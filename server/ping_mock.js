/**
 * Công cụ Ping Dữ Liệu Cảm Biến Giả Lập cho Toàn Bộ 14 Sản Phẩm Trong CSDL Smart Cart:
 *
 * CÁCH SỬ DỤNG:
 * - Thêm món:      node ping_mock.js add <tên_hoặc_mã_vạch>     (VD: node ping_mock.js add coca)
 * - Bớt món:       node ping_mock.js remove <tên_hoặc_mã_vạch>  (VD: node ping_mock.js remove coca)
 * - Bỏ không quét: node ping_mock.js unscanned [số_gram]        (VD: node ping_mock.js unscanned 500)
 * - Lấy ra ngoài:  node ping_mock.js resolve                    (VD: node ping_mock.js resolve)
 * - Xem giỏ hàng:  node ping_mock.js status
 * - Xóa sạch giỏ:  node ping_mock.js clear
 * - Xem danh mục:  node ping_mock.js menu                       (hoặc help / list)
 */

const http = require('http');

const PRODUCTS = {
  aquafina: {
    aliases: ['aqua', 'aquafina', 'nuocaquafina', '8934588063145'],
    name: 'Nước khoáng Aquafina 500ml',
    barcode: '8934588063145',
    sku: '8934588063145',
    price: 6000,
    weight: 500
  },
  haohao: {
    aliases: ['haohao', 'mihaohao', 'mi', 'mitom', '8934563138165'],
    name: 'Mì tôm Hảo Hảo chua cay',
    barcode: '8934563138165',
    sku: '8934563138165',
    price: 4500,
    weight: 75
  },
  lavie: {
    aliases: ['lavie', 'nuoclavie', '8935005801135'],
    name: 'Nước khoáng La Vie 500ml',
    barcode: '8935005801135',
    sku: 'lavie_500ml',
    vision_class: 'lavie_500ml',
    price: 6000,
    weight: 500
  },
  pocari: {
    aliases: ['pocari', 'pocarisweat', 'sweat', '8938556329004'],
    name: 'Pocari Sweat 500 ml',
    barcode: '8938556329004',
    sku: 'pocari_sweat_500ml',
    vision_class: 'pocari_sweat_500ml',
    price: 15000,
    weight: 500
  },
  muoi: {
    aliases: ['muoi', 'muoitinh', 'sosal', '8936120311028'],
    name: 'Muối tinh sấy i-ốt Sosal Group 500 g',
    barcode: '8936120311028',
    sku: '8936120311028',
    price: 4100,
    weight: 500
  },
  khanpuri: {
    aliases: ['khanpuri', 'puri', 'khanuot', '8936040077271'],
    name: 'Khăn ướt Puri không mùi 20 tờ',
    barcode: '8936040077271',
    sku: '8936040077271',
    price: 8800,
    weight: 40
  },
  g7: {
    aliases: ['g7', 'caphe', 'capheg7', 'cafe', '8935024120187'],
    name: 'Cà phê G7 hòa tan đen 15 gói',
    barcode: '8935024120187',
    sku: '8935024120187',
    price: 47000,
    weight: 30
  },
  khangiay: {
    aliases: ['khangiay', 'premier', 'giaypremier', '8938558334556'],
    name: 'Khăn giấy Premier 100 tờ 3 lớp',
    barcode: '8938558334556',
    sku: '8938558334556',
    price: 9500,
    weight: 34
  },
  coca: {
    aliases: ['coca', 'cocacola', 'coke', '8935049501503'],
    name: 'Nước ngọt Coca Cola lon 330ml',
    barcode: '8935049501503',
    sku: '8935049501503',
    price: 10900,
    weight: 330
  },
  phoga: {
    aliases: ['phoga', 'vifon', 'phovifon', 'pho', '8934561010022'],
    name: 'Phở gà Vifon gói 65g',
    barcode: '8934561010022',
    sku: '8934561010022',
    price: 9900,
    weight: 65
  },
  ongtho: {
    aliases: ['ongtho', 'suadac', 'suaongtho', 'ongthodo', '8934673200325'],
    name: 'Sữa đặc Ông Thọ đỏ tuýp 165g',
    barcode: '8934673200325',
    sku: '8934673200325',
    price: 20000,
    weight: 165
  },
  poca: {
    aliases: ['poca', 'snack', 'snackpoca', 'bap', '8936079120382'],
    name: 'Snack Poca bắp ngọt xóc bơ gói 32g',
    barcode: '8936079120382',
    sku: '8936079120382',
    price: 6000,
    weight: 32
  },
  vinamilk: {
    aliases: ['vinamilk', 'suavinamilk', 'suatuoi', '8934673573344'],
    name: 'Sữa tươi tiệt trùng Vinamilk 100% Có đường 180ml',
    barcode: '8934673573344',
    sku: '8934673573344',
    price: 9500,
    weight: 180
  },
  thtruemilk: {
    aliases: ['thtruemilk', 'th', 'suath', 'socola', 'thtrue', '8935217400454'],
    name: 'Sữa tươi tiệt trùng TH true MILK Socola 180ml',
    barcode: '8935217400454',
    sku: '8935217400454',
    price: 9500,
    weight: 180
  }
};

