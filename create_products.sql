USE master;
GO

-- Tạo bảng Products
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Products' AND xtype='U')
BEGIN
    CREATE TABLE Products (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Barcode VARCHAR(50) NOT NULL,
        Name NVARCHAR(100) NOT NULL,
        Price FLOAT NOT NULL
    );
END
GO

-- Xóa dữ liệu cũ nếu trùng lặp
TRUNCATE TABLE Products;
GO

-- Chèn dữ liệu sản phẩm mẫu thật
INSERT INTO Products (Barcode, Name, Price) VALUES ('8934563123456', N'Sữa tươi Vinamilk 180ml', 8500);
INSERT INTO Products (Barcode, Name, Price) VALUES ('123456', N'Bánh Karo sợi gà', 12000);
INSERT INTO Products (Barcode, Name, Price) VALUES ('789012', N'Coca Cola lon 320ml', 10000);
INSERT INTO Products (Barcode, Name, Price) VALUES ('8935001800045', N'Mì tôm Hảo Hảo chua cay', 4500);
INSERT INTO Products (Barcode, Name, Price) VALUES ('8936079015024', N'Nước khoáng La Vie 500ml', 6000);
GO

-- Kiểm tra lại bảng Products
SELECT * FROM Products;
GO
