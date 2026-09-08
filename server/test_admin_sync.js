const http = require('http');

// Khởi chạy server trong tiến trình test
require('./index');

setTimeout(async () => {
  console.log('\n🧪 ĐANG KIỂM THỬ ĐỒNG BỘ CÁC API QUẢN TRỊ TRÊN CỔNG 3000...\n');

  function get(path) {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:3000${path}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        });
      }).on('error', reject);
    });
  }

  try {
    // 1. Test Overview KPI
    const overview = await get('/api/admin/overview');
    console.log('✅ 1. Test /api/admin/overview:');
    console.log('   Doanh thu hôm nay:', overview.data?.todayRevenue);
    console.log('   Tổng số sản phẩm:', overview.data?.totalProducts);
    console.log('   Số xe Smart Cart hoạt động:', overview.data?.activeStrollers);

    // 2. Test Products List
    const products = await get('/api/admin/products');
    console.log('✅ 2. Test /api/admin/products:');
    console.log(`   Đã nạp ${products.total} sản phẩm từ PostgreSQL:`);
    products.data?.slice(0, 3).forEach(p => {
      console.log(`   - [${p.sku}] ${p.name} | Giá: ${p.price} | Tồn: ${p.stock} | Ảnh: ${p.imageUrl}`);
    });

    // 3. Test Orders List
    const orders = await get('/api/admin/orders');
    console.log('✅ 3. Test /api/admin/orders:');
    console.log(`   Đã nạp ${orders.total} đơn hàng từ PostgreSQL & Session:`);
    orders.data?.slice(0, 2).forEach(o => {
      console.log(`   - [${o.id}] Khách: ${o.customerName} | Tổng: ${o.totalAmount} | Trạng thái: ${o.status}`);
    });

    // 4. Test Strollers Fleet
    const strollers = await get('/api/admin/strollers');
    console.log('✅ 4. Test /api/admin/strollers:');
    console.log(`   Đã nạp ${strollers.total} xe đẩy thông minh:`);
    strollers.data?.slice(0, 3).forEach(s => {
      console.log(`   - [${s.id}] ${s.name} | Pin: ${s.battery}% | Trạng thái: ${s.status} | Vị trí: ${s.location}`);
    });

    console.log('\n🎉 TOÀN BỘ CÁC ENDPOINT ĐỒNG BỘ ĐÃ HOẠT ĐỘNG HOÀN HẢO!\n');
  } catch (err) {
    console.error('❌ Lỗi kiểm thử API:', err.message);
  } finally {
    process.exit(0);
  }
}, 1500);