function printHelpMenu() {
  console.log(`\n========================================================================================`);
  console.log(`📋 BẢNG TỔNG HỢP LỆNH PING MOCK CHO TOÀN BỘ 14 SẢN PHẨM TRONG DATABASE`);
  console.log(`========================================================================================`);
  console.log(`STT | Tên Sản Phẩm                          | Giá      | Lệnh Thêm Nhanh         | Lệnh Bớt Nhanh`);
  console.log(`----+---------------------------------------+----------+-------------------------+-------------------------`);

  let idx = 1;
  for (const [key, p] of Object.entries(PRODUCTS)) {
    const num = (idx < 10 ? ' ' : '') + idx;
    const name = p.name.padEnd(37, ' ');
    const price = (p.price.toLocaleString('vi-VN') + 'đ').padEnd(8, ' ');
    const addCmd = `node ping_mock.js ${key}`.padEnd(23, ' ');
    const remCmd = `node ping_mock.js - ${key}`;
    console.log(`${num}  | ${name} | ${price} | ${addCmd} | ${remCmd}`);
    idx++;
  }

  console.log(`----+---------------------------------------+----------+-------------------------+-------------------------`);
  console.log(`💡 CÁC LỆNH HỆ THỐNG & CẢM BIẾN ĐẶC BIỆT:`);
  console.log(`   🚨 Bỏ hàng KHÔNG quét mã (Loadcell tăng cân): node ping_mock.js unscanned [số_gram]`);
  console.log(`   ✅ Lấy hàng chưa quét ra ngoài (Mở khóa xe):   node ping_mock.js resolve`);
  console.log(`   🛒 Xem chi tiết giỏ hàng hiện tại:            node ping_mock.js status`);
  console.log(`   🧹 Xóa sạch toàn bộ giỏ hàng:                 node ping_mock.js clear`);
  console.log(`========================================================================================\n`);
}

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

