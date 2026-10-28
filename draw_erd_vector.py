import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

# Cấu hình font chữ hỗ trợ tiếng Việt hoàn hảo trên Windows
plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Arial', 'Calibri', 'DejaVu Sans']
plt.rcParams['font.family'] = 'sans-serif'

# Thiết lập canvas vẽ sơ đồ vector độ phân giải cao 300 DPI
fig, ax = plt.subplots(figsize=(16.0, 11.2), dpi=300)
ax.set_xlim(0, 160)
ax.set_ylim(0, 112)
ax.axis('off')

# Bảng màu giao diện hiện đại
THEMES = {
    "bank_acc": {
        "header_bg": "#1e3a8a", "header_text": "#ffffff", "sub": "#93c5fd",
        "border": "#2563eb", "row_bg_1": "#f8fafc", "row_bg_2": "#ffffff"
    },
    "sessions": {
        "header_bg": "#3730a3", "header_text": "#ffffff", "sub": "#a5b4fc",
        "border": "#4f46e5", "row_bg_1": "#f8fafc", "row_bg_2": "#ffffff"
    },
    "products": {
        "header_bg": "#064e3b", "header_text": "#ffffff", "sub": "#6ee7b7",
        "border": "#059669", "row_bg_1": "#f0fdf4", "row_bg_2": "#ffffff"
    },
    "cart_items": {
        "header_bg": "#0e7490", "header_text": "#ffffff", "sub": "#67e8f9",
        "border": "#0891b2", "row_bg_1": "#f8fafc", "row_bg_2": "#ffffff"
    },
    "cart_events": {
        "header_bg": "#9a3412", "header_text": "#ffffff", "sub": "#fdba74",
        "border": "#ea580c", "row_bg_1": "#fff7ed", "row_bg_2": "#ffffff"
    },
    "sensors": {
        "header_bg": "#1e293b", "header_text": "#ffffff", "sub": "#94a3b8",
        "border": "#475569", "row_bg_1": "#f8fafc", "row_bg_2": "#ffffff"
    },
    "bank_tx": {
        "header_bg": "#581c87", "header_text": "#ffffff", "sub": "#d8b4fe",
        "border": "#7c3aed", "row_bg_1": "#faf5ff", "row_bg_2": "#ffffff"
    }
}

def draw_table(x, y, w, h, table_name, subtitle, columns, theme_key):
    theme = THEMES[theme_key]
    n_rows = len(columns)
    header_h = 3.6
    row_h = (h - header_h) / n_rows

    # Khung toàn bảng
    outer_box = patches.FancyBboxPatch(
        (x, y), w, h,
        boxstyle="round,pad=0,rounding_size=1.2",
        facecolor="#ffffff",
        edgecolor=theme["border"],
        linewidth=1.4,
        zorder=3
    )
    ax.add_patch(outer_box)

    # Tiêu đề bảng
    header_box = patches.FancyBboxPatch(
        (x, y + h - header_h), w, header_h,
        boxstyle="round,pad=0,rounding_size=1.2",
        facecolor=theme["header_bg"],
        edgecolor="none",
        zorder=4
    )
    ax.add_patch(header_box)

    # Đè phẳng góc dưới header
    header_flat = patches.Rectangle(
        (x, y + h - header_h), w, 1.2,
        facecolor=theme["header_bg"],
        edgecolor="none",
        zorder=4
    )
    ax.add_patch(header_flat)

    # Text tiêu đề
    ax.text(
        x + w / 2, y + h - 1.4, table_name,
        fontsize=8.8, fontweight='bold', color=theme["header_text"],
        ha='center', va='center', zorder=5
    )
    ax.text(
        x + w / 2, y + h - 2.8, subtitle,
        fontsize=6.8, fontweight='normal', color=theme["sub"],
        ha='center', va='center', zorder=5
    )

    # Các dòng cột
    for idx, col in enumerate(columns):
        col_y = y + h - header_h - (idx + 1) * row_h
        bg_color = theme["row_bg_1"] if idx % 2 == 0 else theme["row_bg_2"]

        row_rect = patches.Rectangle(
            (x + 0.1, col_y), w - 0.2, row_h,
            facecolor=bg_color,
            edgecolor="none",
            zorder=3
        )
        ax.add_patch(row_rect)

        # Viền phân cách dòng
        if idx < n_rows - 1:
            ax.plot([x + 0.5, x + w - 0.5], [col_y, col_y], color="#e2e8f0", linewidth=0.5, zorder=4)

        col_name = col["name"]
        col_type = col["type"]
        badge = col.get("badge", "")

        text_x = x + 1.2

        # Vẽ badge PK/FK/UQ
        if badge:
            badge_color = "#dc2626" if "PK" in badge else ("#2563eb" if "FK" in badge else "#059669")
            badge_text = "#ffffff"
            b_w = len(badge) * 1.5 + 1.2
            b_patch = patches.FancyBboxPatch(
                (text_x, col_y + row_h * 0.15), b_w, row_h * 0.7,
                boxstyle="round,pad=0,rounding_size=0.4",
                facecolor=badge_color,
                edgecolor="none",
                zorder=6
            )
            ax.add_patch(b_patch)
            ax.text(
                text_x + b_w / 2, col_y + row_h * 0.5, badge,
                fontsize=6.0, fontweight='bold', color=badge_text,
                ha='center', va='center', zorder=7
            )
            text_x += b_w + 1.0

        # Tên cột
        fontweight = 'bold' if badge else 'normal'
        ax.text(
            text_x, col_y + row_h * 0.5, col_name,
            fontsize=7.2, fontweight=fontweight, color="#1e293b",
            va='center', zorder=6
        )

        # Kiểu dữ liệu (Căn phải)
        ax.text(
            x + w - 1.2, col_y + row_h * 0.5, col_type,
            fontsize=6.6, fontweight='normal', color="#64748b",
            ha='right', va='center', zorder=6
        )

