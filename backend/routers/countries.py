"""Countries router — replaces api/countries and api/countries/[isoCode]."""
from fastapi import APIRouter, HTTPException
from database import get_db

router = APIRouter(prefix="/api/countries", tags=["countries"])


@router.get("")
async def get_countries():
    try:
        db = await get_db()

        pipeline = [
            {"$sort": {"timestamp": -1}},
            {
                "$group": {
                    "_id": "$country.isoCode",
                    "name": {"$first": "$country.name"},
                    "isoCode": {"$first": "$country.isoCode"},
                    "region": {"$first": "$country.region"},
                    "coordinates": {"$first": "$country.coordinates"},
                    "latestReading": {
                        "$first": {
                            "timestamp": "$timestamp",
                            "temperature": "$metrics.temperature",
                            "co2Level": "$metrics.co2Level",
                            "humidity": "$metrics.humidity",
                            "seaLevel": "$metrics.seaLevel",
                            "airQualityIndex": "$metrics.airQualityIndex",
                        }
                    },
                    "latestAnomaly": {"$first": "$anomaly"},
                    "readingCount": {"$sum": 1},
                    "avgTemperature": {"$avg": "$metrics.temperature"},
                    "avgCO2": {"$avg": "$metrics.co2Level"},
                    "anomalyCount": {
                        "$sum": {"$cond": ["$anomaly.detected", 1, 0]}
                    },
                }
            },
            {"$sort": {"name": 1}},
        ]

        countries = await db.climatereadings.aggregate(pipeline).to_list(500)

        return {
            "success": True,
            "data": countries,
            "total": len(countries),
        }

    except Exception as e:
        print(f"Countries GET error: {e}")
        return {"success": False, "error": "Failed to fetch countries"}


@router.get("/{iso_code}")
async def get_country_detail(iso_code: str):
    try:
        db = await get_db()
        code = iso_code.upper()

        cursor = db.climatereadings.find({"country.isoCode": code}).sort("timestamp", -1)
        readings = []
        async for r in cursor:
            r["_id"] = str(r["_id"])
            readings.append(r)

        if not readings:
            raise HTTPException(status_code=404, detail="Country not found or no data available")

        country = readings[0]["country"]
        total_readings = len(readings)
        anomaly_readings = [r for r in readings if r.get("anomaly", {}).get("detected")]

        temps = [r["metrics"]["temperature"] for r in readings]
        co2s = [r["metrics"]["co2Level"] for r in readings]

        stats = {
            "avgTemperature": round(sum(temps) / len(temps), 1),
            "minTemperature": round(min(temps), 1),
            "maxTemperature": round(max(temps), 1),
            "avgCO2": round(sum(co2s) / len(co2s), 1),
            "totalReadings": total_readings,
            "anomalyCount": len(anomaly_readings),
            "anomalyRate": round((len(anomaly_readings) / total_readings) * 100, 1),
        }

        return {
            "success": True,
            "data": {
                "country": country,
                "stats": stats,
                "readings": readings,
                "latestReading": readings[0],
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Country detail GET error: {e}")
        return {"success": False, "error": "Failed to fetch country data"}
