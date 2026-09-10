import React from 'react';
import type { Metadata, Viewport } from 'next';
import CustomerBottomNav from '@/components/customer/CustomerBottomNav';

export const metadata: Metadata = {
  title: 'Smart Cart — Ứng Dụng Khách Hàng',
  description: 'Trải nghiệm mua sắm tự động, đồng bộ giỏ hàng và thanh toán không tiền mặt trên xe đẩy thông minh.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start antialiased selection:bg-emerald-500 selection:text-slate-950">
      {/* Mobile Screen Shell Wrapper */}
      <div className="w-full max-w-md min-h-screen bg-slate-950 flex flex-col relative border-x border-slate-800/40 shadow-2xl shadow-emerald-500/5 pb-20">
        {children}
        <CustomerBottomNav />
      </div>
    </div>
  );
}
