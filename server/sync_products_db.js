const pool = require('./db');

const products = [
  { barcode: '8934588063145', name: 'Nước khoáng Aquafina 500ml', price: 6000, price_vnd: 6000, imageurl: 'aquafina_500ml.jpg', category: 'Đồ uống' },
  { barcode: '8934563138165', name: 'Mì tôm Hảo Hảo chua cay', price: 4500, price_vnd: 4500, imageurl: 'hao_hao.jpg', category: 'Bánh kẹo' },
  { barcode: '8935005801135', name: 'Nước khoáng La Vie 500ml', price: 6000, price_vnd: 6000, imageurl: 'lavie_500ml.jpg', category: 'Đồ uống' },
  { barcode: '8938556329004', name: 'Pocari Sweat 500 ml', price: 15000, price_vnd: 15000, imageurl: 'pocari_sweat.jpg', category: 'Đồ uống' },
  { barcode: '8936120311028', name: 'Muối tinh sấy i-ốt Sosal Group 500 g', price: 4100, price_vnd: 4100, imageurl: 'muoi_tinh_sosal.jpg', category: 'Gia vị' },
  { barcode: '8936040077271', name: 'Khăn ướt Puri không mùi 20 tờ', price: 8800, price_vnd: 8800, imageurl: 'khan_uot_puri.jpg', category: 'Hóa mỹ phẩm' },
  { barcode: '8935024120187', name: 'Cà phê G7 hòa tan đen 15 gói', price: 47000, price_vnd: 47000, imageurl: 'ca_phe_g7.jpg', category: 'Đồ uống' },
  { barcode: '8938558334556', name: 'Khăn giấy Premier 100 tờ 3 lớp', price: 9500, price_vnd: 9500, imageurl: 'khan_giay_premier.jpg', category: 'Hóa mỹ phẩm' },
  { barcode: '8935049501503', name: 'Nước ngọt Coca Cola lon 330ml', price: 10900, price_vnd: 10900, imageurl: 'coke_sleek_lon.jpg', category: 'Đồ uống' },
  { barcode: '8934561010022', name: 'Phở gà Vifon gói 65g', price: 9900, price_vnd: 9900, imageurl: 'pho_ga_vifon.jpg', category: 'Thực phẩm khô' },
  { barcode: '8934673200325', name: 'Sữa đặc Ông Thọ đỏ tuýp 165g', price: 20000, price_vnd: 20000, imageurl: 'ong_tho_do.jpg', category: 'Sữa & Bơ' },
  { barcode: '8936079120382', name: 'Snack Poca bắp ngọt xóc bơ gói 32g', price: 6000, price_vnd: 6000, imageurl: 'snack_poca_bap.jpg', category: 'Bánh kẹo' },
  { barcode: '8934673573344', name: 'Sữa tươi tiệt trùng Vinamilk 100% Có đường 180ml', price: 9500, price_vnd: 9500, imageurl: '8934673573344.jpg', category: 'Đồ uống' },
  { barcode: '8935217400454', name: 'Sữa tươi tiệt trùng TH true MILK Socola 180ml', price: 9500, price_vnd: 9500, imageurl: '8935217400454.jpg', category: 'Đồ uống' }
];

async function syncProductsDatabase() {
  try {
    // 1. Đảm bảo cột imageurl tồn tại
    await pool.query('ALTER TABLE Products ADD COLUMN IF NOT EXISTS imageurl VARCHAR(500)');
    await pool.query('ALTER TABLE Products ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT \'Đồ uống\'');
    await pool.query('ALTER TABLE Products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 100');

    const now = Date.now().toString();
    for (const p of products) {
      await pool.query(`
        INSERT INTO Products (barcode, name, price, price_vnd, imageurl, category, stock, active, created_at_ms, updated_at_ms)
        VALUES ($1, $2, $3, $4, $5, $6, 100, 1, $7, $8)
        ON CONFLICT (barcode) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          price_vnd = EXCLUDED.price_vnd,
          imageurl = EXCLUDED.imageurl,
          category = EXCLUDED.category,
          updated_at_ms = EXCLUDED.updated_at_ms
      `, [p.barcode, p.name, p.price, p.price, p.imageurl, p.category, now, now]);
    }
    console.log('✅ [Product Sync] Đã đồng bộ thành công toàn bộ 22 sản phẩm & hình ảnh vào PostgreSQL.');
  } catch (err) {
    console.warn('⚠️ [Product Sync] Lỗi đồng bộ sản phẩm:', err.message);
  }
}

if (require.main === module) {
  syncProductsDatabase().then(() => pool.end());
}

module.exports = { syncProductsDatabase, products };
