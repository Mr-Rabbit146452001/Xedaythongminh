# SMART CART — RETAIL INTELLIGENCE ADMIN

Ứng dụng Web Quản trị Bán lẻ Thông minh & Giám sát IoT Smart Cart, được phát triển dựa trên bộ thiết kế giao diện chuẩn và tài liệu `DESIGN.md` của hệ thống Smart Cart.

---

## 🚀 Công Nghệ Sử Dụng (Technology Stack)

- **Frontend Framework:** Next.js 14 (App Router) + React 18 + TypeScript.
- **Styling:** Tailwind CSS cấu hình 100% theo các biến màu chuẩn (Corporate/Modern: Primary `#0040A1`, Container `#0056D2`, Surface `#FAF8FF`).
- **Typography:** Inter Font & Google Material Symbols Outlined.
- **Architecture:** Clean Component-based, Type-safe TypeScript.
- **Data Layer:** `ApiService` kết nối trực tiếp Backend REST API (Port 3000) & bộ Fallback Mock Data Adapter mượt mà.

---

## 📂 Cấu Trúc Dự Án

```text
web-admin/
├── app/
│   ├── layout.tsx         # Root Layout với Sidebar cố định 260px và Topbar 64px
│   ├── globals.css        # CSS toàn cục, Inter font, Material symbols
│   ├── page.tsx           # Phân hệ 1: Tổng quan (Dashboard Overview)
│   ├── products/
│   │   └── page.tsx       # Phân hệ 2: Quản lý Sản phẩm (CRUD, Search, Filter)
│   ├── inventory/
│   │   └── page.tsx       # Phân hệ 3: Quản lý Kho hàng (Bento Donut, Nhập/Xuất kho)
│   ├── orders/
│   │   └── page.tsx       # Phân hệ 4: Quản lý Đơn hàng (Filter, Export CSV, Chi tiết)
│   └── smart-cart/
│       └── page.tsx       # Phân hệ 5: Giám sát Smart Cart IoT (Live Floor Map, Battery, Radar)
├── components/
│   ├── Sidebar.tsx        # Thanh điều hướng chuẩn 260px
│   ├── Topbar.tsx         # Thanh công cụ 64px với tìm kiếm, thông báo, profile
│   └── KpiCard.tsx        # Thẻ chỉ số thống kê tái sử dụng
├── data/
│   └── mockData.ts        # Mô hình dữ liệu TypeScript và Seed Data
├── services/
│   └── api.ts             # API Client giao tiếp backend PostgreSQL
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 🛠️ Hướng Dẫn Cài Đặt & Vận Hành

### 1. Cài đặt thư viện:
```powershell
cd "C:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\web-admin"
npm install
```

### 2. Khởi chạy ở chế độ phát triển (Development):
```powershell
npm run dev
```
Truy cập giao diện Web Admin tại: **http://localhost:3001**

### 3. Build kiểm tra sản phẩm:
```powershell
npm run build
```

---

## 📌 Các Phân Hệ Đã Hiện Thực Hóa
1. **Tổng quan (Dashboard):** 5 KPI thẻ tài chính, biểu đồ Doanh thu 7 ngày, Donut trạng thái đơn, Top sản phẩm bán chạy, Cảnh báo tồn kho khẩn cấp.
2. **Quản lý Sản phẩm:** Bảng sản phẩm chi tiết kèm hình ảnh, SKU, Barcode, giá tiền VND, tình trạng tồn kho, bộ lọc đa năng và Modal Thêm/Sửa sản phẩm.
3. **Quản lý Kho:** Thống kê giá trị tồn kho 2.85 tỷ VND theo ngành hàng dạng Bento Donut, nhật ký chứng từ xuất nhập kho và tạo phiếu nhập nhanh.
4. **Quản lý Đơn hàng:** Danh sách đơn hàng thời gian thực, chi tiết thanh toán SmartPay / Visa / MockBank QR, lọc theo ngày và chức năng xuất báo cáo CSV.
5. **Quản lý Smart Cart IoT:** Bản đồ Live Floor Plan 2D định vị 20 xe đẩy thông minh trong siêu thị với radar ping trực quan, bảng pin % và trạng thái Online/Đang sạc/Offline.
