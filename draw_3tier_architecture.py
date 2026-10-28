import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

# Kích thước figure chuẩn tỷ lệ khung hình cân đối, độ phân giải cao
fig, ax = plt.subplots(figsize=(10.2, 12.6), dpi=250)
ax.set_xlim(0, 100)
ax.set_ylim(0, 126)
ax.axis('off')

# Màu sắc chuẩn giao diện
COLOR_BG_GREEN = "#e6f4ea"
COLOR_BORDER_GREEN = "#34a853"
COLOR_TEXT_GREEN_DARK = "#14532d"
COLOR_TEXT_GREEN_MID = "#15803d"

COLOR_BG_PURPLE = "#ede9fe"
COLOR_BORDER_PURPLE = "#8b5cf6"
COLOR_TEXT_PURPLE_DARK = "#5b21b6"
COLOR_TEXT_PURPLE_MID = "#6d28d9"

COLOR_BG_GRAY = "#f5f5f4"
COLOR_BORDER_GRAY = "#78716c"
COLOR_TEXT_GRAY_DARK = "#1c1917"
COLOR_TEXT_GRAY_MID = "#57534e"

COLOR_BG_ORANGE = "#fbeae5"
COLOR_BORDER_ORANGE = "#ea580c"
COLOR_TEXT_ORANGE_DARK = "#9a3412"
COLOR_TEXT_ORANGE_MID = "#c2410c"

COLOR_LINE = "#64748b"

def draw_card(x, y, w, h, bg_color, border_color, title, lines=None, title_color="#000", line_color="#333", rx=1.2, title_size=10.5, line_size=8.3):
    bbox = patches.FancyBboxPatch(
        (x, y), w, h,
        boxstyle=f"round,pad=0,rounding_size={rx}",
        facecolor=bg_color,
        edgecolor=border_color,
        linewidth=1.2,
        zorder=3
    )
    ax.add_patch(bbox)
    cx = x + w / 2
    if lines and len(lines) > 0:
        n = len(lines)
        step = h / (n + 1.2)
        title_y = y + h - step * 0.75
        ax.text(cx, title_y, title, ha='center', va='center', fontsize=title_size, fontweight='bold', color=title_color, zorder=4)
        for i, line in enumerate(lines):
            line_y = y + h - step * (i + 1.65)
            # Nếu dòng có bullet hoặc là ghi chú đặc biệt
            fontweight = 'bold' if 'Polling' in line or 'Mock Bank' in line else 'normal'
            ax.text(cx, line_y, line, ha='center', va='center', fontsize=line_size, fontweight=fontweight, color=line_color, zorder=4)
    else:
        ax.text(cx, y + h * 0.5, title, ha='center', va='center', fontsize=title_size, fontweight='bold', color=title_color, zorder=4)

def draw_arrow(x1, y1, x2, y2, dashed=False, bi_directional=False, label="", label_pos=0.5, label_offset=(0, 0)):
    style = "--" if dashed else "-"
    arrowstyle = "<->" if bi_directional else "->"
    ax.annotate(
        "", xy=(x2, y2), xytext=(x1, y1),
        arrowprops=dict(
            arrowstyle=arrowstyle,
            color=COLOR_LINE,
            linewidth=1.3,
            linestyle=style,
            shrinkA=0, shrinkB=0
        ),
        zorder=2
    )
    if label:
        lx = x1 + (x2 - x1) * label_pos + label_offset[0]
        ly = y1 + (y2 - y1) * label_pos + label_offset[1]
        ax.text(
            lx, ly, label,
            ha='center', va='center',
            fontsize=8.0, fontweight='bold', color='#475569',
            bbox=dict(boxstyle="round,pad=0.25", facecolor="#ffffff", edgecolor="#e2e8f0", linewidth=0.8),
            zorder=5
        )

# =========================================================================
# 1. TẦNG 1: THIẾT BỊ BIÊN IOT
# =========================================================================
t1_box = patches.FancyBboxPatch(
    (3, 87), 94, 35,
    boxstyle="round,pad=0,rounding_size=2",
    facecolor="none", edgecolor="#cbd5e1", linewidth=1.5, linestyle="--", zorder=1
)
ax.add_patch(t1_box)
ax.text(95, 119.0, "Tầng 1: Thiết bị biên IoT", ha='right', va='center', fontsize=12, fontweight='bold', color='#0f172a')

# Khung cụm cảm biến
sensor_box = patches.FancyBboxPatch(
    (5, 102.5), 90, 14.5,
    boxstyle="round,pad=0,rounding_size=1.5",
    facecolor="none", edgecolor="#e2e8f0", linewidth=1.2, linestyle=":", zorder=1
)
ax.add_patch(sensor_box)
ax.text(7, 115.0, "Cụm cảm biến thu thập vật lý", ha='left', va='center', fontsize=9.5, fontweight='bold', color='#475569')

# 4 Cảm biến
w_card = 20.5
h_card = 8.0
y_sensor = 105.0

