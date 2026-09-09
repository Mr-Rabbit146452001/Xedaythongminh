const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'stroller_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'levanhung#',
});

async function init() {
  const client = await pool.connect();
  try {
    console.log('--- Đang khởi tạo bảng cho Mock Bank ---');
    
    // 1. Tạo bảng tài khoản ngân hàng ảo
    await client.query(
      'CREATE TABLE IF NOT EXISTS bank_accounts (' +
      'account_number VARCHAR(30) PRIMARY KEY, ' +
      'owner_name VARCHAR(100) NOT NULL, ' +
      'user_ref_id VARCHAR(50) NOT NULL, ' +
      'token_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (token_balance >= 0), ' +
      'pin VARCHAR(255) DEFAULT \'123456\', ' +
      'failed_attempts INT DEFAULT 0, ' +
      'locked_until TIMESTAMP WITH TIME ZONE DEFAULT NULL, ' +
      'is_active BOOLEAN DEFAULT TRUE, ' +
      'created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()' +
      ');'
    );
    // Migration đảm bảo tương thích nếu bảng đã tồn tại trước đó
    await client.query('ALTER TABLE bank_accounts ALTER COLUMN pin TYPE VARCHAR(255);').catch(() => {});
    await client.query('ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS failed_attempts INT DEFAULT 0;').catch(() => {});
    await client.query('ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE DEFAULT NULL;').catch(() => {});

    // 2. Tạo bảng giao dịch ngân hàng
    await client.query(
      'CREATE TABLE IF NOT EXISTS bank_transactions (' +
      'id UUID PRIMARY KEY DEFAULT gen_random_uuid(), ' +
      'order_id VARCHAR(50) NOT NULL, ' +
      'from_account VARCHAR(30) REFERENCES bank_accounts(account_number), ' +
      'to_account VARCHAR(30) REFERENCES bank_accounts(account_number), ' +
      'amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0), ' +
      'status VARCHAR(20) NOT NULL DEFAULT \'PENDING\', ' +
      'idempotency_key VARCHAR(100) UNIQUE, ' +
      'webhook_status VARCHAR(20) DEFAULT \'UNSENT\', ' +
      'created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()' +
      ');'
    );

    // 3. Tạo bảng sổ cái biến động kép
    await client.query(
      'CREATE TABLE IF NOT EXISTS ledger_entries (' +
      'id BIGSERIAL PRIMARY KEY, ' +
      'transaction_id UUID REFERENCES bank_transactions(id), ' +
      'account_number VARCHAR(30) REFERENCES bank_accounts(account_number), ' +
      'entry_type VARCHAR(10) NOT NULL CHECK (entry_type IN (\'DEBIT\', \'CREDIT\')), ' +
      'amount NUMERIC(15, 2) NOT NULL, ' +
      'balance_after NUMERIC(15, 2), ' +
      'created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()' +
      ');'
    );

    // 4. Seed dữ liệu mặc định: Siêu thị & Khách demo
    await client.query(
      'INSERT INTO bank_accounts (account_number, owner_name, user_ref_id, token_balance) ' +
      'VALUES ' +
      '(\'ACC_STORE_MAIN\', \'Siêu Thị Xe Đẩy Thông Minh\', \'STORE_01\', 0.00), ' +
      '(\'ACC_CUSTOMER_01\', \'Khách Hàng Demo (Anh Nam)\', \'CUST_001\', 500000.00) ' +
      'ON CONFLICT (account_number) DO UPDATE ' +
      'SET token_balance = EXCLUDED.token_balance;'
    );

    console.log('✅ Khởi tạo thành công database Mock Bank!');
    const res = await client.query('SELECT account_number, owner_name, token_balance FROM bank_accounts');
    console.log('📊 Danh sách tài khoản hiện tại:');
    console.table(res.rows);
  } catch (err) {
    console.error('❌ Lỗi khởi tạo Mock Bank DB:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

init();
