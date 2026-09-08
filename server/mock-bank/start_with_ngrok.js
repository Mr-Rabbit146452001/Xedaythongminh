/**
 * Runner Script: Khởi động Mock Bank Server kèm Ngrok HTTPS Tunnel
 * Tự động lấy URL công khai và hiển thị để nhập vào ứng dụng điện thoại (MockBankApp)
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

// 1. Khởi động Mock Bank Server (Port 4000)
const { server } = require('./index');
const PORT = process.env.BANK_PORT || 4000;

console.log('\n⏳ [Ngrok] Đang khởi tạo đường hầm HTTPS ngrok cho cổng ' + PORT + '...');

// 2. Chạy ngrok http 4000
const ngrokProcess = spawn('ngrok', ['http', PORT.toString(), '--log=stdout'], {
  stdio: ['ignore', 'pipe', 'pipe']
});

let tunnelFound = false;

// 3. Polling local API của ngrok (http://127.0.0.1:4040/api/tunnels)
let checkCount = 0;
const checkInterval = setInterval(() => {
  checkCount++;
  if (checkCount > 20) {
    clearInterval(checkInterval);
    if (!tunnelFound) {
      console.error('\n❌ [Ngrok] Không thể lấy thông tin tunnel sau 10 giây. Hãy kiểm tra lại ngrok.');
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

            console.log('\n' + '='.repeat(70));
            console.log('  🏦  MOCK BANK SERVER ĐÃ KẾT NỐI NGROK THÀNH CÔNG!');
            console.log('='.repeat(70));
            console.log('  🌐 Local Port:       http://localhost:' + PORT);
            console.log('  🚀 Ngrok Public URL:  ' + publicUrl);
            console.log('  📊 Ngrok Dashboard:   http://127.0.0.1:4040');
            console.log('='.repeat(70));
            console.log('  📲 HƯỚNG DẪN CHO ĐIỆN THOẠI (MockBankApp):');
            console.log('     Nhập địa chỉ sau vào cài đặt app trên điện thoại:');
            console.log('     👉  ' + publicUrl + '/');
            console.log('='.repeat(70) + '\n');
          }
        }
      } catch (e) {
        // ngrok web service chưa sẵn sàng
      }
    });
  });

  req.on('error', () => {
    // Chờ ngrok khởi động
  });
}, 500);

// Xử lý dọn dẹp khi tắt server (Ctrl + C)
function cleanup() {
  console.log('\n🛑 Đang dừng Mock Bank Server và đóng tunnel ngrok...');
  try {
    if (ngrokProcess) ngrokProcess.kill();
    if (server) server.close();
  } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', () => {
  try {
    if (ngrokProcess) ngrokProcess.kill();
  } catch (e) {}
});
