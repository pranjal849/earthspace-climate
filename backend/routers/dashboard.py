"""Dashboard stats router — replaces api/dashboard/stats."""
from fastapi import APIRouter
from database import get_db

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_dashboard_stats():
    try:
        db = await get_db()

        # Run all queries in parallel-ish (Motor handles this well)
        total_readings = await db.climatereadings.count_documents({})
        iso_codes = await db.climatereadings.distinct("country.isoCode")
        total_countries = len(iso_codes)
        active_alerts = await db.alerts.count_documents({"status": "active"})
        critical_alerts = await db.alerts.count_documents({"status": "active", "severity": "critical"})

        recent_readings_cursor = db.climatereadings.find().sort("timestamp", -1).limit(10)
        recent_readings = []
        async for r in recent_readings_cursor:
            r["_id"] = str(r["_id"])
            recent_readings.append(r)

        # Average metrics aggregation
        avg_pipeline = [
            {
                "$group": {
                    "_id": None,
                    "avgTemperature": {"$avg": "$metrics.temperature"},
                    "avgCO2": {"$avg": "$metrics.co2Level"},
                    "avgHumidity": {"$avg": "$metrics.humidity"},
                    "avgSeaLevel": {"$avg": "$metrics.seaLevel"},
                    "avgAQI": {"$avg": "$metrics.airQualityIndex"},
                }
            }
        ]
        avg_result = await db.climatereadings.aggregate(avg_pipeline).to_list(1)
        global_avg = avg_result[0] if avg_result else {}

        anomaly_readings = await db.climatereadings.count_documents({"anomaly.detected": True})

        # Top anomaly countries
        top_anomaly_pipeline = [
            {"$match": {"anomaly.detected": True}},
            {
                "$group": {
                    "_id": "$country.isoCode",
                    "name": {"$first": "$country.name"},
                    "isoCode": {"$first": "$country.isoCode"},
                    "count": {"$sum": 1},
                    "latestSeverity": {"$first": "$anomaly.severity"},
                }
            },
            {"$sort": {"count": -1}},
            {"$limit": 5},
        ]
        top_anomaly_countries = await db.climatereadings.aggregate(top_anomaly_pipeline).to_list(5)

        # Region stats
        region_pipeline = [
            {
                "$group": {
                    "_id": "$country.region",
                    "avgTemp": {"$avg": "$metrics.temperature"},
                    "avgCO2": {"$avg": "$metrics.co2Level"},
                    "count": {"$sum": 1},
                }
            },
            {"$sort": {"_id": 1}},
        ]
        region_stats = await db.climatereadings.aggregate(region_pipeline).to_list(100)

        return {
            "success": True,
            "data": {
                "kpis": {
                    "totalReadings": total_readings,
                    "totalCountries": total_countries,
                    "activeAlerts": active_alerts,
                    "criticalAlerts": critical_alerts,
                    "avgTemperature": round(global_avg.get("avgTemperature", 0) or 0, 1),
                    "avgCO2": round(global_avg.get("avgCO2", 0) or 0, 1),
                    "avgHumidity": round(global_avg.get("avgHumidity", 0) or 0, 1),
                    "avgSeaLevel": round(global_avg.get("avgSeaLevel", 0) or 0, 2),
                    "avgAQI": round(global_avg.get("avgAQI", 0) or 0),
                    "anomalyRate": round((anomaly_readings / total_readings) * 100, 1) if total_readings > 0 else 0,
                },
                "recentReadings": recent_readings,
                "topAnomalyCountries": top_anomaly_countries,
                "regionStats": region_stats,
            },
        }

    except Exception as e:
        print(f"Dashboard stats error: {e}")
        return {"success": False, "error": "Failed to fetch dashboard stats"}
