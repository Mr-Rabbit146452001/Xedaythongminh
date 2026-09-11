const pool = require('./db');

const products = [
  { barcode: '8934563123456', name: 'Sữa tươi tiệt trùng ít đường 1L', price: 34000, imageurl: 'sua_vinamilk.jpg', category: 'Đồ uống' },
  { barcode: '8934563123459', name: 'Nước khoáng Aquafina 500ml', price: 6000, imageurl: 'aquafina_500ml.jpg', category: 'Đồ uống' },
  { barcode: '8934563123460', name: 'Mì tôm Hảo Hảo chua cay', price: 4500, imageurl: 'hao_hao.jpg', category: 'Bánh kẹo' },
  { barcode: '8936079015024', name: 'Nước khoáng La Vie 500ml', price: 6000, imageurl: 'lavie_500ml.jpg', category: 'Đồ uống' },
  { barcode: '8935001239841', name: 'Bánh quy kẹp kem Oreo socola 137g', price: 18000, imageurl: 'oreo_socola.jpg', category: 'Bánh kẹo' },
  { barcode: '8935005801135', name: 'La Vie 500 ml', price: 10000, imageurl: 'lavie_500ml.jpg', category: 'Đồ uống' },
  { barcode: '6975493200982', name: 'Bánh Sữa Chua 20g', price: 3000, imageurl: 'banh_sua_chua.jpg', category: 'Bánh kẹo' },
  { barcode: '8938556329004', name: 'Pocari Sweat 500 ml', price: 15000, imageurl: 'pocari_sweat.jpg', category: 'Đồ uống' },
  { barcode: '8936154640613', name: 'Siro EUCA Super Extra 125 ml', price: 60000, imageurl: 'siro_euca.jpg', category: 'Đồ uống' },
  { barcode: '8936120311028', name: 'Muối tinh sấy i-ốt Sosal Group 500 g', price: 4100, imageurl: 'muoi_tinh_sosal.jpg', category: 'Gia vị' },
  { barcode: '8936040077271', name: 'Khăn ướt Puri không mùi 20 tờ', price: 8800, imageurl: 'khan_uot_puri.jpg', category: 'Hóa mỹ phẩm' },
  { barcode: '8935024120187', name: 'Cà phê G7 hòa tan đen 15 gói', price: 47000, imageurl: 'ca_phe_g7.jpg', category: 'Đồ uống' },
  { barcode: '8938558334556', name: 'Khăn giấy Premier 100 tờ 3 lớp', price: 9500, imageurl: 'khan_giay_premier.jpg', category: 'Hóa mỹ phẩm' },
  { barcode: '8934673103215', name: 'STTT Socola 180ml', price: 10125, imageurl: 'sttt_socola.jpg', category: 'Đồ uống' },
  { barcode: '8934673003010', name: 'STTT Vinamilk Đàn Bò CD 180ml', price: 9125, imageurl: 'vinamilk_dan_bo.jpg', category: 'Đồ uống' },
  { barcode: '8935049500018', name: 'Nước ngọt Coke Sleek lon 330ml', price: 10900, imageurl: 'coke_sleek_lon.jpg', category: 'Đồ uống' },
  { barcode: '8934561010022', name: 'Phở gà Vifon gói 65g', price: 9900, imageurl: 'pho_ga_vifon.jpg', category: 'Thực phẩm khô' },
  { barcode: '8934673500014', name: 'Sữa đặc Ông Thọ đỏ tuýp 165g', price: 20000, imageurl: 'ong_tho_do.jpg', category: 'Sữa & Bơ' },
  { barcode: '8934680020015', name: 'Snack Poca bắp ngọt xóc bơ gói 32g', price: 6000, imageurl: 'snack_poca_bap.jpg', category: 'Bánh kẹo' }
];

async function syncDb() {
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
  const res = await pool.query('SELECT id, barcode, name, price, imageurl, category, stock FROM Products ORDER BY id ASC');
  console.log('✅ Đã đồng bộ thành công các sản phẩm vào PostgreSQL:');
  console.table(res.rows);
  await pool.end();
}

syncDb().catch(e => {
  console.error(e);
  pool.end();
});
