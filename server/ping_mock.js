const http = require('http');

const PRODUCTS = {
  lavie: {
    name: 'La Vie 500 ml',
    barcode: '8935005801135',
    sku: 'lavie_500ml',
    weight: 505
  },
  banhsuachua: {
    name: 'Bánh Sữa Chua 20g',
    barcode: '6975493200982',
    sku: 'banh_sua_chua_20g',
    weight: 20
  },
  pocari: {
    name: 'Pocari Sweat 500 ml',
    barcode: '8938556329004',
    sku: 'pocari_sweat_500ml',
    weight: 505
  },
  siro: {
    name: 'Siro EUCA Super Extra 125 ml',
    barcode: '8936154640613',
    sku: 'siro_ho_euca_super_extra_125ml',
    weight: 152
  }
};

async function getActiveSession() {
  return new Promise((resolve) => {
    http.get('http://127.0.0.1:3000/api/v1/sessions/active', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.id || 'SESSION_DEFAULT');
        } catch (e) {
          resolve('SESSION_DEFAULT');
        }
      });
    }).on('error', () => resolve('SESSION_DEFAULT'));
  });
}

async function pingProduct(itemKey = 'lavie', action = 'add') {
  const product = PRODUCTS[itemKey.toLowerCase()] || PRODUCTS.lavie;
  const sessionId = await getActiveSession();

  console.log(`\n======================================================`);
  console.log(`📡 ĐANG PING DỮ LIỆU CẢM BIẾN GIẢ LẬP LÊN XE ĐẨY...`);
  console.log(`======================================================`);
  console.log(`🛒 Phiên giỏ hàng: ${sessionId}`);
  console.log(`📦 Sản phẩm:      ${product.name}`);
  console.log(`🏷️  Mã Barcode:    ${product.barcode}`);
  console.log(`👁️  AI Class:      ${product.sku}`);
  console.log(`⚖️  Trọng lượng:   ${product.weight}g`);
  console.log(`⚡ Hành động:      ${action.toUpperCase()}`);
  console.log(`------------------------------------------------------`);

  const payload = JSON.stringify({
    session_id: sessionId,
    action: action,
    barcode: product.barcode,
    ai_class: product.sku,
    ai_confidence: 0.99,
    delta_weight_g: action === 'add' ? product.weight : -product.weight,
    weight_source: 'loadcell'
  });

  const req = http.request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/v1/cart/decisions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(body);
        if (json.decision === 'accepted') {
          console.log(`\n✅ THÀNH CÔNG RỰC RỠ! [Sensor Fusion: ACCEPTED]`);
          console.log(`👉 Giỏ hàng hiện có: ${json.cart?.total_quantity} món | Tổng tiền: ${json.cart?.total_vnd?.toLocaleString('vi-VN')} đ`);
          console.log(`📱 Màn hình máy tính bảng sẽ tự cập nhật trong 1-2 giây!`);
        } else {
          console.log(`\n⚠️ BỊ TỪ CHỐI [REJECTED]: Lý do: ${JSON.stringify(json.reasons)}`);
        }
      } catch (e) {
        console.log(`\nPhản hồi máy chủ:`, body);
      }
      console.log(`======================================================\n`);
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Lỗi kết nối tới máy chủ (port 3000):`, e.message);
  });

  req.write(payload);
  req.end();
}

const arg = process.argv[2] || 'lavie';
pingProduct(arg);
