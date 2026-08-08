const pool = require('./db');

async function updateImages() {
  console.log('🖼️ Đang bổ sung cột imageurl và nạp link hình ảnh sản phẩm vào PostgreSQL...');

  try {
    // 1. Thêm cột imageurl nếu chưa có
    await pool.query('ALTER TABLE Products ADD COLUMN IF NOT EXISTS imageurl VARCHAR(500)');

    // 2. Cập nhật tên tệp hình ảnh tương ứng cho từng sản phẩm
    await pool.query("UPDATE Products SET imageurl = 'sua_vinamilk.jpg' WHERE barcode = '8934563123456'");
    await pool.query("UPDATE Products SET imageurl = 'bo_sap.jpg' WHERE barcode = '8934563123457'");
    await pool.query("UPDATE Products SET imageurl = 'tao_envy.jpg' WHERE barcode = '8934563123458'");
    await pool.query("UPDATE Products SET imageurl = 'hao_hao.jpg' WHERE barcode = '8934563123460'");

    // 3. Kiểm tra kết quả
    const res = await pool.query('SELECT id, barcode, name, imageurl FROM Products ORDER BY id ASC');
    console.log('✅ Đã cập nhật thành công hình ảnh sản phẩm vào PostgreSQL:');
    console.log(res.rows);
  } catch (err) {
    console.error('❌ Lỗi cập nhật hình ảnh:', err);
  } finally {
    await pool.end();
  }
}

updateImages();
