"""Support tickets router — replaces api/support and api/support/[id]."""
from fastapi import APIRouter, HTTPException, Query
from database import get_db
from bson import ObjectId
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/api/support", tags=["support"])


@router.get("")
async def get_tickets(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    priority: Optional[str] = None,
):
    try:
        db = await get_db()
        filter_query = {}
        if status:
            filter_query["status"] = status
        if priority:
            filter_query["priority"] = priority

        skip = (page - 1) * limit

        cursor = db.supporttickets.find(filter_query).sort("createdAt", -1).skip(skip).limit(limit)
        tickets = []
        async for t in cursor:
            t["_id"] = str(t["_id"])
            tickets.append(t)

        total = await db.supporttickets.count_documents(filter_query)

        status_pipeline = [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]
        status_counts_list = await db.supporttickets.aggregate(status_pipeline).to_list(10)
        status_counts = {s["_id"]: s["count"] for s in status_counts_list}

        return {
            "success": True,
            "data": tickets,
            "pagination": {"page": page, "limit": limit, "total": total, "pages": -(-total // limit)},
            "statusCounts": status_counts,
        }

    except Exception as e:
        print(f"Support GET error: {e}")
        return {"success": False, "error": "Failed to fetch tickets"}


@router.post("", status_code=201)
async def create_ticket(body: dict):
    try:
        db = await get_db()
        now = datetime.utcnow()
        body["createdAt"] = now
        body["updatedAt"] = now
        body.setdefault("messages", [])
        result = await db.supporttickets.insert_one(body)
        body["_id"] = str(result.inserted_id)
        return {"success": True, "data": body}

    except Exception as e:
        print(f"Support POST error: {e}")
        return {"success": False, "error": "Failed to create ticket"}


@router.get("/{ticket_id}")
async def get_ticket(ticket_id: str):
    try:
        db = await get_db()
        ticket = await db.supporttickets.find_one({"_id": ObjectId(ticket_id)})

        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")

        ticket["_id"] = str(ticket["_id"])
        return {"success": True, "data": ticket}

    except HTTPException:
        raise
    except Exception:
        return {"success": False, "error": "Failed to fetch ticket"}


@router.put("/{ticket_id}")
async def update_ticket(ticket_id: str, body: dict):
    try:
        db = await get_db()

        # If adding a message, push to messages array
        if body.get("newMessage"):
            update_ops = {
                "$push": {"messages": body["newMessage"]},
            }
            set_fields = {}
            if body.get("status"):
                set_fields["status"] = body["status"]
            if body.get("status") == "resolved":
                set_fields["resolvedAt"] = datetime.utcnow()
            set_fields["updatedAt"] = datetime.utcnow()
            update_ops["$set"] = set_fields

            result = await db.supporttickets.find_one_and_update(
                {"_id": ObjectId(ticket_id)},
                update_ops,
                return_document=True,
            )

            if not result:
                raise HTTPException(status_code=404, detail="Ticket not found")

            result["_id"] = str(result["_id"])
            return {"success": True, "data": result}

        # Regular update
        if body.get("status") in ("resolved", "closed"):
            body["resolvedAt"] = datetime.utcnow()

        body["updatedAt"] = datetime.utcnow()
        body.pop("newMessage", None)

        result = await db.supporttickets.find_one_and_update(
            {"_id": ObjectId(ticket_id)},
            {"$set": body},
            return_document=True,
        )

        if not result:
            raise HTTPException(status_code=404, detail="Ticket not found")

        result["_id"] = str(result["_id"])
        return {"success": True, "data": result}

    except HTTPException:
        raise
    except Exception:
        return {"success": False, "error": "Failed to update ticket"}
