/**
 * Công cụ Ping Dữ Liệu Cảm Biến Giả Lập cho Smart Cart:
 * - Thêm sản phẩm:   node ping_mock.js add lavie       (hoặc node ping_mock.js lavie)
 * - Bớt sản phẩm:    node ping_mock.js remove lavie    (hoặc node ping_mock.js bot lavie / node ping_mock.js - lavie)
 * - Xem giỏ hàng:    node ping_mock.js status          (hoặc node ping_mock.js cart)
 * - Xóa sạch giỏ:    node ping_mock.js clear
 */

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

async function showCartStatus(sessionId) {
  return new Promise((resolve) => {
    http.get(`http://127.0.0.1:3000/api/v1/cart/${sessionId}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const cart = JSON.parse(data);
          console.log(`\n🛒 CHI TIẾT GIỎ HÀNG HIỆN TẠI (Session: ${sessionId}):`);
          console.log(`------------------------------------------------------`);
          if (!cart.items || cart.items.length === 0) {
            console.log(`   (Giỏ hàng đang trống)`);
          } else {
            cart.items.forEach((item, idx) => {
              console.log(`   ${idx + 1}. [${item.sku}] ${item.name} x ${item.quantity} = ${item.line_total_vnd?.toLocaleString('vi-VN')} đ`);
            });
          }
          console.log(`------------------------------------------------------`);
          console.log(`📊 Tổng số lượng: ${cart.total_quantity || 0} món | Tổng thanh toán: ${(cart.total_vnd || 0).toLocaleString('vi-VN')} đ`);
          console.log(`======================================================\n`);
        } catch (e) {
          console.log('Lỗi đọc giỏ hàng:', data);
        }
        resolve();
      });
    }).on('error', (err) => {
      console.error('Không thể kết nối máy chủ:', err.message);
      resolve();
    });
  });
}

async function clearCart(sessionId) {
  console.log(`\n======================================================`);
  console.log(`🧹 ĐANG XÓA SẠCH GIỎ HÀNG (Session: ${sessionId})...`);
  console.log(`======================================================`);
  
  // Xóa từng món đang có trong giỏ
  return new Promise((resolve) => {
    http.get(`http://127.0.0.1:3000/api/v1/cart/${sessionId}`, async (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', async () => {
        try {
          const cart = JSON.parse(data);
          if (!cart.items || cart.items.length === 0) {
            console.log(`👉 Giỏ hàng vốn đã trống sẵn.`);
            console.log(`======================================================\n`);
            return resolve();
          }

          for (const item of cart.items) {
            for (let i = 0; i < item.quantity; i++) {
              await sendDecision(sessionId, 'remove', item.barcode, item.sku, 500, true);
            }
          }
          console.log(`✅ ĐÃ XÓA TOÀN BỘ SẢN PHẨM TRONG GIỎ THÀNH CÔNG!`);
          console.log(`📱 Màn hình máy tính bảng sẽ trở về giỏ hàng trống (0đ).`);
          console.log(`======================================================\n`);
        } catch (e) {
          console.error('Lỗi khi xóa giỏ hàng:', e);
        }
        resolve();
      });
    }).on('error', resolve);
  });
}

function sendDecision(sessionId, action, barcode, sku, weight, silent = false) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      session_id: sessionId,
      action: action,
      barcode: barcode,
      ai_class: sku,
      ai_confidence: 0.99,
      delta_weight_g: action === 'add' ? weight : -weight,
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
          if (!silent) {
            if (json.decision === 'accepted') {
              const actStr = action === 'add' ? 'ĐÃ THÊM THÀNH CÔNG' : 'ĐÃ BỚT THÀNH CÔNG';
              console.log(`\n✅ ${actStr}! [Sensor Fusion: ACCEPTED]`);
              console.log(`👉 Giỏ hàng hiện còn: ${json.cart?.total_quantity} món | Tổng tiền: ${json.cart?.total_vnd?.toLocaleString('vi-VN')} đ`);
              console.log(`📱 Màn hình máy tính bảng sẽ tự động cập nhật trong 1-2 giây!`);
            } else {
              console.log(`\n⚠️ BỊ TỪ CHỐI [REJECTED]: Lý do: ${JSON.stringify(json.reasons)}`);
              if (json.reasons?.includes('product_not_in_cart')) {
                console.log(`👉 Ghi chú: Sản phẩm này chưa có trong giỏ hàng để bớt!`);
              }
            }
            console.log(`======================================================\n`);
          }
          resolve(json);
        } catch (e) {
          if (!silent) console.log(`\nPhản hồi máy chủ:`, body);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ Lỗi kết nối tới máy chủ (port 3000):`, e.message);
      resolve(null);
    });

    req.write(payload);
    req.end();
  });
}

async function main() {
  const args = process.argv.slice(2);
  let action = 'add';
  let itemKey = 'lavie';

  if (args.length === 0) {
    // Mặc định ping thêm lavie
    action = 'add';
    itemKey = 'lavie';
  } else if (args[0] === 'status' || args[0] === 'cart' || args[0] === 'list') {
    const sessionId = await getActiveSession();
    await showCartStatus(sessionId);
    return;
  } else if (args[0] === 'clear' || args[0] === 'reset') {
    const sessionId = await getActiveSession();
    await clearCart(sessionId);
    return;
  } else if (args[0] === 'remove' || args[0] === 'bot' || args[0] === 'xoa' || args[0] === '-') {
    action = 'remove';
    itemKey = args[1] || 'lavie';
  } else if (args[0] === 'add' || args[0] === 'them' || args[0] === '+') {
    action = 'add';
    itemKey = args[1] || 'lavie';
  } else {
    // Nếu truyền trực tiếp tên sản phẩm
    itemKey = args[0];
    action = 'add';
  }

  const product = PRODUCTS[itemKey.toLowerCase()] || PRODUCTS.lavie;
  const sessionId = await getActiveSession();

  console.log(`\n======================================================`);
  if (action === 'remove') {
    console.log(`📤 ĐANG PING GIẢ LẬP GẮP SẢN PHẨM RA KHỎI XE ĐẨY (REMOVE)...`);
  } else {
    console.log(`📥 ĐANG PING GIẢ LẬP ĐẶT SẢN PHẨM VÀO XE ĐẨY (ADD)...`);
  }
  console.log(`======================================================`);
  console.log(`🛒 Phiên giỏ hàng: ${sessionId}`);
  console.log(`📦 Sản phẩm:      ${product.name}`);
  console.log(`🏷️  Mã Barcode:    ${product.barcode}`);
  console.log(`👁️  AI Class:      ${product.sku}`);
  console.log(`⚖️  Trọng lượng:   ${action === 'add' ? '+' : '-'}${product.weight}g`);
  console.log(`⚡ Hành động:      ${action.toUpperCase()}`);
  console.log(`------------------------------------------------------`);

  await sendDecision(sessionId, action, product.barcode, product.sku, product.weight, false);
}

main();
