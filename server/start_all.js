/**
 * Khởi chạy toàn bộ hệ sinh thái Smart Cart:
 * 1. Shop Server                 - Port 3000
 * 2. Mock Bank Server            - Port 4000
 * 3. FastAPI Backend             - Port 8000
 * 4. Smart Cart Web Admin        - Port 3001
 * 5. Ngrok HTTPS Tunnel          - Chuyển tiếp Port 3000
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');

console.log('\n======================================================');
console.log('🚀 ĐANG KHỞI ĐỘNG TOÀN BỘ HỆ SINH THÁI SMART CART...');
console.log('======================================================\n');

const SERVER_DIR = __dirname;
const SHOP_PORT = Number(process.env.PORT || 3000);
const BANK_PORT = Number(process.env.BANK_PORT || 4000);
const FASTAPI_PORT = 8000;
const ADMIN_PORT = 3001;

let fastapiProcess = null;
let webAdminProcess = null;
let ngrokProcess = null;
let shuttingDown = false;

/**
 * Địa chỉ IP LAN của máy chủ.
 */
function getLocalIp() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }

  return 'localhost';
}

const localIp = getLocalIp();

/**
 * Kiểm tra một HTTP endpoint.
 */
function checkHttp(url, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const request = http.get(url, (response) => {
      response.resume();

      resolve(
        response.statusCode !== undefined &&
        response.statusCode >= 200 &&
        response.statusCode < 500
      );
    });

    request.setTimeout(timeoutMs, () => {
      request.destroy();
      resolve(false);
    });

    request.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Đợi FastAPI khởi động.
 */
async function waitForFastApi(maxAttempts = 30) {
  const healthUrl = `http://127.0.0.1:${FASTAPI_PORT}/health`;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (await checkHttp(healthUrl)) {
      console.log(`✅ [FastAPI] Health check thành công: ${healthUrl}`);
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return false;
}

/**
 * Đọc tunnel hiện tại từ dashboard nội bộ của ngrok.
 */
function readNgrokTunnel() {
  return new Promise((resolve) => {
    const request = http.get(
      'http://127.0.0.1:4040/api/tunnels',
      (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const tunnels = Array.isArray(parsed.tunnels)
              ? parsed.tunnels
              : [];

            const tunnel =
              tunnels.find((item) => item.proto === 'https') ||
              tunnels[0] ||
              null;

            resolve(tunnel ? tunnel.public_url : null);
          } catch {
            resolve(null);
          }
        });
      }
    );

    request.setTimeout(2000, () => {
      request.destroy();
      resolve(null);
    });

    request.on('error', () => {
      resolve(null);
    });
  });
}

/**
 * Đợi ngrok tạo tunnel.
 */
async function waitForNgrok(maxAttempts = 30) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const publicUrl = await readNgrokTunnel();

    if (publicUrl) {
      return publicUrl;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return null;
}

/**
 * Dừng các tiến trình con.
 */
function stopChild(child, name) {
  if (!child || child.killed) {
    return;
  }

  try {
    child.kill();
    console.log(`🛑 Đã yêu cầu dừng ${name}.`);
  } catch (error) {
    console.warn(`⚠️ Không thể dừng ${name}: ${error.message}`);
  }
}

/**
 * Dọn dẹp khi tắt.
 */
function cleanup(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  console.log('\n🛑 Đang dừng toàn bộ hệ thống...');

  stopChild(fastapiProcess, 'FastAPI');
  stopChild(webAdminProcess, 'Web Admin');
  stopChild(ngrokProcess, 'ngrok');

  setTimeout(() => {
    process.exit(exitCode);
  }, 300);
}

process.on('SIGINT', () => cleanup(0));
process.on('SIGTERM', () => cleanup(0));

