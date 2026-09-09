"""ThingsBoard Outbox Worker for PostgreSQL stroller_db."""

from __future__ import annotations

import json
import os
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, List, Dict, Optional
import psycopg2
from psycopg2.extras import RealDictCursor


def now_ms() -> int:
    return int(time.time() * 1000)


class ThingsBoardClient:
    def __init__(self, tb_url: str, device_token: str, enabled: bool):
        self.url = tb_url.rstrip("/")
        self.token = device_token.strip()
        self.enabled = enabled

    @property
    def configured(self) -> bool:
        return bool(
            self.enabled
            and self.token
            and self.token not in ("", "PASTE_DEVICE_ACCESS_TOKEN_HERE")
        )

    def send_telemetry_json(self, telemetry_json: str) -> None:
        token_encoded = urllib.parse.quote(self.token, safe="")
        endpoint = f"{self.url}/api/v1/{token_encoded}/telemetry"
        req = urllib.request.Request(
            endpoint,
            data=telemetry_json.encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "User-Agent": "SmartRetailCart/1.0",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status < 200 or resp.status >= 300:
                    raise RuntimeError(f"ThingsBoard HTTP {resp.status}")
        except urllib.error.HTTPError as exc:
            body = exc.read(300).decode("utf-8", errors="replace")
            raise RuntimeError(f"ThingsBoard HTTP {exc.code}: {body}") from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"ThingsBoard connection error: {exc.reason}") from exc


class ThingsBoardWorker:
    def __init__(
        self,
        get_db_connection_func,
        tb_url: str,
        device_token: str,
        enabled: bool,
        interval_seconds: float = 5.0,
    ):
        self.get_db = get_db_connection_func
        self.client = ThingsBoardClient(tb_url, device_token, enabled)
        self.interval = max(1.0, interval_seconds)
        self._stop_event = threading.Event()
        self._sync_lock = threading.Lock()
        self._thread: Optional[threading.Thread] = None

    def start(self) -> None:
        if self._thread is not None:
            return
        self._stop_event.clear()
        self._thread = threading.Thread(
            target=self._run,
            name="thingsboard-outbox-worker",
            daemon=True,
        )
        self._thread.start()
        print(f"📡 [ThingsBoard Worker] Đã khởi động background worker (Configured: {self.client.configured})")

    def stop(self) -> None:
        self._stop_event.set()
        if self._thread is not None:
            self._thread.join(timeout=3)
            self._thread = None
            print("🛑 [ThingsBoard Worker] Đã dừng background worker")

    def _run(self) -> None:
        while not self._stop_event.is_set():
            if self.client.configured:
                try:
                    self.sync_once()
                except Exception as e:
                    print("⚠️ [ThingsBoard Worker] Lỗi chu kỳ đồng bộ:", e)
            self._stop_event.wait(self.interval)

    def fetch_pending_outbox(self, limit: int = 50) -> List[Dict[str, Any]]:
        conn = self.get_db()
        try:
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute("""
                SELECT id, reference_type, reference_id, telemetry_json, attempts, next_attempt_at_ms, status, created_at_ms
                FROM thingsboard_outbox
                WHERE status = 'pending' AND (next_attempt_at_ms IS NULL OR next_attempt_at_ms <= %s)
                ORDER BY id ASC
                LIMIT %s
            """, (now_ms(), limit))
            rows = cur.fetchall()
            cur.close()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    def mark_outbox_sent(self, outbox_id: int) -> None:
        conn = self.get_db()
        conn.autocommit = True
        try:
            cur = conn.cursor()
            cur.execute("""
                UPDATE thingsboard_outbox
                SET status = 'sent',
                    attempts = attempts + 1,
                    sent_at_ms = %s,
                    last_error = NULL
                WHERE id = %s
            """, (now_ms(), outbox_id))
            cur.close()
        finally:
            conn.close()

    def mark_outbox_retry(self, outbox_id: int, attempts: int, error: str) -> None:
        delay_seconds = min(300, 2 ** min(attempts, 8))
        next_attempt = now_ms() + delay_seconds * 1000
        conn = self.get_db()
        conn.autocommit = True
        try:
            cur = conn.cursor()
            cur.execute("""
                UPDATE thingsboard_outbox
                SET attempts = attempts + 1,
                    next_attempt_at_ms = %s,
                    last_error = %s
                WHERE id = %s
            """, (next_attempt, error[:500], outbox_id))
            cur.close()
        finally:
            conn.close()

    def outbox_status(self) -> Dict[str, Any]:
        conn = self.get_db()
        try:
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute("""
                SELECT status, COUNT(*) AS count
                FROM thingsboard_outbox
                GROUP BY status
            """)
            rows = cur.fetchall()
            cur.execute("""
                SELECT last_error, attempts, created_at_ms
                FROM thingsboard_outbox
                WHERE last_error IS NOT NULL
                ORDER BY id DESC
                LIMIT 1
            """)
            last_err = cur.fetchone()
            cur.close()

            counts = {"pending": 0, "sent": 0}
            for r in rows:
                counts[r["status"]] = int(r["count"])

            return {
                **counts,
                "last_error": dict(last_err) if last_err else None,
            }
        except Exception as e:
            return {"error": str(e), "pending": 0, "sent": 0}
        finally:
            conn.close()

    def sync_once(self, limit: int = 50) -> Dict[str, Any]:
        if not self.client.configured:
            return {
                "configured": False,
                "sent": 0,
                "failed": 0,
                "message": "ThingsBoard đang tắt hoặc chưa có device token",
            }

        sent = 0
        failed = 0
        with self._sync_lock:
            pending = self.fetch_pending_outbox(limit=limit)
            for row in pending:
                try:
                    payload = row["telemetry_json"]
                    json.loads(payload)  # Validate JSON
                    self.client.send_telemetry_json(payload)
                    self.mark_outbox_sent(row["id"])
                    sent += 1
                except Exception as exc:
                    self.mark_outbox_retry(row["id"], int(row.get("attempts") or 0) + 1, str(exc))
                    failed += 1
        return {
            "configured": True,
            "sent": sent,
            "failed": failed,
        }