# 1. Camera AI: Dùng mô hình YOLO11n
draw_card(7.0, y_sensor, w_card, h_card, COLOR_BG_GREEN, COLOR_BORDER_GREEN, "Camera AI", ["Mô hình YOLO11n"], COLOR_TEXT_GREEN_DARK, COLOR_TEXT_GREEN_MID, title_size=10.5, line_size=8.8)

# 2. Cân HX711: 1 chiếc đặt ở trung tâm bàn cân
draw_card(29.5, y_sensor, w_card, h_card, COLOR_BG_GREEN, COLOR_BORDER_GREEN, "Cân HX711", ["1 Loadcell tâm bàn cân"], COLOR_TEXT_GREEN_DARK, COLOR_TEXT_GREEN_MID, title_size=10.5, line_size=8.5)

# 3. Đầu quét GM65
draw_card(52.0, y_sensor, w_card, h_card, COLOR_BG_GREEN, COLOR_BORDER_GREEN, "Đầu quét GM65", ["EAN-13 và QR"], COLOR_TEXT_GREEN_DARK, COLOR_TEXT_GREEN_MID, title_size=10.5, line_size=8.8)

# 4. Cảm biến ToF
draw_card(74.5, y_sensor, w_card, h_card, COLOR_BG_GREEN, COLOR_BORDER_GREEN, "Cảm biến ToF", ["VL53L0X (I2C)"], COLOR_TEXT_GREEN_DARK, COLOR_TEXT_GREEN_MID, title_size=10.5, line_size=8.8)

# Raspberry Pi 4 Model B (8GB)
draw_card(26, 89.5, 48, 8.2, COLOR_BG_GREEN, COLOR_BORDER_GREEN, "Raspberry Pi 4 Model B (8GB)", ["Linux Debian, Python 3.11 Runtime"], "#064e3b", "#047857", rx=1.5, title_size=11.0, line_size=9.0)

# Mũi tên cảm biến -> Pi
draw_arrow(17.2, y_sensor, 33, 97.7)
draw_arrow(39.7, y_sensor, 43, 97.7)
draw_arrow(62.2, y_sensor, 57, 97.7)
draw_arrow(84.7, y_sensor, 67, 97.7)


# =========================================================================
# LIÊN TẦNG 1 -> 2
# =========================================================================
# Đường liền: POST /cart/decisions
draw_arrow(28, 89.5, 28, 73.5, dashed=False)
# Đường đứt: POST /product
draw_arrow(31, 89.5, 31, 73.5, dashed=True)

# Chú thích đường truyền giữa T1 và T2
ax.text(34, 83.0, "POST /api/v1/cart/decisions", ha='left', va='center', fontsize=8.2, fontweight='bold', color='#334155',
        bbox=dict(boxstyle="round,pad=0.2", facecolor="#ffffff", edgecolor="#e2e8f0", linewidth=0.7))
ax.text(34, 79.0, "POST /product (tra mã vạch)", ha='left', va='center', fontsize=8.0, fontweight='normal', color='#475569',
        bbox=dict(boxstyle="round,pad=0.2", facecolor="#ffffff", edgecolor="#e2e8f0", linewidth=0.7))


# =========================================================================
# 2. TẦNG 2: BACKEND VÀ GATEWAY
# =========================================================================
t2_box = patches.FancyBboxPatch(
    (3, 39.5), 94, 36,
    boxstyle="round,pad=0,rounding_size=2",
    facecolor="none", edgecolor="#cbd5e1", linewidth=1.5, linestyle="--", zorder=1
)
ax.add_patch(t2_box)
ax.text(95, 72.5, "Tầng 2: Backend và gateway", ha='right', va='center', fontsize=12, fontweight='bold', color='#0f172a')

# FastAPI :8000
draw_card(7, 62.0, 26, 8.8, COLOR_BG_PURPLE, COLOR_BORDER_PURPLE, "FastAPI :8000", ["Sensor fusion, đối soát"], COLOR_TEXT_PURPLE_DARK, COLOR_TEXT_PURPLE_MID, title_size=11.0, line_size=8.8)

# PostgreSQL :5432
draw_card(42, 62.0, 28, 8.8, COLOR_BG_GRAY, COLOR_BORDER_GRAY, "PostgreSQL :5432", ["stroller_db"], COLOR_TEXT_GRAY_DARK, COLOR_TEXT_GRAY_MID, title_size=11.0, line_size=9.0)

# Shop Express :3000
draw_card(7, 44.0, 26, 8.8, COLOR_BG_PURPLE, COLOR_BORDER_PURPLE, "Shop Express :3000", ["Nghiệp vụ, đồng bộ giỏ"], COLOR_TEXT_PURPLE_DARK, COLOR_TEXT_PURPLE_MID, title_size=11.0, line_size=8.8)

# Mock Bank :4000 (LOẠI BỎ CHỮ VietQR, webhook THEO YÊU CẦU)
draw_card(42, 44.0, 28, 8.8, COLOR_BG_PURPLE, COLOR_BORDER_PURPLE, "Mock Bank :4000", ["Ngân hàng số mô phỏng", "Xử lý thanh toán thẻ ảo"], COLOR_TEXT_PURPLE_DARK, COLOR_TEXT_PURPLE_MID, title_size=11.0, line_size=8.2)

