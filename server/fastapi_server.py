import os
import time
import uuid
import json
from typing import Optional, List, Dict, Any, Literal
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query, Path as FPath
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
import psycopg2
from psycopg2.extras import RealDictCursor

from thingsboard_worker import ThingsBoardWorker

# ==========================================
# CẤU HÌNH BIẾN MÔI TRƯỜNG & DATABASE
# ==========================================
BASE_DIR = Path(__file__).resolve().parent

# Đọc file .env nếu có
env_file = BASE_DIR / ".env"
if env_file.exists():
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 5432))
DB_NAME = os.getenv("DB_NAME", "stroller_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASSWORD", "levanhung#")

AI_THRESHOLD = float(os.getenv("SMARTCART_AI_THRESHOLD", "0.80"))
THINGSBOARD_URL = os.getenv("THINGSBOARD_URL", "https://thingsboard.cloud")
THINGSBOARD_DEVICE_TOKEN = os.getenv("THINGSBOARD_DEVICE_TOKEN", "")
THINGSBOARD_ENABLED = os.getenv("THINGSBOARD_ENABLED", "false").lower() in ("true", "1", "yes")
THINGSBOARD_SYNC_INTERVAL = float(os.getenv("THINGSBOARD_SYNC_INTERVAL_SECONDS", "5"))

def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )

