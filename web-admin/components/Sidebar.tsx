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
  { name: 'Khuyến mãi', href: '#', icon: 'sell' },
  { name: 'Báo cáo', href: '#', icon: 'assessment' },
  { name: 'Nhân viên', href: '#', icon: 'badge' },
  { name: 'Cài đặt', href: '#', icon: 'settings' },
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

      {/* Sidebar Drawer */}
      <aside
        className={`fixed left-0 top-0 h-screen w-[280px] md:w-sidebar-width bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col py-6 px-4 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand & Mobile Close Button */}
        <div className="flex items-center justify-between px-2 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white p-1 shadow-md border border-[#0D47A1]/20 flex items-center justify-center shrink-0">
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
              <h1 className="text-lg font-black text-[#0D47A1] tracking-tight uppercase">SMART STROLLER</h1>
              <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                IoT Admin Intelligence
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-2 text-on-surface-variant hover:text-primary rounded-xl hover:bg-surface-container-high transition-colors"
            title="Đóng menu"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto pr-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-primary-fixed text-on-primary-fixed-variant shadow-sm'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`material-symbols-outlined text-xl ${
                    isActive ? 'filled text-primary' : ''
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Account */}
      <div className="mt-auto border-t border-outline-variant/30 pt-4 flex flex-col gap-1 text-sm font-semibold text-on-surface-variant">
        <Link
          href="#"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:text-primary hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-xl">account_circle</span>
          <span>Hồ sơ quản trị</span>
        </Link>
        <Link
          href="#"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:text-danger hover:bg-error-container/40 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span>Đăng xuất</span>
        </Link>
      </div>
    </aside>
    </>
  );
}
