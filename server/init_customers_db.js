const pool = require('./db');

/**
 * Module khởi tạo & đồng bộ cơ sở dữ liệu Khách Hàng trong PostgreSQL
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
        pin VARCHAR(10) DEFAULT '123456',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Danh sách dữ liệu mẫu đầy đủ các phân khúc khách hàng
    const sampleCustomers = [
      {
        id: 'CUSTOMER_888',
        name: 'Nguyễn Văn A',
        membershiplevel: 'Hội viên Vàng',
        points: 3820,
        phonenumber: '0987654321',
        password: '123456',
        email: 'nguyenvana@gmail.com',
        total_spent: 38200000,
        tokenBalance: 150000,
        accountNumber: 'ACC_CUSTOMER_01'
      },
      {
        id: 'CUSTOMER_999',
        name: 'Trần Thị B',
        membershiplevel: 'Hội viên Kim Cương',
        points: 8900,
        phonenumber: '0909123456',
        password: '123456',
        email: 'tranthib@gmail.com',
        total_spent: 89000000,
        tokenBalance: 350000,
        accountNumber: 'ACC_CUSTOMER_999'
      },
      {
        id: 'CUSTOMER_003',
        name: 'Lê Hoàng Long',
        membershiplevel: 'Hội viên VIP',
        points: 5400,
        phonenumber: '0918889999',
        password: '123456',
        email: 'hoanglong.le@gmail.com',
        total_spent: 54000000,
        tokenBalance: 500000,
        accountNumber: 'ACC_CUSTOMER_003'
      },
      {
        id: 'CUSTOMER_004',
        name: 'Phạm Thu Hà',
        membershiplevel: 'Hội viên Bạc',
        points: 650,
        phonenumber: '0977112233',
        password: '123456',
        email: 'thuha.pham@gmail.com',
        total_spent: 6500000,
        tokenBalance: 80000,
        accountNumber: 'ACC_CUSTOMER_004'
      },
      {
        id: 'CUSTOMER_005',
        name: 'Đỗ Minh Khôi',
        membershiplevel: 'Hội viên Thân Thiết',
        points: 280,
        phonenumber: '0933556677',
        password: '123456',
        email: 'minhkhoi.do@gmail.com',
        total_spent: 2800000,
        tokenBalance: 60000,
        accountNumber: 'ACC_CUSTOMER_005'
      },
      {
        id: 'CUSTOMER_006',
        name: 'Hoàng Mai Anh',
        membershiplevel: 'Hội viên Mới',
        points: 100,
        phonenumber: '0966443322',
        password: '123456',
        email: 'maianh.hoang@gmail.com',
        total_spent: 1000000,
        tokenBalance: 50000,
        accountNumber: 'ACC_CUSTOMER_006'
      }
    ];

    for (const c of sampleCustomers) {
      // Upsert vào bảng Customers
      await client.query(`
        INSERT INTO Customers (id, name, membershiplevel, points, phonenumber, password, email, total_spent)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          membershiplevel = EXCLUDED.membershiplevel,
          points = EXCLUDED.points,
          phonenumber = EXCLUDED.phonenumber,
          password = EXCLUDED.password,
          email = EXCLUDED.email,
          total_spent = EXCLUDED.total_spent
      `, [c.id, c.name, c.membershiplevel, c.points, c.phonenumber, c.password, c.email, c.total_spent]);

      // Khởi tạo tài khoản ví ngân hàng số dư Token
      await client.query(`
        INSERT INTO bank_accounts (account_number, owner_name, user_ref_id, token_balance, pin, is_active)
        VALUES ($1, $2, $3, $4, '123456', TRUE)
        ON CONFLICT (account_number) DO UPDATE SET
          owner_name = EXCLUDED.owner_name,
          user_ref_id = EXCLUDED.user_ref_id,
          token_balance = EXCLUDED.token_balance
      `, [c.accountNumber, c.name, c.id, c.tokenBalance]);
    }

    console.log(`✅ Đã khởi tạo và đồng bộ thành công ${sampleCustomers.length} khách hàng mẫu vào CSDL PostgreSQL!`);
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
