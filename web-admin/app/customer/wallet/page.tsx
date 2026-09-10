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
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft,
  Sparkles,
  Lock
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
    <div className="flex flex-col flex-1 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-400" />
          <h1 className="text-base font-bold text-slate-100 tracking-tight">Ví Điện Tử Thông Minh</h1>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
          Mock Bank 2026
        </span>
      </div>

      {/* Thẻ Ngân Hàng Titanium Obsidian */}
      <div className="relative w-full aspect-[1.6/1] rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-black border border-slate-700/60 p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top row */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
              SMART CART TITANIUM
            </span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
            CONTACTLESS
          </span>
        </div>

        {/* Middle row: Balance */}
        <div className="relative z-10 my-auto">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
            Số dư khả dụng
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-100 tracking-tight">
              {isLoading ? '...' : tokenBalance.toLocaleString('vi-VN')}
            </span>
            <span className="text-sm font-bold text-emerald-400">TOKEN</span>
          </div>
          <span className="text-xs text-slate-400 block mt-0.5 font-medium">
            ≈ {isLoading ? '...' : vndBalance.toLocaleString('vi-VN')} VNĐ (Tỷ giá 1:10)
          </span>
        </div>

        {/* Bottom row: Card Holder & Account */}
        <div className="flex items-end justify-between relative z-10 pt-2 border-t border-slate-800/80">
          <div>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Chủ tài khoản</span>
            <span className="text-xs font-bold text-slate-200">
              {account?.ownerName || 'Khách Hàng Demo (Anh Nam)'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Số tài khoản</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {account?.accountNumber || 'ACC_CUSTOMER_01'}
            </span>
          </div>
        </div>
      </div>

      {/* Thông báo Faucet */}
      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Nút Faucet Bơm Tiền Thử Nghiệm */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Nạp Token Thử Nghiệm (Faucet)
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Bơm tức thì <b className="text-slate-200">50.000 Token</b> (tương đương 500.000 VNĐ) vào ví để thử nghiệm thanh toán đơn hàng siêu thị.
        </p>

        <button
          onClick={handleFaucet}
          disabled={isFauceting}
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 active:scale-[0.98] disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isFauceting ? 'Đang bơm Token...' : '+50.000 Token (+500.000 đ)'}</span>
        </button>
      </div>

      {/* Thông tin bảo mật */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Cơ chế bảo mật thanh toán</span>
        </div>
        <ul className="text-[11px] text-slate-400 space-y-1.5 pl-5 list-disc">
          <li>Mỗi giao dịch thanh toán đều yêu cầu nhập mã PIN 6 số bí mật.</li>
          <li>Mã PIN thử nghiệm hệ thống mặc định là: <b className="text-emerald-400 font-mono">123456</b>.</li>
          <li>Khóa tài khoản tạm thời 15 phút nếu nhập sai mã PIN quá 5 lần liên tiếp.</li>
        </ul>
      </div>
    </div>
  );
}
