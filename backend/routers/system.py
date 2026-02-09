"""System endpoints — health metrics, overall status."""

import time

from fastapi import APIRouter, Request

from backend.models import SystemHealth, SystemStatus, StreamStatus
from backend.services.health import get_system_health

router = APIRouter(prefix="/api/system", tags=["system"])


@router.get("/health", response_model=SystemHealth)
async def health() -> SystemHealth:
    """Return CPU, RAM, GPU, and disk metrics."""
    return get_system_health()


@router.get("/status", response_model=SystemStatus)
async def status(request: Request) -> SystemStatus:
    """Return armed state, uptime, stream status, and system health."""
    app = request.app
    uptime = time.time() - app.state.start_time
    stream_data = app.state.stream_manager.get_status()
    return SystemStatus(
        armed=app.state.armed,
        uptime_seconds=round(uptime, 1),
        stream=StreamStatus(**stream_data),
        health=get_system_health(),
    )
