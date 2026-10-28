# -*- coding: utf-8 -*-
from create_abbreviations_docx import GROUPS_DATA

md_lines = []
md_lines.append("# DANH MỤC CÁC TỪ VIẾT TẮT VÀ THUẬT NGỮ KỸ THUẬT")
md_lines.append("**Đồ án tốt nghiệp / Báo cáo NCKH:** Thiết kế và thi công mô hình xe đẩy mua sắm thông minh tích hợp AIoT cho siêu thị bán lẻ  ")
md_lines.append("**Đơn vị đào tạo:** Học viện Công nghệ Bưu chính Viễn thông — Khoa Viễn thông 2  ")
md_lines.append("**Quy mô trích xuất:** Tổng hợp toàn diện 162 thuật ngữ chuyên môn từ Chương 1 đến Chương 5 của báo cáo  \n")
md_lines.append("---\n")

md_lines.append("## BẢNG TỔNG QUAN PHÂN BỔ 6 NHÓM CHUYÊN MÔN KỸ THUẬT\n")
md_lines.append("| STT | Phân nhóm chuyên môn kỹ thuật | Số lượng | Các thuật ngữ tiêu biểu |")
md_lines.append("| :---: | :--- | :---: | :--- |")
md_lines.append("| 1 | **Nhóm 1: Trí tuệ nhân tạo, Thị giác máy tính & Học sâu (AI / CV)** | 48 thuật ngữ | YOLO11n, NMS, IoU, CIoU, DFL, mAP, NCNN, PTQ, QAT, ByteTrack... |")
md_lines.append("| 2 | **Nhóm 2: Hệ thống nhúng, Phần cứng & Cảm biến IoT (Hardware)** | 36 thuật ngữ | SoC, Pi 4, Loadcell, HX711, ToF, VL53L0X, GM65, DMA, VCSEL... |")
md_lines.append("| 3 | **Nhóm 3: Chuẩn giao tiếp & Giao thức truyền thông (Protocols)** | 13 thuật ngữ | I2C, UART, USB, Wi-Fi 802.11ac, WebSocket, MQTT, ThingsBoard... |")
md_lines.append("| 4 | **Nhóm 4: Phần mềm Backend, Cơ sở dữ liệu & Kiến trúc (Backend & DB)** | 21 thuật ngữ | FastAPI, PostgreSQL, ACID, Idempotency, UPSERT, Redis, Mock Bank... |")
md_lines.append("| 5 | **Nhóm 5: Giao diện người dùng, Mobile & Nền tảng Web (Frontend & Web)** | 16 thuật ngữ | Jetpack Compose, MVVM, StateFlow, Next.js 14, PWA, VietQR... |")
md_lines.append("| 6 | **Nhóm 6: Nghiệp vụ bán lẻ, Đơn vị đo lường & Thống kê kiểm thử** | 28 thuật ngữ | SKU, SLA, P50–P99, TC-01–TC-05, Sensor Fusion, MAE, R_ToF... |")
md_lines.append("| **TỔNG** | **Toàn bộ 6 nhóm chuyên môn đề tài** | **162 thuật ngữ** | **Phủ kín toàn bộ 5 chương của luận văn tốt nghiệp** |\n")
md_lines.append("---\n")

for group in GROUPS_DATA:
    md_lines.append(f"### {group['group_name']}\n")
    md_lines.append(f"> *{group['description']}*\n")
    md_lines.append("| STT | Từ viết tắt / Ký hiệu | Thuật ngữ tiếng Anh đầy đủ | Ý nghĩa / Định nghĩa kỹ thuật trong đề tài | Chương |")
    md_lines.append("| :---: | :---: | :--- | :--- | :---: |")
    for r_i, (abbr, en_name, vn_desc, ch_occ) in enumerate(group["terms"]):
        md_lines.append(f"| {r_i + 1} | `{abbr}` | **{en_name}** | {vn_desc} | *{ch_occ}* |")
    md_lines.append("\n---\n")

with open(r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\Danh_Muc_Tu_Viet_Tat_Do_An_Tot_Nghiep.md", "w", encoding="utf-8") as f:
    f.write("\n".join(md_lines))

print("✅ Đã tạo thành công file Markdown Danh mục từ viết tắt!")