# Khởi tạo ThingsBoard Worker
tb_worker = ThingsBoardWorker(
    get_db_connection_func=get_db_connection,
    tb_url=THINGSBOARD_URL,
    device_token=THINGSBOARD_DEVICE_TOKEN,
    enabled=THINGSBOARD_ENABLED,
    interval_seconds=THINGSBOARD_SYNC_INTERVAL
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Khởi động ThingsBoard Outbox worker
    tb_worker.start()
    yield
    # Dừng worker khi tắt ứng dụng
    tb_worker.stop()

app = FastAPI(
    title="Smart Retail Cart Backend API",
    description="FastAPI IoT Gateway tích hợp PostgreSQL & ThingsBoard Telemetry chuẩn bàn giao",
    version="1.1.0",
    lifespan=lifespan
)

# Kích hoạt CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Phục vụ ảnh sản phẩm tĩnh
image_dir = os.path.join(os.path.dirname(__file__), "public", "images")
if os.path.exists(image_dir):
    app.mount("/images", StaticFiles(directory=image_dir), name="images")

# ==========================================
# PYDANTIC DTO MODELS
# ==========================================
class ProductItem(BaseModel):
    id: Optional[int] = None
    barcode: str
    sku: Optional[str] = None
    name: str
    vision_class: Optional[str] = None
    price_vnd: int
    expected_weight_g: Optional[float] = 0.0
    weight_tolerance_g: Optional[float] = 0.0
    active: Optional[int] = 1
    created_at_ms: Optional[int] = None
    updated_at_ms: Optional[int] = None

class ProductIn(BaseModel):
    barcode: Optional[str] = None
    sku: Optional[str] = None
    name: str
    vision_class: Optional[str] = None
    price_vnd: Optional[int] = Field(default=None, ge=0)
    expected_weight_g: Optional[float] = Field(default=None, ge=0)
    weight_tolerance_g: Optional[float] = Field(default=None, ge=0)
    active: bool = True

class SessionResponse(BaseModel):
    id: str
    status: str
    started_at_ms: int
    ended_at_ms: Optional[int] = None

class CartItemDetail(BaseModel):
    barcode: str
    sku: Optional[str] = None
    name: str
    quantity: int
    unit_price_vnd: int
    line_total_vnd: int

class CartResponse(BaseModel):
    session_id: str
    items: List[CartItemDetail]
    total_quantity: int
    total_vnd: int

class CartDecisionRequest(BaseModel):
    session_id: str
    action: Literal["add", "remove"]
    barcode: str
    ai_class: Optional[str] = None
    ai_confidence: Optional[float] = Field(default=None, ge=0, le=1)
    delta_weight_g: Optional[float] = None
    weight_source: Optional[str] = "simulated"
    created_at_ms: Optional[int] = None

class SensorEventRequest(BaseModel):
    session_id: Optional[str] = None
    source: Optional[str] = "gm65"
    event_type: str
    barcode: Optional[str] = None
    ai_class: Optional[str] = None
    ai_confidence: Optional[float] = Field(default=None, ge=0, le=1)
    weight_g: Optional[float] = None
    delta_weight_g: Optional[float] = None
    decision: Optional[str] = None
    metadata_json: Optional[str] = None

# ==========================================
# 1. HEALTH CHECK & THÔNG TIN HỆ THỐNG
# ==========================================
@app.get("/")
def root():
    return {
        "service": "Smart Retail Cart API",
        "docs": "/docs",
        "health": "/health",
        "version": "1.1.0"
    }

@app.get("/health")
def health_check():
    db_status = "ok"
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
        conn.close()
    except Exception as e:
        db_status = f"error: {str(e)}"

    outbox = tb_worker.outbox_status()
    return {
        "status": "ok" if db_status == "ok" else "error",
        "database": "postgresql",
        "thingsboard": {
            "enabled": THINGSBOARD_ENABLED,
            "configured": tb_worker.client.configured,
            "url": THINGSBOARD_URL,
            **outbox
        },
        "time_ms": int(time.time() * 1000)
    }

# ==========================================
# 2. DANH MỤC SẢN PHẨM
# ==========================================
@app.get("/api/v1/products", response_model=List[ProductItem])
def get_products():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            SELECT id, barcode, sku, name, vision_class, price_vnd, 
                   expected_weight_g, weight_tolerance_g, active, 
                   created_at_ms, updated_at_ms 
            FROM products 
            WHERE active = 1 
            ORDER BY id ASC
        """)
        rows = cur.fetchall()
        return [dict(r) for r in rows]
    finally:
        cur.close()
        conn.close()

@app.get("/api/products")
def get_products_legacy():
    products = get_products()
    return {
        "status": "Thành công",
        "data": [
            {
                "Id": p.id,
                "Barcode": p.barcode,
                "Name": p.name,
                "Price": p.price_vnd,
                "ImageUrl": f"{p.barcode}.jpg"
            }
            for p in products
        ]
    }

@app.put("/api/v1/products/{barcode}")
def upsert_product(barcode: str, item: ProductIn):
    conn = get_db_connection()
    conn.autocommit = True
    cur = conn.cursor()
    now_ms = int(time.time() * 1000)
    active_int = 1 if item.active else 0
    try:
        cur.execute("""
            INSERT INTO products (barcode, sku, name, vision_class, price_vnd, expected_weight_g, weight_tolerance_g, active, created_at_ms, updated_at_ms)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (barcode) DO UPDATE SET
                sku = COALESCE(EXCLUDED.sku, products.sku),
                name = EXCLUDED.name,
                vision_class = COALESCE(EXCLUDED.vision_class, products.vision_class),
                price_vnd = COALESCE(EXCLUDED.price_vnd, products.price_vnd),
                expected_weight_g = COALESCE(EXCLUDED.expected_weight_g, products.expected_weight_g),
                weight_tolerance_g = COALESCE(EXCLUDED.weight_tolerance_g, products.weight_tolerance_g),
                active = EXCLUDED.active,
                updated_at_ms = %s
        """, (barcode, item.sku, item.name, item.vision_class, item.price_vnd or 0, 
              item.expected_weight_g or 0.0, item.weight_tolerance_g or 0.0, active_int, now_ms, now_ms, now_ms))
        return {"status": "success", "barcode": barcode}
    finally:
        cur.close()
        conn.close()

# ==========================================
# 3. QUẢN LÝ PHIÊN MUA HÀNG
# ==========================================
@app.post("/api/v1/sessions", response_model=SessionResponse, status_code=201)
def create_session():
    new_id = str(uuid.uuid4())
    now_ms = int(time.time() * 1000)
    conn = get_db_connection()
    conn.autocommit = True
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO shopping_sessions (id, status, started_at_ms) VALUES (%s, 'active', %s)",
            (new_id, now_ms)
        )
        # Đồng bộ sang bảng shoppingsessions (dành cho Web Admin)
        cur.execute(
            "INSERT INTO shoppingsessions (id, status) VALUES (%s, 'active') ON CONFLICT (id) DO NOTHING",
            (new_id,)
        )
        return SessionResponse(id=new_id, status="active", started_at_ms=now_ms)
    finally:
        cur.close()
        conn.close()

@app.get("/api/v1/sessions/active", response_model=SessionResponse)
def get_active_session():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            SELECT id, status, started_at_ms, ended_at_ms 
            FROM shopping_sessions 
            WHERE status = 'active' 
            ORDER BY started_at_ms DESC 
            LIMIT 1
        """)
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Không có phiên mua sắm nào đang hoạt động")
        return SessionResponse(**dict(row))
    finally:
        cur.close()
        conn.close()

