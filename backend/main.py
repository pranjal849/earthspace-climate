"""
EarthScape Climate Intelligence Platform — FastAPI Backend
Replaces the Node.js/Express API routes and Socket.io server.
"""
import asyncio
from contextlib import asynccontextmanager

import socketio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from database import connect_db, close_db
from realtime import sio, realtime_feed

# Import all routers
from routers import auth, dashboard, climate_data, countries, analytics
from routers import alerts, reports, support
from routers import admin_users, admin_audit, admin_settings

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup
    await connect_db()
    print("\nEarthScape FastAPI backend starting...")
    print("Connected to MongoDB")

    # Start the real-time feed background task
    task = asyncio.create_task(realtime_feed())
    print("Real-time feed: generating readings every 3 seconds\n")

    yield

    # Shutdown
    task.cancel()
    await close_db()
    print("\nEarthScape FastAPI backend stopped.")


# Create FastAPI app
app = FastAPI(
    title="EarthScape Climate Intelligence Platform",
    description="Backend API for the EarthScape climate monitoring platform.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(climate_data.router)
app.include_router(countries.router)
app.include_router(analytics.router)
app.include_router(alerts.router)
app.include_router(reports.router)
app.include_router(support.router)
app.include_router(admin_users.router)
app.include_router(admin_audit.router)
app.include_router(admin_settings.router)

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "earthscape-backend"}


# Wrap FastAPI with Socket.io ASGI app
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)


if __name__ == "__main__":
    print(f"\nStarting EarthScape backend on http://localhost:{settings.PORT}")
    print(f"Socket.io ready\n")
    uvicorn.run(
        socket_app,
        host=settings.HOST,
        port=settings.PORT,
        log_level="info",
    )
