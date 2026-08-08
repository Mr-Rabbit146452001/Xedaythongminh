USE master;
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Customers' AND xtype='U')
BEGIN
    CREATE TABLE Customers (
        Id VARCHAR(50) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        MembershipLevel NVARCHAR(50) NOT NULL,
        Points INT NOT NULL,
        PhoneNumber VARCHAR(20) NOT NULL,
        Vouchers NVARCHAR(MAX) NOT NULL,
        Promotions NVARCHAR(MAX) NOT NULL
    );
END
GO

-- Xóa dữ liệu cũ nếu trùng khóa
DELETE FROM Customers WHERE Id IN ('CUSTOMER_888', 'CUSTOMER_999');
GO

-- Chèn dữ liệu khách hàng thực tế
INSERT INTO Customers (Id, Name, MembershipLevel, Points, PhoneNumber, Vouchers, Promotions)
VALUES 
('CUSTOMER_888', N'Nguyễn Văn A', N'Hội viên Vàng', 2450, '0987.654.321', 
 '["Voucher giảm 50K cho đơn hàng từ 500K", "Miễn phí giao hàng tận nhà", "Voucher sinh nhật giảm 15%"]',
 '["Tặng 1 bình nước giữ nhiệt khi mua 2 hộp sữa", "Giảm 20% toàn bộ mặt hàng rau xanh hôm nay"]'),
('CUSTOMER_999', N'Trần Thị B', N'Hội viên Kim Cương', 8900, '0909.123.456', 
 '["Voucher giảm 100K cho đơn hàng từ 1 Triệu", "Voucher giảm 10% ngành hàng gia dụng"]',
 '["Ưu đãi nhân đôi điểm tích lũy khi mua tã sữa", "Mua 1 tặng 1 nước ép trái cây tươi"]');
GO

-- Kiểm tra lại bảng dữ liệu
SELECT * FROM Customers;
GO
