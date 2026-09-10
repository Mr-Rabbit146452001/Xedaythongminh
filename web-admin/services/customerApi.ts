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
  async getCart(): Promise<CustomerCartSummary> {
    try {
      const res = await fetch(getBaseUrl() + '/api/cart', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      const items: CustomerCartItem[] = json.items || json.data || [];
      const totalAmount = json.totalAmount || items.reduce((sum, item) => sum + (item.TotalPrice || item.Price * item.Quantity), 0);
      const totalQuantity = json.totalQuantity || items.reduce((sum, item) => sum + item.Quantity, 0);
      const anomalyDetected = json.anomalyDetected || false;
      return { items, totalQuantity, totalAmount, anomalyDetected };
    } catch (e) {
      console.warn('Loi getCart:', e);
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

  // 5. Thanh toan QR bang Token
  async payQr(qrData: string, pin: string = '123456'): Promise<PayResult> {
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
    try {
      const res = await fetch(getBaseUrl() + '/api/auth/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password, sessionId })
      });
      const data = await res.json();
      if (res.ok && data.customer) {
        this.setStoredCustomer(data.customer);
        return { success: true, message: data.message || 'Đăng nhập thành công', customer: data.customer };
      }
      return { success: false, message: data.message || 'Đăng nhập thất bại' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Lỗi mạng khi kết nối máy chủ' };
    }
  },

  // 10. Dang ky tai khoan khach hang moi
  async customerRegister(name: string, phoneNumber: string, password: string, sessionId: string = 'STR_001'): Promise<{ success: boolean; message: string; customer?: CustomerUser }> {
    try {
      const res = await fetch(getBaseUrl() + '/api/auth/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phoneNumber, password, sessionId })
      });
      const data = await res.json();
      if (res.ok && data.customer) {
        this.setStoredCustomer(data.customer);
        return { success: true, message: data.message || 'Đăng ký thành công', customer: data.customer };
      }
      return { success: false, message: data.message || 'Đăng ký không thành công' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Lỗi kết nối máy chủ khi đăng ký' };
    }
  },

  // 11. Quen mat khau / Dat lai mat khau
  async customerForgotPassword(phoneNumber: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(getBaseUrl() + '/api/auth/customer/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: data.message || 'Đổi mật khẩu thành công' };
      }
      return { success: false, message: data.message || 'Không thể đổi mật khẩu' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Lỗi kết nối máy chủ' };
    }
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