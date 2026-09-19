"""Climate data router — replaces api/climate-data and api/climate-data/[id]."""
from fastapi import APIRouter, HTTPException, Query
from database import get_db
from bson import ObjectId
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/api/climate-data", tags=["climate-data"])


def serialize(doc: dict) -> dict:
    """Convert ObjectId to string."""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


@router.get("")
async def get_climate_data(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    country: Optional[str] = None,
    region: Optional[str] = None,
    source: Optional[str] = None,
    startDate: Optional[str] = None,
    endDate: Optional[str] = None,
    anomalyOnly: bool = False,
    sortBy: str = "timestamp",
    sortOrder: str = "desc",
):
    try:
        db = await get_db()
        filter_query = {}

        if country:
            filter_query["country.isoCode"] = country.upper()
        if region:
            filter_query["country.region"] = region
        if source:
            filter_query["source"] = source
        if anomalyOnly:
            filter_query["anomaly.detected"] = True

        if startDate or endDate:
            filter_query["timestamp"] = {}
            if startDate:
                filter_query["timestamp"]["$gte"] = datetime.fromisoformat(startDate)
            if endDate:
                filter_query["timestamp"]["$lte"] = datetime.fromisoformat(endDate)

        sort_dir = 1 if sortOrder == "asc" else -1
        skip = (page - 1) * limit

        cursor = db.climatereadings.find(filter_query).sort(sortBy, sort_dir).skip(skip).limit(limit)
        readings = [serialize(doc) async for doc in cursor]
        total = await db.climatereadings.count_documents(filter_query)

        return {
            "success": True,
            "data": readings,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": -(-total // limit),  # ceil division
            },
        }

    except Exception as e:
        print(f"Climate data GET error: {e}")
        return {"success": False, "error": "Failed to fetch climate data"}


@router.post("", status_code=201)
async def create_climate_data(body: dict):
    try:
        db = await get_db()
        now = datetime.utcnow()
        body["createdAt"] = now
        body["updatedAt"] = now
        result = await db.climatereadings.insert_one(body)
        body["_id"] = str(result.inserted_id)
        return {"success": True, "data": body}

    except Exception as e:
        print(f"Climate data POST error: {e}")
        return {"success": False, "error": "Failed to create climate reading"}


@router.get("/{reading_id}")
async def get_climate_reading(reading_id: str):
    try:
        db = await get_db()
        reading = await db.climatereadings.find_one({"_id": ObjectId(reading_id)})

        if not reading:
            raise HTTPException(status_code=404, detail="Reading not found")

        return {"success": True, "data": serialize(reading)}

    except HTTPException:
        raise
    except Exception as e:
        return {"success": False, "error": "Failed to fetch reading"}


@router.put("/{reading_id}")
async def update_climate_reading(reading_id: str, body: dict):
    try:
        db = await get_db()
        body["updatedAt"] = datetime.utcnow()

        result = await db.climatereadings.find_one_and_update(
            {"_id": ObjectId(reading_id)},
            {"$set": body},
            return_document=True,
        )

        if not result:
            raise HTTPException(status_code=404, detail="Reading not found")

        return {"success": True, "data": serialize(result)}

    except HTTPException:
        raise
    except Exception as e:
        return {"success": False, "error": "Failed to update reading"}


@router.delete("/{reading_id}")
async def delete_climate_reading(reading_id: str):
    try:
        db = await get_db()
        result = await db.climatereadings.delete_one({"_id": ObjectId(reading_id)})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Reading not found")

        return {"success": True, "message": "Reading deleted"}

    except HTTPException:
        raise
    except Exception as e:
        return {"success": False, "error": "Failed to delete reading"}