def draw_relation(points, label1="1", label2="N", color="#2563eb", p1_offset=(0, 0), p2_offset=(0, 0)):
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    ax.plot(xs, ys, color=color, linewidth=1.4, linestyle="-", zorder=2)

    p_start = points[0]
    p_end = points[-1]

    ax.text(
        p_start[0] + p1_offset[0], p_start[1] + p1_offset[1], label1,
        fontsize=7.2, fontweight='bold', color='#1d4ed8',
        ha='center', va='center',
        bbox=dict(boxstyle="circle,pad=0.22", facecolor="#eff6ff", edgecolor="#93c5fd", linewidth=0.8),
        zorder=8
    )

    ax.text(
        p_end[0] + p2_offset[0], p_end[1] + p2_offset[1], label2,
        fontsize=7.2, fontweight='bold', color='#1d4ed8',
        ha='center', va='center',
        bbox=dict(boxstyle="circle,pad=0.22", facecolor="#eff6ff", edgecolor="#93c5fd", linewidth=0.8),
        zorder=8
    )

# =========================================================================
# BANNER TIÊU ĐỀ
# =========================================================================
banner = patches.FancyBboxPatch(
    (4, 102.0), 152, 7.5,
    boxstyle="round,pad=0,rounding_size=1.5",
    facecolor="#0f172a", edgecolor="none", zorder=2
)
ax.add_patch(banner)

ax.text(
    80.0, 106.8, "SƠ ĐỒ QUAN HỆ THỰC THỂ CƠ SỞ DỮ LIỆU THỰC TẾ (POSTGRESQL - STROLLER_DB)",
    fontsize=12.5, fontweight='bold', color='#ffffff', ha='center', va='center', zorder=5
)
ax.text(
    80.0, 103.8, "Đối chiếu chuẩn hóa 100% với schema_handover.sql & stroller_db_backup.sql • Toàn vẹn ACID & Index B-Tree",
    fontsize=8.2, fontweight='normal', color='#94a3b8', ha='center', va='center', zorder=5
)

# =========================================================================
# 1. BẢNG TẦNG TRÊN (TOP ROW)
# =========================================================================

# 1.1. Bảng bank_accounts
cols_bank_acc = [
    {"name": "account_number", "type": "VARCHAR(30)", "badge": "PK"},
    {"name": "owner_name", "type": "VARCHAR(100)"},
    {"name": "user_ref_id", "type": "VARCHAR(50)"},
    {"name": "token_balance", "type": "NUMERIC(15,2)"},
    {"name": "pin", "type": "VARCHAR(10)"},
    {"name": "is_active", "type": "BOOLEAN"}
]
draw_table(5, 74.0, 34, 25.0, "bank_accounts", "Tài khoản thẻ ảo Mock Bank", cols_bank_acc, "bank_acc")

