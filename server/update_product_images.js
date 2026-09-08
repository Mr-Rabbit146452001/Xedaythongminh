const pool = require('./db');

async function updateImages() {
  console.log('🖼️ Đang bổ sung cột imageurl và nạp link hình ảnh sản phẩm thực tế vào PostgreSQL...');

  try {
    // 1. Thêm cột imageurl nếu chưa có
    await pool.query('ALTER TABLE Products ADD COLUMN IF NOT EXISTS imageurl VARCHAR(500)');

    // 2. Cập nhật tên tệp hình ảnh tương ứng cho từng sản phẩm hiện có
    await pool.query("UPDATE Products SET imageurl = 'sua_vinamilk.jpg' WHERE barcode = '8934563123456'");
    await pool.query("UPDATE Products SET imageurl = 'bo_sap.jpg' WHERE barcode = '8934563123457'");
    await pool.query("UPDATE Products SET imageurl = 'tao_envy.jpg' WHERE barcode = '8934563123458'");
    await pool.query("UPDATE Products SET imageurl = 'hao_hao.jpg' WHERE barcode = '8934563123460'");
    await pool.query("UPDATE Products SET imageurl = 'lavie_500ml.jpg' WHERE barcode = '8936079015024'");
    await pool.query("UPDATE Products SET imageurl = 'aquafina_500ml.jpg' WHERE barcode = '8934563123459'");

    // 3. Nạp bổ sung thêm 2 sản phẩm Oreo và Coca Cola nếu chưa có
    await pool.query(`
      INSERT INTO Products (barcode, name, price, imageurl)
      VALUES 
      ('8935001239841', 'Bánh quy kẹp kem Oreo socola 137g', 18000, 'oreo_socola.jpg'),
      ('8935001239842', 'Nước ngọt Coca Cola lon 330ml', 10000, 'coca_cola_330ml.jpg')
      ON CONFLICT (barcode) DO UPDATE SET 
        imageurl = EXCLUDED.imageurl,
        name = EXCLUDED.name,
        price = EXCLUDED.price
    `);

    // 4. Kiểm tra kết quả
    const res = await pool.query('SELECT id, barcode, name, price, imageurl FROM Products ORDER BY id ASC');
    console.log('✅ Đã cập nhật thành công hình ảnh cho 8 sản phẩm vào PostgreSQL:');
    console.table(res.rows);
  } catch (err) {
    console.error('❌ Lỗi cập nhật hình ảnh:', err);
  } finally {
    await pool.end();
  }
}

updateImages();
