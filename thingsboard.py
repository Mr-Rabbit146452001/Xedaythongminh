"""Reliable SQLite-outbox delivery to the ThingsBoard device HTTP API."""

from __future__ import annotations

import json
import threading
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

from config import Settings
from database import Database


class ThingsBoardClient:
    def __init__(self, settings: Settings):
        self.settings = settings

    @property
    def configured(self) -> bool:
        return bool(
            self.settings.thingsboard_enabled
            and self.settings.thingsboard_device_token
            and self.settings.thingsboard_device_token
            != "PASTE_DEVICE_ACCESS_TOKEN_HERE"
        )

    def send_telemetry_json(self, telemetry_json: str) -> None:
        token = urllib.parse.quote(
            self.settings.thingsboard_device_token, safe=""
        )
        url = f"{self.settings.thingsboard_url}/api/v1/{token}/telemetry"
        request = urllib.request.Request(
            url,
            data=telemetry_json.encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "User-Agent": "SmartRetailCart/1.0",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=10) as response:
                if response.status < 200 or response.status >= 300:
                    raise RuntimeError(f"ThingsBoard HTTP {response.status}")
        except urllib.error.HTTPError as exc:
            response_body = exc.read(300).decode("utf-8", errors="replace")
            raise RuntimeError(
                f"ThingsBoard HTTP {exc.code}: {response_body}"
            ) from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"ThingsBoard connection error: {exc.reason}") from exc


class ThingsBoardWorker:
    def __init__(self, database: Database, settings: Settings):
        self.database = database
        self.settings = settings
        self.client = ThingsBoardClient(settings)
        self._stop_event = threading.Event()
        self._sync_lock = threading.Lock()
        self._thread: threading.Thread | None = None

    def start(self) -> None:
        if self._thread is not None:
            return
        self._thread = threading.Thread(
            target=self._run,
            name="thingsboard-outbox-worker",
            daemon=True,
        )
        self._thread.start()

    def stop(self) -> None:
        self._stop_event.set()
        if self._thread is not None:
            self._thread.join(timeout=3)

    def _run(self) -> None:
        while not self._stop_event.is_set():
            if self.client.configured:
                self.sync_once()
            self._stop_event.wait(
                self.settings.thingsboard_sync_interval_seconds
            )

    def sync_once(self, limit: int = 20) -> dict[str, Any]:
        if not self.client.configured:
            return {
                "configured": False,
                "sent": 0,
                "failed": 0,
                "message": "ThingsBoard dang tat hoac chua co device token",
            }

        sent = 0
        failed = 0
        with self._sync_lock:
            rows = self.database.fetch_pending_outbox(limit=limit)
            for row in rows:
                try:
                    # Validate stored payload before sending corrupted data.
                    json.loads(row["telemetry_json"])
                    self.client.send_telemetry_json(row["telemetry_json"])
                    self.database.mark_outbox_sent(row["id"])
                    sent += 1
                except Exception as exc:  # The outbox must survive all network errors.
                    self.database.mark_outbox_retry(
                        row["id"], int(row["attempts"]) + 1, str(exc)
                    )
                    failed += 1
        return {
            "configured": True,
            "sent": sent,
            "failed": failed,
        }

