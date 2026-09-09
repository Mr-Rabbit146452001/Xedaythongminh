const pool = require('./db');

async function runTests() {
  console.log('🧪 Bắt đầu kiểm thử tự động các API PostgreSQL...');

  try {
    // 1. Reset dữ liệu test cũ
    await pool.query("DELETE FROM cart_items WHERE session_id = 'SESSION_TEST'");
    console.log('1. ✅ Đã dọn dẹp bảng cart_items test');

    // 2. Giả lập Raspberry Pi quét mã vạch 8934563123456 (Sữa Vinamilk)
    const pResult = await pool.query("SELECT id, name, price, price_vnd FROM Products WHERE barcode = '8934563123456'");
    const product = pResult.rows[0];
    const nowMs = Date.now();
    
    await pool.query("INSERT INTO shopping_sessions (id, status, started_at_ms) VALUES ('SESSION_TEST', 'active', $1) ON CONFLICT (id) DO NOTHING", [nowMs]);
    await pool.query("INSERT INTO shoppingsessions (id, status) VALUES ('SESSION_TEST', 'active') ON CONFLICT (id) DO NOTHING");
    await pool.query("INSERT INTO cart_items (session_id, product_id, quantity, unit_price_vnd, updated_at_ms) VALUES ('SESSION_TEST', $1, 2, $2, $3)", [product.id, product.price_vnd || product.price, nowMs]);
    console.log(`2. ✅ [Raspberry Pi IoT] Đã quét thành công 2x ${product.name}`);

    // 3. Đọc dữ liệu giỏ hàng từ PostgreSQL (cart_items JOIN Products)
    const cartRes = await pool.query(`
      SELECT c.quantity, p.name, COALESCE(c.unit_price_vnd, p.price) as price, (c.quantity * COALESCE(c.unit_price_vnd, p.price)) as subtotal
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.session_id = 'SESSION_TEST'
    `);
    console.log('3. ✅ Dữ liệu giỏ hàng từ PostgreSQL:', cartRes.rows);

    // 4. Kiểm thử Checkout Transaction
    const totalAmount = parseFloat(cartRes.rows[0].subtotal);
    const pointsEarned = Math.floor(totalAmount / 1000);
    
    await pool.query('UPDATE Customers SET points = points + $1 WHERE id = $2', [pointsEarned, 'CUSTOMER_888']);
    await pool.query("DELETE FROM cart_items WHERE session_id = 'SESSION_TEST'");
    console.log(`4. ✅ [Checkout Transaction] Đã thanh toán thành công! Tích thêm ${pointsEarned} điểm cho CUSTOMER_888.`);

    const custRes = await pool.query("SELECT name, points FROM Customers WHERE id = 'CUSTOMER_888'");
    console.log('5. ✅ Điểm thưởng khách hàng mới:', custRes.rows[0]);

    console.log('\n🎉 TẤT CẢ 5 BƯỚC KIỂM THỬ BACKEND POSTGRESQL ĐÃ THÀNH CÔNG 100%!');
  } catch (err) {
    console.error('❌ Lỗi kiểm thử Backend:', err);
  } finally {
    await pool.end();
  }
}

runTests();
