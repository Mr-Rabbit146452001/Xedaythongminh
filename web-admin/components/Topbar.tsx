'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TopbarProps {
  onRefresh?: () => void;
  onToggleMobileSidebar?: () => void;
}

export default function Topbar({ onRefresh, onToggleMobileSidebar }: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-260px)] h-topbar-height bg-surface-container-lowest/90 border-b border-outline-variant/30 backdrop-blur-md shadow-sm flex justify-between items-center px-3 sm:px-gutter-md z-40 transition-all">
      {/* Mobile Hamburger Menu Toggle */}
      <button
        type="button"
        onClick={onToggleMobileSidebar}
        className="md:hidden p-2 -ml-1 mr-2 text-on-surface-variant hover:text-primary rounded-xl hover:bg-surface-container-high transition-colors active:scale-95"
        title="Mở menu quản trị"
        aria-label="Mở menu"
      >
        <span className="material-symbols-outlined text-2xl">menu</span>
      </button>

      {/* Search Input */}
      <div className="flex-1 max-w-xs sm:max-w-md relative">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm sản phẩm, đơn hàng, xe đẩy..."
          className="w-full bg-surface-container-low border-none rounded-full py-2 pl-11 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all shadow-inner"
        />
      </div>

      {/* Action Buttons & Avatar */}
      <div className="flex items-center gap-2">
        {/* Switch View Button to Mobile Customer */}
        <Link
          href="/customer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0D47A1] hover:bg-[#1565C0] text-white text-xs font-bold transition-all active:scale-95 shadow-md"
          title="Chuyển sang giao diện Mobile Khách Hàng (PWA)"
        >
          <img src="/img_smart_cart_logo.png" alt="Logo" className="w-4 h-4 object-contain bg-white rounded-full p-0.5" onError={(e) => {(e.target as HTMLImageElement).src = '/logo.png';}} />
          <span className="hidden md:inline">Giao Diện Khách Hàng (PWA)</span>
        </Link>

        <button
          onClick={onRefresh}
          title="Làm mới dữ liệu"
          className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-high active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">refresh</span>
        </button>

        <button
          title="Thông báo"
          className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-high active:scale-95 relative"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-white"></span>
        </button>

        <button
          title="Cài đặt hệ thống"
          className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-high active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">settings</span>
        </button>

        <div className="h-6 w-px bg-outline-variant/40 mx-2"></div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full hover:bg-surface-container-high transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            AD
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold text-on-surface leading-tight group-hover:text-primary transition-colors">
              Quản trị viên
            </span>
            <span className="text-[11px] text-on-surface-variant leading-none">Admin Store</span>
          </div>
          <span className="material-symbols-outlined text-sm text-outline-variant">expand_more</span>
        </div>
      </div>
    </header>
  );
}
