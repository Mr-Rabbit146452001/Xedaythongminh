-- Script khởi tạo Bảng & Dữ liệu Khách hàng trên PostgreSQL (Raspberry Pi)

CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    membership_level VARCHAR(50) NOT NULL,
    points INT NOT NULL DEFAULT 0,
    phone_number VARCHAR(20) NOT NULL,
    vouchers JSONB NOT NULL DEFAULT '[]'::jsonb,
    promotions JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Xóa dữ liệu cũ nếu trùng khóa
DELETE FROM customers WHERE id IN ('CUSTOMER_888', 'CUSTOMER_999');

-- Chèn dữ liệu khách hàng thực tế vào PostgreSQL
INSERT INTO customers (id, name, membership_level, points, phone_number, vouchers, promotions)
VALUES 
('CUSTOMER_888', 'Nguyễn Văn A', 'Hội viên Vàng', 2450, '0987.654.321', 
 '["Voucher giảm 50K cho đơn hàng từ 500K", "Miễn phí giao hàng tận nhà", "Voucher sinh nhật giảm 15%"]'::jsonb,
 '["Tặng 1 bình nước giữ nhiệt khi mua 2 hộp sữa", "Giảm 20% toàn bộ mặt hàng rau xanh hôm nay"]'::jsonb),
('CUSTOMER_999', 'Trần Thị B', 'Hội viên Kim Cương', 8900, '0909.123.456', 
 '["Voucher giảm 100K cho đơn hàng từ 1 Triệu", "Voucher giảm 10% ngành hàng gia dụng"]'::jsonb,
 '["Ưu đãi nhân đôi điểm tích lũy khi mua tã sữa", "Mua 1 tặng 1 nước ép trái cây tươi"]'::jsonb);

-- Kiểm tra bảng customers
SELECT * FROM customers;
