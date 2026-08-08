-- Script khởi tạo Bảng & Dữ liệu Sản phẩm trên PostgreSQL (Raspberry Pi)

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    barcode VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    price BIGINT NOT NULL
);

-- Xóa dữ liệu cũ và reset ID
TRUNCATE TABLE products RESTART IDENTITY;

-- Chèn dữ liệu sản phẩm mẫu thật vào PostgreSQL
INSERT INTO products (barcode, name, price) VALUES 
('8934563123456', 'Sữa tươi Vinamilk 180ml', 8500),
('123456', 'Bánh Karo sợi gà', 12000),
('789012', 'Coca Cola lon 320ml', 10000),
('8935001800045', 'Mì tôm Hảo Hảo chua cay', 4500),
('8936079015024', 'Nước khoáng La Vie 500ml', 6000);

-- Kiểm tra bảng products
SELECT * FROM products;
