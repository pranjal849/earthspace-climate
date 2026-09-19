"""
EarthScape Database Seeder — Python version.
Replaces scripts/seed.js. Seeds the same data for the FastAPI backend.
Run: python backend/seed.py
"""
import asyncio
import json
import os
import random
import math
from datetime import datetime, timedelta, timezone
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt

MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/earthscape")
DB_NAME = "earthscape"

# Load countries from the same JSON file used by the JS seeder
COUNTRIES_JSON_PATH = Path(__file__).parent.parent / "frontend" / "scripts" / "countries.json"
with open(COUNTRIES_JSON_PATH, "r", encoding="utf-8") as f:
    COUNTRIES = json.load(f)

SOURCES = ["satellite", "weather_station", "sensor", "manual"]
ANOMALY_DESCRIPTIONS = [
    "Unusual temperature spike detected above seasonal average",
    "CO2 levels exceeding regional threshold",
    "Abnormal humidity drop below historical minimum",
    "Sea level rise rate accelerating beyond prediction",
    "Precipitation pattern deviating from expected range",
    "Wind speed anomaly detected in monitoring zone",
    "UV index unusually high for this latitude and season",
    "Air quality index deteriorated beyond safe levels",
    "Temperature inversion event detected",
    "Sudden pressure drop indicating extreme weather formation",
]


def random_between(min_val, max_val):
    return random.uniform(min_val, max_val)


def random_int(min_val, max_val):
    return random.randint(min_val, max_val)


def pick_random(arr):
    return random.choice(arr)


def generate_timestamp(start_year, end_year):
    start = datetime(start_year, 1, 1, tzinfo=timezone.utc)
    end = datetime(end_year, 12, 31, tzinfo=timezone.utc)
    delta = (end - start).total_seconds()
    return start + timedelta(seconds=random.uniform(0, delta))


def get_seasonal_offset(date, base_lat):
    month = date.month - 1  # 0-indexed
    seasonal_curve = [-4, -3, -1, 2, 5, 8, 10, 9, 6, 2, -1, -3]
    idx = month if base_lat > 0 else (month + 6) % 12
    return seasonal_curve[idx]


def generate_reading(country, date):
    seasonal_temp = get_seasonal_offset(date, country["lat"])
    months_since_2024 = (date.year - 2024) * 12 + (date.month - 1)
    warming_trend = months_since_2024 * 0.02

    temperature = round(country["baseTemp"] + seasonal_temp + warming_trend + random_between(-2, 2), 1)
    co2_trend = months_since_2024 * (2.5 / 12)
    co2_level = round(country.get("baseCO2", 418) + co2_trend + random_between(-3, 3), 1)
    humidity = round(random_between(30, 90), 1)
    sea_level = round(3.5 + (months_since_2024 * 0.01) + random_between(-0.5, 0.5), 2)
    precipitation = round(random_between(0, 250), 1)
    wind_speed = round(random_between(0, 45), 1)
    uv_index = round(random_between(1, 12), 1)
    air_quality_index = random_int(20, 300)

    is_anomaly = random.random() < 0.15
    anomaly = {"detected": False, "severity": None, "description": ""}

    if is_anomaly:
        severities = ["low", "medium", "high", "critical"]
        weights = [0.4, 0.3, 0.2, 0.1]
        roll = random.random()
        cumulative = 0
        severity = "low"
        for i, s in enumerate(severities):
            cumulative += weights[i]
            if roll <= cumulative:
                severity = s
                break
        anomaly = {
            "detected": True,
            "severity": severity,
            "description": pick_random(ANOMALY_DESCRIPTIONS),
        }

    return {
        "timestamp": date,
        "source": pick_random(SOURCES),
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
        "anomaly": anomaly,
        "processed": True,
        "createdAt": date,
        "updatedAt": date,
    }


