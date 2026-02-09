"""RTSP stream capture with auto-reconnect and thread-safe frame access."""

import logging
import threading
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone

import cv2
import numpy as np

from backend.config import (
    DEFAULT_RTSP_URL,
    STREAM_JPEG_QUALITY,
    STREAM_RECONNECT_INITIAL_DELAY,
    STREAM_RECONNECT_MAX_DELAY,
    STREAM_RECONNECT_MULTIPLIER,
)

logger = logging.getLogger("watcher.stream")


@dataclass
class StreamState:
    connected: bool = False
    fps: float = 0.0
    width: int = 0
    height: int = 0
    reconnect_attempts: int = 0
    last_frame_at: str | None = None
    error: str | None = None


class StreamManager:
    """Captures RTSP frames in a background thread with auto-reconnect."""

    def __init__(self, rtsp_url: str = DEFAULT_RTSP_URL) -> None:
        self._rtsp_url = rtsp_url
        self._lock = threading.Lock()
        self._frame: np.ndarray | None = None
        self._state = StreamState()
        self._running = False
        self._thread: threading.Thread | None = None
        self._fps_counter: list[float] = []

    @property
    def rtsp_url(self) -> str:
        return self._rtsp_url

    def start(self) -> None:
        if self._running:
            return
        self._running = True
        self._thread = threading.Thread(target=self._capture_loop, daemon=True)
        self._thread.start()
        logger.info("StreamManager started — target: %s", self._rtsp_url)

    def stop(self) -> None:
        self._running = False
        if self._thread:
            self._thread.join(timeout=5)
        logger.info("StreamManager stopped")

    def reconnect(self, new_url: str | None = None) -> None:
        """Trigger a reconnect, optionally with a new URL."""
        if new_url:
            self._rtsp_url = new_url
        # Signal the capture loop to drop the current connection
        with self._lock:
            self._state.connected = False
            self._state.reconnect_attempts = 0
        logger.info("StreamManager reconnect requested — url: %s", self._rtsp_url)

    def get_frame(self) -> np.ndarray | None:
        with self._lock:
            return self._frame.copy() if self._frame is not None else None

    def get_jpeg(self) -> bytes | None:
        frame = self.get_frame()
        if frame is None:
            return None
        ok, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, STREAM_JPEG_QUALITY])
        return buf.tobytes() if ok else None

    def get_status(self) -> dict:
        with self._lock:
            return {
                "connected": self._state.connected,
                "fps": round(self._state.fps, 1),
                "width": self._state.width,
                "height": self._state.height,
                "reconnect_attempts": self._state.reconnect_attempts,
                "last_frame_at": self._state.last_frame_at,
                "rtsp_url": self._rtsp_url,
                "error": self._state.error,
            }

    # ── private ──────────────────────────────────────────────────────────

    def _capture_loop(self) -> None:
        delay = STREAM_RECONNECT_INITIAL_DELAY

        while self._running:
            cap = cv2.VideoCapture(self._rtsp_url, cv2.CAP_FFMPEG)
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

            if not cap.isOpened():
                with self._lock:
                    self._state.connected = False
                    self._state.reconnect_attempts += 1
                    self._state.error = f"Cannot open {self._rtsp_url}"
                logger.warning(
                    "RTSP open failed (attempt %d), retry in %.1fs",
                    self._state.reconnect_attempts,
                    delay,
                )
                time.sleep(delay)
                delay = min(delay * STREAM_RECONNECT_MULTIPLIER, STREAM_RECONNECT_MAX_DELAY)
                continue

            # Connected
            delay = STREAM_RECONNECT_INITIAL_DELAY
            with self._lock:
                self._state.connected = True
                self._state.reconnect_attempts = 0
                self._state.error = None
            logger.info("RTSP connected: %s", self._rtsp_url)

            frame_times: list[float] = []

            while self._running and self._state.connected:
                ok, frame = cap.read()
                if not ok:
                    with self._lock:
                        self._state.connected = False
                        self._state.error = "Frame read failed"
                    logger.warning("Frame read failed — reconnecting")
                    break

                now = time.monotonic()
                frame_times.append(now)
                # Keep only last 30 timestamps for FPS calc
                frame_times = [t for t in frame_times if now - t < 2.0]

                with self._lock:
                    self._frame = frame
                    self._state.last_frame_at = datetime.now(timezone.utc).isoformat()
                    h, w = frame.shape[:2]
                    self._state.width = w
                    self._state.height = h
                    self._state.fps = len(frame_times) / max(now - frame_times[0], 0.001) if len(frame_times) > 1 else 0.0

            cap.release()
            if self._running:
                logger.info("Reconnecting in %.1fs...", delay)
                time.sleep(delay)
                delay = min(delay * STREAM_RECONNECT_MULTIPLIER, STREAM_RECONNECT_MAX_DELAY)
