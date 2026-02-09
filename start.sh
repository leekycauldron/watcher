#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo "============================================"
echo "  Watcher — Starting services"
echo "============================================"

# Check setup has been run
if [ ! -d ".venv" ]; then
    echo "ERROR: Run ./setup.sh first."
    exit 1
fi

source .venv/bin/activate

# Launch mediamtx in the background
echo "[1/2] Starting mediamtx..."
if [ -f "mediamtx/mediamtx" ]; then
    cd mediamtx && ./mediamtx &
    cd ..
    sleep 2
else
    echo "      WARNING: mediamtx binary not found — skipping."
    echo "      Stream proxy will not be available."
fi

# Launch FastAPI backend
echo "[2/2] Starting backend on 0.0.0.0:8000..."
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
