import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Thiết lập font tiếng Việt chuẩn
plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Arial', 'Calibri', 'DejaVu Sans']
plt.rcParams['font.family'] = 'sans-serif'

fig, ax = plt.subplots(figsize=(13.5, 7.5), dpi=300)
fig.patch.set_facecolor('#ffffff')
ax.set_facecolor('#ffffff')
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.axis('off')

# Tiêu đề sơ đồ
ax.text(50, 96, 'SƠ ĐỒ LUỒNG ĐỒNG THUẬN ĐA CẢM BIẾN & 3 LỚP PHÒNG VỆ HỆ THỐNG', 
        ha='center', va='center', fontsize=13, fontweight='bold', color='#1e3a8a')
ax.text(50, 92.5, 'Cơ chế hiệp đồng giữa Thiết bị biên (Raspberry Pi 4) và Máy chủ Backend (FastAPI / PostgreSQL)', 
        ha='center', va='center', fontsize=9.5, color='#475569')

# Hàm vẽ hộp bo tròn
def draw_box(x, y, w, h, bg_color, border_color, title, subtitle="", badge=""):
    box = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.5,rounding_size=1.2",
                                facecolor=bg_color, edgecolor=border_color, linewidth=1.5, zorder=3)
    ax.add_patch(box)
    if badge:
        b_box = patches.FancyBboxPatch((x + 1.5, y + h - 3.2), len(badge)*1.8 + 2.0, 3.2,
                                      boxstyle="round,pad=0.2,rounding_size=0.6",
                                      facecolor=border_color, edgecolor='none', zorder=4)
        ax.add_patch(b_box)
        ax.text(x + 2.2 + len(badge)*0.9, y + h - 1.6, badge, ha='center', va='center',
                fontsize=7.5, fontweight='bold', color='#ffffff', zorder=5)
    
    ax.text(x + w/2, y + h/2 + (1.2 if subtitle else 0), title,
            ha='center', va='center', fontsize=9.5, fontweight='bold', color='#0f172a', zorder=5)
    if subtitle:
        ax.text(x + w/2, y + h/2 - 2.8, subtitle,
                ha='center', va='center', fontsize=8.0, color='#334155', zorder=5)

# 1. Bắt đầu: Thao tác khách hàng
draw_box(4, 76, 20, 10, '#f8fafc', '#64748b', 'Khách hàng đặt / lấy hàng', 'Bỏ sản phẩm vào lòng xe đẩy', 'INPUT')

# 2. Lớp 1: Edge AI
draw_box(30, 74, 32, 14, '#eff6ff', '#2563eb', 'LỚP 1: THỊ GIÁC MÁY TÍNH BIÊN', 'Camera YOLO11n trích xuất ai_class & ai_conf', 'EDGE - PI 4')

# Mũi tên từ Input sang Lớp 1
ax.annotate('', xy=(30, 81), xytext=(24, 81),
            arrowprops=dict(arrowstyle="-|>", color='#2563eb', lw=2.0))

# 3. Phán quyết AI: ai_conf >= 0.80?
# Nhánh YES (91.4%) -> Lớp 2
ax.annotate('Độ tin cậy cao ≥ 0.80\n(91.4% - 457/500)', xy=(46, 56), xytext=(46, 74),
            ha='center', va='center', fontsize=8.2, fontweight='bold', color='#059669',
            arrowprops=dict(arrowstyle="-|>", color='#059669', lw=2.0))

# 4. Lớp 2: Kiểm chứng Cân & CSDL
draw_box(30, 38, 32, 18, '#ecfdf5', '#059669', 'LỚP 2: KIỂM CHỨNG TRỌNG LƯỢNG & CSDL', 
         'Cân HX711 đo ΔW | FastAPI đối soát expected_weight_g\nNgưỡng kiểm tra: |ΔW - W_chuẩn| ≤ Dung sai', 'BACKEND & SENSOR')

# Nhánh từ Lớp 2 -> Thành công (Bên trái) hoặc Báo động (Bên phải)
# A. Thành công
draw_box(4, 38, 22, 18, '#f0fdf4', '#16a34a', 'CHẤP THUẬN TỨC THÌ\n(Instant Fusion Approval)', 
         '• accepted = true\n• Cập nhật cart_items\n• Chốt 91.4% giao dịch', 'THÀNH CÔNG')
ax.annotate('Trọng lượng khớp\n(Hợp lệ)', xy=(26, 47), xytext=(30, 47),
            ha='right', va='center', fontsize=8.2, fontweight='bold', color='#16a34a',
            arrowprops=dict(arrowstyle="-|>", color='#16a34a', lw=2.0))

# B. Lệch cân (Gian lận)
draw_box(4, 12, 22, 16, '#fef2f2', '#dc2626', 'KHÓA BẢO VỆ CHỐNG TRỘM\n(Anti-theft Safety Lock)', 
         '• accepted = false\n• Báo động đỏ trên Tablet\n• Chặn 100% gian lận', 'CHẶN GIAN LẬN')
