"""Admin users router — replaces api/admin/users and api/admin/users/[id]."""
from fastapi import APIRouter, HTTPException, Query
from database import get_db
from auth.jwt import hash_password
from bson import ObjectId
from datetime import datetime
from typing import Optional
import re

router = APIRouter(prefix="/api/admin/users", tags=["admin-users"])


@router.get("")
async def get_users(
    role: Optional[str] = None,
    search: Optional[str] = None,
):
    try:
        db = await get_db()
        filter_query = {}
        if role:
            filter_query["role"] = role
        if search:
            regex = re.compile(re.escape(search), re.IGNORECASE)
            filter_query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
            ]

        cursor = db.users.find(filter_query, {"password": 0}).sort("createdAt", -1)
        users = []
        async for u in cursor:
            u["_id"] = str(u["_id"])
            users.append(u)

        return {"success": True, "data": users}

    except Exception as e:
        print(f"Admin users GET error: {e}")
        return {"success": False, "error": "Failed to fetch users"}


@router.post("", status_code=201)
async def create_user(body: dict):
    try:
        db = await get_db()
        name = body.get("name")
        email = body.get("email")
        password = body.get("password")

        if not name or not email or not password:
            raise HTTPException(status_code=400, detail="Name, email, and password are required")

        existing = await db.users.find_one({"email": email.lower()})
        if existing:
            raise HTTPException(status_code=409, detail="Email already exists")

        hashed = hash_password(password)
        now = datetime.utcnow()

        user_doc = {
            "name": name,
            "email": email.lower(),
            "password": hashed,
            "role": body.get("role", "viewer"),
            "department": body.get("department", ""),
            "avatar": "",
            "isActive": True,
            "lastLogin": None,
            "phone": "",
            "createdAt": now,
            "updatedAt": now,
        }

        result = await db.users.insert_one(user_doc)
        user_doc.pop("password")
        user_doc["_id"] = str(result.inserted_id)

        return {"success": True, "data": user_doc}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Admin users POST error: {e}")
        return {"success": False, "error": "Failed to create user"}


@router.get("/{user_id}")
async def get_user(user_id: str):
    try:
        db = await get_db()
        user = await db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user["_id"] = str(user["_id"])
        return {"success": True, "data": user}

    except HTTPException:
        raise
    except Exception:
        return {"success": False, "error": "Failed to fetch user"}


@router.put("/{user_id}")
async def update_user(user_id: str, body: dict):
    try:
        db = await get_db()
        body.pop("password", None)  # Don't allow password update through this route
        body["updatedAt"] = datetime.utcnow()

        result = await db.users.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$set": body},
            return_document=True,
            projection={"password": 0},
        )

        if not result:
            raise HTTPException(status_code=404, detail="User not found")

        result["_id"] = str(result["_id"])
        return {"success": True, "data": result}

    except HTTPException:
        raise
    except Exception:
        return {"success": False, "error": "Failed to update user"}


@router.delete("/{user_id}")
async def delete_user(user_id: str):
    try:
        db = await get_db()
        result = await db.users.delete_one({"_id": ObjectId(user_id)})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User not found")

        return {"success": True, "message": "User deleted"}

    except HTTPException:
        raise
    except Exception:
        return {"success": False, "error": "Failed to delete user"}
