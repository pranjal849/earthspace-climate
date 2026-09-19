from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    name: str = Field(..., max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field(default="viewer")
    department: str = Field(default="")


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    isActive: Optional[bool] = None


class UserOut(BaseModel):
    id: str = Field(alias="_id")
    name: str
    email: str
    role: str
    avatar: str = ""
    isActive: bool = True
    lastLogin: Optional[datetime] = None
    department: str = ""
    phone: str = ""
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict
