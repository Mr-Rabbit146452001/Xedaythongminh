

-- ===================================================
-- SCRIPT KHỞI TẠO CƠ SỞ DỮ LIỆU POSTGRESQL (STROLLER APP)
-- ===================================================

-- 1. Xóa các bảng cũ nếu đã tồn tại
DROP TABLE IF EXISTS CartItems CASCADE;
DROP TABLE IF EXISTS ShoppingSessions CASCADE;
DROP TABLE IF EXISTS Products CASCADE;
DROP TABLE IF EXISTS Strollers CASCADE;
DROP TABLE IF EXISTS Customers CASCADE;

-- 2. Bảng Khách hàng (Customers)
CREATE TABLE Customers (
    Id VARCHAR(50) PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    MembershipLevel VARCHAR(50) DEFAULT 'Thành viên mới',
    Points INT DEFAULT 0,
    PhoneNumber VARCHAR(20) NOT NULL UNIQUE
);

-- 3. Bảng Xe đẩy (Strollers)
CREATE TABLE Strollers (
    Id SERIAL PRIMARY KEY,
    Status VARCHAR(50) DEFAULT 'idle' -- 'idle', 'in_use', 'maintenance'
);

-- 4. Bảng Sản phẩm (Products)
CREATE TABLE Products (
    Id SERIAL PRIMARY KEY,
    Barcode VARCHAR(50) NOT NULL UNIQUE,
    Name VARCHAR(255) NOT NULL,
    Price NUMERIC(18,2) NOT NULL CHECK (Price >= 0)
);

-- 5. Bảng Phiên mua sắm (ShoppingSessions)
CREATE TABLE ShoppingSessions (
    Id VARCHAR(100) PRIMARY KEY,
    CustomerId VARCHAR(50) REFERENCES Customers(Id) ON DELETE SET NULL,
    StrollerId INT REFERENCES Strollers(Id) ON DELETE SET NULL,
    StartTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    EndTime TIMESTAMP NULL,
    Status VARCHAR(50) DEFAULT 'active' -- 'active', 'completed'
);

-- 6. Bảng Chi tiết Giỏ hàng (CartItems)
CREATE TABLE CartItems (
    SessionId VARCHAR(100) REFERENCES ShoppingSessions(Id) ON DELETE CASCADE,
    ProductId INT REFERENCES Products(Id) ON DELETE CASCADE,
    Quantity INT NOT NULL CHECK (Quantity > 0),
    AddedTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (SessionId, ProductId)
);

-- 7. Tạo Index tối ưu hóa tìm kiếm sản phẩm theo Barcode
CREATE INDEX IX_Products_Barcode ON Products(Barcode);

-- ===================================================
-- NẠP DỮ LIỆU MẪU (SEED DATA)
-- ===================================================

INSERT INTO Products (Barcode, Name, Price) VALUES
('8934563123456', 'Sữa tươi tiệt trùng ít đường 1L', 34000),
('8934563123457', 'Bơ sáp loại 1 (KG)', 45000),
('8934563123458', 'Táo Envy New Zealand', 125000),
('8934563123459', 'Nước khoáng Aquafina 500ml', 6000),
('8934563123460', 'Mì tôm Hảo Hảo chua cay', 4500),
('8936079015024', 'Nước khoáng La Vie 500ml', 6000);

INSERT INTO Customers (Id, Name, MembershipLevel, Points, PhoneNumber) VALUES
('CUSTOMER_888', 'Nguyễn Văn A', 'Hội viên Vàng', 2450, '0987654321'),
('CUSTOMER_999', 'Trần Thị B', 'Hội viên Kim Cương', 8900, '0909123456');
