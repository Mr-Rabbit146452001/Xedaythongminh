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
  { name: 'Khách hàng', href: '#', icon: 'group' },
  { name: 'Khuyến mãi', href: '#', icon: 'sell' },
  { name: 'Báo cáo', href: '#', icon: 'assessment' },
  { name: 'Nhân viên', href: '#', icon: 'badge' },
  { name: 'Cài đặt', href: '#', icon: 'settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-sidebar-width bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col py-6 px-4 z-50">
      {/* Brand */}
      <div className="flex items-center gap-3 px-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-white shadow-sm">
          <span className="material-symbols-outlined text-2xl">shopping_basket</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-primary tracking-tight">SMART CART</h1>
          <p className="text-xs font-medium text-on-surface-variant">Retail Intelligence</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto pr-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
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
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:text-primary hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-xl">account_circle</span>
          <span>Hồ sơ quản trị</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:text-danger hover:bg-error-container/40 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span>Đăng xuất</span>
        </Link>
      </div>
    </aside>
  );
}
