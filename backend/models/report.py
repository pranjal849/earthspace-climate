from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime


class ReportCountry(BaseModel):
    name: str
    isoCode: str


class DateRange(BaseModel):
    start: datetime
    end: datetime


class ReportMetrics(BaseModel):
    totalReadings: int = 0
    anomaliesDetected: int = 0
    avgTemperature: float = 0
    avgCO2: float = 0


class ReportCreate(BaseModel):
    title: str
    type: str  # monthly, quarterly, annual, custom, anomaly, comparison
    generatedBy: str
    countries: list[ReportCountry] = []
    dateRange: DateRange
    summary: str = ""
    data: Any = {}
    format: str = "pdf"
    status: str = "completed"
    fileUrl: str = ""
    metrics: ReportMetrics = ReportMetrics()


class ReportOut(BaseModel):
    id: str = Field(alias="_id")
    title: str
    type: str
    generatedBy: Optional[dict] = None
    countries: list[ReportCountry] = []
    dateRange: DateRange
    summary: str = ""
    data: Any = {}
    format: str = "pdf"
    status: str = "completed"
    fileUrl: str = ""
    metrics: ReportMetrics = ReportMetrics()
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True
