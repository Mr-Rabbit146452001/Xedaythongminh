'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Wifi, RefreshCw, User, ShieldCheck } from 'lucide-react';
import { CustomerApiService, CustomerUser } from '@/services/customerApi';

interface MobileHeaderProps {
  strollerId?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  itemCount?: number;
}

export default function MobileHeader({
  strollerId = 'STR_001',
  onRefresh,
  isRefreshing = false,
  itemCount = 0
}: MobileHeaderProps) {
  const [user, setUser] = useState<CustomerUser | null>(null);

  useEffect(() => {
    setUser(CustomerApiService.getStoredCustomer());
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#0D47A1] text-white shadow-md border-b border-[#0A3880] px-4 py-2.5">
      <div className="flex items-center justify-between">
        {/* Brand & Stroller Logo & ID */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-md border border-white/30 flex items-center justify-center shrink-0">
            <img
              src="/img_smart_cart_logo.png"
              alt="Smart Cart Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-white uppercase">SMART STROLLER</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E3F2FD] text-[#0D47A1] font-extrabold border border-white/40">
                PWA
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-blue-100 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span>Xe: <b className="text-white font-mono bg-white/10 px-1 py-0.2 rounded">{strollerId}</b></span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white active:scale-95 transition-all shadow-sm"
              title="Làm mới giỏ hàng"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
            </button>
          )}

          {/* User Auth Quick Link */}
          <Link
            href="/customer/login"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white text-[#0D47A1] hover:bg-blue-50 text-xs font-bold shadow-md transition-all active:scale-95"
            title={user ? `Tài khoản: ${user.name}` : 'Đăng nhập / Đăng ký'}
          >
            {user ? (
              <>
                <div className="w-4 h-4 rounded-full bg-[#0D47A1] text-white flex items-center justify-center text-[10px] font-black">
                  {user.name.charAt(0)}
                </div>
                <span className="text-[11px] max-w-[80px] truncate font-bold">{user.name.split(' ').slice(-1)[0]}</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-[#0D47A1]" />
                <span className="text-[11px] text-[#0D47A1]">Đăng nhập</span>
              </>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
