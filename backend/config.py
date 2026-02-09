"""Watcher configuration — paths, defaults, constants."""

from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────
ROOT_DIR = Path(__file__).resolve().parent.parent
DB_PATH = ROOT_DIR / "watcher.db"
LOG_PATH = ROOT_DIR / "logs" / "watcher.log"
FRONTEND_DIST = ROOT_DIR / "frontend" / "dist"

# ── Stream defaults ──────────────────────────────────────────────────────
DEFAULT_RTSP_URL = "rtsp://localhost:8554/cam"
STREAM_RECONNECT_INITIAL_DELAY = 1.0   # seconds
STREAM_RECONNECT_MULTIPLIER = 1.5
STREAM_RECONNECT_MAX_DELAY = 10.0      # seconds
STREAM_JPEG_QUALITY = 80
MJPEG_FPS = 15

# ── Config defaults (seeded into DB on first run) ────────────────────────
CONFIG_DEFAULTS: dict[str, str] = {
    "rtsp_url": DEFAULT_RTSP_URL,
    "detection_confidence": "0.5",
    "motion_threshold": "25",
    "webhook_url": "",
    "retention_days": "30",
    "armed": "false",
}

# ── Server ───────────────────────────────────────────────────────────────
API_HOST = "0.0.0.0"
API_PORT = 8000
CORS_ORIGINS = ["*"]

# ── MediaMTX ─────────────────────────────────────────────────────────────
MEDIAMTX_WEBRTC_PORT = 8889