process.on('uncaughtException', (error) => {
  console.error('❌ [Lỗi ngoài ý muốn]:', error);
  cleanup(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ [Promise bị từ chối]:', error);
  cleanup(1);
});

/**
 * Khởi động hệ thống.
 */
async function main() {
  // 1. Shop Server - Port 3000
  console.log(`🛒 [Shop Server] Khởi động trên cổng ${SHOP_PORT}...`);
  require('./index');

  // 2. Mock Bank Server - Port 4000
  console.log(`🏦 [Mock Bank] Khởi động trên cổng ${BANK_PORT}...`);
  require('./mock-bank/index');

  // 3. FastAPI - dùng đúng .venv nằm trong thư mục server
  const pythonExe = path.join(
    SERVER_DIR,
    '.venv',
    'Scripts',
    'python.exe'
  );

  if (!fs.existsSync(pythonExe)) {
    throw new Error(
      [
        `Không tìm thấy Python backend: ${pythonExe}`,
        '',
        'Hãy tạo môi trường bằng:',
        `cd "${SERVER_DIR}"`,
        'F:\\severNCKH\\ai-server\\python.exe -m venv .venv',
        '.\\.venv\\Scripts\\python.exe -m pip install -r requirements.txt'
      ].join('\n')
    );
  }

  console.log(`🐍 [FastAPI] Python: ${pythonExe}`);
  console.log(`📁 [FastAPI] Thư mục: ${SERVER_DIR}`);
  console.log(`⚡ [FastAPI] Khởi động trên cổng ${FASTAPI_PORT}...`);

  fastapiProcess = spawn(
    pythonExe,
    [
      '-m',
      'uvicorn',
      'main:app',
      '--host',
      '0.0.0.0',
      '--port',
      FASTAPI_PORT.toString(),
      '--log-level',
      'debug'
    ],
    {
      cwd: SERVER_DIR,
      shell: false,
      stdio: ['ignore', 'inherit', 'inherit']
    }
  );

  fastapiProcess.on('error', (error) => {
    console.error(
      '❌ [FastAPI] Không thể khởi chạy:',
      error.message
    );
  });

  fastapiProcess.on('exit', (code, signal) => {
    if (!shuttingDown) {
      console.error(
        `❌ [FastAPI] Đã dừng ngoài ý muốn ` +
        `(code=${code}, signal=${signal}).`
      );
    }
  });

  // 4. Web Admin - thư mục ngang cấp với server
  const webAdminDir = path.join(SERVER_DIR, '..', 'web-admin');

  if (fs.existsSync(webAdminDir)) {
    console.log(
      `🖥️ [Web Admin] Khởi động trên cổng ${ADMIN_PORT}...`
    );

    webAdminProcess = spawn(
      'npm',
      ['run', 'dev'],
      {
        cwd: webAdminDir,
        shell: true,
        stdio: ['ignore', 'inherit', 'inherit'],
        env: {
          ...process.env,
          PORT: ADMIN_PORT.toString()
        }
      }
    );

    webAdminProcess.on('error', (error) => {
      console.warn(
        '⚠️ [Web Admin] Không thể khởi chạy:',
        error.message
      );
    });

    webAdminProcess.on('exit', (code, signal) => {
      if (!shuttingDown) {
        console.warn(
          `⚠️ [Web Admin] Đã dừng ` +
          `(code=${code}, signal=${signal}).`
        );
      }
    });
  } else {
    console.warn(
      `⚠️ [Web Admin] Không tìm thấy thư mục: ${webAdminDir}`
    );
  }

  // 5. Ngrok - ưu tiên ngrok.exe nằm cạnh start_all.js
  const localNgrokExe = path.join(SERVER_DIR, 'ngrok.exe');
  const ngrokBinary = fs.existsSync(localNgrokExe)
    ? localNgrokExe
    : 'ngrok';

  console.log(
    `🌐 [Ngrok] Khởi tạo tunnel HTTPS cho cổng ${SHOP_PORT}...`
  );

  ngrokProcess = spawn(
    ngrokBinary,
    [
      'http',
      SHOP_PORT.toString(),
      '--log=stdout'
    ],
    {
      cwd: SERVER_DIR,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe']
    }
  );

  ngrokProcess.stdout.on('data', (data) => {
    const text = data.toString().trim();

    if (text) {
      console.log(`[Ngrok] ${text}`);
    }
  });

  ngrokProcess.stderr.on('data', (data) => {
    const text = data.toString().trim();

    if (text) {
      console.warn(`[Ngrok] ${text}`);
    }
  });

  ngrokProcess.on('error', (error) => {
    console.warn(
      '⚠️ [Ngrok] Không thể khởi chạy. ' +
      'Kiểm tra ngrok.exe hoặc PATH:',
      error.message
    );
  });

  ngrokProcess.on('exit', (code, signal) => {
    if (!shuttingDown) {
      console.warn(
        `⚠️ [Ngrok] Đã dừng ` +
        `(code=${code}, signal=${signal}).`
      );
    }
  });

  const fastApiReady = await waitForFastApi();

  if (!fastApiReady) {
    throw new Error(
      `FastAPI không phản hồi tại ` +
      `http://127.0.0.1:${FASTAPI_PORT}/health`
    );
  }

  const publicUrl = await waitForNgrok();

  console.log('\n' + '='.repeat(72));

  if (publicUrl) {
    console.log(
      '🎉 TOÀN BỘ HỆ SINH THÁI SMART CART ĐÃ SẴN SÀNG!'
    );
  } else {
    console.log(
      '⚠️ HỆ THỐNG ĐÃ CHẠY TRONG MẠNG LAN, NHƯNG NGROK CHƯA SẴN SÀNG.'
    );
  }

  console.log('='.repeat(72));
  console.log(
    `🛒 Shop Server:       http://localhost:${SHOP_PORT}`
  );
  console.log(
    `🏦 Mock Bank:         http://localhost:${BANK_PORT}`
  );
  console.log(
    `⚡ FastAPI:           http://localhost:${FASTAPI_PORT}`
  );
  console.log(
    `📖 FastAPI Docs:      http://localhost:${FASTAPI_PORT}/docs`
  );
  console.log(
    `🖥️ Web Admin:         http://localhost:${ADMIN_PORT}`
  );
  console.log(
    `📟 Tablet LAN:        http://${localIp}:${SHOP_PORT}`
  );

  if (publicUrl) {
    console.log(`🌐 Ngrok HTTPS:       ${publicUrl}`);
    console.log(`📖 API Docs:          ${publicUrl}/docs`);
    console.log(
      `📦 Products API:      ${publicUrl}/api/v1/products`
    );
    console.log(
      `📥 MockBank APK:      ${publicUrl}/download/MockBankApp.apk`
    );
    console.log(
      '📊 Ngrok Dashboard:   http://127.0.0.1:4040'
    );
  } else {
    console.log(
      '💡 Cài ngrok hoặc đặt ngrok.exe cạnh start_all.js.'
    );
  }

  console.log('='.repeat(72) + '\n');
}

main().catch((error) => {
  console.error('\n❌ KHỞI ĐỘNG HỆ THỐNG THẤT BẠI');
  console.error(error);
  cleanup(1);
});