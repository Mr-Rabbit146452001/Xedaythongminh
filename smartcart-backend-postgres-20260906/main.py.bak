"""Smart Retail Cart backend: FastAPI, SQLite and ThingsBoard telemetry."""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Any, Literal

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from config import get_settings
from database import Database, DomainError
from thingsboard import ThingsBoardWorker


settings = get_settings()
database = Database(settings.database_url, settings.ai_threshold)
thingsboard_worker = ThingsBoardWorker(database, settings)


@asynccontextmanager
async def lifespan(_: FastAPI):
    database.initialize()
    thingsboard_worker.start()
    yield
    thingsboard_worker.stop()


app = FastAPI(
    title="Smart Retail Cart API",
    version="0.1.0",
    description=(
        "Backend offline-first: luu SQLite truoc, sau do gui telemetry "
        "len ThingsBoard bang outbox co retry."
    ),
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://127.0.0.1"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(DomainError)
async def handle_domain_error(_, exc: DomainError):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


class ProductIn(BaseModel):
    barcode: str = Field(min_length=4, max_length=64)
    sku: str = Field(min_length=1, max_length=64)
    name: str = Field(min_length=1, max_length=200)
    vision_class: str = Field(min_length=1, max_length=100)
    price_vnd: int | None = Field(default=None, ge=0)
    expected_weight_g: float | None = Field(default=None, gt=0)
    weight_tolerance_g: float | None = Field(default=None, ge=0)
    active: bool = True


class SensorEventIn(BaseModel):
    session_id: str | None = None
    source: Literal[
        "gm65", "vision", "hx711", "weight_simulated", "fusion", "system"
    ]
    event_type: str = Field(min_length=1, max_length=100)
    barcode: str | None = None
    ai_class: str | None = None
    ai_confidence: float | None = Field(default=None, ge=0, le=1)
    weight_g: float | None = None
    delta_weight_g: float | None = None
    decision: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at_ms: int | None = Field(default=None, gt=0)


class CartDecisionIn(BaseModel):
    session_id: str
    action: Literal["add", "remove"]
    barcode: str
    ai_class: str
    ai_confidence: float = Field(ge=0, le=1)
    delta_weight_g: float
    weight_source: Literal["hx711", "simulated"] = "simulated"
    created_at_ms: int | None = Field(default=None, gt=0)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "service": "Smart Retail Cart API",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "database": database.description,
        "thingsboard": {
            "enabled": settings.thingsboard_enabled,
            "configured": thingsboard_worker.client.configured,
            **database.outbox_status(),
        },
    }


@app.get("/api/v1/products")
def list_products() -> list[dict[str, Any]]:
    return database.list_products()


@app.put("/api/v1/products/{barcode}")
def upsert_product(barcode: str, product: ProductIn) -> dict[str, Any]:
    values = product.model_dump()
    values["barcode"] = barcode
    return database.upsert_product(values)


@app.post("/api/v1/sessions", status_code=201)
def create_session() -> dict[str, Any]:
    return database.create_session()


@app.get("/api/v1/sessions/active")
def latest_active_session() -> dict[str, Any]:
    return database.latest_active_session()


@app.post("/api/v1/sessions/{session_id}/complete")
def complete_session(session_id: str) -> dict[str, Any]:
    return database.complete_session(session_id)


@app.post("/api/v1/events", status_code=201)
def record_event(event: SensorEventIn) -> dict[str, Any]:
    return database.record_sensor_event(event.model_dump())


@app.get("/api/v1/events")
def list_events(
    limit: int = Query(default=100, ge=1, le=1000),
) -> list[dict[str, Any]]:
    return database.list_sensor_events(limit)


@app.post("/api/v1/cart/decisions")
def cart_decision(decision: CartDecisionIn) -> dict[str, Any]:
    return database.process_cart_decision(decision.model_dump())


@app.get("/api/v1/cart/{session_id}")
def get_cart(session_id: str) -> dict[str, Any]:
    return database.cart_snapshot(session_id)


@app.get("/api/v1/thingsboard/status")
def thingsboard_status() -> dict[str, Any]:
    return {
        "enabled": settings.thingsboard_enabled,
        "configured": thingsboard_worker.client.configured,
        "url": settings.thingsboard_url,
        **database.outbox_status(),
    }


@app.post("/api/v1/thingsboard/sync")
def thingsboard_sync() -> dict[str, Any]:
    return {
        **thingsboard_worker.sync_once(limit=100),
        "outbox": database.outbox_status(),
    }
