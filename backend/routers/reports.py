"""Reports router — replaces api/reports and api/reports/[id]."""
from fastapi import APIRouter, HTTPException, Query
from database import get_db
from bson import ObjectId
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/api/reports", tags=["reports"])


async def populate_user(db, user_id, fields=("name", "email")):
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
async def get_reports(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    type: Optional[str] = None,
):
    try:
        db = await get_db()
        filter_query = {}
        if type:
            filter_query["type"] = type

        skip = (page - 1) * limit

        cursor = db.reports.find(filter_query).sort("createdAt", -1).skip(skip).limit(limit)
        reports = []
        async for r in cursor:
            r["_id"] = str(r["_id"])
            r["generatedBy"] = await populate_user(db, r.get("generatedBy"))
            reports.append(r)

        total = await db.reports.count_documents(filter_query)

        return {
            "success": True,
            "data": reports,
            "pagination": {"page": page, "limit": limit, "total": total, "pages": -(-total // limit)},
        }

    except Exception as e:
        print(f"Reports GET error: {e}")
        return {"success": False, "error": "Failed to fetch reports"}


@router.post("", status_code=201)
async def create_report(body: dict):
    try:
        db = await get_db()
        now = datetime.utcnow()
        body["createdAt"] = now
        body["updatedAt"] = now
        result = await db.reports.insert_one(body)
        body["_id"] = str(result.inserted_id)
        return {"success": True, "data": body}

    except Exception as e:
        print(f"Reports POST error: {e}")
        return {"success": False, "error": "Failed to create report"}


@router.get("/{report_id}")
async def get_report(report_id: str):
    try:
        db = await get_db()
        report = await db.reports.find_one({"_id": ObjectId(report_id)})

        if not report:
            raise HTTPException(status_code=404, detail="Report not found")

        report["_id"] = str(report["_id"])
        report["generatedBy"] = await populate_user(db, report.get("generatedBy"))

        return {"success": True, "data": report}

    except HTTPException:
        raise
    except Exception:
        return {"success": False, "error": "Failed to fetch report"}


@router.delete("/{report_id}")
async def delete_report(report_id: str):
    try:
        db = await get_db()
        result = await db.reports.delete_one({"_id": ObjectId(report_id)})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Report not found")

        return {"success": True, "message": "Report deleted"}

    except HTTPException:
        raise
    except Exception:
        return {"success": False, "error": "Failed to delete report"}
