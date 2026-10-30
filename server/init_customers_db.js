const pool = require('./db');

/**
 * Module khởi tạo & đồng bộ cấu trúc cơ sở dữ liệu Khách Hàng trong PostgreSQL
 * (Đã loại bỏ toàn bộ tài khoản khách hàng demo mẫu theo yêu cầu dự án)
 */
async function initCustomersDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔄 Đang kiểm tra và khởi tạo cấu trúc CSDL Khách Hàng (Customers)...');

    // 1. Tạo bảng Customers nếu chưa có
    await client.query(`
      CREATE TABLE IF NOT EXISTS Customers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        membershiplevel VARCHAR(50) DEFAULT 'Hội viên Mới',
        points INTEGER DEFAULT 0,
        phonenumber VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255) DEFAULT '123456',
        email VARCHAR(255),
        total_spent NUMERIC DEFAULT 0,
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Đảm bảo tất cả các cột cần thiết đều tồn tại
    const columns = [
      { name: 'password', type: 'VARCHAR(255) DEFAULT \'123456\'' },
      { name: 'email', type: 'VARCHAR(255)' },
      { name: 'total_spent', type: 'NUMERIC DEFAULT 0' },
      { name: 'avatar', type: 'TEXT' },
      { name: 'linked_bank_account', type: 'VARCHAR(50)' },
      { name: 'cccd', type: 'VARCHAR(20)' },
      { name: 'payment_pin', type: 'VARCHAR(255) DEFAULT \'652001\'' },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ];

    for (const col of columns) {
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'customers' AND column_name = '${col.name}'
          ) THEN
            ALTER TABLE Customers ADD COLUMN ${col.name} ${col.type};
          END IF;
        END $$;
      `);
    }

    // 3. Đảm bảo bảng bank_accounts tồn tại
    await client.query(`
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id SERIAL PRIMARY KEY,
        account_number VARCHAR(50) UNIQUE NOT NULL,
        owner_name VARCHAR(100) NOT NULL,
        user_ref_id VARCHAR(50),
        token_balance NUMERIC(12,2) DEFAULT 0,
        pin VARCHAR(255) DEFAULT '652001',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Dọn dẹp các tài khoản demo mẫu cũ nếu còn sót lại trong CSDL
    const demoIds = ['CUSTOMER_888', 'CUSTOMER_999', 'CUSTOMER_003', 'CUSTOMER_004', 'CUSTOMER_005', 'CUSTOMER_006'];
    const demoBankAccounts = ['ACC_CUSTOMER_01', 'ACC_CUSTOMER_999', 'ACC_CUSTOMER_003', 'ACC_CUSTOMER_004', 'ACC_CUSTOMER_005', 'ACC_CUSTOMER_006'];

    await client.query('DELETE FROM Customers WHERE id = ANY($1::text[])', [demoIds]).catch(() => {});
    await client.query('DELETE FROM bank_accounts WHERE account_number = ANY($1::text[])', [demoBankAccounts]).catch(() => {});

    console.log('✅ Đã khởi tạo cấu trúc bảng Customers & dọn sạch tài khoản demo mẫu!');
  } catch (err) {
    console.error('❌ Lỗi initCustomersDatabase:', err.message);
  } finally {
    client.release();
  }
}

if (require.main === module) {
  initCustomersDatabase().then(() => process.exit(0));
}

module.exports = { initCustomersDatabase };
