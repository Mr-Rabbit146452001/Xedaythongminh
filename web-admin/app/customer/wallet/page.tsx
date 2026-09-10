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
    <div className="flex flex-col flex-1 p-4 space-y-4 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight">Ví Điện Tử Thông Minh</h1>
            <p className="text-[11px] text-slate-400">Thanh toán Token tự động</p>
          </div>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-bold font-mono">
          Mock Bank 2026
        </span>
      </div>

      {/* Thẻ Ngân Hàng Titanium Dark Obsidian FinTech */}
      <div className="relative w-full aspect-[1.6/1] rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-black border border-slate-700/80 p-6 shadow-2xl flex flex-col justify-between overflow-hidden group">
        {/* Glow and Reflection elements */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.08),transparent_50%)] pointer-events-none" />

        {/* Top row */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            <span className="text-xs font-black text-slate-200 uppercase tracking-widest">
              SMART CART TITANIUM
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
            CONTACTLESS
          </span>
        </div>

        {/* EMV Chip graphic */}
        <div className="relative z-10 my-1 w-10 h-7 rounded-md bg-gradient-to-tr from-amber-600/60 via-amber-400/80 to-amber-200/90 border border-amber-300/40 flex items-center justify-center">
          <div className="w-8 h-5 border border-amber-800/40 rounded-[2px]" />
        </div>

        {/* Middle row: Balance */}
        <div className="relative z-10">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-0.5">
            Số Dư Khả Dụng
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-100 tracking-tight font-mono">
              {isLoading ? '...' : tokenBalance.toLocaleString('vi-VN')}
            </span>
            <span className="text-sm font-bold text-emerald-400">TOKEN</span>
          </div>
          <span className="text-xs text-slate-400 block font-mono">
            ≈ {isLoading ? '...' : vndBalance.toLocaleString('vi-VN')} VNĐ (Tỷ giá 1:10)
          </span>
        </div>

        {/* Bottom row: Card Holder & Account */}
        <div className="flex items-end justify-between relative z-10 pt-2 border-t border-slate-800/80">
          <div>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Chủ tài khoản</span>
            <span className="text-xs font-bold text-slate-200">
              {account?.ownerName || 'Khách Hàng Demo (Anh Nam)'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Số tài khoản</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {account?.accountNumber || 'ACC_CUSTOMER_01'}
            </span>
          </div>
        </div>
      </div>

      {/* Thông báo Faucet */}
      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-300 shadow-md">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Nút Faucet Bơm Tiền Thử Nghiệm */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3.5 shadow-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Nạp Token Thử Nghiệm (Faucet Sandbox)
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Bơm tức thì <b className="text-slate-100 font-bold">+50.000 Token</b> (tương đương 500.000 VNĐ) vào ví để thử nghiệm thanh toán đơn hàng siêu thị.
        </p>

        <button
          onClick={handleFaucet}
          disabled={isFauceting}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 active:scale-[0.98] disabled:opacity-50 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all select-none"
        >
          <PlusCircle className="w-5 h-5 stroke-[2.5]" />
          <span>{isFauceting ? 'Đang bơm Token...' : '+50.000 Token (+500.000 đ)'}</span>
        </button>
      </div>

      {/* Thông tin bảo mật */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Bảo mật chuẩn FinTech 2026</span>
        </div>
        <ul className="text-xs text-slate-400 space-y-2 pl-4 list-disc">
          <li>Mỗi giao dịch thanh toán đều yêu cầu nhập mã PIN 6 số bí mật.</li>
          <li>Mã PIN thử nghiệm mặc định: <b className="text-emerald-400 font-mono font-bold bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">123456</b></li>
          <li>Hệ thống liên kết đồng bộ tức thời với cơ chế mở cổng tự động Exit Gate.</li>
        </ul>
      </div>
    </div>
  );
}
