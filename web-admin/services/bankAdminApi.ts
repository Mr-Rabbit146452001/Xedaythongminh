export interface BankAccountAdminItem {
  accountNumber: string;
  ownerName: string;
  phoneNumber: string;
  idCardNumber: string;
  tokenBalance: number;
  vndBalance: number;
  isActive: boolean;
  failedAttempts: number;
  isLocked: boolean;
  lockedUntil?: string;
  createdAt?: string;
}

export interface BankSummary {
  totalAccounts: number;
  totalToken: number;
  totalVnd: number;
}

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';
};

export const BankAdminService = {
  // 1. Lấy danh sách toàn bộ tài khoản ngân hàng & số dư
  async getAccounts(): Promise<{ success: boolean; summary: BankSummary; data: BankAccountAdminItem[] }> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/bank/admin/accounts`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return {
        success: true,
        summary: json.summary || { totalAccounts: 0, totalToken: 0, totalVnd: 0 },
        data: json.data || []
      };
    } catch (e: any) {
      console.warn('Lỗi getAccounts:', e);
      return {
        success: false,
        summary: { totalAccounts: 0, totalToken: 0, totalVnd: 0 },
        data: []
      };
    }
  },

  // 2. Đăng ký tài khoản MockBank mới (Định danh CCCD & SĐT)
  async registerAccount(data: { fullName: string; idCardNumber: string; phoneNumber: string; pin: string }): Promise<any> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/bank/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      return json;
    } catch (e: any) {
      return { success: false, message: e.message || 'Lỗi mạng khi kết nối máy chủ' };
    }
  },

  // 3. Nạp hoặc cân chỉnh số dư Token
  async adjustBalance(accountNumber: string, amount: number, action: 'add' | 'set' = 'add'): Promise<any> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/bank/admin/adjust-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber, amount, action })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message || 'Lỗi mạng' };
    }
  },

  // 4. Khóa hoặc Mở khóa tài khoản
  async toggleStatus(accountNumber: string, isActive: boolean): Promise<any> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/bank/admin/toggle-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber, isActive })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message || 'Lỗi mạng' };
    }
  },

  // 5. Cấp lại mã PIN về mặc định (Master PIN 652001)
  async resetPin(accountNumber: string, newPin: string = '652001'): Promise<any> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/bank/admin/reset-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber, newPin })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message || 'Lỗi mạng' };
    }
  }
};
