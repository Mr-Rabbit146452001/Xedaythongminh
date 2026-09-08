---
name: Retail Intelligence Admin
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3fe'
  surface-container: '#ededf8'
  surface-container-high: '#e7e7f2'
  surface-container-highest: '#e1e2ec'
  on-surface: '#191b23'
  on-surface-variant: '#424654'
  inverse-surface: '#2e3038'
  inverse-on-surface: '#f0f0fb'
  outline: '#737785'
  outline-variant: '#c3c6d6'
  surface-tint: '#0056d2'
  primary: '#0040a1'
  on-primary: '#ffffff'
  primary-container: '#0056d2'
  on-primary-container: '#ccd8ff'
  inverse-primary: '#b2c5ff'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#e2e3e2'
  on-secondary-container: '#636565'
  tertiary: '#822800'
  on-tertiary: '#ffffff'
  tertiary-container: '#a93802'
  on-tertiary-container: '#ffcebd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001847'
  on-primary-fixed-variant: '#0040a1'
  secondary-fixed: '#e2e3e2'
  secondary-fixed-dim: '#c6c7c6'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59b'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#812800'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ec'
  success: '#22C55E'
  warning: '#F59E0B'
  danger: '#EF4444'
  chart-blue: '#3B82F6'
  chart-teal: '#14B8A6'
  chart-indigo: '#6366F1'
  chart-gray: '#94A3B8'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  table-header:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 260px
  topbar-height: 64px
  gutter-md: 24px
  card-gap: 20px
  table-row-height: 52px
---

## Brand & Style

Hệ thống thiết kế này mở rộng từ nền tảng Retail OS để phục vụ giao diện quản trị (Admin Dashboard) với phong cách **Corporate / Modern**. Mục tiêu cốt lõi là tối ưu hóa hiệu suất quản lý, độ chính xác của dữ liệu và khả năng giám sát hệ thống IoT trong thời gian thực. 

Ngôn ngữ thiết kế nhấn mạnh tính **Chuyên nghiệp (Professional), Hiệu quả (Efficient) và Hiện đại (Modern)**. Không gian làm việc được tổ chức chặt chẽ, giảm thiểu các yếu tố trang trí dư thừa để tập trung hoàn toàn vào luồng công việc của người vận hành. Sự kết hợp giữa các lớp màu trắng sạch sẽ, đổ bóng mềm và các điểm nhấn màu xanh Primary tạo ra một môi trường làm việc đáng tin cậy, giúp người dùng xử lý khối lượng thông tin lớn mà không gây mỏi mắt hay nhầm lẫn.

## Colors

Hệ thống màu sắc được tinh chỉnh để phục vụ mục đích phân tích dữ liệu và báo cáo trạng thái.

- **Màu Chính (Primary):** Sử dụng sắc xanh `#0056D2` cho các hành động quan trọng và định danh thương hiệu.
- **Màu Trạng thái (Status):** 
    - `Success` (Xanh lá): Cho các giao dịch hoàn tất hoặc tồn kho an toàn.
    - `Warning` (Cam): Cảnh báo mức tồn kho thấp hoặc cần kiểm tra hệ thống.
    - `Danger` (Đỏ): Thông báo hết hàng (Stock-out) hoặc lỗi nghiêm trọng.
- **Bảng màu Visual (Data Viz):** Một dải màu lạnh gồm Blue, Teal và Indigo được thiết lập để phân biệt các tập dữ liệu trên biểu đồ, đảm bảo độ tương phản tốt trên nền trắng và xám nhạt.
- **Trung tính (Neutral):** Sử dụng các sắc độ xám từ `#F7F9FC` đến `#191C1E` để phân cấp giao diện và tạo sự ổn định thị giác.

## Typography

Sử dụng phông chữ **Inter** làm chủ đạo nhờ cấu trúc chữ hiện đại, tối ưu cho việc hiển thị dữ liệu số và văn bản kỹ thuật.

Trong môi trường Dashboard, kích thước chữ được thu nhỏ hơn so với phiên bản tại cửa hàng để tối ưu không gian hiển thị thông tin. Các cấp độ `Headline` được sử dụng cho tiêu đề trang và các khối KPI lớn. `Table-header` sử dụng kiểu chữ in hoa nhẹ hoặc đậm để phân biệt rõ ràng với nội dung dữ liệu bên dưới. Hệ thống phân cấp chữ đảm bảo người dùng có thể quét nhanh các bảng dữ liệu phức tạp mà vẫn duy trì được sự mạch lạc.

