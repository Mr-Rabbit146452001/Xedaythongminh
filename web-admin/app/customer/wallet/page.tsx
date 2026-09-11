'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  CreditCard, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  Coins, 
  ShieldCheck, 
  Sparkles,
  Lock,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { CustomerApiService, BankAccount } from '@/services/customerApi';

export default function CustomerWalletPage() {
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFauceting, setIsFauceting] = useState(false);
  const [message, setMessage] = useState('');

  const loadAccount = async () => {
    setIsLoading(true);
    const acc = await CustomerApiService.getAccount('ACC_CUSTOMER_01');
    setAccount(acc);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAccount();
  }, []);

  const handleFaucet = async () => {
    setIsFauceting(true);
    setMessage('');
    const success = await CustomerApiService.faucet('ACC_CUSTOMER_01', 50000);
    if (success) {
      setMessage('Bơm thành công +50.000 Token (+500.000 VNĐ)!');
      await loadAccount();
    } else {
      setMessage('Bơm tiền thất bại, vui lòng kiểm tra kết nối Server.');
    }
    setIsFauceting(false);
  };

  const tokenBalance = account ? account.tokenBalance : 0;
  const vndBalance = tokenBalance * 10;

  return (
    <div className="flex flex-col flex-1 p-4 space-y-4 pb-16 bg-[#F8F9FA] text-[#1A1A1A]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E0E0E0]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E3F2FD] border border-blue-200 flex items-center justify-center text-[#0D47A1]">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-black text-[#0D47A1] tracking-tight uppercase">Ví Điện Tử Thông Minh</h1>
            <p className="text-[11px] font-semibold text-[#666666]">Thanh toán Token tự động</p>
          </div>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#0D47A1] text-white font-bold font-mono shadow-sm">
          Mock Bank 2026
        </span>
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
            Số Dư Khả Dụng
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
              {account?.ownerName || 'Khách Hàng Demo (Anh Nam)'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-blue-200 uppercase tracking-wider block font-semibold">Số tài khoản</span>
            <span className="text-xs font-mono font-black text-amber-300">
              {account?.accountNumber || 'ACC_CUSTOMER_01'}
            </span>
          </div>
        </div>
      </div>

      {/* Thông báo Faucet */}
      {message && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-800 font-bold shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Nút Faucet Bơm Tiền Thử Nghiệm */}
      <div className="bg-white border border-[#E0E0E0] rounded-3xl p-5 space-y-3.5 shadow-md">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#0D47A1]" />
          <h3 className="text-xs font-black text-[#0D47A1] uppercase tracking-wider">
            Nạp Token Thử Nghiệm (Faucet Sandbox)
          </h3>
        </div>
        <p className="text-xs text-[#666666] leading-relaxed">
          Bơm tức thì <b className="text-[#0D47A1] font-bold">+50.000 Token</b> (tương đương 500.000 VNĐ) vào ví để thử nghiệm thanh toán đơn hàng siêu thị.
        </p>

        <button
          onClick={handleFaucet}
          disabled={isFauceting}
          className="w-full h-14 rounded-2xl bg-[#0D47A1] hover:bg-[#1565C0] active:scale-[0.98] disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all select-none"
        >
          <PlusCircle className="w-5 h-5 stroke-[2.5]" />
          <span>{isFauceting ? 'Đang bơm Token...' : '+50.000 Token (+500.000 đ)'}</span>
        </button>
      </div>

      {/* Thông tin bảo mật */}
      <div className="bg-[#E3F2FD] border border-blue-200 rounded-3xl p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-[#0D47A1] text-xs font-black">
          <ShieldCheck className="w-4 h-4 text-[#0D47A1]" />
          <span>Bảo mật chuẩn FinTech 2026</span>
        </div>
        <ul className="text-xs text-[#1A1A1A] space-y-2 pl-4 list-disc font-medium">
          <li>Mỗi giao dịch thanh toán đều yêu cầu nhập mã PIN 6 số bí mật.</li>
          <li>Mã PIN thử nghiệm mặc định: <b className="text-[#0D47A1] font-mono font-black bg-white px-1.5 py-0.5 rounded border border-blue-300">123456</b></li>
          <li>Hệ thống liên kết đồng bộ tức thời với cơ chế mở cổng tự động Exit Gate.</li>
        </ul>
      </div>
    </div>
  );
}
