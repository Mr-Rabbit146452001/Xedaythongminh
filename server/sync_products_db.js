const pool = require('./db');

const products = [
  { barcode: '8934588063145', sku: '8934588063145', name: 'Nước khoáng Aquafina 500ml', price: 6000, price_vnd: 6000, expected_weight_g: 500, weight_tolerance_g: 50, imageurl: 'aquafina_500ml.jpg', category: 'Đồ uống' },
  { barcode: '8934563138165', sku: '8934563138165', name: 'Mì tôm Hảo Hảo chua cay', price: 4500, price_vnd: 4500, expected_weight_g: 75, weight_tolerance_g: 20, imageurl: 'hao_hao.jpg', category: 'Bánh kẹo' },
  { barcode: '8935005801135', sku: 'lavie_500ml', vision_class: 'lavie_500ml', name: 'Nước khoáng La Vie 500ml', price: 6000, price_vnd: 6000, expected_weight_g: 500, weight_tolerance_g: 50, imageurl: 'lavie_500ml.jpg', category: 'Đồ uống' },
  { barcode: '8938556329004', sku: 'pocari_sweat_500ml', vision_class: 'pocari_sweat_500ml', name: 'Pocari Sweat 500 ml', price: 15000, price_vnd: 15000, expected_weight_g: 500, weight_tolerance_g: 50, imageurl: 'pocari_sweat.jpg', category: 'Đồ uống' },
  { barcode: '8936120311028', sku: '8936120311028', name: 'Muối tinh sấy i-ốt Sosal Group 500 g', price: 4100, price_vnd: 4100, expected_weight_g: 500, weight_tolerance_g: 50, imageurl: 'muoi_tinh_sosal.jpg', category: 'Gia vị' },
  { barcode: '8936040077271', sku: '8936040077271', name: 'Khăn ướt Puri không mùi 20 tờ', price: 8800, price_vnd: 8800, expected_weight_g: 40, weight_tolerance_g: 20, imageurl: 'khan_uot_puri.jpg', category: 'Hóa mỹ phẩm' },
  { barcode: '8935024120187', sku: '8935024120187', name: 'Cà phê G7 hòa tan đen 15 gói', price: 47000, price_vnd: 47000, expected_weight_g: 30, weight_tolerance_g: 15, imageurl: 'ca_phe_g7.jpg', category: 'Đồ uống' },
  { barcode: '8938558334556', sku: '8938558334556', name: 'Khăn giấy Premier 100 tờ 3 lớp', price: 9500, price_vnd: 9500, expected_weight_g: 34, weight_tolerance_g: 15, imageurl: 'khan_giay_premier.jpg', category: 'Hóa mỹ phẩm' },
  { barcode: '8935049501503', sku: '8935049501503', name: 'Nước ngọt Coca Cola lon 330ml', price: 10900, price_vnd: 10900, expected_weight_g: 330, weight_tolerance_g: 50, imageurl: 'coke_sleek_lon.jpg', category: 'Đồ uống' },
  { barcode: '8934561010022', sku: '8934561010022', name: 'Phở gà Vifon gói 65g', price: 9900, price_vnd: 9900, expected_weight_g: 65, weight_tolerance_g: 20, imageurl: 'pho_ga_vifon.jpg', category: 'Thực phẩm khô' },
  { barcode: '8934673200325', sku: '8934673200325', name: 'Sữa đặc Ông Thọ đỏ tuýp 165g', price: 20000, price_vnd: 20000, expected_weight_g: 165, weight_tolerance_g: 30, imageurl: 'ong_tho_do.jpg', category: 'Sữa & Bơ' },
  { barcode: '8936079120382', sku: '8936079120382', name: 'Snack Poca bắp ngọt xóc bơ gói 32g', price: 6000, price_vnd: 6000, expected_weight_g: 32, weight_tolerance_g: 15, imageurl: 'snack_poca_bap.jpg', category: 'Bánh kẹo' },
  { barcode: '8934673573344', sku: '8934673573344', name: 'Sữa tươi tiệt trùng Vinamilk 100% Có đường 180ml', price: 9500, price_vnd: 9500, expected_weight_g: 180, weight_tolerance_g: 30, imageurl: '8934673573344.jpg', category: 'Đồ uống' },
  { barcode: '8935217400454', sku: '8935217400454', name: 'Sữa tươi tiệt trùng TH true MILK Socola 180ml', price: 9500, price_vnd: 9500, expected_weight_g: 180, weight_tolerance_g: 30, imageurl: '8935217400454.jpg', category: 'Đồ uống' }
];

async function syncProductsDatabase() {
  try {
    // 1. Đảm bảo các cột cần thiết tồn tại
    await pool.query('ALTER TABLE Products ADD COLUMN IF NOT EXISTS imageurl VARCHAR(500)');
    await pool.query('ALTER TABLE Products ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT \'Đồ uống\'');
    await pool.query('ALTER TABLE Products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 100');
    await pool.query('ALTER TABLE Products ADD COLUMN IF NOT EXISTS sku VARCHAR(100)');
    await pool.query('ALTER TABLE Products ADD COLUMN IF NOT EXISTS vision_class VARCHAR(100)');
    await pool.query('ALTER TABLE Products ADD COLUMN IF NOT EXISTS expected_weight_g DOUBLE PRECISION');
    await pool.query('ALTER TABLE Products ADD COLUMN IF NOT EXISTS weight_tolerance_g DOUBLE PRECISION DEFAULT 50.0');

    const now = Date.now().toString();
    for (const p of products) {
      await pool.query(`
        INSERT INTO Products (barcode, sku, vision_class, name, price, price_vnd, expected_weight_g, weight_tolerance_g, imageurl, category, stock, active, created_at_ms, updated_at_ms)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 100, 1, $11, $12)
        ON CONFLICT (barcode) DO UPDATE SET
          sku = COALESCE(EXCLUDED.sku, Products.sku),
          vision_class = COALESCE(EXCLUDED.vision_class, Products.vision_class),
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          price_vnd = EXCLUDED.price_vnd,
          expected_weight_g = EXCLUDED.expected_weight_g,
          weight_tolerance_g = EXCLUDED.weight_tolerance_g,
          imageurl = EXCLUDED.imageurl,
          category = EXCLUDED.category,
          updated_at_ms = EXCLUDED.updated_at_ms
      `, [
        p.barcode,
        p.sku || p.barcode,
        p.vision_class || null,
        p.name,
        p.price,
        p.price_vnd,
        p.expected_weight_g,
        p.weight_tolerance_g || 50.0,
        p.imageurl,
        p.category,
        now,
        now
      ]);
    }
    console.log('✅ [Product Sync] Đã đồng bộ thành công toàn bộ 14 sản phẩm, trọng lượng & hình ảnh vào PostgreSQL.');
  } catch (err) {
    console.warn('⚠️ [Product Sync] Lỗi đồng bộ sản phẩm:', err.message);
  }
}

if (require.main === module) {
  syncProductsDatabase().then(() => pool.end());
}

module.exports = { syncProductsDatabase, products };
