export interface Product {
  id: number;
  barcode: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'low' | 'out';
  imageUrl: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  createdAt: string;
  itemCount: number;
  totalAmount: number;
  paymentMethod: string;
  status: 'pending' | 'shipping' | 'completed' | 'cancelled';
}

export interface SmartCart {
  id: string;
  name: string;
  battery: number;
  status: 'online' | 'charging' | 'offline';
  location: string;
  currentSessionId?: string;
  customerName?: string;
  coordinates: { x: number; y: number }; // percentage on floor plan
  lastPing: string;
}

export interface InventoryMovement {
  id: string;
  type: 'import' | 'export';
  code: string;
  supplier: string;
  date: string;
  itemsCount: number;
  totalValue: number;
  status: 'completed' | 'processing';
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    barcode: '8934588063145',
    sku: '8934588063145',
    name: 'Nước khoáng Aquafina 500ml',
    category: 'Đồ uống',
    price: 6000,
    stock: 100,
    status: 'active',
    imageUrl: '/products/aquafina_500ml.jpg',
  },
  {
    id: 2,
    barcode: '8934563138165',
    sku: '8934563138165',
    name: 'Mì tôm Hảo Hảo chua cay',
    category: 'Bánh kẹo',
    price: 4500,
    stock: 100,
    status: 'active',
    imageUrl: '/products/hao_hao.jpg',
  },
  {
    id: 3,
    barcode: '8935005801135',
    sku: '8935005801135',
    name: 'Nước khoáng La Vie 500ml',
    category: 'Đồ uống',
    price: 6000,
    stock: 100,
    status: 'active',
    imageUrl: '/products/lavie_500ml.jpg',
  },
  {
    id: 4,
    barcode: '8938556329004',
    sku: '8938556329004',
    name: 'Pocari Sweat 500 ml',
    category: 'Đồ uống',
    price: 15000,
    stock: 100,
    status: 'active',
    imageUrl: '/products/pocari_sweat.jpg',
  },
  {
    id: 5,
    barcode: '8936120311028',
    sku: '8936120311028',
    name: 'Muối tinh sấy i-ốt Sosal Group 500 g',
    category: 'Gia vị',
    price: 4100,
    stock: 100,
    status: 'active',
    imageUrl: '/products/muoi_tinh_sosal.jpg',
  },
  {
    id: 6,
    barcode: '8936040077271',
    sku: '8936040077271',
    name: 'Khăn ướt Puri không mùi 20 tờ',
    category: 'Hóa mỹ phẩm',
    price: 8800,
    stock: 100,
    status: 'active',
    imageUrl: '/products/khan_uot_puri.jpg',
  },
  {
    id: 7,
    barcode: '8935024120187',
    sku: '8935024120187',
    name: 'Cà phê G7 hòa tan đen 15 gói',
    category: 'Đồ uống',
    price: 47000,
    stock: 100,
    status: 'active',
    imageUrl: '/products/ca_phe_g7.jpg',
  },
  {
    id: 8,
    barcode: '8938558334556',
    sku: '8938558334556',
    name: 'Khăn giấy Premier 100 tờ 3 lớp',
    category: 'Hóa mỹ phẩm',
    price: 9500,
    stock: 100,
    status: 'active',
    imageUrl: '/products/khan_giay_premier.jpg',
  },
  {
    id: 9,
    barcode: '8935049501503',
    sku: '8935049501503',
    name: 'Nước ngọt Coca Cola lon 330ml',
    category: 'Đồ uống',
    price: 10900,
    stock: 100,
    status: 'active',
    imageUrl: '/products/coke_sleek_lon.jpg',
  },
  {
    id: 10,
    barcode: '8934561010022',
    sku: '8934561010022',
    name: 'Phở gà Vifon gói 65g',
    category: 'Thực phẩm khô',
    price: 9900,
    stock: 100,
    status: 'active',
    imageUrl: '/products/pho_ga_vifon.jpg',
  },
  {
    id: 11,
    barcode: '8934673200325',
    sku: '8934673200325',
    name: 'Sữa đặc Ông Thọ đỏ tuýp 165g',
    category: 'Sữa & Bơ',
    price: 20000,
    stock: 100,
    status: 'active',
    imageUrl: '/products/ong_tho_do.jpg',
  },
  {
    id: 12,
    barcode: '8936079120382',
    sku: '8936079120382',
    name: 'Snack Poca bắp ngọt xóc bơ gói 32g',
    category: 'Bánh kẹo',
    price: 6000,
    stock: 100,
    status: 'active',
    imageUrl: '/products/snack_poca_bap.jpg',
  },
  {
    id: 13,
    barcode: '8934673573344',
    sku: '8934673573344',
    name: 'Sữa tươi tiệt trùng Vinamilk 100% Có đường 180ml',
    category: 'Đồ uống',
    price: 9500,
    stock: 100,
    status: 'active',
    imageUrl: '/products/8934673573344.jpg',
  },
  {
    id: 14,
    barcode: '8935217400454',
    sku: '8935217400454',
    name: 'Sữa tươi tiệt trùng TH true MILK Socola 180ml',
    category: 'Đồ uống',
    price: 9500,
    stock: 100,
    status: 'active',
    imageUrl: '/products/8935217400454.jpg',
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-98241',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0987***321',
    createdAt: '10:45 Hôm nay',
    itemCount: 5,
    totalAmount: 450000,
    paymentMethod: 'Ví điện tử SmartPay',
    status: 'completed',
  },
  {
    id: 'ORD-98240',
    customerName: 'Trần Thị B',
    customerPhone: '0909***456',
    createdAt: '10:30 Hôm nay',
    itemCount: 12,
    totalAmount: 1250000,
    paymentMethod: 'Thẻ Visa Platinum',
    status: 'completed',
  },
  {
    id: 'ORD-98239',
    customerName: 'Lê Hoàng C',
    customerPhone: '0918***789',
    createdAt: '10:15 Hôm nay',
    itemCount: 2,
    totalAmount: 70000,
    paymentMethod: 'Quét mã QR MockBank',
    status: 'pending',
  },
  {
    id: 'ORD-98238',
    customerName: 'Phạm Minh D',
    customerPhone: '0977***112',
    createdAt: '09:50 Hôm nay',
    itemCount: 7,
    totalAmount: 680000,
    paymentMethod: 'Ví Hội viên trả sau',
    status: 'shipping',
  },
  {
    id: 'ORD-98237',
    customerName: 'Hoàng Thảo E',
    customerPhone: '0933***554',
    createdAt: '09:20 Hôm nay',
    itemCount: 1,
    totalAmount: 34000,
    paymentMethod: 'Ví điện tử SmartPay',
    status: 'cancelled',
  },
  {
    id: 'ORD-98236',
    customerName: 'Vũ Quốc F',
    customerPhone: '0944***998',
    createdAt: '08:55 Hôm nay',
    itemCount: 4,
    totalAmount: 290000,
    paymentMethod: 'Thẻ Visa Platinum',
    status: 'completed',
  },
];

