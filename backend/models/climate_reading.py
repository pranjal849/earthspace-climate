from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Coordinates(BaseModel):
    lat: float
    lng: float


class Country(BaseModel):
    name: str
    isoCode: str
    region: str
    coordinates: Coordinates


class Metrics(BaseModel):
    temperature: float
    co2Level: float
    humidity: Optional[float] = None
    seaLevel: Optional[float] = None
    precipitation: Optional[float] = None
    windSpeed: Optional[float] = None
    uvIndex: Optional[float] = None
    airQualityIndex: Optional[float] = None


class Anomaly(BaseModel):
    detected: bool = False
    severity: Optional[str] = None
    description: str = ""


class ClimateReadingCreate(BaseModel):
    timestamp: datetime
    source: str
    country: Country
    metrics: Metrics
    anomaly: Anomaly = Anomaly()
    processed: bool = True


class ClimateReadingOut(BaseModel):
    id: str = Field(alias="_id")
    timestamp: datetime
    source: str
    country: Country
    metrics: Metrics
    anomaly: Anomaly
    processed: bool = True
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True