async def seed():
    print("\n=== EarthScape Climate Intelligence Platform - Python Database Seeder ===\n")

    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DB_NAME]

    print("Connected to MongoDB\n")

    # Clear existing data
    print("Clearing existing data...")
    await asyncio.gather(
        db.users.delete_many({}),
        db.climate_readings.delete_many({}),  # Mongoose uses lowercase plural by default
        db.alerts.delete_many({}),
        db.reports.delete_many({}),
        db.auditlogs.delete_many({}),
        db.supporttickets.delete_many({}),
    )
    # Also try the collection names Mongoose might use
    await asyncio.gather(
        db.climatereadings.delete_many({}),
    )
    print("   Done.\n")

    # ── Seed Users ──────────────────────────────────────────────────────────
    print("Seeding users...")
    hashed_password = bcrypt.hashpw("password123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    users_data = [
        {"name": "Admin User", "email": "admin@earthscape.io", "role": "admin", "department": "Operations"},
        {"name": "Sarah Chen", "email": "sarah@earthscape.io", "role": "admin", "department": "Engineering"},
        {"name": "Dr. James Okafor", "email": "james@earthscape.io", "role": "analyst", "department": "Climate Science"},
        {"name": "Maria Rodriguez", "email": "maria@earthscape.io", "role": "analyst", "department": "Data Analytics"},
        {"name": "Ahmed Khan", "email": "ahmed@earthscape.io", "role": "analyst", "department": "Research"},
        {"name": "Emily Watson", "email": "emily@earthscape.io", "role": "viewer", "department": "Public Relations"},
        {"name": "Li Wei", "email": "li@earthscape.io", "role": "viewer", "department": "Government Liaison"},
        {"name": "Fatima Al-Hassan", "email": "fatima@earthscape.io", "role": "viewer", "department": "Education"},
    ]

    now = datetime.now(timezone.utc)
    user_docs = []
    for u in users_data:
        user_docs.append({
            **u,
            "password": hashed_password,
            "isActive": True,
            "lastLogin": now - timedelta(days=random_int(0, 30)),
            "avatar": "",
            "phone": "",
            "createdAt": now,
            "updatedAt": now,
        })

    result = await db.users.insert_many(user_docs)
    users = []
    for i, doc in enumerate(user_docs):
        doc["_id"] = result.inserted_ids[i]
        users.append(doc)
    print(f"   Success: {len(users)} users created\n")

    # ── Seed Climate Readings ───────────────────────────────────────────────
    print("Seeding climate readings...")
    readings = []

    for country in COUNTRIES:
        reading_count = random_int(20, 24)
        for _ in range(reading_count):
            date = generate_timestamp(2024, 2026)
            readings.append(generate_reading(country, date))

    readings.sort(key=lambda r: r["timestamp"])

    # Use the collection name Mongoose uses: climatereadings
    inserted = await db.climatereadings.insert_many(readings)
    for i, doc in enumerate(readings):
        doc["_id"] = inserted.inserted_ids[i]
    print(f"   Success: {len(readings)} climate readings created across {len(COUNTRIES)} countries\n")

    # ── Seed Alerts ─────────────────────────────────────────────────────────
    print("Seeding alerts...")
    anomaly_readings = [r for r in readings if r["anomaly"]["detected"]]
    alert_metrics = ["temperature", "co2Level", "humidity", "seaLevel", "airQualityIndex"]
    alert_statuses = ["active", "active", "active", "acknowledged", "acknowledged", "resolved"]
    non_viewers = [u for u in users if u["role"] != "viewer"]

    alerts_data = []
    for i in range(35):
        reading = anomaly_readings[i % len(anomaly_readings)]
        metric = pick_random(alert_metrics)
        status = pick_random(alert_statuses)
        assignee = pick_random(non_viewers)

        alerts_data.append({
            "title": f"{reading['anomaly']['severity'][0].upper()}{reading['anomaly']['severity'][1:]} anomaly in {reading['country']['name']}",
            "description": reading["anomaly"]["description"] or f"{metric} exceeded threshold in {reading['country']['name']}",
            "severity": reading["anomaly"]["severity"],
            "country": {"name": reading["country"]["name"], "isoCode": reading["country"]["isoCode"]},
            "metric": metric,
            "threshold": {"temperature": 35, "co2Level": 430, "airQualityIndex": 200}.get(metric, 100),
            "currentValue": reading["metrics"][metric],
            "status": status,
            "assignedTo": assignee["_id"],
            "resolvedAt": now - timedelta(days=random_int(1, 60)) if status == "resolved" else None,
            "resolvedBy": assignee["_id"] if status == "resolved" else None,
            "notes": "",
            "createdAt": reading["timestamp"],
            "updatedAt": reading["timestamp"],
        })

    await db.alerts.insert_many(alerts_data)
    print(f"   Success: {len(alerts_data)} alerts created\n")

    # ── Seed Reports ────────────────────────────────────────────────────────
    print("Seeding reports...")
    report_types = ["monthly", "quarterly", "annual", "custom", "anomaly", "comparison"]
    reports_data = []

    for i in range(12):
        author = pick_random(non_viewers)
        r_type = report_types[i % len(report_types)]
        sample_countries = random.sample(COUNTRIES, min(5, len(COUNTRIES)))

        reports_data.append({
            "title": f"{r_type.capitalize()} Climate Report - {datetime(2024 + i // 6, (i % 6) + 1, 1).strftime('%B %Y')}",
            "type": r_type,
            "generatedBy": author["_id"],
            "countries": [{"name": c["name"], "isoCode": c["isoCode"]} for c in sample_countries],
            "dateRange": {
                "start": datetime(2024, 1, 1, tzinfo=timezone.utc),
                "end": datetime(2026, 6, 30, tzinfo=timezone.utc),
            },
            "summary": f"Comprehensive {r_type} analysis of climate data across {len(sample_countries)} countries.",
            "data": {},
            "format": pick_random(["pdf", "csv", "json"]),
            "status": "completed",
            "fileUrl": "",
            "metrics": {
                "totalReadings": random_int(100, 500),
                "anomaliesDetected": random_int(5, 50),
                "avgTemperature": round(random_between(10, 30), 1),
                "avgCO2": round(random_between(410, 430), 1),
            },
            "createdAt": now - timedelta(days=random_int(1, 180)),
            "updatedAt": now,
        })

    await db.reports.insert_many(reports_data)
    print(f"   Success: {len(reports_data)} reports created\n")

    # ── Seed Support Tickets ────────────────────────────────────────────────
    print("Seeding support tickets...")
    categories = ["bug", "feature_request", "data_issue", "access", "general", "performance"]
    priorities = ["low", "medium", "high", "urgent"]
    ticket_statuses = ["open", "in_progress", "waiting", "resolved", "closed"]

    tickets_data = []
    for i in range(17):
        submitter = pick_random(users)
        tickets_data.append({
            "subject": f"Support request #{i + 1} - {pick_random(categories).replace('_', ' ').title()}",
            "description": f"Detailed description of the support request regarding {pick_random(categories).replace('_', ' ')}.",
            "category": pick_random(categories),
            "priority": pick_random(priorities),
            "status": pick_random(ticket_statuses),
            "submittedBy": submitter["_id"],
            "submittedByName": submitter["name"],
            "assignedTo": pick_random(non_viewers)["_id"] if random.random() > 0.3 else None,
            "assignedToName": "",
            "messages": [],
            "resolvedAt": None,
            "createdAt": now - timedelta(days=random_int(1, 90)),
            "updatedAt": now,
        })

    await db.supporttickets.insert_many(tickets_data)
    print(f"   Success: {len(tickets_data)} support tickets created\n")

    # ── Seed Audit Logs ─────────────────────────────────────────────────────
    print("Seeding audit logs...")
    actions = [
        "login", "logout", "create_reading", "update_reading",
        "create_alert", "acknowledge_alert", "resolve_alert",
        "generate_report", "create_user", "update_user",
        "create_ticket", "update_ticket", "update_settings",
    ]
    resources = ["user", "climate_reading", "alert", "report", "support_ticket", "settings", "system"]

    audit_data = []
    for i in range(55):
        actor = pick_random(users)
        action = pick_random(actions)
        audit_data.append({
            "user": actor["_id"],
            "userName": actor["name"],
            "action": action,
            "resource": pick_random(resources),
            "resourceId": "",
            "details": f"User {actor['name']} performed {action.replace('_', ' ')}",
            "ipAddress": f"192.168.1.{random_int(1, 254)}",
            "userAgent": "Mozilla/5.0",
            "createdAt": now - timedelta(days=random_int(0, 90), hours=random_int(0, 23)),
            "updatedAt": now,
        })

    await db.auditlogs.insert_many(audit_data)
    print(f"   Success: {len(audit_data)} audit logs created\n")

    # ── Summary ─────────────────────────────────────────────────────────────
    print("===============================================")
    print("  Seed completed successfully!")
    print("===============================================")
    print(f"  Users:            {len(users)}")
    print(f"  Climate Readings: {len(readings)}")
    print(f"  Countries:        {len(COUNTRIES)}")
    print(f"  Alerts:           {len(alerts_data)}")
    print(f"  Reports:          {len(reports_data)}")
    print(f"  Support Tickets:  {len(tickets_data)}")
    print(f"  Audit Logs:       {len(audit_data)}")
    print("===============================================")
    print()
    print("  Default credentials:")
    print("  ---------------------")
    print("  Admin:   admin@earthscape.io    / password123")
    print("  Analyst: james@earthscape.io    / password123")
    print("  Viewer:  emily@earthscape.io    / password123")
    print()

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
