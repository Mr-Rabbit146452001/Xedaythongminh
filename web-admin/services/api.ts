import { Product, Order, SmartCart, InventoryMovement } from '../data/mockData';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Trình duyệt client (bất kể localhost hay qua ngrok): Dùng đường dẫn tương đối /api
    return '/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

export const ApiService = {
  // Lấy dữ liệu tổng quan Dashboard (100% từ PostgreSQL Server)
  async getOverview() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/overview`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.data) return json.data;
    } catch (err) {
      console.warn('⚠️ [API Service] Lỗi kết nối /api/admin/overview:', err);
    }
    return {
      todayRevenue: 0,
      todayOrders: 0,
      totalProducts: 0,
      lowStock: 0,
      outStock: 0,
      totalStockUnits: 0,
      totalInventoryValue: 0,
      totalStrollers: 0,
      activeStrollers: 0,
      topProducts: [],
      stockAlerts: [],
      revenueTrend7Days: [0, 0, 0, 0, 0, 0, 0],
      orderStatusDistribution: {
        paid: 0,
        processing: 0,
        completed: 0,
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
      console.warn('⚠️ [API Service] Lỗi kết nối /api/admin/inventory:', err);
    }
    return {
      totalItems: 0,
      totalUnits: 0,
      totalValue: 0,
      lowStock: 0,
      outStock: 0,
      categories: [],
      movements: []
    };
  },

  // Tạo phiếu nhập / xuất kho trên Server PostgreSQL
  async createInventoryMovement(movement: Partial<InventoryMovement>): Promise<InventoryMovement | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/inventory/movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movement),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch (err) {
      console.error('❌ [API Service] Lỗi tạo phiếu nhập/xuất kho trên server:', err);
    }
    return null;
  },

  // Lấy danh sách sản phẩm (100% từ PostgreSQL Server)
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        return json.data.map((item: any, index: number) => {
          const stockVal = item.stock !== undefined && item.stock !== null
            ? parseInt(String(item.stock), 10)
            : item.Stock !== undefined && item.Stock !== null
            ? parseInt(String(item.Stock), 10)
            : 0;
          return {
            id: item.id || item.Id || index + 1,
            barcode: item.barcode || item.Barcode || '',
            sku: item.sku || `SKU-${(item.id || item.Id || index + 1).toString().padStart(3, '0')}`,
            name: item.name || item.Name,
            category: item.category || item.Category || 'Đồ uống',
            price: parseFloat(item.price ?? item.Price ?? 0),
            stock: isNaN(stockVal) ? 0 : stockVal,
            status: stockVal <= 0 ? 'out' : stockVal < 20 ? 'low' : 'active',
            imageUrl: (() => {
              const rawImg = item.imageUrl || item.imageurl || item.ImageUrl;
              if (!rawImg) return '/products/8934673573344.jpg';
              if (rawImg.startsWith('http') || rawImg.startsWith('/')) return rawImg;
              return `/products/${rawImg}`;
            })(),
          };
        });
      }
    } catch (err) {
      console.warn('⚠️ [API Service] Không kết nối được /api/admin/products, thử /api/products:', err);
      try {
        const res2 = await fetch(`${API_BASE_URL}/products`, { cache: 'no-store' });
        if (res2.ok) {
          const json2 = await res2.json();
          if (json2.data && Array.isArray(json2.data)) {
            return json2.data.map((item: any, index: number) => {
              const stockVal = item.Stock !== undefined && item.Stock !== null
                ? parseInt(String(item.Stock), 10)
                : item.stock !== undefined && item.stock !== null
                ? parseInt(String(item.stock), 10)
                : 0;
              return {
                id: item.Id || item.id || index + 1,
                barcode: item.Barcode || item.barcode || '',
                sku: `SKU-${(item.Id || item.id || index + 1).toString().padStart(3, '0')}`,
                name: item.Name || item.name,
                category: item.Category || item.category || 'Đồ uống',
                price: parseFloat(item.Price ?? item.price ?? 0),
                stock: isNaN(stockVal) ? 0 : stockVal,
                status: stockVal <= 0 ? 'out' : stockVal < 20 ? 'low' : 'active',
                imageUrl: (() => {
                  const rawImg = item.ImageUrl || item.imageurl;
                  if (!rawImg) return '/products/8934673573344.jpg';
                  if (rawImg.startsWith('http') || rawImg.startsWith('/')) return rawImg;
                  return `/products/${rawImg}`;
                })(),
              };
            });
          }
        }
      } catch (err2) {
        console.warn('⚠️ [API Service] Lỗi kết nối /api/products:', err2);
      }
    }
    return [];
  },

  // Thêm sản phẩm mới vào PostgreSQL qua Backend
  async createProduct(product: Partial<Product>): Promise<Product | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const stockVal = parseInt(String(json.data.stock ?? 0), 10);
          return {
            id: json.data.id,
            barcode: json.data.barcode,
            sku: `SKU-${json.data.id.toString().padStart(3, '0')}`,
            name: json.data.name,
            category: json.data.category || 'Đồ uống',
            price: parseFloat(json.data.price),
            stock: isNaN(stockVal) ? 0 : stockVal,
            status: stockVal <= 0 ? 'out' : stockVal < 20 ? 'low' : 'active',
            imageUrl: json.data.imageurl ? `/products/${json.data.imageurl}` : '/products/8934673573344.jpg',
          };
        }
      }
    } catch (err) {
      console.error('❌ [API Service] Lỗi tạo sản phẩm trên server:', err);
    }
    return null;
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

  // Lấy danh sách đơn hàng thực tế từ Server
  async getOrders(): Promise<Order[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('⚠️ [API Service] Lỗi kết nối /api/admin/orders:', err);
    }
    return [];
  },

  // Lấy danh sách Smart Carts từ DB Strollers
  async getSmartCarts(): Promise<SmartCart[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/strollers`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('⚠️ [API Service] Lỗi kết nối /api/admin/strollers:', err);
    }
    return [];
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
  },

  // Đăng ký nhận sự kiện realtime 2 chiều từ PostgreSQL Server qua SSE
  subscribeToRealtimeEvents(onEvent: (event: string, data: any) => void): () => void {
    if (typeof window === 'undefined') return () => {};
    let eventSource: EventSource | null = null;
    try {
      const url = `${API_BASE_URL}/realtime/events`;
      eventSource = new EventSource(url);

      eventSource.addEventListener('connected', (e: any) => {
        try {
          const parsed = JSON.parse(e.data);
          onEvent('connected', parsed);
        } catch (_) {}
      });

      const events = ['product_change', 'order_change', 'inventory_change', 'stroller_change'];
      events.forEach((evtName) => {
        eventSource?.addEventListener(evtName, (e: any) => {
          try {
            const parsed = JSON.parse(e.data);
            onEvent(evtName, parsed);
          } catch (err) {
            console.error(`Lỗi parse realtime event (${evtName}):`, err);
          }
        });
      });

      eventSource.onerror = () => {
        // Tự động kết nối lại bởi EventSource
      };
    } catch (err) {
      console.warn('⚠️ [API Service] Trình duyệt không hỗ trợ EventSource hoặc lỗi kết nối:', err);
    }

    return () => {
      eventSource?.close();
    };
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