@app.post("/api/v1/sessions/{session_id}/complete", response_model=SessionResponse)
def complete_session(session_id: str):
    now_ms = int(time.time() * 1000)
    conn = get_db_connection()
    conn.autocommit = True
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            "UPDATE shopping_sessions SET status = 'completed', ended_at_ms = %s WHERE id = %s RETURNING id, status, started_at_ms, ended_at_ms",
            (now_ms, session_id)
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Phiên mua hàng không tồn tại")
        
        # Đồng bộ sang bảng shoppingsessions cho Web Admin
        cur.execute("UPDATE shoppingsessions SET status = 'completed', endtime = NOW() WHERE id = %s", (session_id,))

        # Xóa sạch giỏ hàng của phiên đã hoàn tất để tránh rò rỉ dữ liệu
        cur.execute("DELETE FROM cart_items WHERE session_id = %s", (session_id,))

        # Đẩy telemetry hoàn tất phiên lên ThingsBoard
        telemetry = {
            "session_id": session_id,
            "status": "completed",
            "completed_at_ms": now_ms
        }
        cur.execute("""
            INSERT INTO thingsboard_outbox (reference_type, reference_id, telemetry_json, status, created_at_ms)
            VALUES ('session', %s, %s, 'pending', %s)
        """, (session_id, json.dumps(telemetry), now_ms))

        return SessionResponse(**dict(row))
    finally:
        cur.close()
        conn.close()

