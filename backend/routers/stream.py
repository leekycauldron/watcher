"""Stream endpoints — snapshot, MJPEG, status."""

import asyncio
import time

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, Response, StreamingResponse

from backend.config import MJPEG_FPS

router = APIRouter(prefix="/api/stream", tags=["stream"])


@router.get("/snapshot")
async def snapshot(request: Request) -> Response:
    """Return the current frame as a JPEG image."""
    sm = request.app.state.stream_manager
    jpeg = sm.get_jpeg()
    if jpeg is None:
        return JSONResponse({"error": "No frame available"}, status_code=503)
    return Response(content=jpeg, media_type="image/jpeg")


@router.get("/mjpeg")
async def mjpeg_feed(request: Request) -> StreamingResponse:
    """Multipart MJPEG stream at ~15 fps."""
    sm = request.app.state.stream_manager
    interval = 1.0 / MJPEG_FPS

    async def generate():
        while True:
            jpeg = sm.get_jpeg()
            if jpeg is not None:
                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n"
                    b"Content-Length: " + str(len(jpeg)).encode() + b"\r\n\r\n"
                    + jpeg + b"\r\n"
                )
            await asyncio.sleep(interval)

    return StreamingResponse(
        generate(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


@router.get("/status")
async def stream_status(request: Request) -> dict:
    """Return current stream connection status."""
    return request.app.state.stream_manager.get_status()
