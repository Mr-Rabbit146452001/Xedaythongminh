'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wallet, 
  CreditCard, 
  ArrowDownToLine, 
  CheckCircle2, 
  AlertCircle, 
  Coins, 
  ShieldCheck,
  Building2,
  Lock,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { CustomerApiService, BankAccount, CustomerUser } from '@/services/customerApi';
import PinModal from '@/components/customer/PinModal';

export default function CustomerWalletPage() {
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(null);
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50000);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage('');
    const user = CustomerApiService.getStoredCustomer();
    setCurrentUser(user);

    const targetAccountNo = user?.linkedBankAccount || 'ACC_CUSTOMER_01';
    const acc = await CustomerApiService.getAccount(targetAccountNo);
    setAccount(acc);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenWithdrawModal = () => {
    setMessage('');
    setErrorMessage('');
    if (!withdrawAmount || withdrawAmount <= 0) {
      setErrorMessage('Vui lòng chọn hoặc nhập số Token hợp lệ (> 0).');
      return;
    }
    const currentBankBalance = account?.tokenBalance || 0;
    if (currentBankBalance < withdrawAmount) {
      setErrorMessage(`Số dư tài khoản ngân hàng không đủ (${currentBankBalance.toLocaleString('vi-VN')} Token).`);
      return;
    }
    setIsPinModalOpen(true);
  };

  const handleConfirmWithdraw = async (pin: string) => {
    const targetAccountNo = account?.accountNumber || currentUser?.linkedBankAccount || 'ACC_CUSTOMER_01';
    setIsWithdrawing(true);
    setErrorMessage('');
    setMessage('');

    try {
      const res = await CustomerApiService.withdrawToken(
        targetAccountNo,
        withdrawAmount,
        pin,
        currentUser?.id
      );

      if (res.success) {
        setMessage(res.message || `Rút thành công +${withdrawAmount.toLocaleString('vi-VN')} Token vào Ví!`);
        setIsPinModalOpen(false);
        await loadData();
      } else {
        setErrorMessage(res.message || 'Mã PIN không chính xác hoặc lỗi hệ thống.');
      }
    } catch (err: any) {
      setErrorMessage('Lỗi thực hiện rút Token: ' + err.message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const tokenBalance = account ? account.tokenBalance : 0;
  const vndBalance = tokenBalance * 10;
  const isLinked = Boolean(currentUser?.linkedBankAccount || account?.accountNumber);

  return (
    <div className="flex flex-col flex-1 p-4 space-y-4 pb-20 bg-[#F8F9FA] text-[#1A1A1A]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E0E0E0]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E3F2FD] border border-blue-200 flex items-center justify-center text-[#0D47A1]">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-black text-[#0D47A1] tracking-tight uppercase">Ví Điện Tử Thông Minh</h1>
            <p className="text-[11px] font-semibold text-[#666666]">MockBank FinTech 2026</p>
          </div>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="p-1.5 rounded-lg text-[#0D47A1] hover:bg-blue-50 transition-colors"
          title="Làm mới số dư"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Thẻ Ngân Hàng Titanium Royal Blue FinTech */}
      <div className="relative w-full aspect-[1.6/1] rounded-3xl bg-gradient-to-br from-[#0D47A1] via-[#1565C0] to-[#0A2472] border border-[#0D47A1]/40 p-6 shadow-2xl flex flex-col justify-between overflow-hidden group text-white">
        {/* Glow and Reflection elements */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-blue-300/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />

        {/* Top row */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-amber-300" />
            <span className="text-xs font-black text-white uppercase tracking-widest">
              SMARTCART TITANIUM
            </span>
          </div>
          <span className="text-[10px] font-extrabold text-[#0D47A1] uppercase tracking-wider bg-white px-2 py-0.5 rounded-full shadow-sm">
            CONTACTLESS
          </span>
        </div>

        {/* EMV Chip graphic */}
        <div className="relative z-10 my-1 w-10 h-7 rounded-md bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-100 border border-amber-300/60 flex items-center justify-center shadow-sm">
          <div className="w-8 h-5 border border-amber-700/40 rounded-[2px]" />
        </div>

        {/* Middle row: Balance */}
        <div className="relative z-10">
          <span className="text-[10px] text-blue-100 uppercase tracking-wider font-extrabold block mb-0.5">
            Số Dư Khả Dụng Trong Ngân Hàng
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight font-mono">
              {isLoading ? '...' : tokenBalance.toLocaleString('vi-VN')}
            </span>
            <span className="text-sm font-black text-amber-300">TOKEN</span>
          </div>
          <span className="text-xs text-blue-100 block font-mono font-medium">
            ≈ {isLoading ? '...' : vndBalance.toLocaleString('vi-VN')} VNĐ (Tỷ giá 1:10)
          </span>
        </div>

        {/* Bottom row: Card Holder & Account */}
        <div className="flex items-end justify-between relative z-10 pt-2 border-t border-white/20">
          <div>
            <span className="text-[9px] text-blue-200 uppercase tracking-wider block font-semibold">Chủ tài khoản</span>
            <span className="text-xs font-bold text-white">
              {account?.ownerName || currentUser?.name || 'Khách Hàng Demo'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-blue-200 uppercase tracking-wider block font-semibold">Số tài khoản</span>
            <span className="text-xs font-mono font-black text-amber-300">
              {account?.accountNumber || currentUser?.linkedBankAccount || 'ACC_CUSTOMER_01'}
            </span>
          </div>
        </div>
      </div>

      {/* Thông báo trạng thái */}
      {message && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-800 font-bold shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-[#FFEBEE] border border-[#D32F2F]/30 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-[#D32F2F] font-bold shadow-sm animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-[#D32F2F] flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* KHỐI RÚT TOKEN TỪ NGÂN HÀNG LIÊN KẾT */}
      <div className="bg-white border border-[#E0E0E0] rounded-3xl p-5 space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#E3F2FD] border border-blue-200 flex items-center justify-center text-[#0D47A1]">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-[#0D47A1] uppercase tracking-wider">
                Rút Token Vào Ví Xe Đẩy
              </h3>
              <p className="text-[10px] font-semibold text-[#666666]">
                Xác thực bằng Mã PIN Ngân Hàng
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-[#0D47A1] border border-blue-200 font-mono">
            1 Token = 10 đ
          </span>
        </div>

        {/* Input số Token muốn rút */}
        <div>
          <label className="block text-[11px] font-bold text-[#1A1A1A] mb-1.5">
            Số lượng Token muốn rút:
          </label>
          <div className="relative">
            <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0D47A1]" />
            <input
              type="number"
              min={1000}
              step={1000}
              value={withdrawAmount || ''}
              onChange={(e) => setWithdrawAmount(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="50000"
              className="w-full bg-[#F8F9FA] border border-[#CCCCCC] rounded-2xl pl-10 pr-20 py-3 text-sm font-mono font-black text-[#0D47A1] focus:outline-none focus:border-[#0D47A1] focus:ring-1 focus:ring-[#0D47A1]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-500 font-mono">
              TOKEN
            </span>
          </div>
          <span className="text-[11px] font-mono font-semibold text-gray-500 block mt-1 pl-1">
            ≈ {((withdrawAmount || 0) * 10).toLocaleString('vi-VN')} VNĐ
          </span>
        </div>

        {/* Quick Amount Chips */}
        <div className="grid grid-cols-4 gap-2">
          {[10000, 20000, 50000, 100000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setWithdrawAmount(amt)}
              className={`py-2 px-1 rounded-xl text-[11px] font-black font-mono transition-all border ${
                withdrawAmount === amt
                  ? 'bg-[#0D47A1] text-white border-[#0D47A1] shadow-sm'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {(amt / 1000)}K
            </button>
          ))}
        </div>

        {/* Nút Rút Token */}
        <button
          onClick={handleOpenWithdrawModal}
          disabled={isWithdrawing || !withdrawAmount || withdrawAmount <= 0}
          className="w-full h-13 py-3.5 rounded-2xl bg-[#0D47A1] hover:bg-[#1565C0] active:scale-[0.98] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all select-none"
        >
          <Lock className="w-4 h-4 stroke-[2.5]" />
          <span>Rút Token Vào Ví (Xác Thực PIN)</span>
        </button>
      </div>

      {/* Banner liên kết tài khoản nếu chưa liên kết */}
      {currentUser && !currentUser.linkedBankAccount && (
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-black text-amber-900">Chưa liên kết thẻ MockBank</h4>
              <p className="text-[10px] text-amber-700">Liên kết CCCD & SĐT để kích hoạt mã PIN thanh toán</p>
            </div>
          </div>
          <Link
            href="/customer/login"
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm shrink-0"
          >
            <span>Liên kết</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Modal nhập mã PIN để xác thực rút tiền */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onConfirm={handleConfirmWithdraw}
        title="Xác thực mã PIN để rút Token"
        amountToken={withdrawAmount}
        amountVnd={withdrawAmount * 10}
        isLoading={isWithdrawing}
      />
    </div>
  );
}