ax.annotate('Lệch cân vượt ngưỡng\n(Phát hiện gian lận)', xy=(15, 28), xytext=(30, 42),
            ha='center', va='center', fontsize=7.8, fontweight='bold', color='#dc2626',
            arrowprops=dict(arrowstyle="-|>", color='#dc2626', lw=1.8, connectionstyle="arc3,rad=-0.2"))

# Nhánh NO từ Lớp 1 (8.6%) -> Chuyển sang Lớp 3 (Cứu trợ Barcode)
ax.annotate('Độ tin cậy thấp < 0.80\n(8.6% - 43/500)\n(Do che khuất / lóa sáng)', 
            xy=(78, 68), xytext=(62, 81),
            ha='center', va='bottom', fontsize=8.2, fontweight='bold', color='#d97706',
            arrowprops=dict(arrowstyle="-|>", color='#d97706', lw=2.0, connectionstyle="arc3,rad=-0.15"))

# 5. Lớp 3: Cứu trợ mã vạch GM65
draw_box(68, 50, 28, 18, '#fffbeb', '#d97706', 'LỚP 3: CỨU TRỢ MÃ VẠCH GM65\n(Barcode Fallback Protocol)', 
         '• Quét mã EAN-13 qua mắt đọc GM65\n• mode = barcode_recovery\n• Bỏ qua AI, kiểm tra Barcode & Cân', 'FALLBACK')

# Từ Lớp 3 -> Giải cứu thành công
draw_box(68, 16, 28, 20, '#eff6ff', '#2563eb', 'MỞ KHÓA & CHỐT GIAO DỊCH\n(Recovery Success)', 
         '• Gỡ cờ cảnh báo trên Shop Server\n• Cập nhật giỏ hàng Tablet trong 410ms\n• Cứu hộ 100% lỗi AI (43/43 lượt)', 'CỨU TRỢ HOÀN TẤT')

ax.annotate('Mã vạch hợp lệ\n& Cân nặng khớp', xy=(82, 36), xytext=(82, 50),
            ha='center', va='center', fontsize=8.2, fontweight='bold', color='#2563eb',
            arrowprops=dict(arrowstyle="-|>", color='#2563eb', lw=2.0))

# Khung tổng kết tỷ lệ chốt 100%
summary_box = patches.FancyBboxPatch((32, 10), 28, 18, boxstyle="round,pad=0.5,rounding_size=1.0",
                                     facecolor='#f8fafc', edgecolor='#0f172a', linewidth=2.0, zorder=3)
ax.add_patch(summary_box)
ax.text(46, 24, 'TỔNG TỶ LỆ HOÀN TẤT GIAO DỊCH', ha='center', va='center', fontsize=9.2, fontweight='bold', color='#0f172a', zorder=4)
ax.text(46, 18.5, '100.0% (500 / 500 lượt)', ha='center', va='center', fontsize=13.0, fontweight='bold', color='#047857', zorder=4)
ax.text(46, 13.5, '= 91.4% (Fusion AI) + 8.6% (GM65)\nTỷ lệ thất thoát hàng hóa = 0.0%', ha='center', va='center', fontsize=7.8, color='#334155', zorder=4)

# Mũi tên từ các nhánh thành công về khung tổng kết
ax.annotate('', xy=(32, 22), xytext=(26, 40),
            arrowprops=dict(arrowstyle="-|>", color='#047857', lw=1.8, connectionstyle="arc3,rad=-0.1"))
ax.annotate('', xy=(60, 22), xytext=(68, 24),
            arrowprops=dict(arrowstyle="-|>", color='#047857', lw=1.8, connectionstyle="arc3,rad=0.1"))

plt.tight_layout()

# Xuất file
out_png_workspace = r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\so_do_dong_thuan_3_lop_phong_ve.png"
out_svg_workspace = r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\so_do_dong_thuan_3_lop_phong_ve.svg"
out_png_screenshots = r"C:\Users\LE THI HAU\Pictures\Screenshots\so_do_dong_thuan_3_lop_phong_ve.png"
out_svg_screenshots = r"C:\Users\LE THI HAU\Pictures\Screenshots\so_do_dong_thuan_3_lop_phong_ve.svg"

plt.savefig(out_png_workspace, dpi=300, bbox_inches='tight', facecolor='#ffffff')
plt.savefig(out_svg_workspace, format='svg', bbox_inches='tight', facecolor='#ffffff')
print(f"✅ Đã xuất sơ đồ luồng 3 lớp tại: {out_png_workspace}")

try:
    plt.savefig(out_png_screenshots, dpi=300, bbox_inches='tight', facecolor='#ffffff')
    plt.savefig(out_svg_screenshots, format='svg', bbox_inches='tight', facecolor='#ffffff')
    print("✅ Đã sao chép sang Screenshots!")
except Exception as e:
    print(f"Lỗi: {e}")
