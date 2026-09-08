const http = require('http');

async function runTest() {
  console.log('🧪 BẮT ĐẦU KIỂM THỬ GIAI ĐOẠN 1 & 2 (MOCK BANK & SHOP SERVER)...');

  // Khởi động Shop Server
  const shopApp = require('./index.js');
  // Khởi động Mock Bank
  const { app: bankApp } = require('./mock-bank/index.js');

  await new Promise(r => setTimeout(r, 1000));

  try {
    // 1. Tablet xe đẩy tạo phiên QR
    console.log('\n1️⃣ [Tablet Xe Đẩy] Gọi API tạo phiên thanh toán QR...');
    const createRes = await fetch('http://127.0.0.1:3000/api/payment/create-qr-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'TEST_SESS_001', customerId: 'CUST_001' })
    });
    const createData = await createRes.json();
    console.log('👉 Kết quả tạo phiên QR:', createData);
    const { orderId, amountTokens, qrContent } = createData.data;

    // 2. Kiểm tra số dư của khách trước khi trả
    console.log('\n2️⃣ [Điện thoại khách] Kiểm tra số dư trước khi thanh toán...');
    const balRes = await fetch('http://127.0.0.1:4000/api/bank/accounts/ACC_CUSTOMER_01');
    const balData = await balRes.json();
    console.log('balData response status:', balRes.status, 'body:', JSON.stringify(balData));

    // 3. Khách quét QR và bấm thanh toán trên Mock Bank App
    console.log('\n3️⃣ [Điện thoại khách] Quét mã QR và bấm [XÁC NHẬN CHUYỂN TOKEN]...');
    const qrObj = JSON.parse(qrContent);
    const payRes = await fetch('http://127.0.0.1:4000/api/bank/pay-qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromAccount: 'ACC_CUSTOMER_01',
        toAccount: qrObj.toAccount,
        amount: qrObj.amount,
        orderId: qrObj.orderId,
        pin: '123456'
      })
    });
    const payData = await payRes.json();
    console.log('👉 Kết quả thanh toán trên Ngân hàng:', payData);

    await new Promise(r => setTimeout(r, 1000));

    // 4. Tablet trên xe đẩy Polling kiểm tra trạng thái
    console.log('\n4️⃣ [Tablet Xe Đẩy] Polling kiểm tra trạng thái đơn hàng...');
    const pollRes = await fetch('http://127.0.0.1:3000/api/payment/qr-status/' + orderId);
    const pollData = await pollRes.json();
    console.log('👉 Trạng thái đơn hàng trên Xe Đẩy:', pollData);

    if (pollData.data && pollData.data.isPaid) {
      console.log('\n🎉 THÀNH CÔNG RỰC RỠ! ĐƠN HÀNG ĐÃ THANH TOÁN VÀ XE ĐẨY ĐÃ NHẬN TÍN HIỆU TỨC THÌ!');
    } else {
      console.log('\n❌ Thất bại: Đơn hàng chưa chuyển sang PAID!');
    }

    // 5. Kiểm tra số dư sau giao dịch
    console.log('\n5️⃣ Kiểm tra số dư sau giao dịch:');
    const balCustAfter = await (await fetch('http://127.0.0.1:4000/api/bank/accounts/ACC_CUSTOMER_01')).json();
    const balStoreAfter = await (await fetch('http://127.0.0.1:4000/api/bank/accounts/ACC_STORE_MAIN')).json();
    console.log('👉 Số dư khách:', balCustAfter.data.tokenBalance, 'Token');
    console.log('👉 Số dư Siêu thị nhận về:', balStoreAfter.data.tokenBalance, 'Token');

  } catch (err) {
    console.error('Lỗi kiểm thử:', err);
  } finally {
    process.exit(0);
  }
}

runTest();
