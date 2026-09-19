"""
Real-time Socket.io server + synthetic climate data generator.
Replaces the Socket.io + cron logic from server.js
"""
import math
import random
import asyncio
from datetime import datetime, timezone
from bson import ObjectId

import socketio

# Create Socket.io async server
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    transports=["websocket", "polling"],
)

# ── Country data for synthetic readings (same as server.js) ──────────────────
COUNTRIES = [
    {"name": "Pakistan", "isoCode": "PK", "region": "South Asia", "lat": 30.3753, "lng": 69.3451, "baseTemp": 27},
    {"name": "India", "isoCode": "IN", "region": "South Asia", "lat": 20.5937, "lng": 78.9629, "baseTemp": 28},
    {"name": "Bangladesh", "isoCode": "BD", "region": "South Asia", "lat": 23.685, "lng": 90.3563, "baseTemp": 26},
    {"name": "China", "isoCode": "CN", "region": "East Asia", "lat": 35.8617, "lng": 104.1954, "baseTemp": 14},
    {"name": "Japan", "isoCode": "JP", "region": "East Asia", "lat": 36.2048, "lng": 138.2529, "baseTemp": 15},
    {"name": "Indonesia", "isoCode": "ID", "region": "Southeast Asia", "lat": -0.7893, "lng": 113.9213, "baseTemp": 27},
    {"name": "United States", "isoCode": "US", "region": "North America", "lat": 37.0902, "lng": -95.7129, "baseTemp": 12},
    {"name": "Canada", "isoCode": "CA", "region": "North America", "lat": 56.1304, "lng": -106.3468, "baseTemp": -1},
    {"name": "Mexico", "isoCode": "MX", "region": "North America", "lat": 23.6345, "lng": -102.5528, "baseTemp": 22},
    {"name": "Brazil", "isoCode": "BR", "region": "South America", "lat": -14.235, "lng": -51.9253, "baseTemp": 25},
    {"name": "Argentina", "isoCode": "AR", "region": "South America", "lat": -38.4161, "lng": -63.6167, "baseTemp": 16},
    {"name": "United Kingdom", "isoCode": "GB", "region": "Europe", "lat": 55.3781, "lng": -3.436, "baseTemp": 10},
    {"name": "Germany", "isoCode": "DE", "region": "Europe", "lat": 51.1657, "lng": 10.4515, "baseTemp": 10},
    {"name": "France", "isoCode": "FR", "region": "Europe", "lat": 46.6034, "lng": 1.8883, "baseTemp": 12},
    {"name": "Spain", "isoCode": "ES", "region": "Europe", "lat": 40.4637, "lng": -3.7492, "baseTemp": 15},
    {"name": "Netherlands", "isoCode": "NL", "region": "Europe", "lat": 52.1326, "lng": 5.2913, "baseTemp": 10},
    {"name": "Sweden", "isoCode": "SE", "region": "Europe", "lat": 60.1282, "lng": 18.6435, "baseTemp": 3},
    {"name": "Nigeria", "isoCode": "NG", "region": "Africa", "lat": 9.082, "lng": 8.6753, "baseTemp": 28},
    {"name": "Kenya", "isoCode": "KE", "region": "Africa", "lat": -0.0236, "lng": 37.9062, "baseTemp": 24},
    {"name": "Egypt", "isoCode": "EG", "region": "Africa", "lat": 26.8206, "lng": 30.8025, "baseTemp": 23},
    {"name": "South Africa", "isoCode": "ZA", "region": "Africa", "lat": -30.5595, "lng": 22.9375, "baseTemp": 18},
    {"name": "Australia", "isoCode": "AU", "region": "Oceania", "lat": -25.2744, "lng": 133.7751, "baseTemp": 22},
    {"name": "Saudi Arabia", "isoCode": "SA", "region": "Middle East", "lat": 23.8859, "lng": 45.0792, "baseTemp": 33},
    {"name": "United Arab Emirates", "isoCode": "AE", "region": "Middle East", "lat": 23.4241, "lng": 53.8478, "baseTemp": 32},
    {"name": "Turkey", "isoCode": "TR", "region": "Middle East", "lat": 38.9637, "lng": 35.2433, "baseTemp": 14},
]


