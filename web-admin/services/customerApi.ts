export interface CustomerProduct {
  Id: number;
  Barcode: string;
  Name: string;
  Price: number;
  ImageUrl?: string;
  Category?: string;
  Stock?: number;
}

export interface CustomerCartItem {
  Id: number;
  Barcode: string;
  Name: string;
  Price: number;
  Quantity: number;
  ImageUrl?: string;
  TotalPrice: number;
  Weight?: number;
}

export interface CustomerCartSummary {
  items: CustomerCartItem[];
  totalQuantity: number;
  totalAmount: number;
  anomalyDetected?: boolean;
}

export interface BankAccount {
  accountNumber: string;
  ownerName: string;
  userRefId: string;
  tokenBalance: number;
  isActive: boolean;
}

export interface CustomerUser {
  id: string;
  name: string;
  phoneNumber: string;
  membershipLevel: string;
  points: number;
  tokenBalance: number;
  vouchers?: string[];
  promotions?: string[];
}

export interface PayResult {
  success: boolean;
  message?: string;
  errorCode?: string;
  data?: {
    transactionId: string;
    orderId: string;
    amount: number;
    tokenPaid: number;
    tokenBalanceAfter: number;
    timestamp: string;
  };
}

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return '';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
};

export const CustomerApiService = {
  // 1. Lay danh sach san pham sieu thi
  async getProducts(): Promise<CustomerProduct[]> {
    try {
      const res = await fetch(getBaseUrl() + '/api/products', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.warn('Loi getProducts:', e);
      return [];
    }
  },

  // 2. Lay gio hang thoi gian thuc
  async getCart(sessionId?: string): Promise<CustomerCartSummary> {
    try {
      const url = sessionId 
        ? `${getBaseUrl()}/api/cart?sessionId=${encodeURIComponent(sessionId)}`
        : `${getBaseUrl()}/api/cart`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      const rawItems = json.items || json.data?.items || json.data || [];
      const items: CustomerCartItem[] = rawItems.map((it: any) => ({
        Id: it.Id || it.id || it.product?.Id || 0,
        Barcode: it.Barcode || it.barcode || it.product?.Barcode || '',
        Name: it.Name || it.name || it.product?.Name || 'Sản phẩm',
        Price: it.Price || it.price || it.product?.Price || 0,
        Quantity: it.Quantity || it.quantity || 1,
        TotalPrice: it.TotalPrice || it.totalPrice || ((it.Price || it.price || it.product?.Price || 0) * (it.Quantity || it.quantity || 1)),
        ImageUrl: it.ImageUrl || it.imageUrl || it.product?.ImageUrl || 'sua_vinamilk.jpg'
      }));
      const totalAmount = json.totalAmount || json.data?.totalAmount || items.reduce((sum, item) => sum + item.TotalPrice, 0);
      const totalQuantity = json.totalQuantity || json.data?.totalItems || items.reduce((sum, item) => sum + item.Quantity, 0);
      const anomalyDetected = json.anomalyDetected || false;
      return { items, totalQuantity, totalAmount, anomalyDetected };
    } catch (e) {
      console.warn('Loi getCart, thu fallback /api/cart/items:', e);
      try {
        const fallbackUrl = `${getBaseUrl()}/api/cart/items${sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ''}`;
        const res2 = await fetch(fallbackUrl, { cache: 'no-store' });
        if (res2.ok) {
          const json2 = await res2.json();
          const legacyItems = json2.data?.items || [];
          const items: CustomerCartItem[] = legacyItems.map((it: any) => ({
            Id: it.product?.Id || 0,
            Barcode: it.product?.Barcode || '',
            Name: it.product?.Name || 'Sản phẩm',
            Price: it.product?.Price || 0,
            Quantity: it.quantity || 1,
            TotalPrice: (it.product?.Price || 0) * (it.quantity || 1),
            ImageUrl: it.product?.ImageUrl || 'sua_vinamilk.jpg'
          }));
          const totalAmount = json2.data?.totalAmount || items.reduce((sum, it) => sum + it.TotalPrice, 0);
          const totalQuantity = json2.data?.totalItems || items.reduce((sum, it) => sum + it.Quantity, 0);
          return { items, totalQuantity, totalAmount, anomalyDetected: false };
        }
      } catch (_) {}
      return { items: [], totalQuantity: 0, totalAmount: 0, anomalyDetected: false };
    }
  },

  // 3. Thong tin tai khoan ngan hang ao
  async getAccount(accountNumber: string = 'ACC_CUSTOMER_01'): Promise<BankAccount | null> {
    try {
      const res = await fetch(getBaseUrl() + '/api/bank/accounts/' + encodeURIComponent(accountNumber), { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
      return null;
    } catch (e) {
      console.warn('Loi getAccount:', e);
      return null;
    }
  },

  // 4. Bom tien thu nghiem (Faucet)
  async faucet(accountNumber: string = 'ACC_CUSTOMER_01', amount: number = 50000): Promise<boolean> {
    try {
      const res = await fetch(getBaseUrl() + '/api/bank/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber, amount })
      });
      const json = await res.json();
      return json.success === true;
    } catch (e) {
      console.error('Loi faucet:', e);
      return false;
    }
  },

  // 5. Thanh toan QR bang Token (Master PIN default: 652001)
  async payQr(qrData: string, pin: string = '652001'): Promise<PayResult> {
    try {
      const res = await fetch(getBaseUrl() + '/api/bank/pay-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData, pin })
      });
      const json = await res.json();
      return json;
    } catch (e: any) {
      return { success: false, message: e.message || 'Loi mang khi ket noi cong thanh toan' };
    }
  },

  // 6. Ghep noi phien xe day
  async pairSession(sessionId: string, customerId: string = 'CUST_001'): Promise<any> {
    try {
      const res = await fetch(getBaseUrl() + '/api/auth/session/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, customerId })
      });
      return await res.json();
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  },

  // 7. Hoan tat phien / Checkout
  async checkout(paymentMethod: string = 'QR_TOKEN', customerId: string = 'CUST_001'): Promise<any> {
    try {
      const res = await fetch(getBaseUrl() + '/api/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod, customerId, notes: 'Thanh toan qua Web App Khach Hang' })
      });
      return await res.json();
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  },

  // 8. Xac nhan dang nhap tren man hinh xe day
  async confirmLogin(sessionId: string, customerId: string = 'CUSTOMER_888'): Promise<any> {
    try {
      const res = await fetch(getBaseUrl() + '/api/auth/confirm-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, customerId })
      });
      return await res.json();
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  },

  // 9. Dang nhap tai khoan khach hang bang so dien thoai & mat khau
  async customerLogin(phoneNumber: string, password: string, sessionId: string = 'STR_001'): Promise<{ success: boolean; message: string; customer?: CustomerUser }> {
    const urls = ['/api/auth/customer/login', '/api/customer/login', '/api/login'];
    for (const u of urls) {
      try {
        const res = await fetch(getBaseUrl() + u, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber, password, sessionId })
        });
        const data = await res.json();
        if (res.ok && data.customer) {
          this.setStoredCustomer(data.customer);
          return { success: true, message: data.message || 'Đăng nhập thành công', customer: data.customer };
        }
        if (res.status !== 404) {
          return { success: false, message: data.message || 'Đăng nhập thất bại' };
        }
      } catch (e: any) {
        console.warn(`Lỗi login qua ${u}:`, e);
      }
    }
    return { success: false, message: 'Không thể kết nối máy chủ đăng nhập' };
  },

  // 10. Dang ky tai khoan khach hang moi
  async customerRegister(name: string, phoneNumber: string, password: string, sessionId: string = 'STR_001'): Promise<{ success: boolean; message: string; customer?: CustomerUser }> {
    const urls = ['/api/auth/customer/register', '/api/customer/register', '/api/register'];
    for (const u of urls) {
      try {
        const res = await fetch(getBaseUrl() + u, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phoneNumber, password, sessionId })
        });
        const data = await res.json();
        if (res.ok && data.customer) {
          this.setStoredCustomer(data.customer);
          return { success: true, message: data.message || 'Đăng ký thành công', customer: data.customer };
        }
        if (res.status !== 404) {
          return { success: false, message: data.message || 'Đăng ký không thành công' };
        }
      } catch (e: any) {
        console.warn(`Lỗi register qua ${u}:`, e);
      }
    }
    return { success: false, message: 'Không thể kết nối máy chủ đăng ký' };
  },

  // 11. Quen mat khau / Dat lai mat khau
  async customerForgotPassword(phoneNumber: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const urls = ['/api/auth/customer/forgot-password', '/api/customer/forgot-password', '/api/forgot-password'];
    for (const u of urls) {
      try {
        const res = await fetch(getBaseUrl() + u, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber, newPassword })
        });
        const data = await res.json();
        if (res.ok) {
          return { success: true, message: data.message || 'Đổi mật khẩu thành công' };
        }
        if (res.status !== 404) {
          return { success: false, message: data.message || 'Không thể đổi mật khẩu' };
        }
      } catch (e: any) {
        console.warn(`Lỗi forgot-password qua ${u}:`, e);
      }
    }
    return { success: false, message: 'Không thể kết nối máy chủ' };
  },

  // Helpers quan ly phien dang nhap khach hang tai LocalStorage
  getStoredCustomer(): CustomerUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('smartcart_customer_user');
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  },

  setStoredCustomer(customer: CustomerUser): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('smartcart_customer_user', JSON.stringify(customer));
      window.dispatchEvent(new Event('customer_auth_changed'));
    } catch (_) {}
  },

  clearStoredCustomer(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('smartcart_customer_user');
      window.dispatchEvent(new Event('customer_auth_changed'));
    } catch (_) {}
  }
};