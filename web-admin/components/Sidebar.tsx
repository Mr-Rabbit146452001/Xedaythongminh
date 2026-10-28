'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Tổng quan', href: '/', icon: 'dashboard' },
  { name: 'Đơn hàng', href: '/orders', icon: 'shopping_cart' },
  { name: 'Sản phẩm', href: '/products', icon: 'inventory_2' },
  { name: 'Kho hàng', href: '/inventory', icon: 'warehouse' },
  { name: 'Smart Cart', href: '/smart-cart', icon: 'shopping_basket', badge: 'IoT' },
  { name: 'Khách hàng', href: '/customers', icon: 'group', badge: 'DB' },
  { name: 'Khách hàng (Mobile)', href: '/customer', icon: 'smartphone', badge: 'PWA' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer với Hình nền Thủy tinh Hữu cơ (Organic Glass) */}
      <aside
        className={`fixed left-0 top-0 h-screen w-[260px] md:w-sidebar-width border-r border-white/60 flex flex-col py-5 px-3 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 overflow-hidden shadow-lg ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
        style={{
          backgroundImage: "url('/bg_tablet_organic_glass.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'left top',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Lớp phủ Thủy tinh Mờ (Frosted Organic Glassmorphism) */}
        <div
          className="absolute inset-0 bg-white/45 backdrop-blur-[6px] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-white/35 via-transparent to-[#0D47A1]/10 pointer-events-none"
          aria-hidden="true"
        />

        {/* Nội dung Sidebar */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Brand & Mobile Close Button */}
          <div className="flex items-center justify-between px-3 py-2.5 mb-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-[0_4px_16px_rgba(13,71,161,0.06)]">
            <div className="flex items-center gap-2.5">
              <img
                src="/img_smart_cart_logo.png"
                alt="Smart Cart Logo"
                className="h-9 w-auto max-w-[65px] object-contain drop-shadow transition-transform hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
              <div>
                <h1 className="text-base font-black text-[#0D47A1] tracking-tight uppercase leading-none">
                  SMART CART
                </h1>
                <p className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Retail Intelligence
                </p>
              </div>
            </div>

            {/* Close button on mobile */}
            <button
              onClick={onClose}
              className="md:hidden p-1.5 text-slate-600 hover:text-primary rounded-xl hover:bg-white/80 transition-colors"
              title="Đóng menu"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 pr-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-white/95 text-[#0D47A1] shadow-[0_4px_14px_rgba(13,71,161,0.14)] border border-white font-bold backdrop-blur-md'
                      : 'text-slate-700 hover:text-[#0D47A1] hover:bg-white/60 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-xl ${
                        isActive ? 'filled text-[#0D47A1]' : 'text-slate-600'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#0D47A1]/10 text-[#0D47A1] border border-[#0D47A1]/20">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="my-3 border-t border-white/60 mx-1" />

          {/* Management / Account Section */}
          <div className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
            <Link
              href="#"
              onClick={onClose}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:text-[#0D47A1] hover:bg-white/60 transition-colors"
            >
              <span className="material-symbols-outlined text-xl text-slate-600">account_circle</span>
              <span>Hồ sơ quản trị</span>
            </Link>
            <Link
              href="#"
              onClick={onClose}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50/70 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              <span>Đăng xuất</span>
            </Link>
          </div>

          {/* Brand Partner Badge matching Android app */}
          <div className="mt-auto pt-2.5 pb-1 px-3 flex items-center justify-between text-[11px] text-slate-600/80 border-t border-white/50 bg-white/40 backdrop-blur-xs rounded-xl border">
            <span className="font-semibold">Hệ thống Xe đẩy IoT</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/im_logovt.png"
              alt="Partner Logo"
              className="h-5 w-auto object-contain opacity-85"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
