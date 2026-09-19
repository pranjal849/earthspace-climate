"""Auth router — replaces api/auth/[...nextauth] and api/auth/register."""
from fastapi import APIRouter, HTTPException, status
from database import get_db
from auth.jwt import verify_password, hash_password, create_access_token
from models.user import LoginRequest, TokenResponse, UserCreate
from datetime import datetime, timezone

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login")
async def login(request: LoginRequest):
    db = await get_db()
    user = await db.users.find_one({"email": request.email.lower()})

    if not user:
        raise HTTPException(status_code=401, detail="No account found with this email")

    if not user.get("isActive", True):
        raise HTTPException(status_code=401, detail="Account has been deactivated")

    if not verify_password(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid password")

    # Update last login
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"lastLogin": datetime.now(timezone.utc)}}
    )

    token = create_access_token({
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user.get("role", "viewer"),
        "avatar": user.get("avatar", ""),
        "department": user.get("department", ""),
    })

    return {
        "success": True,
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "viewer"),
            "avatar": user.get("avatar", ""),
            "department": user.get("department", ""),
        },
    }


@router.post("/register", status_code=201)
async def register(request: UserCreate):
    db = await get_db()

    if not request.name or not request.email or not request.password:
        raise HTTPException(status_code=400, detail="Name, email, and password are required")

    if len(request.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    existing = await db.users.find_one({"email": request.email.lower()})
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    hashed = hash_password(request.password)
    now = datetime.now(timezone.utc)

    user_doc = {
        "name": request.name,
        "email": request.email.lower(),
        "password": hashed,
        "role": "viewer",
        "avatar": "",
        "isActive": True,
        "lastLogin": None,
        "department": "",
        "phone": "",
        "createdAt": now,
        "updatedAt": now,
    }

    result = await db.users.insert_one(user_doc)

    return {
        "success": True,
        "user": {
            "id": str(result.inserted_id),
            "name": request.name,
            "email": request.email.lower(),
            "role": "viewer",
        },
    }
