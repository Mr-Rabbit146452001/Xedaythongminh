const pool = require('./db');

async function migrateAdminColumns() {
  console.log('🔄 Đang nâng cấp cấu trúc PostgreSQL phục vụ Web Admin...');

  try {
    // 1. Thêm cột category và stock vào bảng Products
    await pool.query(`
      ALTER TABLE Products 
      ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Đồ uống',
      ADD COLUMN IF NOT EXISTS stock INT DEFAULT 100;
    `);

    // 2. Cập nhật phân loại và số lượng tồn kho thực tế cho 8 sản phẩm
    await pool.query("UPDATE Products SET category = 'Đồ uống', stock = 86 WHERE barcode = '8934563123456'");
    await pool.query("UPDATE Products SET category = 'Đồ uống', stock = 42 WHERE barcode = '8936079015024'");
    await pool.query("UPDATE Products SET category = 'Bánh kẹo', stock = 350 WHERE barcode = '8934563123460'");
    await pool.query("UPDATE Products SET category = 'Thực phẩm tươi', stock = 18 WHERE barcode = '8934563123458'");
    await pool.query("UPDATE Products SET category = 'Thực phẩm tươi', stock = 0 WHERE barcode = '8934563123457'");
    await pool.query("UPDATE Products SET category = 'Bánh kẹo', stock = 0 WHERE barcode = '8935001239841'");
    await pool.query("UPDATE Products SET category = 'Đồ uống', stock = 0 WHERE barcode = '8935001239842'");
    await pool.query("UPDATE Products SET category = 'Đồ uống', stock = 115 WHERE barcode = '8934563123459'");

    // 3. Đảm bảo bảng Strollers có đủ dữ liệu xe
    await pool.query(`
      INSERT INTO Strollers (Id, Status) VALUES 
      (1, 'in_use'),
      (2, 'in_use'),
      (3, 'in_use'),
      (8, 'maintenance'),
      (15, 'idle'),
      (16, 'in_use'),
      (17, 'in_use'),
      (18, 'in_use')
      ON CONFLICT (Id) DO NOTHING;
    `);

    console.log('✅ Đã hoàn tất nâng cấp cột category, stock và danh sách xe đẩy trong PostgreSQL!');
  } catch (err) {
    console.error('❌ Lỗi nâng cấp DB:', err);
  } finally {
    await pool.end();
  }
}

migrateAdminColumns();
