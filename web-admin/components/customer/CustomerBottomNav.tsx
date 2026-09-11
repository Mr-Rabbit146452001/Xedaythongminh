'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Wallet, PackageSearch, UserCircle } from 'lucide-react';

const navItems = [
  { label: 'Giỏ Hàng', href: '/customer', icon: ShoppingBag },
  { label: 'Ví Token', href: '/customer/wallet', icon: Wallet },
  { label: 'Sản Phẩm', href: '/customer/products', icon: PackageSearch },
  { label: 'Tài Khoản', href: '/customer/login', icon: UserCircle },
];

export default function CustomerBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed md:absolute bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="w-full max-w-md mx-auto pointer-events-auto">
        <div className="mx-3 mb-2 sm:mb-3 bg-white/95 backdrop-blur-2xl border border-[#E0E0E0] rounded-2xl shadow-[0_10px_30px_rgba(13,71,161,0.15)] px-2 py-1.5 flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1 px-2 rounded-xl transition-all duration-200 select-none active:scale-95 ${
                  isActive
                    ? 'text-[#0D47A1] font-extrabold bg-[#E3F2FD] border border-[#0D47A1]/20 shadow-sm'
                    : 'text-[#666666] hover:text-[#1A1A1A] hover:bg-gray-100'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5] scale-110 text-[#0D47A1]' : 'stroke-[1.75]'}`} />
                  {isActive && (
                    <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#0D47A1] animate-ping opacity-75" />
                  )}
                </div>
                <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'text-[#0D47A1] font-bold' : 'font-medium'}`}>
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
