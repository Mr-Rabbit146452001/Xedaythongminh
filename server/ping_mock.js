/**
 * Công cụ Ping Dữ Liệu Cảm Biến Giả Lập cho Smart Cart:
 * - Thêm sản phẩm:               node ping_mock.js add lavie       (hoặc node ping_mock.js lavie)
 * - Bớt sản phẩm:                node ping_mock.js remove lavie    (hoặc node ping_mock.js bot lavie / node ping_mock.js - lavie)
 * - Bỏ hàng KHÔNG quét barcode:  node ping_mock.js unscanned [gram] (hoặc node ping_mock.js anomaly / loadcell / can)
 * - Lấy hàng chưa quét ra ngoài: node ping_mock.js resolve         (hoặc node ping_mock.js normal / layra / ok)
 * - Xem giỏ hàng:                node ping_mock.js status          (hoặc node ping_mock.js cart)
 * - Xóa sạch giỏ:                node ping_mock.js clear
 */

const http = require('http');

const PRODUCTS = {
  aquafina: {
    name: 'Nước khoáng Aquafina 500ml',
    barcode: '8934588063145',
    sku: '8934588063145',
    weight: 500
  },
  haohao: {
    name: 'Mì tôm Hảo Hảo chua cay',
    barcode: '8934563138165',
    sku: '8934563138165',
    weight: 75
  },
  lavie: {
    name: 'Nước khoáng La Vie 500ml',
    barcode: '8935005801135',
    sku: '8935005801135',
    weight: 500
  },
  pocari: {
    name: 'Pocari Sweat 500 ml',
    barcode: '8938556329004',
    sku: '8938556329004',
    weight: 500
  },
  muoi: {
    name: 'Muối tinh sấy i-ốt Sosal Group 500 g',
    barcode: '8936120311028',
    sku: '8936120311028',
    weight: 500
  },
  khanpuri: {
    name: 'Khăn ướt Puri không mùi 20 tờ',
    barcode: '8936040077271',
    sku: '8936040077271',
    weight: 40
  },
  g7: {
    name: 'Cà phê G7 hòa tan đen 15 gói',
    barcode: '8935024120187',
    sku: '8935024120187',
    weight: 30
  },
  khangiay: {
    name: 'Khăn giấy Premier 100 tờ 3 lớp',
    barcode: '8938558334556',
    sku: '8938558334556',
    weight: 34
  },
  coca: {
    name: 'Nước ngọt Coca Cola lon 330ml',
    barcode: '8935049501503',
    sku: '8935049501503',
    weight: 330
  },
  phoga: {
    name: 'Phở gà Vifon gói 65g',
    barcode: '8934561010022',
    sku: '8934561010022',
    weight: 65
  },
  ongtho: {
    name: 'Sữa đặc Ông Thọ đỏ tuýp 165g',
    barcode: '8934673200325',
    sku: '8934673200325',
    weight: 165
  },
  poca: {
    name: 'Snack Poca bắp ngọt xóc bơ gói 32g',
    barcode: '8936079120382',
    sku: '8936079120382',
    weight: 32
  },
  vinamilk: {
    name: 'Sữa tươi tiệt trùng Vinamilk 100% Có đường 180ml',
    barcode: '8934673573344',
    sku: '8934673573344',
    weight: 180
  },
  thtruemilk: {
    name: 'Sữa tươi tiệt trùng TH true MILK Socola 180ml',
    barcode: '8935217400454',
    sku: '8935217400454',
    weight: 180
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

function setWeightAnomaly(detected) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ detected: Boolean(detected) });
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/iot/set-weight-anomaly',
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
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.error('⚠️ Lỗi gọi /api/iot/set-weight-anomaly:', e.message);
      resolve(null);
    });

    req.write(payload);
    req.end();
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

