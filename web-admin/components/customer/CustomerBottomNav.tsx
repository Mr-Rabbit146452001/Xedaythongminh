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
    <nav className="fixed md:absolute bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="w-full max-w-md mx-auto pointer-events-auto">
        <div className="mx-3 mb-2 sm:mb-3 bg-slate-950/90 backdrop-blur-2xl border border-slate-800/80 rounded-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.7),0_0_20px_rgba(16,185,129,0.08)] px-2 py-1.5 flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1 px-2 rounded-xl transition-all duration-200 select-none active:scale-95 ${
                  isActive
                    ? 'text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 shadow-sm shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5] scale-110 text-emerald-400' : 'stroke-[1.75]'}`} />
                  {isActive && (
                    <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
                  )}
                </div>
                <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'text-emerald-400 font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
