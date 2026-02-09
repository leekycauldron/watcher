"""Watcher FastAPI application."""

import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.config import CORS_ORIGINS, FRONTEND_DIST, LOG_PATH
from backend.database import get_config_value, init_db
from backend.stream_manager import StreamManager
from backend.routers import stream, config_router, system, websocket

# ── Logging ──────────────────────────────────────────────────────────────
LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(name)-24s  %(levelname)-7s  %(message)s",
    handlers=[
        logging.FileHandler(str(LOG_PATH)),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger("watcher")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: init DB + StreamManager. Shutdown: stop StreamManager."""
    logger.info("Watcher starting up")

    # Database
    await init_db()
    logger.info("Database initialized")

    # Stream manager — use DB-stored RTSP URL if available
    rtsp_url = await get_config_value("rtsp_url")
    sm = StreamManager(rtsp_url=rtsp_url or "rtsp://localhost:8554/cam")
    sm.start()
    app.state.stream_manager = sm
    app.state.start_time = time.time()
    app.state.armed = False

    yield

    sm.stop()
    logger.info("Watcher shut down")


app = FastAPI(title="Watcher", version="0.1.0", lifespan=lifespan)

# ── CORS ─────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────
app.include_router(stream.router)
app.include_router(config_router.router)
app.include_router(system.router)
app.include_router(websocket.router)

# ── Static files (production SPA) ───────────────────────────────────────
if FRONTEND_DIST.is_dir():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend")
