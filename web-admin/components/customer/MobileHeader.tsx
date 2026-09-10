'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Wifi, Sparkles, RefreshCw, LayoutDashboard } from 'lucide-react';

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
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Brand & Stroller ID */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 flex items-center justify-center shadow-lg shadow-emerald-500/25 border border-emerald-400/30">
            <ShoppingCart className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-slate-100 tracking-tight">SMART CART</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                PWA
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Xe: <b className="text-slate-200 font-mono">{strollerId}</b></span>
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
              className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/30 active:scale-95 transition-all shadow-sm"
              title="Làm mới giỏ hàng"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          )}

          {/* Online Tag */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 font-semibold shadow-sm">
            <Wifi className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
            <span className="text-[11px]">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
