"""Pydantic schemas for API request/response models."""

from pydantic import BaseModel


class StreamStatus(BaseModel):
    connected: bool
    fps: float
    width: int
    height: int
    reconnect_attempts: int
    last_frame_at: str | None
    rtsp_url: str
    error: str | None


class ConfigItem(BaseModel):
    value: str


class ConfigResponse(BaseModel):
    config: dict[str, str]


class SystemHealth(BaseModel):
    cpu_percent: float
    ram_percent: float
    ram_used_gb: float
    ram_total_gb: float
    gpu_name: str | None
    gpu_percent: float | None
    gpu_memory_percent: float | None
    gpu_temp_c: float | None
    disk_percent: float
    disk_used_gb: float
    disk_total_gb: float


class SystemStatus(BaseModel):
    armed: bool
    uptime_seconds: float
    stream: StreamStatus
    health: SystemHealth