async function handleUnscannedAnomaly(weightDelta = 500) {
  const sessionId = await getActiveSession();
  console.log(`\n======================================================`);
  console.log(`🚨 PING GIẢ LẬP: BỎ SẢN PHẨM VÀO XE MÀ KHÔNG QUÉT BARCODE`);
  console.log(`======================================================`);
  console.log(`🛒 Phiên giỏ hàng:               ${sessionId}`);
  console.log(`⚖️ Cảm biến tải trọng (Loadcell): Phát hiện trọng lượng tăng +${weightDelta}g`);
  console.log(`📷 Camera AI / Đầu quét mã:      KHÔNG phát hiện mã vạch hợp lệ!`);
  console.log(`🚨 Kích hoạt cảnh báo hệ thống:  BẬT [weightAnomalyDetected = true]`);
  console.log(`------------------------------------------------------`);

  // 1. Kích hoạt cờ cảnh báo cảm biến tải trọng bất thường trên Shop Server
  await setWeightAnomaly(true);

  // 2. Gửi sự kiện cảm biến bất thường sang CSDL PostgreSQL để ghi log kiểm chứng
  await sendDecision(sessionId, 'add', 'UNSCANNED_ITEM', 'unknown', weightDelta, true);

  console.log(`📱 PHẢN HỒI TRÊN ỨNG DỤNG XE ĐẨY (TABLET / APP):`);
  console.log(`   1. Nếu khách đang ở Màn hình Mua sắm (ScanProduct):`);
  console.log(`      👉 Hiện Popup đỏ cảnh báo: "Sản phẩm chưa được quét!"`);
  console.log(`         Yêu cầu quét mã vạch hoặc lấy vật lạ ra khỏi giỏ.`);
  console.log(`   2. Nếu khách đang ở Màn hình Thanh toán (sau khi chốt giỏ hàng):`);
  console.log(`      👉 Bật màn hình mờ Full-Screen nhấp nháy đỏ báo động`);
  console.log(`         Khóa 100% chức năng thanh toán cho đến khi lấy hàng ra!`);
  console.log(`------------------------------------------------------`);
  console.log(`💡 Để giả lập lấy sản phẩm ra ngoài (hủy cảnh báo & mở khóa), chạy:`);
  console.log(`   node ping_mock.js resolve`);
  console.log(`======================================================\n`);
}

async function handleResolveAnomaly(weightDelta = 500) {
  const sessionId = await getActiveSession();
  console.log(`\n======================================================`);
  console.log(`✅ PING GIẢ LẬP: ĐÃ LẤY SẢN PHẨM / VẬT LẠ RA KHỎI XE ĐẨY`);
  console.log(`======================================================`);
  console.log(`🛒 Phiên giỏ hàng:               ${sessionId}`);
  console.log(`⚖️ Cảm biến tải trọng (Loadcell): Trọng lượng giảm -${weightDelta}g (về mức cũ)`);
  console.log(`🔓 Khôi phục trạng thái an toàn: TẮT [weightAnomalyDetected = false]`);
  console.log(`------------------------------------------------------`);

  // 1. Tắt cờ cảnh báo trên Shop Server
  await setWeightAnomaly(false);

  // 2. Gửi sự kiện cân giảm về trạng thái an toàn
  await sendDecision(sessionId, 'remove', 'UNSCANNED_ITEM', 'unknown', weightDelta, true);

  console.log(`📱 PHẢN HỒI TRÊN ỨNG DỤNG XE ĐẨY (TABLET / APP):`);
  console.log(`   👉 Mọi Popup cảnh báo và Màn hình khóa mờ sẽ tự động giải tỏa!`);
  console.log(`   👉 Khách hàng có thể tiếp tục mua sắm hoặc thanh toán bình thường.`);
  console.log(`======================================================\n`);
}

async function main() {
  const args = process.argv.slice(2);
  let action = 'add';
  let itemKey = 'lavie';

  if (args.length === 0) {
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
  } else if (
    args[0] === 'unscanned' || 
    args[0] === 'anomaly' || 
    args[0] === 'loadcell' || 
    args[0] === 'can' || 
    args[0] === 'canhbao'
  ) {
    // GIẢ LẬP BỎ SẢN PHẨM VÀO XE MÀ KHÔNG QUÉT MÃ VẠCH (LOADCELL BÁO TĂNG TRỌNG LƯỢNG)
    const customWeight = parseInt(args[1], 10) || 500;
    await handleUnscannedAnomaly(customWeight);
    return;
  } else if (
    args[0] === 'resolve' || 
    args[0] === 'normal' || 
    args[0] === 'layra' || 
    args[0] === 'ok' || 
    args[0] === 'clear-anomaly'
  ) {
    // GIẢ LẬP ĐÃ LẤY SẢN PHẨM RA KHỎI XE (MỞ KHÓA HỆ THỐNG)
    const customWeight = parseInt(args[1], 10) || 500;
    await handleResolveAnomaly(customWeight);
    return;
  } else if (args[0] === 'remove' || args[0] === 'bot' || args[0] === 'xoa' || args[0] === '-') {
    action = 'remove';
    itemKey = args[1] || 'lavie';
  } else if (args[0] === 'add' || args[0] === 'them' || args[0] === '+') {
    action = 'add';
    itemKey = args[1] || 'lavie';
  } else {
    // Nếu truyền trực tiếp tên sản phẩm hoặc barcode
    itemKey = args[0];
    action = 'add';
  }

  // Tìm sản phẩm theo shortcut key hoặc barcode
  let product = PRODUCTS[itemKey.toLowerCase()];
  if (!product) {
    for (const p of Object.values(PRODUCTS)) {
      if (p.barcode === itemKey || p.sku === itemKey) {
        product = p;
        break;
      }
    }
  }
  if (!product) {
    product = PRODUCTS.lavie;
  }

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
