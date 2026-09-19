"""Admin audit log router — replaces api/admin/audit-log."""
from fastapi import APIRouter, Query
from database import get_db
from bson import ObjectId
from typing import Optional

router = APIRouter(prefix="/api/admin/audit-log", tags=["admin-audit"])


async def populate_user(db, user_id, fields=("name", "email", "role")):
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
async def get_audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(30, ge=1, le=100),
    action: Optional[str] = None,
    resource: Optional[str] = None,
):
    try:
        db = await get_db()
        filter_query = {}
        if action:
            filter_query["action"] = action
        if resource:
            filter_query["resource"] = resource

        skip = (page - 1) * limit

        cursor = db.auditlogs.find(filter_query).sort("createdAt", -1).skip(skip).limit(limit)
        logs = []
        async for log in cursor:
            log["_id"] = str(log["_id"])
            log["user"] = await populate_user(db, log.get("user"))
            logs.append(log)

        total = await db.auditlogs.count_documents(filter_query)

        return {
            "success": True,
            "data": logs,
            "pagination": {"page": page, "limit": limit, "total": total, "pages": -(-total // limit)},
        }

    except Exception as e:
        print(f"Audit log GET error: {e}")
        return {"success": False, "error": "Failed to fetch audit logs"}