# Kết nối nội bộ Tầng 2
# FastAPI <-> PostgreSQL
draw_arrow(33, 66.4, 42, 66.4, bi_directional=True)
# FastAPI -> Shop Express (Báo bất thường)
draw_arrow(20, 62.0, 20, 52.8, bi_directional=False, label="Báo bất thường", label_pos=0.5, label_offset=(6.5, 0))
# Shop Express <-> PostgreSQL
draw_arrow(33, 51.0, 48, 62.0, bi_directional=True)
# Shop Express <-> Mock Bank
draw_arrow(33, 48.4, 42, 48.4, bi_directional=True)


# =========================================================================
# 3. TẦNG 3: ỨNG DỤNG VÀ QUẢN TRỊ
# =========================================================================
t3_box = patches.FancyBboxPatch(
    (3, 3), 94, 28.5,
    boxstyle="round,pad=0,rounding_size=2",
    facecolor="none", edgecolor="#cbd5e1", linewidth=1.5, linestyle="--", zorder=1
)
ax.add_patch(t3_box)
ax.text(95, 29.0, "Tầng 3: Ứng dụng và quản trị", ha='right', va='center', fontsize=12, fontweight='bold', color='#0f172a')

# 3 Khối Tầng 3 (Tăng chiều cao h_t3 để hiển thị đầy đủ chi tiết theo yêu cầu)
w_t3 = 28.0
h_t3 = 14.5
y_t3 = 7.0

# Card 1 (TRÁI - Thẳng dưới Shop Express): Tablet Android
draw_card(
    5.5, y_t3, w_t3, h_t3, COLOR_BG_ORANGE, COLOR_BORDER_ORANGE,
    "Tablet Android",
    [
        "Jetpack Compose, Material 3",
        "Quét QR hội viên / Thanh toán",
        "• Polling chu kỳ 650ms •"
    ],
    COLOR_TEXT_ORANGE_DARK, COLOR_TEXT_ORANGE_MID,
    title_size=11.0, line_size=8.2
)

# Card 2 (GIỮA): Web quản trị (ĐẦY ĐỦ 5 TÍNH NĂNG THEO YÊU CẦU CỦA BẠN)
draw_card(
    36.0, y_t3, w_t3, h_t3, COLOR_BG_ORANGE, COLOR_BORDER_ORANGE,
    "Web quản trị (Next.js 14)",
    [
        "• KPI & Tình trạng kho hàng",
        "• Giám sát trạng thái xe (Radar 2D)",
        "• Nhập/xuất SP, QL khách hàng"
    ],
    COLOR_TEXT_ORANGE_DARK, COLOR_TEXT_ORANGE_MID,
    title_size=10.8, line_size=8.0
)

# Card 3 (PHẢI): Web khách hàng (ĐẦY ĐỦ CÁC TÍNH NĂNG THEO YÊU CẦU CỦA BẠN)
draw_card(
    66.5, y_t3, w_t3, h_t3, COLOR_BG_ORANGE, COLOR_BORDER_ORANGE,
    "Web khách hàng (PWA)",
    [
        "• Thẻ thanh toán Mock Bank",
        "• Đồng bộ giỏ Live Sync",
        "• Hồ sơ hội viên & Voucher"
    ],
    COLOR_TEXT_ORANGE_DARK, COLOR_TEXT_ORANGE_MID,
    title_size=10.8, line_size=8.1
)


# =========================================================================
# LIÊN TẦNG 2 -> 3 (KẾT NỐI TỪ SHOP EXPRESS)
# =========================================================================
# 1. Shop Express <-> Tablet Android (Mũi tên thẳng đứng cực kỳ sạch sẽ)
draw_arrow(19.5, 44.0, 19.5, 21.5, bi_directional=True, label="Polling 650ms", label_pos=0.48, label_offset=(0, 0))

# 2. Shop Express <-> Web quản trị (Chéo nhẹ sang khối giữa)
draw_arrow(25.0, 44.0, 45.0, 21.5, bi_directional=True, label="REST API / Quản trị", label_pos=0.42, label_offset=(0, 0))

# 3. Shop Express <-> Web khách hàng (Chéo sang khối phải)
draw_arrow(30.0, 44.0, 75.0, 21.5, bi_directional=True, label="REST API / Live Sync", label_pos=0.38, label_offset=(0, 0))

plt.tight_layout()

# Xuất ra thư mục dự án và Screenshots
out_project = r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\so_do_kien_truc_3_tang_chuan.png"
out_screenshots = r"C:\Users\LE THI HAU\Pictures\Screenshots\so_do_kien_truc_3_tang_chuan.png"

plt.savefig(out_project, dpi=250, bbox_inches='tight', facecolor='#ffffff')
print(f"Đã xuất sơ đồ thành công tại: {out_project}")

try:
    plt.savefig(out_screenshots, dpi=250, bbox_inches='tight', facecolor='#ffffff')
    print(f"Đã xuất sơ đồ sang thư mục Screenshots tại: {out_screenshots}")
except Exception as e:
    print(f"Không thể ghi sang Screenshots: {e}")
