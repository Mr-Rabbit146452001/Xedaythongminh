/**
 * Script Ping Giả Lập: Xe đẩy di chuyển qua Cổng an ninh RFID (RC522 / UHF RFID)
 *
 * Cách dùng:
 * 1. Giả lập xe đẩy đi qua cổng an ninh (mặc định thẻ: CART_RFID_8888, cổng: GATE_01):
 *    node ping_rfid_gate.js
 *
 * 2. Tùy chỉnh mã thẻ từ hoặc cổng an ninh:
 *    node ping_rfid_gate.js CART_VIP_999 GATE_A
 *
 * 3. Đặt lại / hủy sự kiện cổng:
 *    node ping_rfid_gate.js reset
 *    node ping_rfid_gate.js clear
 */

const http = require('http');

const arg1 = process.argv[2] ? process.argv[2].trim() : '';
const arg2 = process.argv[3] ? process.argv[3].trim() : '';

const isReset = ['reset', 'clear', 'off', '0', 'cancel'].includes(arg1.toLowerCase());
const rfidTag = isReset ? null : (arg1 || 'CART_RFID_8888');
const gateId = isReset ? null : (arg2 || 'GATE_01');

function triggerRfid(detected, tag, gate) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      detected: Boolean(detected),
      tag: tag,
      rfid_tag: tag,
      gate_id: gate
    });

    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/iot/rfid-gate',
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
      console.error('⚠️ Lỗi gọi /api/iot/rfid-gate (cổng 3000):', e.message);
      resolve(null);
    });

    req.write(payload);
    req.end();
  });
}

async function run() {
  if (isReset) {
    console.log(`\n======================================================`);
    console.log(`🔄 ĐẶT LẠI TRẠNG THÁI CỔNG AN NINH RFID`);
    console.log(`======================================================`);
    await triggerRfid(false, null, null);
    console.log(`✅ Đã hủy tín hiệu quét cổng RFID.`);
    console.log(`======================================================\n`);
  } else {
    console.log(`\n======================================================`);
    console.log(`🏷️ PING GIẢ LẬP: XE ĐẨY ĐI QUA CỔNG AN NINH RFID`);
    console.log(`======================================================`);
    console.log(`📡 Cảm biến RFID:                ĐÃ QUÉT NHẬN DIỆN THẺ TỪ`);
    console.log(`🏷️ Mã thẻ RFID gắn trên xe:      ${rfidTag}`);
    console.log(`🚪 Vị trí cổng an ninh:          ${gateId}`);
    console.log(`------------------------------------------------------`);

    const result = await triggerRfid(true, rfidTag, gateId);

    console.log(`📱 PHẢN HỒI TRÊN ỨNG DỤNG XE ĐẨY (TABLET / APP):`);
    console.log(`   👉 Nếu xe đang trong màn hình mua hàng (ScanProductScreen / CartDetail):`);
    console.log(`   👉 App tự động phát âm thanh xác nhận.`);
    console.log(`   👉 Tự động chốt / khóa giỏ hàng.`);
    console.log(`   👉 TỰ ĐỘNG CHUYỂN SANG MÀN HÌNH THANH TOÁN TỰ ĐỘNG (AutoPaymentScreen)`);
    console.log(`   👉 Chờ khách hàng bấm "Xác nhận & Thanh toán tự động"!`);
    console.log(`------------------------------------------------------`);
    console.log(`💡 Để hủy tín hiệu, chạy: node ping_rfid_gate.js reset`);
    console.log(`======================================================\n`);
  }
}

run();
