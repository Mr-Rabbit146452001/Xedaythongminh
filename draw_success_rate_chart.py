import matplotlib.pyplot as plt
import numpy as np

# Thiết lập font tiếng Việt chuẩn
plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Arial', 'Calibri', 'DejaVu Sans']
plt.rcParams['font.family'] = 'sans-serif'

# Tạo figure 2 cột thể hiện tỷ lệ nhận diện thực nghiệm
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14.8, 6.2), dpi=300)
fig.patch.set_facecolor('#ffffff')

# =========================================================================
# BIỂU ĐỒ 1: CƠ CẤU NHẬN DIỆN CAMERA AI VÀ QUÉT BỔ SUNG GM65 (300 LƯỢT)
# =========================================================================
labels = ['AI nhận diện đúng\n89.7% (269 lượt)', 
          'GM65 bổ sung đúng\n10.3% (31 lượt)']
sizes = [89.67, 10.33]
colors = ['#10b981', '#f59e0b']
explode = (0.04, 0.08)

wedges, texts, autotexts = ax1.pie(
    sizes, explode=explode, labels=labels, autopct='%1.1f%%',
    startangle=140, colors=colors,
    textprops=dict(color='#0f172a', fontsize=9.8, fontweight='bold'),
    wedgeprops=dict(width=0.58, edgecolor='#ffffff', linewidth=2)
)

for autotext in autotexts:
    autotext.set_fontsize(11.2)
    autotext.set_color('#ffffff')
    autotext.set_weight('bold')

ax1.set_title('Tỷ lệ Nhận diện Camera AI & Quét GM65 Bổ sung\n(Đo kiểm thực nghiệm 150 cặp thử — 300 lượt thao tác vào/ra)',
              fontsize=11.5, fontweight='bold', color='#0f172a', pad=14)

# Chú thích ở giữa Donut chart
ax1.text(0, 0, '150 CẶP\n(300 lượt)\n100% ĐÚNG', ha='center', va='center', fontsize=11.0, fontweight='bold', color='#0f172a')

# =========================================================================
# BIỂU ĐỒ 2: THỐNG KÊ CHI TIẾT THEO 5 MẶT HÀNG THỰC NGHIỆM (30 CẶP / MÓN)
# =========================================================================
products = [
    'Khăn ướt (95.4g)',
    'Sữa đặc (178.0g)',
    'Cà phê G7 (60.3g)',
    'Sữa Vina (197.7g)',
    'Poca (38.0g)'
]
ai_counts = [52, 53, 53, 54, 57]
gm65_counts = [8, 7, 7, 6, 3]

y_pos = np.arange(len(products))
width = 0.58

# Stacked Bar Chart
p1 = ax2.barh(y_pos, ai_counts, width, label='AI nhận diện đúng (lượt)', color='#10b981', edgecolor='#cbd5e1', zorder=3)
p2 = ax2.barh(y_pos, gm65_counts, width, left=ai_counts, label='GM65 bổ sung đúng (lượt)', color='#f59e0b', edgecolor='#cbd5e1', zorder=3)

ax2.set_facecolor('#f8fafc')
ax2.grid(axis='x', linestyle='--', alpha=0.6, zorder=1, color='#cbd5e1')
ax2.set_xlabel('Số lượt thao tác (Mỗi sản phẩm 30 cặp = 60 lượt vào/ra)', fontsize=10.0, fontweight='bold', color='#1e293b')
ax2.set_title('Kết quả Hệ thống Sau Nhận diện AI và Quét GM65 Bổ sung\n(Hệ thống đúng 100.0% — Sai 0.0% trên 5 sản phẩm cốt lõi)',
              fontsize=11.5, fontweight='bold', color='#0f172a', pad=14)
ax2.set_yticks(y_pos)
ax2.set_yticklabels(products, fontsize=9.5, fontweight='bold', color='#1e293b')
ax2.set_xlim(0, 75)
ax2.legend(loc='lower right', frameon=True, facecolor='#ffffff', edgecolor='#cbd5e1', fontsize=9.0)

# Hiển thị số liệu chi tiết trên từng thanh
for i in range(len(products)):
    c_ai = ai_counts[i]
    c_gm = gm65_counts[i]
    pct = ((c_ai + c_gm) / 60.0) * 100.0
    ax2.text(c_ai / 2, i, f'{c_ai}', va='center', ha='center', fontsize=9.0, fontweight='bold', color='#ffffff', zorder=4)
    ax2.text(c_ai + c_gm / 2, i, f'{c_gm}', va='center', ha='center', fontsize=8.5, fontweight='bold', color='#ffffff', zorder=4)
    ax2.text(61.5, i, f'Đúng: 100%', va='center', ha='left', fontsize=8.8, fontweight='bold', color='#047857')

plt.tight_layout()

# Xuất file
out_png_workspace = r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\bieu_do_ty_le_thanh_cong_tong_the.png"
out_svg_workspace = r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\bieu_do_ty_le_thanh_cong_tong_the.svg"
out_png_screenshots = r"C:\Users\LE THI HAU\Pictures\Screenshots\bieu_do_ty_le_thanh_cong_tong_the.png"
out_svg_screenshots = r"C:\Users\LE THI HAU\Pictures\Screenshots\bieu_do_ty_le_thanh_cong_tong_the.svg"

plt.savefig(out_png_workspace, dpi=300, bbox_inches='tight', facecolor='#ffffff')
plt.savefig(out_svg_workspace, format='svg', bbox_inches='tight', facecolor='#ffffff')
print(f"✅ Đã lưu biểu đồ thực nghiệm 5 sản phẩm tại: {out_png_workspace}")

try:
    plt.savefig(out_png_screenshots, dpi=300, bbox_inches='tight', facecolor='#ffffff')
    plt.savefig(out_svg_screenshots, format='svg', bbox_inches='tight', facecolor='#ffffff')
    print("✅ Đã sao chép sang Screenshots!")
except Exception as e:
    print(f"Lỗi: {e}")
