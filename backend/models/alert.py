from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AlertCountry(BaseModel):
    name: str
    isoCode: str


class AlertCreate(BaseModel):
    title: str
    description: str
    severity: str  # low, medium, high, critical
    country: AlertCountry
    metric: str
    threshold: float
    currentValue: float
    status: str = "active"
    assignedTo: Optional[str] = None
    notes: str = ""


class AlertUpdate(BaseModel):
    status: Optional[str] = None
    assignedTo: Optional[str] = None
    resolvedBy: Optional[str] = None
    resolvedAt: Optional[datetime] = None
    notes: Optional[str] = None


class AlertOut(BaseModel):
    id: str = Field(alias="_id")
    title: str
    description: str
    severity: str
    country: AlertCountry
    metric: str
    threshold: float
    currentValue: float
    status: str
    assignedTo: Optional[dict] = None
    resolvedAt: Optional[datetime] = None
    resolvedBy: Optional[dict] = None
    notes: str = ""
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True
