/**
 * Script Ping Giả Lập: Bỏ sản phẩm vào xe đẩy mà không quét mã vạch (Loadcell báo tăng tải trọng)
 *
 * Cách dùng:
 * 1. Bỏ sản phẩm chưa quét vào xe (mặc định +500g hoặc truyền số gram):
 *    node ping_unscanned.js
 *    node ping_unscanned.js 300
 *
 * 2. Lấy sản phẩm ra khỏi xe (khôi phục trạng thái an toàn & mở khóa):
 *    node ping_unscanned.js resolve
 *    node ping_unscanned.js layra
 */

const http = require('http');

const arg = process.argv[2] ? process.argv[2].toLowerCase() : '';
const isResolve = ['resolve', 'normal', 'layra', 'ok', 'clear', 'off', '0'].includes(arg);
const weight = parseInt(process.argv[2], 10) || (parseInt(process.argv[3], 10) || 500);

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
      console.error('⚠️ Lỗi gọi /api/iot/set-weight-anomaly (cổng 3000):', e.message);
      resolve(null);
    });

    req.write(payload);
    req.end();
  });
}

function sendDecision(sessionId, action, weight) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      session_id: sessionId,
      action: action,
      barcode: 'UNSCANNED_ITEM',
      ai_class: 'unknown',
      ai_confidence: 0.0,
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
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.write(payload);
    req.end();
  });
}

async function run() {
  const sessionId = await getActiveSession();

  if (isResolve) {
    console.log(`\n======================================================`);
    console.log(`✅ PING GIẢ LẬP: ĐÃ LẤY SẢN PHẨM / VẬT LẠ RA KHỎI XE ĐẨY`);
    console.log(`======================================================`);
    console.log(`🛒 Phiên giỏ hàng:               ${sessionId}`);
    console.log(`⚖️ Cảm biến tải trọng (Loadcell): Trọng lượng giảm -${weight}g (trở lại bình thường)`);
    console.log(`🔓 Trạng thái bảo mật an toàn:   ĐÃ HỦY CẢNH BÁO [weightAnomalyDetected = false]`);
    console.log(`------------------------------------------------------`);

    await setWeightAnomaly(false);
    await sendDecision(sessionId, 'remove', weight);

    console.log(`📱 PHẢN HỒI TRÊN ỨNG DỤNG XE ĐẨY (TABLET / APP):`);
    console.log(`   👉 Mọi Popup cảnh báo và Màn hình khóa mờ sẽ tự động biến mất!`);
    console.log(`   👉 Toàn bộ chức năng mua sắm & thanh toán đã được mở khóa.`);
    console.log(`======================================================\n`);
  } else {
    console.log(`\n======================================================`);
    console.log(`🚨 PING GIẢ LẬP: BỎ SẢN PHẨM VÀO XE MÀ KHÔNG QUÉT BARCODE`);
    console.log(`======================================================`);
    console.log(`🛒 Phiên giỏ hàng:               ${sessionId}`);
    console.log(`⚖️ Cảm biến tải trọng (Loadcell): Phát hiện trọng lượng tăng +${weight}g`);
    console.log(`📷 Camera AI / Đầu đọc Barcode:  KHÔNG phát hiện mã vạch hợp lệ!`);
    console.log(`🚨 Trạng thái bảo mật an toàn:   KÍCH HOẠT CẢNH BÁO [weightAnomalyDetected = true]`);
    console.log(`------------------------------------------------------`);

    await setWeightAnomaly(true);
    await sendDecision(sessionId, 'add', weight);

    console.log(`📱 PHẢN HỒI TRÊN ỨNG DỤNG XE ĐẨY (TABLET / APP):`);
    console.log(`   1. Tại Màn hình Mua sắm (ScanProductScreen):`);
    console.log(`      👉 Hiện Popup đỏ cảnh báo: "Sản phẩm chưa được quét!"`);
    console.log(`         Yêu cầu quét mã vạch hoặc lấy vật lạ ra khỏi khay chứa.`);
    console.log(`   2. Tại Màn hình Thanh toán (sau khi chốt giỏ hàng):`);
    console.log(`      👉 Bật màn hình mờ Full-Screen nhấp nháy đỏ báo động`);
    console.log(`         Khóa 100% chức năng thanh toán cho đến khi lấy hàng ra!`);
    console.log(`------------------------------------------------------`);
    console.log(`💡 Để giả lập lấy sản phẩm ra ngoài (hủy cảnh báo & mở khóa), chạy:`);
    console.log(`   node ping_unscanned.js resolve`);
    console.log(`======================================================\n`);
  }
}

run();