def get_region_room(region: str) -> str:
    return region.lower().replace(" ", "-")


def generate_synthetic_reading(country: dict) -> dict:
    now = datetime.now(timezone.utc)
    month = now.month - 1  # 0-indexed like JS
    seasonal_offset = math.sin((month - 3) * math.pi / 6) * 8 * (1 if country["lat"] > 0 else -1)

    temperature = round(country["baseTemp"] + seasonal_offset + random.uniform(-3, 3), 1)
    co2_level = round(418 + random.uniform(-5, 8), 1)
    humidity = round(random.uniform(25, 90), 1)
    sea_level = round(3.7 + random.uniform(-0.3, 0.3), 2)
    precipitation = round(random.uniform(0, 150), 1)
    wind_speed = round(random.uniform(0, 40), 1)
    uv_index = round(random.uniform(1, 11), 1)
    air_quality_index = round(random.uniform(20, 250))

    is_anomaly = random.random() < 0.12
    severities = ["low", "medium", "high", "critical"]

    return {
        "_id": str(ObjectId()),
        "timestamp": now.isoformat(),
        "source": random.choice(["satellite", "weather_station", "sensor"]),
        "country": {
            "name": country["name"],
            "isoCode": country["isoCode"],
            "region": country["region"],
            "coordinates": {"lat": country["lat"], "lng": country["lng"]},
        },
        "metrics": {
            "temperature": temperature,
            "co2Level": co2_level,
            "humidity": humidity,
            "seaLevel": sea_level,
            "precipitation": precipitation,
            "windSpeed": wind_speed,
            "uvIndex": uv_index,
            "airQualityIndex": air_quality_index,
        },
        "anomaly": {
            "detected": is_anomaly,
            "severity": random.choice(severities) if is_anomaly else None,
            "description": "Real-time anomaly detected in monitoring data" if is_anomaly else "",
        },
        "processed": True,
    }


# ── Socket.io event handlers ────────────────────────────────────────────────

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")
    await sio.enter_room(sid, "all-countries")


@sio.on("subscribe:region")
async def subscribe_region(sid, region):
    room = get_region_room(region)
    await sio.enter_room(sid, room)
    print(f"   {sid} joined room: {room}")


@sio.on("unsubscribe:region")
async def unsubscribe_region(sid, region):
    room = get_region_room(region)
    await sio.leave_room(sid, room)


@sio.on("sensor:ping")
async def sensor_ping(sid):
    await sio.emit("sensor:status", {
        "status": "online",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "activeCountries": len(COUNTRIES),
    }, room=sid)


@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")


# ── Background task: generate synthetic readings every 3 seconds ─────────────

reading_counter = 0


async def realtime_feed():
    """Background loop that generates synthetic readings every 3 seconds."""
    global reading_counter

    while True:
        await asyncio.sleep(3)

        country = random.choice(COUNTRIES)
        reading = generate_synthetic_reading(country)
        reading_counter += 1

        # Emit to all clients
        await sio.emit("climate:reading", reading, room="all-countries")

        # Emit to region-specific room
        region_room = get_region_room(country["region"])
        await sio.emit("climate:reading", reading, room=region_room)

        # If anomaly detected, emit alert
        if reading["anomaly"]["detected"]:
            alert = {
                "_id": str(ObjectId()),
                "title": f"{reading['anomaly']['severity'][0].upper()}{reading['anomaly']['severity'][1:]} anomaly in {country['name']}",
                "description": reading["anomaly"]["description"],
                "severity": reading["anomaly"]["severity"],
                "country": {"name": country["name"], "isoCode": country["isoCode"]},
                "metric": "temperature",
                "currentValue": reading["metrics"]["temperature"],
                "status": "active",
                "createdAt": reading["timestamp"],
            }
            await sio.emit("alert:new", alert, room="all-countries")

        # Periodic sensor status broadcast
        if reading_counter % 10 == 0:
            await sio.emit("sensor:status", {
                "status": "online",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "activeCountries": len(COUNTRIES),
                "totalReadings": reading_counter,
            })
