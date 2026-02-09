"""Config endpoints — read/write application configuration."""

from fastapi import APIRouter, HTTPException, Request

from backend.database import get_all_config, get_config_value, set_config_value
from backend.models import ConfigItem, ConfigResponse

router = APIRouter(prefix="/api/config", tags=["config"])


@router.get("", response_model=ConfigResponse)
async def read_all_config() -> ConfigResponse:
    """Return all configuration key-value pairs."""
    return ConfigResponse(config=await get_all_config())


@router.get("/{key}")
async def read_config(key: str) -> dict:
    """Return a single config value."""
    value = await get_config_value(key)
    if value is None:
        raise HTTPException(status_code=404, detail=f"Config key '{key}' not found")
    return {"key": key, "value": value}


@router.put("/{key}")
async def update_config(key: str, item: ConfigItem, request: Request) -> dict:
    """Update a config value. Triggers stream reconnect if key is rtsp_url."""
    await set_config_value(key, item.value)

    if key == "rtsp_url":
        sm = request.app.state.stream_manager
        sm.reconnect(new_url=item.value)

    return {"key": key, "value": item.value, "updated": True}
