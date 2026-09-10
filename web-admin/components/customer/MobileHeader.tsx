'use client';

import React from 'react';
import { ShoppingCart, Wifi, Sparkles, RefreshCw } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShoppingCart className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-100 tracking-tight">SMART CART</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">
                PWA
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Xe: <b className="text-slate-200">{strollerId}</b></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-emerald-400 active:scale-95 transition-all"
              title="Làm mới giỏ hàng"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          )}

          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 font-medium">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
