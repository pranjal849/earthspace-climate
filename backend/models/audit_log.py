from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AuditLogOut(BaseModel):
    id: str = Field(alias="_id")
    user: Optional[dict] = None
    userName: str
    action: str
    resource: str
    resourceId: str = ""
    details: str = ""
    ipAddress: str = ""
    userAgent: str = ""
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True
