/**
 * Runner Script: Khởi chạy toàn bộ hệ sinh thái Smart Cart:
 * 1. Shop Server (Port 3000)
 * 2. Mock Bank Server (Port 4000)
 * 3. Smart Cart Web Admin (Port 3001)
 * 4. Ngrok Public HTTPS Tunnel
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

console.log('\n======================================================');
console.log('🚀 ĐANG KHỞI ĐỘNG TOÀN BỘ HỆ SINH THÁI SMART CART & WEB ADMIN...');
console.log('======================================================\n');

// 1. Khởi động Shop Server (Port 3000)
require('./index');

// 2. Khởi động Mock Bank Server (Port 4000)
require('./mock-bank/index');

const SHOP_PORT = process.env.PORT || 3000;
const BANK_PORT = process.env.BANK_PORT || 4000;
const FASTAPI_PORT = 8000;
const ADMIN_PORT = 3001;

// 3. Khởi động FastAPI Backend Gateway (Port 8000 theo tài liệu bàn giao)
console.log('⚡ [FastAPI] Đang khởi động FastAPI Server trên cổng ' + FASTAPI_PORT + ' (PostgreSQL + ThingsBoard)...');
let fastapiProcess = null;
try {
  fastapiProcess = spawn('python', ['-m', 'uvicorn', 'fastapi_server:app', '--host', '0.0.0.0', '--port', FASTAPI_PORT.toString()], {
    cwd: __dirname,
    shell: true,
    stdio: ['ignore', 'inherit', 'inherit']
  });
  fastapiProcess.on('error', (err) => {
    console.warn('⚠️ [FastAPI] Không thể khởi chạy tiến trình Python:', err.message);
  });
} catch (e) {
  console.warn('⚠️ [FastAPI] Lỗi khởi động:', e.message);
}

// 4. Khởi động Smart Cart Web Admin (Port 3001)
console.log('🖥️ [Web Admin] Đang khởi động giao diện quản trị Next.js trên cổng ' + ADMIN_PORT + '...');
const webAdminDir = path.join(__dirname, '..', 'web-admin');
let webAdminProcess = null;
try {
  webAdminProcess = spawn('npm', ['run', 'dev'], {
    cwd: webAdminDir,
    shell: true,
    stdio: 'ignore'
  });
  webAdminProcess.on('error', (err) => {
    console.warn('⚠️ [Web Admin] Không thể khởi chạy npm run dev:', err.message);
  });
} catch (e) {
  console.warn('⚠️ [Web Admin] Lỗi khởi động:', e.message);
}

// Tìm địa chỉ IP LAN cục bộ
const os = require('os');
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}
const localIp = getLocalIp();

console.log('⏳ [Ngrok] Đang khởi tạo đường hầm HTTPS ngrok cho cổng ' + SHOP_PORT + '...');

// 5. Khởi động Ngrok cho cổng 3000 (Shop Server sẽ tự forward /api/bank sang 4000)
let ngrokProcess = null;
let ngrokAvailable = true;
try {
  ngrokProcess = spawn('ngrok', ['http', SHOP_PORT.toString(), '--log=stdout'], {
    stdio: ['ignore', 'pipe', 'pipe']
  });
  ngrokProcess.on('error', (err) => {
    ngrokAvailable = false;
    console.warn('⚠️ [Ngrok] Chưa tìm thấy ngrok trên máy (hoặc chưa thêm vào PATH). Hệ thống sẽ chạy ở chế độ mạng LAN nội bộ.');
  });
} catch (e) {
  ngrokAvailable = false;
}

let tunnelFound = false;
let checkCount = 0;
const checkInterval = setInterval(() => {
  checkCount++;
  if (checkCount > 15) {
    clearInterval(checkInterval);
    if (!tunnelFound) {
      console.log('\n' + '='.repeat(72));
      console.log('  🎉  HỆ THỐNG SMART CART ĐÃ SẴN SÀNG HOẠT ĐỘNG (MẠNG LAN)!');
      console.log('='.repeat(72));
      console.log('  🛒 Shop Server (Tablet):     http://localhost:' + SHOP_PORT + '  hoặc  http://' + localIp + ':' + SHOP_PORT);
      console.log('  🏦 Mock Bank Server:         http://localhost:' + BANK_PORT);
      console.log('  ⚡ FastAPI Server (IoT):      http://localhost:' + FASTAPI_PORT);
      console.log('  🖥️  Smart Cart Web Admin:     http://localhost:' + ADMIN_PORT);
      console.log('  📟 DÀNH CHO APP TABLET:      http://' + localIp + ':' + SHOP_PORT);
      console.log('  💡 Để bật đường hầm online Ngrok, cài đặt bằng lệnh: winget install ngrok/ngrok');
      console.log('='.repeat(72) + '\n');
    }
    return;
  }

  const req = http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.tunnels && json.tunnels.length > 0) {
          const httpsTunnel = json.tunnels.find(t => t.proto === 'https') || json.tunnels[0];
          if (httpsTunnel && !tunnelFound) {
            tunnelFound = true;
            clearInterval(checkInterval);

            const publicUrl = httpsTunnel.public_url;

            console.log('\n' + '='.repeat(72));
            console.log('  🎉  TOÀN BỘ HỆ SINH THÁI SMART CART ĐÃ SẴN SÀNG HOẠT ĐỘNG!');
            console.log('='.repeat(72));
            console.log('  🛒 Shop Server (Tablet):     http://localhost:' + SHOP_PORT);
            console.log('  🏦 Mock Bank Server:         http://localhost:' + BANK_PORT);
            console.log('  ⚡ FastAPI Server (IoT):      http://localhost:' + FASTAPI_PORT);
            console.log('  🖥️  Smart Cart Web Admin:     http://localhost:' + ADMIN_PORT);
            console.log('  🌐 Ngrok Public HTTPS:       ' + publicUrl);
            console.log('  📥 Tải MockBankApp APK:      ' + publicUrl + '/download/MockBankApp.apk');
            console.log('  📊 Ngrok Web Dashboard:      http://127.0.0.1:4040');
            console.log('='.repeat(72));
            console.log('  ⚡ DÀNH CHO IOT / FASTAPI GATEWAY (CỔNG 8000 QUA NGROK):');
            console.log('     👉  ' + publicUrl + '/docs             (Tài liệu Swagger UI API)');
            console.log('     👉  ' + publicUrl + '/api/v1/products  (API Danh mục sản phẩm)');
            console.log('='.repeat(72));
            console.log('  📱 DÀNH CHO APP ĐIỆN THOẠI (MockBankApp):');
            console.log('     Tải APK trực tiếp về máy: ' + publicUrl + '/download/MockBankApp.apk');
            console.log('     API Base URL:            ' + publicUrl + '/');
            console.log('='.repeat(72));
            console.log('  📟 DÀNH CHO APP TABLET XE ĐẨY (StrollerApp):');
            console.log('     👉  ' + publicUrl + '/');
            console.log('='.repeat(72));
            console.log('  💻 DÀNH CHO QUẢN TRỊ VIÊN SIÊU THỊ (Web Admin):');
            console.log('     🏠 Xem trên máy tính cục bộ:       http://localhost:' + ADMIN_PORT);
            console.log('     🌍 GỬI CHO BẠN BÈ TRUY CẬP TỪ XA:');
            console.log('     👉  ' + publicUrl + '/smart-cart     (Bản đồ & Xe Đẩy IoT)');
            console.log('     👉  ' + publicUrl + '/               (Dashboard Tổng Quan)');
            console.log('     👉  ' + publicUrl + '/products       (Kho & Sản Phẩm)');
            console.log('='.repeat(72) + '\n');
          }
        }
      } catch (e) {}
    });
  });

  req.on('error', () => {});
}, 500);

// Dọn dẹp tiến trình khi tắt
function cleanup() {
  console.log('\n🛑 Đang dừng toàn bộ hệ thống và đóng các tiến trình...');
  try {
    if (fastapiProcess) fastapiProcess.kill();
  } catch (e) {}
  try {
    if (ngrokProcess) ngrokProcess.kill();
  } catch (e) {}
  try {
    if (webAdminProcess) webAdminProcess.kill();
  } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('uncaughtException', (err) => {
  console.error('❌ [Lỗi ngoài ý muốn]:', err.message);
});
