"""SQLite database layer using aiosqlite."""

import aiosqlite
from datetime import datetime, timezone

from backend.config import DB_PATH, CONFIG_DEFAULTS

_db_path = str(DB_PATH)


async def init_db() -> None:
    """Create tables and seed default config values."""
    async with aiosqlite.connect(_db_path) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS config (
                key        TEXT PRIMARY KEY,
                value      TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        now = datetime.now(timezone.utc).isoformat()
        for key, value in CONFIG_DEFAULTS.items():
            await db.execute(
                "INSERT OR IGNORE INTO config (key, value, updated_at) VALUES (?, ?, ?)",
                (key, value, now),
            )
        await db.commit()


async def get_all_config() -> dict[str, str]:
    """Return all config key-value pairs."""
    async with aiosqlite.connect(_db_path) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT key, value FROM config")
        rows = await cursor.fetchall()
        return {row["key"]: row["value"] for row in rows}


async def get_config_value(key: str) -> str | None:
    """Return a single config value, or None if missing."""
    async with aiosqlite.connect(_db_path) as db:
        cursor = await db.execute("SELECT value FROM config WHERE key = ?", (key,))
        row = await cursor.fetchone()
        return row[0] if row else None


async def set_config_value(key: str, value: str) -> None:
    """Upsert a config key-value pair."""
    now = datetime.now(timezone.utc).isoformat()
    async with aiosqlite.connect(_db_path) as db:
        await db.execute(
            """INSERT INTO config (key, value, updated_at) VALUES (?, ?, ?)
               ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at""",
            (key, value, now),
        )
        await db.commit()
