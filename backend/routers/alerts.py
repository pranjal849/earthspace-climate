"""Alerts router — replaces api/alerts and api/alerts/[id]."""
from fastapi import APIRouter, HTTPException, Query
from database import get_db
from bson import ObjectId
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


def serialize(doc: dict) -> dict:
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    # Handle populated refs
    if doc.get("assignedTo") and isinstance(doc["assignedTo"], ObjectId):
        doc["assignedTo"] = str(doc["assignedTo"])
    if doc.get("resolvedBy") and isinstance(doc["resolvedBy"], ObjectId):
        doc["resolvedBy"] = str(doc["resolvedBy"])
    return doc


async def populate_user(db, user_id, fields=("name", "email")):
    """Simulate Mongoose populate for user references."""
    if not user_id:
        return None
    try:
        oid = ObjectId(user_id) if isinstance(user_id, str) else user_id
        user = await db.users.find_one({"_id": oid})
        if user:
            result = {"_id": str(user["_id"])}
            for f in fields:
                result[f] = user.get(f, "")
            return result
    except Exception:
        pass
    return None


@router.get("")
async def get_alerts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    severity: Optional[str] = None,
    country: Optional[str] = None,
):
    try:
        db = await get_db()
        filter_query = {}
        if status:
            filter_query["status"] = status
        if severity:
            filter_query["severity"] = severity
        if country:
            filter_query["country.isoCode"] = country.upper()

        skip = (page - 1) * limit

        cursor = db.alerts.find(filter_query).sort("createdAt", -1).skip(skip).limit(limit)
        alerts = []
        async for a in cursor:
            a["_id"] = str(a["_id"])
            a["assignedTo"] = await populate_user(db, a.get("assignedTo"))
            alerts.append(a)

        total = await db.alerts.count_documents(filter_query)

        # Status counts
        status_pipeline = [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]
        status_counts_list = await db.alerts.aggregate(status_pipeline).to_list(10)
        status_counts = {s["_id"]: s["count"] for s in status_counts_list}

        return {
            "success": True,
            "data": alerts,
            "pagination": {"page": page, "limit": limit, "total": total, "pages": -(-total // limit)},
            "statusCounts": status_counts,
        }

    except Exception as e:
        print(f"Alerts GET error: {e}")
        return {"success": False, "error": "Failed to fetch alerts"}


@router.post("", status_code=201)
async def create_alert(body: dict):
    try:
        db = await get_db()
        now = datetime.utcnow()
        body["createdAt"] = now
        body["updatedAt"] = now
        result = await db.alerts.insert_one(body)
        body["_id"] = str(result.inserted_id)
        return {"success": True, "data": body}

    except Exception as e:
        print(f"Alerts POST error: {e}")
        return {"success": False, "error": "Failed to create alert"}


@router.get("/{alert_id}")
async def get_alert(alert_id: str):
    try:
        db = await get_db()
        alert = await db.alerts.find_one({"_id": ObjectId(alert_id)})

        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")

        alert["_id"] = str(alert["_id"])
        alert["assignedTo"] = await populate_user(db, alert.get("assignedTo"))
        alert["resolvedBy"] = await populate_user(db, alert.get("resolvedBy"))

        return {"success": True, "data": alert}

    except HTTPException:
        raise
    except Exception:
        return {"success": False, "error": "Failed to fetch alert"}


@router.put("/{alert_id}")
async def update_alert(alert_id: str, body: dict):
    try:
        db = await get_db()

        if body.get("status") == "resolved":
            body["resolvedAt"] = datetime.utcnow()

        body["updatedAt"] = datetime.utcnow()

        result = await db.alerts.find_one_and_update(
            {"_id": ObjectId(alert_id)},
            {"$set": body},
            return_document=True,
        )

        if not result:
            raise HTTPException(status_code=404, detail="Alert not found")

        result["_id"] = str(result["_id"])
        return {"success": True, "data": result}

    except HTTPException:
        raise
    except Exception:
        return {"success": False, "error": "Failed to update alert"}
