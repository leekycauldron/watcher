#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo "============================================"
echo "  Watcher — Setup"
echo "============================================"
echo

# ── Python venv ─────────────────────────────
echo "[1/4] Creating Python virtual environment..."
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi
source .venv/bin/activate
echo "      .venv OK"

# ── Python deps ─────────────────────────────
echo "[2/4] Installing Python dependencies..."
pip install -r backend/requirements.txt --quiet
echo "      pip OK"

# ── Node deps ───────────────────────────────
echo "[3/4] Installing frontend dependencies..."
cd frontend
npm install --silent
echo "      npm OK"

# ── Frontend build ──────────────────────────
echo "[4/4] Building frontend..."
npm run build
cd ..
echo "      build OK"

echo
echo "============================================"
echo "  Setup complete!"
echo
echo "  Next steps:"
echo "    1. Download mediamtx for your platform from:"
echo "       https://github.com/bluenviron/mediamtx/releases"
echo "       Place the binary in the mediamtx/ folder."
echo
echo "    2. Edit mediamtx/mediamtx.yml if your Pi"
echo "       IP differs from 192.168.2.150."
echo
echo "    3. Run: ./start.sh"
echo "============================================"
