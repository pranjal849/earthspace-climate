"""Admin settings router — replaces api/admin/settings."""
from fastapi import APIRouter

router = APIRouter(prefix="/api/admin/settings", tags=["admin-settings"])

# In-memory settings (matches the JS version exactly)
settings = {
    "siteName": "EarthScape Climate Intelligence Platform",
    "alertThresholds": {
        "temperature": 35,
        "co2Level": 430,
        "airQualityIndex": 200,
        "seaLevel": 5,
    },
    "realTimeInterval": 3,
    "dataRetentionDays": 365,
    "emailNotifications": True,
    "anomalyDetectionThreshold": 2.0,
    "maintenanceMode": False,
}


@router.get("")
async def get_settings():
    return {"success": True, "data": settings}


@router.put("")
async def update_settings(body: dict):
    try:
        global settings
        settings = {**settings, **body}
        return {"success": True, "data": settings}
    except Exception:
        return {"success": False, "error": "Failed to update settings"}