function getProductVisionClass(barcode) {
  return new Promise((resolve) => {
    http.get('http://127.0.0.1:3000/api/v1/products', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const list = json.products || (Array.isArray(json) ? json : []);
          const matched = list.find(p => p.barcode === barcode || p.sku === barcode);
          if (matched && matched.vision_class && matched.vision_class !== '[null]') {
            resolve(matched.vision_class);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function sendDecision(sessionId, action, barcode, sku, weight, silent = false, visionClass = null) {
  let aiClass = visionClass || sku || barcode;
  try {
    const dbVisionClass = await getProductVisionClass(barcode);
    if (dbVisionClass) {
      aiClass = dbVisionClass;
    }
  } catch (e) {}

  return new Promise((resolve) => {
    const payload = JSON.stringify({
      session_id: sessionId,
      action: action,
      barcode: barcode,
      ai_class: aiClass,
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

  await setWeightAnomaly(true);
  await sendDecision(sessionId, 'add', 'UNSCANNED_ITEM', 'unknown', weightDelta, true);

  console.log(`📱 PHẢN HỒI TRÊN ỨNG DỤNG XE ĐẨY (TABLET / APP):`);
  console.log(`   1. Nếu khách đang ở Màn hình Mua sắm (ScanProduct):`);
  console.log(`      👉 Hiện Popup đỏ cảnh báo: "Sản phẩm chưa được quét!"`);
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

  await setWeightAnomaly(false);
  await sendDecision(sessionId, 'remove', 'UNSCANNED_ITEM', 'unknown', weightDelta, true);

  console.log(`📱 PHẢN HỒI TRÊN ỨNG DỤNG XE ĐẨY (TABLET / APP):`);
  console.log(`   👉 Mọi Popup cảnh báo và Màn hình khóa mờ sẽ tự động giải tỏa!`);
  console.log(`   👉 Khách hàng có thể tiếp tục mua sắm hoặc thanh toán bình thường.`);
  console.log(`======================================================\n`);
}

async function main() {
  const args = process.argv.slice(2);
  let action = 'add';
  let itemKey = '';

  if (args.length === 0 || args[0] === 'help' || args[0] === 'menu' || args[0] === 'list' || args[0] === '--help' || args[0] === '-h') {
    printHelpMenu();
    return;
  }

  if (args[0] === 'status' || args[0] === 'cart') {
    const sessionId = await getActiveSession();
    await showCartStatus(sessionId);
    return;
  }

  if (args[0] === 'clear' || args[0] === 'reset') {
    const sessionId = await getActiveSession();
    await clearCart(sessionId);
    return;
  }

  if (['unscanned', 'anomaly', 'loadcell', 'can', 'canhbao'].includes(args[0])) {
    const customWeight = parseInt(args[1], 10) || 500;
    await handleUnscannedAnomaly(customWeight);
    return;
  }

  if (['resolve', 'normal', 'layra', 'ok', 'clear-anomaly'].includes(args[0])) {
    const customWeight = parseInt(args[1], 10) || 500;
    await handleResolveAnomaly(customWeight);
    return;
  }

  if (['remove', 'bot', 'xoa', '-'].includes(args[0])) {
    action = 'remove';
    itemKey = args[1] || 'lavie';
  } else if (['add', 'them', '+'].includes(args[0])) {
    action = 'add';
    itemKey = args[1] || 'lavie';
  } else {
    // Nếu truyền trực tiếp tên sản phẩm hoặc barcode
    itemKey = args[0];
    action = 'add';
  }

  // Tìm sản phẩm theo alias, key hoặc barcode
  const searchKey = itemKey.toLowerCase().trim();
  let foundProduct = null;

  for (const p of Object.values(PRODUCTS)) {
    if (
      p.barcode === searchKey ||
      p.sku === searchKey ||
      p.aliases.some(a => a.toLowerCase() === searchKey)
    ) {
      foundProduct = p;
      break;
    }
  }

  if (!foundProduct) {
    console.log(`\n❌ Không tìm thấy sản phẩm có tên hoặc mã vạch: "${itemKey}"`);
    console.log(`👉 Chạy lệnh "node ping_mock.js menu" để xem danh sách toàn bộ 14 sản phẩm.`);
    return;
  }

  const product = foundProduct;
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
  console.log(`💰 Đơn giá:        ${product.price.toLocaleString('vi-VN')} đ`);
  console.log(`⚖️  Trọng lượng:   ${action === 'add' ? '+' : '-'}${product.weight}g`);
  console.log(`⚡ Hành động:      ${action.toUpperCase()}`);
  console.log(`------------------------------------------------------`);

  await sendDecision(sessionId, action, product.barcode, product.sku, product.weight, false, product.vision_class);
}

main();
