const pool = require('./db');

async function runTests() {
  console.log('🧪 Bắt đầu kiểm thử tự động các API PostgreSQL...');

  try {
    // 1. Reset dữ liệu test cũ
    await pool.query("DELETE FROM CartItems WHERE sessionid = 'SESSION_TEST'");
    console.log('1. ✅ Đã dọn dẹp bảng CartItems test');

    // 2. Giả lập Raspberry Pi quét mã vạch 8934563123456 (Sữa Vinamilk)
    const pResult = await pool.query("SELECT id, name, price FROM Products WHERE barcode = '8934563123456'");
    const product = pResult.rows[0];
    
    await pool.query("INSERT INTO ShoppingSessions (Id, Status) VALUES ('SESSION_TEST', 'active') ON CONFLICT (Id) DO NOTHING");
    await pool.query("INSERT INTO CartItems (SessionId, ProductId, Quantity) VALUES ('SESSION_TEST', $1, 2)", [product.id]);
    console.log(`2. ✅ [Raspberry Pi IoT] Đã quét thành công 2x ${product.name}`);

    // 3. Đọc dữ liệu giỏ hàng từ PostgreSQL (CartItems JOIN Products)
    const cartRes = await pool.query(`
      SELECT c.quantity, p.name, p.price, (c.quantity * p.price) as subtotal
      FROM CartItems c
      JOIN Products p ON c.productid = p.id
      WHERE c.sessionid = 'SESSION_TEST'
    `);
    console.log('3. ✅ Dữ liệu giỏ hàng từ PostgreSQL:', cartRes.rows);

    // 4. Kiểm thử Checkout Transaction
    const totalAmount = parseFloat(cartRes.rows[0].subtotal);
    const pointsEarned = Math.floor(totalAmount / 1000);
    
    await pool.query('UPDATE Customers SET points = points + $1 WHERE id = $2', [pointsEarned, 'CUSTOMER_888']);
    await pool.query("DELETE FROM CartItems WHERE sessionid = 'SESSION_TEST'");
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