# 1.2. Bảng shopping_sessions
cols_sessions = [
    {"name": "id", "type": "TEXT (UUID)", "badge": "PK"},
    {"name": "status", "type": "TEXT ('active'|'completed')"},
    {"name": "started_at_ms", "type": "BIGINT"},
    {"name": "ended_at_ms", "type": "BIGINT"}
]
draw_table(47, 76.0, 38, 23.0, "shopping_sessions", "Phiên mua sắm xe đẩy", cols_sessions, "sessions")

# 1.3. Bảng products
cols_products = [
    {"name": "id", "type": "INTEGER/BIGINT", "badge": "PK"},
    {"name": "barcode", "type": "VARCHAR(50)", "badge": "UQ"},
    {"name": "sku", "type": "TEXT"},
    {"name": "name", "type": "VARCHAR(255)"},
    {"name": "vision_class", "type": "TEXT (YOLO11n)"},
    {"name": "price_vnd", "type": "INTEGER"},
    {"name": "expected_weight_g", "type": "REAL (Định mức)"},
    {"name": "weight_tolerance_g", "type": "REAL (±Dung sai)"},
    {"name": "active", "type": "INTEGER (1/0)"},
    {"name": "imageurl", "type": "VARCHAR(255)"}
]
draw_table(94, 55.0, 61, 44.0, "products", "Danh mục 10 sản phẩm & Định mức vật lý", cols_products, "products")

# =========================================================================
# 2. BẢNG TẦNG DƯỚI (BOTTOM ROW)
# =========================================================================

# 2.1. Bảng bank_transactions
cols_bank_tx = [
    {"name": "id", "type": "UUID (gen_random)", "badge": "PK"},
    {"name": "order_id", "type": "VARCHAR(50)"},
    {"name": "from_account", "type": "VARCHAR(30)", "badge": "FK"},
    {"name": "to_account", "type": "VARCHAR(30)", "badge": "FK"},
    {"name": "amount", "type": "NUMERIC(15,2)"},
    {"name": "status", "type": "VARCHAR(20) (SUCCESS)"},
    {"name": "idempotency_key", "type": "VARCHAR(100)"}
]
draw_table(5, 38.0, 34, 30.0, "bank_transactions", "Giao dịch trừ tiền thẻ ảo", cols_bank_tx, "bank_tx")

# 2.2. Bảng sensor_events
cols_sensors = [
    {"name": "id", "type": "BIGINT (Identity)", "badge": "PK"},
    {"name": "session_id", "type": "TEXT", "badge": "FK"},
    {"name": "source", "type": "TEXT ('yolo'|'hx711'|'gm65')"},
    {"name": "event_type", "type": "TEXT"},
    {"name": "barcode", "type": "TEXT"},
    {"name": "weight_g", "type": "REAL"},
    {"name": "delta_weight_g", "type": "REAL"},
    {"name": "ai_class", "type": "TEXT"},
    {"name": "ai_confidence", "type": "REAL"},
    {"name": "created_at_ms", "type": "BIGINT"}
]
draw_table(47, 34.0, 38, 36.0, "sensor_events", "Nhật ký chuỗi dữ liệu cảm biến biên", cols_sensors, "sensors")

# 2.3. Bảng cart_events
cols_cart_events = [
    {"name": "id", "type": "BIGINT (Identity)", "badge": "PK"},
    {"name": "session_id", "type": "TEXT", "badge": "FK"},
    {"name": "product_id", "type": "BIGINT", "badge": "FK"},
    {"name": "action", "type": "TEXT ('add'|'remove')"},
    {"name": "barcode", "type": "TEXT"},
    {"name": "ai_class", "type": "TEXT (YOLO11n)"},
    {"name": "ai_confidence", "type": "REAL (0..1)"},
    {"name": "delta_weight_g", "type": "REAL (HX711)"},
    {"name": "decision", "type": "TEXT ('accepted'|'reject')"},
    {"name": "reasons_json", "type": "TEXT (JSON)"},
    {"name": "created_at_ms", "type": "BIGINT"}
]
draw_table(90, 8.0, 40, 42.0, "cart_events", "Nhật ký phán quyết Sensor Fusion", cols_cart_events, "cart_events")

# 2.4. Bảng cart_items
cols_cart_items = [
    {"name": "session_id", "type": "TEXT", "badge": "PK,FK"},
    {"name": "product_id", "type": "BIGINT", "badge": "PK,FK"},
    {"name": "quantity", "type": "INTEGER (> 0)"},
    {"name": "unit_price_vnd", "type": "INTEGER"},
    {"name": "updated_at_ms", "type": "BIGINT"}
]
draw_table(133, 20.0, 24, 25.0, "cart_items", "Giỏ hàng hiện tại", cols_cart_items, "cart_items")

