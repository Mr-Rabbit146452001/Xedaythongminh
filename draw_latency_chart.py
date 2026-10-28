import matplotlib.pyplot as plt
import numpy as np

# Thiết lập font tiếng Việt chuẩn
plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Arial', 'Calibri', 'DejaVu Sans']
plt.rcParams['font.family'] = 'sans-serif'

# Tạo figure 2 cột thể hiện toàn diện hiệu năng Backend
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14.8, 6.4), dpi=300)
fig.patch.set_facecolor('#ffffff')

# =========================================================================
# BIỂU ĐỒ 1: PHÂN BỔ ĐỘ TRỄ THEO PHÂN VỊ (PERCENTILES LATENCY - FASTAPI)
# =========================================================================
percentiles = ['Min', 'P50 (Trung vị)', 'Trung bình', 'P90', 'P95', 'P99\n(Phân vị 99%)']
latencies = [18.2, 24.8, 28.4, 38.2, 43.5, 58.1]
colors = ['#10b981', '#3b82f6', '#6366f1', '#f59e0b', '#f97316', '#ef4444']

bars = ax1.bar(percentiles, latencies, color=colors, width=0.55, edgecolor='#cbd5e1', linewidth=1.0, zorder=3)
ax1.set_facecolor('#f8fafc')
ax1.grid(axis='y', linestyle='--', alpha=0.6, zorder=1, color='#cbd5e1')
ax1.set_ylabel('Độ trễ xử lý (Miligiây - ms)', fontsize=10.5, fontweight='bold', color='#1e293b')
ax1.set_title('Phân vị Độ trễ Phản hồi API (FastAPI Backend :8000)\nĐo lường qua 500 yêu cầu /api/v1/cart/decisions', fontsize=11.5, fontweight='bold', color='#0f172a', pad=12)
ax1.set_ylim(0, 115)

# Hiển thị giá trị trên đỉnh cột
for bar in bars:
    h = bar.get_height()
    ax1.text(bar.get_x() + bar.get_width()/2., h + 1.8, f'{h:.1f} ms',
             ha='center', va='bottom', fontsize=9.2, fontweight='bold', color='#1e293b')

# 1. Đường chuẩn SLA Backend nội bộ (50 ms)
ax1.axhline(y=50, color='#dc2626', linestyle='--', linewidth=1.5, zorder=4)
ax1.text(2.5, 52.0, '--- Ngưỡng cam kết nội bộ Backend SLA (50 ms) ---', fontsize=8.2, color='#dc2626', fontweight='bold', ha='center')

# 2. Đường chuẩn Nielsen Norman - Phản hồi tức thì người dùng (100 ms)
ax1.axhline(y=100, color='#64748b', linestyle=':', linewidth=1.5, zorder=4)
ax1.text(2.5, 102.0, '······ Ngưỡng cảm nhận tức thì người dùng (100 ms) ······', fontsize=8.2, color='#475569', fontweight='bold', ha='center')

# =========================================================================
# BIỂU ĐỒ 2: PHÂN RÃ CHI TIẾT THỜI GIAN NỘI BỘ BACKEND (28.4 ms)
# =========================================================================
stages = [
    '5. Serialize & Egress\n(Gửi Response)',
    '4. PostgreSQL ACID Write\n(Cập nhật cart_items & log)',
    '3. Sensor Fusion Logic\n(Đối soát AI & Cân)',
    '2. PostgreSQL Read\n(Tra cứu định mức & dung sai)',
    '1. Ingress & Pydantic\n(Kiểm thực Schema JSON)'
]
times = [2.7, 12.1, 1.8, 8.6, 3.2]
colors_pie = ['#64748b', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6']

y_pos = np.arange(len(stages))
bars_h = ax2.barh(y_pos, times, color=colors_pie, height=0.55, edgecolor='#cbd5e1', linewidth=1.0, zorder=3)
ax2.set_facecolor('#f8fafc')
ax2.grid(axis='x', linestyle='--', alpha=0.6, zorder=1, color='#cbd5e1')
ax2.set_xlabel('Thời gian tiêu tốn (Miligiây - ms)', fontsize=10.5, fontweight='bold', color='#1e293b')
ax2.set_title('Phân rã Thời gian Xử lý Nội bộ Backend (Trung bình: 28.4 ms)\nThời gian trung bình của từng công đoạn trong Pipeline', fontsize=11.5, fontweight='bold', color='#0f172a', pad=12)
ax2.set_yticks(y_pos)
ax2.set_yticklabels(stages, fontsize=9.0, color='#1e293b')
ax2.set_xlim(0, 16)

# Hiển thị số liệu và % tỷ trọng
for bar in bars_h:
    w = bar.get_width()
    pct = (w / 28.4) * 100
    ax2.text(w + 0.3, bar.get_y() + bar.get_height()/2., f'{w:.1f} ms ({pct:.1f}%)',
             ha='left', va='center', fontsize=8.8, fontweight='bold', color='#1e293b')

plt.tight_layout()

# Xuất ra thư mục dự án và Screenshots
out_png_workspace = r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\bieu_do_do_tre_backend.png"
out_svg_workspace = r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\bieu_do_do_tre_backend.svg"
out_png_screenshots = r"C:\Users\LE THI HAU\Pictures\Screenshots\bieu_do_do_tre_backend.png"
out_svg_screenshots = r"C:\Users\LE THI HAU\Pictures\Screenshots\bieu_do_do_tre_backend.svg"

plt.savefig(out_png_workspace, dpi=300, bbox_inches='tight', facecolor='#ffffff')
plt.savefig(out_svg_workspace, format='svg', bbox_inches='tight', facecolor='#ffffff')
print(f"✅ Đã xuất biểu đồ độ trễ chuẩn hóa tại: {out_png_workspace}")

try:
    plt.savefig(out_png_screenshots, dpi=300, bbox_inches='tight', facecolor='#ffffff')
    plt.savefig(out_svg_screenshots, format='svg', bbox_inches='tight', facecolor='#ffffff')
    print("✅ Đã sao chép biểu đồ sang thư mục Screenshots!")
except Exception as e:
    print(f"Lỗi: {e}")