export const INITIAL_SMART_CARTS: SmartCart[] = [
  {
    id: 'SC-001',
    name: 'Smart Cart #01',
    battery: 87,
    status: 'online',
    location: 'Khu Đồ Uống A1',
    currentSessionId: 'SESS_98241',
    customerName: 'Nguyễn Văn A',
    coordinates: { x: 38, y: 32 },
    lastPing: 'Vừa xong',
  },
  {
    id: 'SC-002',
    name: 'Smart Cart #02',
    battery: 92,
    status: 'online',
    location: 'Khu Bánh Kẹo B3',
    currentSessionId: 'SESS_98240',
    customerName: 'Trần Thị B',
    coordinates: { x: 26, y: 58 },
    lastPing: '10s trước',
  },
  {
    id: 'SC-003',
    name: 'Smart Cart #03',
    battery: 65,
    status: 'online',
    location: 'Quầy Trái Cây C2',
    coordinates: { x: 55, y: 44 },
    lastPing: '5s trước',
  },
  {
    id: 'SC-008',
    name: 'Smart Cart #08',
    battery: 8,
    status: 'offline',
    location: 'Lối vào Cửa Tây',
    coordinates: { x: 80, y: 18 },
    lastPing: '15 phút trước',
  },
  {
    id: 'SC-015',
    name: 'Smart Cart #15',
    battery: 24,
    status: 'charging',
    location: 'Trạm sạc Kỹ thuật #2',
    coordinates: { x: 88, y: 85 },
    lastPing: 'Vừa xong',
  },
  {
    id: 'SC-016',
    name: 'Smart Cart #16',
    battery: 78,
    status: 'online',
    location: 'Khu Thực Phẩm Tươi',
    coordinates: { x: 42, y: 70 },
    lastPing: '20s trước',
  },
  {
    id: 'SC-017',
    name: 'Smart Cart #17',
    battery: 81,
    status: 'online',
    location: 'Khu Gia Dụng & Đồ Tết',
    coordinates: { x: 68, y: 62 },
    lastPing: '15s trước',
  },
  {
    id: 'SC-018',
    name: 'Smart Cart #18',
    battery: 95,
    status: 'online',
    location: 'Cổng ra Checkout #1',
    coordinates: { x: 15, y: 75 },
    lastPing: 'Vừa xong',
  },
];

export const INVENTORY_MOVEMENTS: InventoryMovement[] = [
  {
    id: 'NK-2026-081',
    type: 'import',
    code: 'PN-VINAMILK-01',
    supplier: 'Công ty Cổ phần Sữa Vinamilk',
    date: '07/09/2026 08:30',
    itemsCount: 500,
    totalValue: 15500000,
    status: 'completed',
  },
  {
    id: 'NK-2026-080',
    type: 'import',
    code: 'PN-LAVIE-02',
    supplier: 'Công ty TNHH La Vie Việt Nam',
    date: '06/09/2026 14:15',
    itemsCount: 1200,
    totalValue: 6200000,
    status: 'completed',
  },
  {
    id: 'XK-2026-042',
    type: 'export',
    code: 'PX-STORE-FLOOR',
    supplier: 'Xuất lên kệ quầy tầng 1',
    date: '07/09/2026 09:00',
    itemsCount: 250,
    totalValue: 4800000,
    status: 'completed',
  }
];