# ==========================================
# 4. ĐỌC GIỎ HÀNG
# ==========================================
@app.get("/api/v1/cart/{session_id}", response_model=CartResponse)
def get_cart(session_id: str):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            SELECT p.barcode, p.sku, p.name, c.quantity, c.unit_price_vnd, (c.quantity * c.unit_price_vnd) AS line_total_vnd
            FROM cart_items c
            JOIN products p ON c.product_id = p.id
            WHERE c.session_id = %s AND c.quantity > 0
            ORDER BY p.name ASC
        """, (session_id,))
        rows = cur.fetchall()

        items = []
        total_quantity = 0
        total_vnd = 0
        for r in rows:
            qty = int(r["quantity"])
            unit_price = int(r["unit_price_vnd"])
            line_total = int(r["line_total_vnd"])
            items.append(CartItemDetail(
                barcode=r["barcode"],
                sku=r.get("sku"),
                name=r["name"],
                quantity=qty,
                unit_price_vnd=unit_price,
                line_total_vnd=line_total
            ))
            total_quantity += qty
            total_vnd += line_total

        return CartResponse(
            session_id=session_id,
            items=items,
            total_quantity=total_quantity,
            total_vnd=total_vnd
        )
    finally:
        cur.close()
        conn.close()

# ==========================================
# 5. XÁC MINH & CẬP NHẬT GIỎ HÀNG (FUSION DECISION ALGORITHM)
# ==========================================
@app.post("/api/v1/cart/decisions")
def process_cart_decision(decision: CartDecisionRequest):
    conn = get_db_connection()
    conn.autocommit = True
    cur = conn.cursor(cursor_factory=RealDictCursor)
    now_ms = decision.created_at_ms or int(time.time() * 1000)
    reasons: List[str] = []

    try:
        # 1. Đảm bảo session_id tồn tại
        cur.execute("SELECT id FROM shopping_sessions WHERE id = %s", (decision.session_id,))
        if not cur.fetchone():
            cur.execute(
                "INSERT INTO shopping_sessions (id, status, started_at_ms) VALUES (%s, 'active', %s)",
                (decision.session_id, now_ms)
            )
            cur.execute(
                "INSERT INTO shoppingsessions (id, status) VALUES (%s, 'active') ON CONFLICT (id) DO NOTHING",
                (decision.session_id,)
            )

        # 2. Tìm thông tin sản phẩm
        cur.execute("""
            SELECT id, barcode, sku, name, vision_class, price_vnd, 
                   expected_weight_g, weight_tolerance_g, active 
            FROM products 
            WHERE barcode = %s OR id::text = %s
        """, (decision.barcode, decision.barcode))
        product = cur.fetchone()

        if not product:
            reasons.append("product_not_found")
        elif not product.get("active", 1):
            reasons.append("product_inactive")

        # 3. Thuật toán kiểm chứng đa cảm biến (Sensor Fusion Logic):
        if product:
            expected_class = product.get("vision_class")
            if expected_class and decision.ai_class:
                if decision.ai_class.strip().lower() != expected_class.strip().lower():
                    reasons.append("ai_class_mismatch")

            if decision.ai_confidence is not None and decision.ai_confidence < AI_THRESHOLD:
                reasons.append("ai_confidence_low")

            expected_weight = product.get("expected_weight_g")
            tolerance = product.get("weight_tolerance_g")
            if decision.delta_weight_g is not None:
                if expected_weight and expected_weight > 0 and tolerance is not None:
                    if abs(abs(decision.delta_weight_g) - expected_weight) > tolerance:
                        reasons.append("weight_out_of_tolerance")

                if decision.action == "add" and decision.delta_weight_g <= 0:
                    reasons.append("weight_direction_mismatch")
                elif decision.action == "remove" and decision.delta_weight_g >= 0:
                    reasons.append("weight_direction_mismatch")

        # 4. Kiểm tra số lượng trong giỏ nếu thao tác remove
        current_quantity = 0
        if product:
            cur.execute(
                "SELECT quantity FROM cart_items WHERE session_id = %s AND product_id = %s",
                (decision.session_id, product["id"])
            )
            q_row = cur.fetchone()
            current_quantity = int(q_row["quantity"]) if q_row else 0
            if decision.action == "remove" and current_quantity <= 0:
                reasons.append("product_not_in_cart")

        accepted = len(reasons) == 0
        decision_text = "accepted" if accepted else "rejected"
        quantity_delta = (1 if decision.action == "add" else -1) if accepted else 0

        # 5. Cập nhật giỏ hàng nếu quyết định được chấp nhận
        if accepted and product:
            new_quantity = current_quantity + quantity_delta
            if new_quantity <= 0:
                cur.execute(
                    "DELETE FROM cart_items WHERE session_id = %s AND product_id = %s",
                    (decision.session_id, product["id"])
                )
            else:
                cur.execute("""
                    INSERT INTO cart_items (session_id, product_id, quantity, unit_price_vnd, updated_at_ms)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (session_id, product_id) DO UPDATE SET
                        quantity = EXCLUDED.quantity,
                        unit_price_vnd = EXCLUDED.unit_price_vnd,
                        updated_at_ms = EXCLUDED.updated_at_ms
                """, (decision.session_id, product["id"], new_quantity, product["price_vnd"] or 0, now_ms))

        # 6. Ghi nhật ký sự kiện cart_events
        cur.execute("""
            INSERT INTO cart_events (
                session_id, action, product_id, barcode, ai_class,
                ai_confidence, delta_weight_g, weight_source,
                quantity_delta, decision, reasons_json, created_at_ms
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            decision.session_id,
            decision.action,
            product["id"] if product else None,
            decision.barcode,
            decision.ai_class,
            decision.ai_confidence,
            decision.delta_weight_g,
            decision.weight_source,
            quantity_delta,
            decision_text,
            json.dumps(reasons, ensure_ascii=False),
            now_ms
        ))
        event_row = cur.fetchone()
        cart_event_id = int(event_row["id"]) if event_row else None

        # 7. Tính tổng giỏ hàng hiện tại
        cur.execute("""
            SELECT COALESCE(SUM(quantity), 0) AS total_qty, 
                   COALESCE(SUM(quantity * unit_price_vnd), 0) AS total_vnd
            FROM cart_items 
            WHERE session_id = %s
        """, (decision.session_id,))
        summary = cur.fetchone()
        total_qty = int(summary["total_qty"])
        total_vnd = int(summary["total_vnd"])

        # 8. Đẩy Telemetry vào ThingsBoard Outbox
        tb_payload = {
            "event_id": cart_event_id,
            "event_type": "cart_decision",
            "session_id": decision.session_id,
            "action": decision.action,
            "barcode": decision.barcode,
            "product_name": product["name"] if product else "UNKNOWN",
            "ai_class": decision.ai_class,
            "ai_confidence": decision.ai_confidence,
            "delta_weight_g": decision.delta_weight_g,
            "weight_source": decision.weight_source,
            "decision": decision_text,
            "rejection_reasons": ",".join(reasons) if reasons else None,
            "cart_quantity": total_qty,
            "cart_total_vnd": total_vnd,
            "timestamp": now_ms
        }
        cur.execute("""
            INSERT INTO thingsboard_outbox (reference_type, reference_id, telemetry_json, status, created_at_ms)
            VALUES ('cart_event', %s, %s, 'pending', %s)
        """, (cart_event_id, json.dumps(tb_payload, ensure_ascii=False), now_ms))

        # Lấy danh sách sản phẩm giỏ hàng trả về
        cur.execute("""
            SELECT p.barcode, p.sku, p.name, ci.quantity, ci.unit_price_vnd, 
                   (ci.quantity * ci.unit_price_vnd) AS line_total_vnd
            FROM cart_items ci
            JOIN products p ON p.id = ci.product_id
            WHERE ci.session_id = %s AND ci.quantity > 0
            ORDER BY p.name
        """, (decision.session_id,))
        cart_items_rows = [dict(r) for r in cur.fetchall()]

        return {
            "event_id": cart_event_id,
            "decision": decision_text,
            "reasons": reasons,
            "product": dict(product) if product else None,
            "cart": {
                "session_id": decision.session_id,
                "items": cart_items_rows,
                "total_quantity": total_qty,
                "total_vnd": total_vnd
            },
            "created_at_ms": now_ms
        }
    finally:
        cur.close()
        conn.close()

