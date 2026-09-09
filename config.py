"""Configuration loaded from environment variables and an optional .env file."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import quote


BASE_DIR = Path(__file__).resolve().parent


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


load_env_file(BASE_DIR / ".env")


@dataclass(frozen=True)
class Settings:
    database_url: str
    db_path: Path
    ai_threshold: float
    thingsboard_url: str
    thingsboard_device_token: str
    thingsboard_enabled: bool
    thingsboard_sync_interval_seconds: float


def get_settings() -> Settings:
    raw_db_path = Path(os.getenv("SMARTCART_DB_PATH", "data/smartcart.db"))
    db_path = raw_db_path if raw_db_path.is_absolute() else BASE_DIR / raw_db_path
    database_url = os.getenv("DATABASE_URL", "").strip()
    postgres_password = os.getenv("POSTGRES_PASSWORD", "")
    if not database_url and postgres_password:
        postgres_user = quote(os.getenv("POSTGRES_USER", "smartcart_app"), safe="")
        postgres_password_encoded = quote(postgres_password, safe="")
        postgres_host = os.getenv("POSTGRES_HOST", "127.0.0.1")
        postgres_port = os.getenv("POSTGRES_PORT", "5432")
        postgres_db = quote(os.getenv("POSTGRES_DB", "smartcart_retail"), safe="")
        database_url = (
            f"postgresql://{postgres_user}:{postgres_password_encoded}"
            f"@{postgres_host}:{postgres_port}/{postgres_db}"
        )
    if not database_url:
        database_url = f"sqlite:///{db_path.as_posix()}"
    return Settings(
        database_url=database_url,
        db_path=db_path,
        ai_threshold=float(os.getenv("SMARTCART_AI_THRESHOLD", "0.80")),
        thingsboard_url=os.getenv(
            "THINGSBOARD_URL", "https://thingsboard.cloud"
        ).rstrip("/"),
        thingsboard_device_token=os.getenv(
            "THINGSBOARD_DEVICE_TOKEN", ""
        ).strip(),
        thingsboard_enabled=env_bool("THINGSBOARD_ENABLED", False),
        thingsboard_sync_interval_seconds=max(
            1.0, float(os.getenv("THINGSBOARD_SYNC_INTERVAL_SECONDS", "5"))
        ),
    )
