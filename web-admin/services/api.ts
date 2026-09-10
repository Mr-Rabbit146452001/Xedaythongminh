import { Product, Order, SmartCart, INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_SMART_CARTS } from '../data/mockData';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Trình duyệt client (bất kể localhost hay qua ngrok): Dùng đường dẫn tương đối /api
    return '/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

export const ApiService = {
  // Lấy dữ liệu tổng quan Dashboard
  async getOverview() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/overview`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.data) return json.data;
    } catch (err) {
      console.warn('⚠️ [API Service] Sử dụng fallback overview cục bộ:', err);
    }
    return {
      todayRevenue: 12500000,
      todayOrders: 12,
      totalProducts: 8,
      lowStock: 0,
      outStock: 0,
      totalStockUnits: 800,
      totalInventoryValue: 24850000,
      totalStrollers: 8,
      activeStrollers: 6,
      topProducts: [
        { rank: 1, id: 3, name: 'Táo Envy New Zealand', price: 125000, soldCount: 48, revenue: 6000000, trend: 'up', imageUrl: '/products/tao_envy.jpg' },
        { rank: 2, id: 2, name: 'Bơ sáp loại 1 (KG)', price: 45000, soldCount: 32, revenue: 1440000, trend: 'up', imageUrl: '/products/bo_sap.jpg' },
        { rank: 3, id: 1, name: 'Sữa tươi tiệt trùng ít đường 1L', price: 34000, soldCount: 55, revenue: 1870000, trend: 'up', imageUrl: '/products/sua_vinamilk.jpg' },
        { rank: 4, id: 7, name: 'Bánh quy kẹp kem Oreo socola 137g', price: 18000, soldCount: 60, revenue: 1080000, trend: 'up', imageUrl: '/products/oreo_socola.jpg' },
      ],
      stockAlerts: [],
      revenueTrend7Days: [10.5, 12.2, 9.8, 14.5, 11.0, 15.2, 12.5],
      orderStatusDistribution: {
        paid: 8,
        processing: 2,
        completed: 2,
        cancelled: 0
      }
    };
  },

  // Lấy dữ liệu phân tích kho hàng từ PostgreSQL
  async getInventory() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/inventory`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (err) {
      console.warn('⚠️ [API Service] Sử dụng fallback inventory:', err);
    }
    return {
      totalItems: 8,
      totalUnits: 800,
      totalValue: 24850000,
      lowStock: 0,
      outStock: 0,
      categories: [
        { category: 'Đồ uống', productCount: 4, stockUnits: 400, categoryValue: 5600000, percentage: 23 },
        { category: 'Thực phẩm tươi', productCount: 2, stockUnits: 200, categoryValue: 17000000, percentage: 68 },
        { category: 'Bánh kẹo', productCount: 2, stockUnits: 200, categoryValue: 2250000, percentage: 9 },
      ]
    };
  },

  // Lấy danh sách sản phẩm (Ưu tiên /api/admin/products từ PostgreSQL)
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    } catch (err) {
      console.warn('⚠️ [API Service] Không kết nối được /api/admin/products, thử /api/products:', err);
      try {
        const res2 = await fetch(`${API_BASE_URL}/products`, { cache: 'no-store' });
        if (res2.ok) {
          const json2 = await res2.json();
          if (json2.data && Array.isArray(json2.data) && json2.data.length > 0) {
            return json2.data.map((item: any, index: number) => ({
              id: item.Id || item.id || index + 1,
              barcode: item.Barcode || item.barcode || '',
              sku: `SKU-${(item.Id || index + 1).toString().padStart(3, '0')}`,
              name: item.Name || item.name,
              category: item.Category || item.category || 'Đồ uống',
              price: parseFloat(item.Price || item.price || 0),
              stock: parseInt(item.Stock || item.stock || 80),
              status: (item.stock || 80) <= 0 ? 'out' : (item.stock || 80) < 20 ? 'low' : 'active',
              imageUrl: (() => {
                const rawImg = item.ImageUrl || item.imageurl;
                if (!rawImg) return INITIAL_PRODUCTS[0].imageUrl;
                if (rawImg.startsWith('http') || rawImg.startsWith('/')) return rawImg;
                return `/products/${rawImg}`;
              })(),
            }));
          }
        }
      } catch (err2) {
        console.warn('⚠️ [API Service] Sử dụng dữ liệu sản phẩm cục bộ:', err2);
      }
    }
    return INITIAL_PRODUCTS;
  },

  // Thêm sản phẩm mới vào PostgreSQL qua Backend
  async createProduct(product: Partial<Product>): Promise<Product> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          return {
            id: json.data.id,
            barcode: json.data.barcode,
            sku: `SKU-${json.data.id.toString().padStart(3, '0')}`,
            name: json.data.name,
            category: json.data.category || 'Đồ uống',
            price: parseFloat(json.data.price),
            stock: parseInt(json.data.stock || 100),
            status: json.data.stock <= 0 ? 'out' : json.data.stock < 20 ? 'low' : 'active',
            imageUrl: json.data.imageurl ? `/products/${json.data.imageurl}` : '/products/sua_vinamilk.jpg',
          };
        }
      }
    } catch (err) {
      console.error('❌ [API Service] Lỗi tạo sản phẩm trên server:', err);
    }
    // Fallback nếu server offline
    return {
      id: Date.now(),
      barcode: product.barcode || '',
      sku: product.sku || `SKU-${Date.now().toString().slice(-3)}`,
      name: product.name || '',
      category: product.category || 'Đồ uống',
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
      status: Number(product.stock) <= 0 ? 'out' : Number(product.stock) < 20 ? 'low' : 'active',
      imageUrl: product.imageUrl || '/products/sua_vinamilk.jpg',
    };
  },

  // Sửa sản phẩm trên PostgreSQL
  async updateProduct(id: number, product: Partial<Product>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      return res.ok;
    } catch (err) {
      console.warn('⚠️ [API Service] Không cập nhật được server:', err);
      return false;
    }
  },

  // Xóa sản phẩm khỏi PostgreSQL
  async deleteProduct(id: number): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.warn('⚠️ [API Service] Không xóa được trên server:', err);
      return false;
    }
  },

  // Lấy danh sách đơn hàng thực tế
  async getOrders(): Promise<Order[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('⚠️ [API Service] Sử dụng fallback đơn hàng cục bộ:', err);
    }
    return INITIAL_ORDERS;
  },

  // Lấy danh sách Smart Carts từ DB Strollers
  async getSmartCarts(): Promise<SmartCart[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/strollers`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('⚠️ [API Service] Sử dụng fallback xe đẩy cục bộ:', err);
    }
    return INITIAL_SMART_CARTS;
  },

  // Thêm xe đẩy vào PostgreSQL
  async createSmartCart(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/strollers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  },

  // Giả lập quét IoT qua backend
  async simulateIoTScan(barcode: string, sessionId?: string) {
    const res = await fetch(`${API_BASE_URL}/iot/simulate-scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode, sessionId: sessionId || 'SESSION_DEFAULT' }),
    });
    return res.json();
  },

  // Format số nguyên chuẩn (ngăn chặn lỗi React Hydration mismatch giữa Server và Client)
  formatNumber(num: number | string): string {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return '0';
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  },

  // Format tiền tệ VNĐ chuẩn đồng nhất
  formatVND(amount: number | string): string {
    const n = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(n)) return '0 ₫';
    return `${ApiService.formatNumber(n)} ₫`;
  },

  // ====================================================
  // QUẢN LÝ KHÁCH HÀNG & ĐỒNG BỘ CƠ SỞ DỮ LIỆU (CSDL)
  // ====================================================
  async getCustomers(search?: string, tier?: string): Promise<CustomerItem[]> {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (tier && tier !== 'ALL') params.append('tier', tier);

      const res = await fetch(`${API_BASE_URL}/customers?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('⚠️ [API Service] Lỗi getCustomers:', err);
      return [];
    }
  },

  async createCustomer(customer: Partial<CustomerItem>): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const res = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
      });
      const json = await res.json();
      return { success: res.ok, message: json.message || 'Thao tác hoàn tất', data: json.data };
    } catch (err: any) {
      return { success: false, message: err.message || 'Lỗi kết nối máy chủ' };
    }
  },

  async updateCustomer(id: string, customer: Partial<CustomerItem>): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/customers/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
      });
      const json = await res.json();
      return { success: res.ok, message: json.message || 'Thao tác hoàn tất' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Lỗi kết nối' };
    }
  },

  async deleteCustomer(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/customers/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      return { success: res.ok, message: json.message || 'Thao tác hoàn tất' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Lỗi kết nối' };
    }
  },

  async syncCustomerToStroller(id: string, sessionId: string = 'STR_001'): Promise<{ success: boolean; message: string; customer?: any }> {
    try {
      const res = await fetch(`${API_BASE_URL}/customers/${encodeURIComponent(id)}/sync-cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      const json = await res.json();
      return { success: res.ok, message: json.message || 'Đã đồng bộ xe đẩy', customer: json.customer };
    } catch (err: any) {
      return { success: false, message: err.message || 'Lỗi kết nối' };
    }
  }
};

export interface CustomerItem {
  id: string;
  name: string;
  membershipLevel: string;
  points: number;
  phoneNumber: string;
  email?: string;
  totalSpent?: number;
  tokenBalance: number;
  accountNumber?: string;
  createdAt?: string;
}