# =========================================================================
# 3. VẼ ĐƯỜNG LIÊN KẾT QUAN HỆ (RELATIONSHIP CONNECTIONS)
# =========================================================================

# 1. bank_accounts -> bank_transactions (1:N)
draw_relation([(22, 74.0), (22, 68.0)], label1="1", label2="N", color="#7c3aed", p1_offset=(0, 1.2), p2_offset=(0, -1.2))

# 2. shopping_sessions -> sensor_events (1:N)
draw_relation([(66, 76.0), (66, 70.0)], label1="1", label2="N", color="#475569", p1_offset=(0, 1.2), p2_offset=(0, -1.2))

# 3. shopping_sessions -> cart_items (1:N)
draw_relation([(85, 87.5), (90, 87.5), (90, 50.0), (133, 50.0), (145, 45.0)], 
              label1="1", label2="N", color="#0891b2", p1_offset=(-1.5, 0), p2_offset=(0, 1.5))

# 4. products -> cart_items (1:N)
draw_relation([(145, 55.0), (145, 45.0)], label1="1", label2="N", color="#059669", p1_offset=(0, 1.5), p2_offset=(0, -1.5))

# 5. shopping_sessions -> cart_events (1:N)
draw_relation([(85, 80.0), (88, 80.0), (88, 30.0), (90, 30.0)], 
              label1="1", label2="N", color="#ea580c", p1_offset=(-1.5, 0), p2_offset=(1.5, 0))

# 6. products -> cart_events (1:N)
draw_relation([(110, 55.0), (110, 50.0)], label1="1", label2="N", color="#059669", p1_offset=(0, 1.2), p2_offset=(0, -1.2))

# Chú thích góc dưới
legend_box = patches.FancyBboxPatch(
    (5, 8.0), 75, 18.0,
    boxstyle="round,pad=0,rounding_size=1.0",
    facecolor="#f8fafc", edgecolor="#cbd5e1", linewidth=1.0, zorder=2
)
ax.add_patch(legend_box)

ax.text(8.0, 23.0, "CHÚ THÍCH CÁC RÀNG BUỘC TOÀN VẸN & LIÊN KẾT KHÓA:", fontsize=8.0, fontweight='bold', color='#0f172a')
ax.text(8.0, 19.5, "• PK (Primary Key): Khóa chính nhận diện duy nhất bản ghi.", fontsize=7.2, color='#334155')
ax.text(8.0, 16.5, "• FK (Foreign Key): Khóa ngoại bảo đảm toàn vẹn tham chiếu (ON DELETE CASCADE / SET NULL).", fontsize=7.2, color='#334155')
ax.text(8.0, 13.5, "• cart_items: Khóa chính phức hợp (session_id, product_id) chống trùng lặp dòng sản phẩm.", fontsize=7.2, color='#334155')
ax.text(8.0, 10.5, "• products: Chỉ mục B-Tree ix_products_barcode tối ưu truy vấn O(log N) cho Endpoint Backend.", fontsize=7.2, color='#334155')

plt.tight_layout()

# Xuất ra các đường dẫn
out_png_workspace = r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\so_do_erd_database_stroller.png"
out_svg_workspace = r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\so_do_erd_database_stroller.svg"
out_png_screenshots = r"C:\Users\LE THI HAU\Pictures\Screenshots\so_do_erd_database_stroller.png"
out_svg_screenshots = r"C:\Users\LE THI HAU\Pictures\Screenshots\so_do_erd_database_stroller.svg"

plt.savefig(out_png_workspace, dpi=300, bbox_inches='tight', facecolor='#ffffff')
plt.savefig(out_svg_workspace, format='svg', bbox_inches='tight', facecolor='#ffffff')
print(f"✅ Đã lưu ERD chuẩn tại: {out_png_workspace}")

try:
    plt.savefig(out_png_screenshots, dpi=300, bbox_inches='tight', facecolor='#ffffff')
    plt.savefig(out_svg_screenshots, format='svg', bbox_inches='tight', facecolor='#ffffff')
    print("✅ Đã sao chép sang thư mục Screenshots!")
except Exception as e:
    print(f"Lưu ý: {e}")
