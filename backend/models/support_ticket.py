from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class MessageCreate(BaseModel):
    sender: str
    senderName: str
    content: str
    timestamp: datetime = None


class MessageOut(BaseModel):
    sender: str
    senderName: str
    content: str
    timestamp: Optional[datetime] = None


class TicketCreate(BaseModel):
    subject: str = Field(..., max_length=200)
    description: str
    category: str  # bug, feature_request, data_issue, access, general, performance
    priority: str = "medium"
    status: str = "open"
    submittedBy: str
    submittedByName: str
    assignedTo: Optional[str] = None
    assignedToName: str = ""


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assignedTo: Optional[str] = None
    assignedToName: Optional[str] = None
    newMessage: Optional[MessageCreate] = None
    resolvedAt: Optional[datetime] = None


class TicketOut(BaseModel):
    id: str = Field(alias="_id")
    subject: str
    description: str
    category: str
    priority: str
    status: str
    submittedBy: str
    submittedByName: str
    assignedTo: Optional[str] = None
    assignedToName: str = ""
    messages: list[MessageOut] = []
    resolvedAt: Optional[datetime] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True