# ==========================================
# 6. SỰ KIỆN CẢM BIẾN (RAW SENSOR EVENTS)
# ==========================================
@app.post("/api/v1/events", status_code=201)
def create_sensor_event(event: SensorEventRequest):
    conn = get_db_connection()
    conn.autocommit = True
    cur = conn.cursor()
    now_ms = int(time.time() * 1000)
    try:
        cur.execute("""
            INSERT INTO sensor_events (session_id, source, event_type, barcode, ai_class, ai_confidence, weight_g, delta_weight_g, decision, metadata_json, created_at_ms)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (event.session_id, event.source, event.event_type, event.barcode, event.ai_class, event.ai_confidence, event.weight_g, event.delta_weight_g, event.decision, event.metadata_json, now_ms))
        return {"status": "success", "created_at_ms": now_ms}
    finally:
        cur.close()
        conn.close()

@app.get("/api/v1/events")
def get_sensor_events(limit: int = Query(default=100, le=500)):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            SELECT id, session_id, source, event_type, barcode, ai_class, ai_confidence, weight_g, delta_weight_g, decision, metadata_json, created_at_ms
            FROM sensor_events
            ORDER BY id DESC
            LIMIT %s
        """, (limit,))
        return [dict(r) for r in cur.fetchall()]
    finally:
        cur.close()
        conn.close()

# ==========================================
# 7. THINGSBOARD TELEMETRY APIS
# ==========================================
@app.get("/api/v1/thingsboard/status")
def thingsboard_status():
    return {
        "enabled": THINGSBOARD_ENABLED,
        "configured": tb_worker.client.configured,
        "url": THINGSBOARD_URL,
        **tb_worker.outbox_status(),
    }

@app.post("/api/v1/thingsboard/sync")
def thingsboard_sync():
    res = tb_worker.sync_once(limit=100)
    return {
        **res,
        "outbox": tb_worker.outbox_status()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("fastapi_server:app", host="0.0.0.0", port=8000, reload=True)
