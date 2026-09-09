import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

def get(path):
    with urllib.request.urlopen(f"{BASE_URL}{path}") as resp:
        return resp.status, json.loads(resp.read().decode())

def post(path, data):
    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=json.dumps(data).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode())

print("--- 1. Testing GET /health ---")
s, health = get("/health")
print(f"Status: {s}, Body: {health}")
assert health["status"] == "ok"
assert health["database"] == "postgresql"

print("\n--- 2. Testing GET /api/v1/products ---")
s, products = get("/api/v1/products")
print(f"Status: {s}, Products Count: {len(products)}")
for p in products:
    print(f"  - {p['barcode']}: {p['name']} ({p['price_vnd']}đ)")
assert len(products) >= 4

print("\n--- 3. Testing POST /api/v1/sessions ---")
s, session = post("/api/v1/sessions", {})
print(f"Status: {s}, Session: {session}")
session_id = session["id"]
assert session["status"] == "active"
assert len(session_id) > 10

print(f"\n--- 4. Testing POST /api/v1/cart/decisions for session {session_id} ---")
# 4 sản phẩm theo mục 7
items_to_add = [
    ("8935005801135", "lavie_500ml", 500),
    ("6975493200982", "banh_sua_chua_20g", 20),
    ("8938556329004", "pocari_sweat_500ml", 500),
    ("8936154640613", "siro_ho_euca_super_extra_125ml", 150)
]

for barcode, ai_class, weight in items_to_add:
    s, res = post("/api/v1/cart/decisions", {
        "session_id": session_id,
        "action": "add",
        "barcode": barcode,
        "ai_class": ai_class,
        "ai_confidence": 0.95,
        "delta_weight_g": weight,
        "weight_source": "simulated"
    })
    print(f"  Added {barcode}: action={res['action']}, total_qty={res['current_total_quantity']}, total_vnd={res['current_total_vnd']}đ")

print(f"\n--- 5. Testing GET /api/v1/cart/{session_id} ---")
s, cart = get(f"/api/v1/cart/{session_id}")
print(f"Status: {s}")
print(f"Session: {cart['session_id']}")
print(f"Total Quantity: {cart['total_quantity']}")
print(f"Total VND: {cart['total_vnd']}")
for item in cart["items"]:
    print(f"  - {item['name']} x{item['quantity']} = {item['line_total_vnd']}đ")

assert cart["total_quantity"] == 4
assert cart["total_vnd"] == 88000
print("✅ Checklist Item 13: cart_quantity = 4 and total_vnd = 88000 PASSED!")

print(f"\n--- 6. Testing POST /api/v1/sessions/{session_id}/complete ---")
s, comp = post(f"/api/v1/sessions/{session_id}/complete", {})
print(f"Status: {s}, Completed Session: {comp}")
assert comp["status"] == "completed"
print("✅ Checklist Item 13: Session completed PASSED!")

print("\n🎉 ALL CHECKLIST CRITERIA FROM TAI_LIEU_BAN_GIAO PASSED!")
