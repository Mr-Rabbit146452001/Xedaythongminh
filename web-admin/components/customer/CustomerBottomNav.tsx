'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, QrCode, Wallet, PackageSearch } from 'lucide-react';

const navItems = [
  { label: 'Giỏ Hàng', href: '/customer', icon: ShoppingBag },
  { label: 'Quét Xe', href: '/customer/scan', icon: QrCode },
  { label: 'Ví Token', href: '/customer/wallet', icon: Wallet },
  { label: 'Sản Phẩm', href: '/customer/products', icon: PackageSearch },
];

export default function CustomerBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 py-1 transition-all duration-200 ${
                isActive
                  ? 'text-emerald-400 font-semibold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