## Layout & Spacing

Hệ thống sử dụng **Fixed Sidebar Layout** kết hợp với vùng nội dung linh hoạt (Fluid Content Area).

- **Sidebar:** Cố định ở bên trái với chiều rộng 260px, chứa các danh mục điều hướng chính.
- **Top Bar:** Chiều cao 64px, chứa thanh tìm kiếm toàn cục, thông báo hệ thống và thông tin người dùng.
- **Bố cục lưới:** Các khối nội dung (KPI cards, Charts) được sắp xếp theo hệ lưới 12 cột với khoảng cách giữa các khối (Gap) là 20px-24px.
- **Phân cấp:** Sử dụng Margin và Padding rộng rãi xung quanh các tiêu đề chính (24px-32px) để tạo khoảng thở, tránh cảm giác quá tải thông tin trên màn hình Desktop.

## Elevation & Depth

Phân cấp độ sâu được thực hiện thông qua sự kết hợp giữa **Tonal Layers** và **Ambient Shadows**.

- **Mặt nền (Background):** Sử dụng màu xám rất nhạt (#F7F9FC) để làm nổi bật các khối nội dung.
- **Thẻ nội dung (Cards):** Sử dụng nền trắng thuần (#FFFFFF), bo góc và đổ bóng nhẹ (Blur 12px, Opacity 5%) để tạo cảm giác nổi khối nhẹ nhàng.
- **Sidebar & Topbar:** Sử dụng đường kẻ Border mỏng (#E6E8EB) thay vì đổ bóng đậm để duy trì vẻ ngoài phẳng và hiện đại.
- **Modals & Popovers:** Sử dụng độ cao lớn nhất với đổ bóng khuếch tán rộng để tập trung sự chú ý tuyệt đối của người dùng vào hành động hiện tại.

## Shapes

Ngôn ngữ hình khối duy trì sự nhất quán với hệ thống Retail OS gốc thông qua các góc bo tròn mềm mại.

- **Thẻ KPI & Bảng:** Bo góc 12px-16px để tạo cảm giác hiện đại và an toàn.
- **Nút bấm & Input:** Sử dụng bo góc 8px cho các thành phần nhỏ và trung bình để tạo sự cân đối.
- **Trạng thái (Badges):** Sử dụng bo tròn hoàn toàn (Pill-shaped) để làm nổi bật các nhãn trạng thái như "Hết hàng" hoặc "Đang xử lý".

## Components

### Sidebar Navigation
- **Active State:** Nền xanh Primary nhạt hoặc đường chỉ màu bên trái, văn bản và icon màu Primary.
- **Inactive State:** Văn bản màu xám trung tính, icon mảnh.
- Hỗ trợ phân nhóm (Collapsible groups) cho các danh mục con.

### KPI Cards
- Hiển thị các chỉ số quan trọng (Doanh thu, Tồn kho, Thiết bị online).
- Bao gồm tiêu đề, con số lớn, và một biểu đồ mini (Sparkline) hoặc phần trăm thay đổi so với kỳ trước.

### Tables
- **Header:** Nền xám nhạt, chữ in đậm, căn lề thẳng hàng với dữ liệu.
- **Rows:** Sử dụng "Subtle Zebra Striping" (dòng chẵn lẻ lệch màu cực nhẹ) để tăng khả năng đọc. Chiều cao dòng tối thiểu 52px.
- **Hover:** Dòng thay đổi màu nền nhẹ khi di chuột qua.

### Form Layouts
- Thiết kế một hoặc hai cột tùy theo độ phức tạp.
- Nhãn (Labels) nằm phía trên trường nhập liệu. 
- Validation lỗi hiển thị ngay dưới field với màu Danger (#EF4444).

### Modals
- Xuất hiện giữa màn hình với lớp phủ (Overlay) tối 40%.
- Tiêu đề rõ ràng, nút hành động chính nằm ở góc dưới bên phải.

### Data Visualization
- Biểu đồ đường (Line chart) cho xu hướng thời gian.
- Biểu đồ tròn (Donut chart) cho phân bổ danh mục hàng hóa.
- Sử dụng các màu trong palette Visual để đảm bảo tính thẩm mỹ đồng nhất.