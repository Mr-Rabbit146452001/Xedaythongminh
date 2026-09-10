'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Kiểm tra nếu là trang web app của khách hàng (/customer)
  const isCustomerRoute = pathname?.startsWith('/customer');

  // Đóng sidebar di động khi chuyển route
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  // 1. Nếu là Web App Khách Hàng (/customer): Trả về 100% giao diện điện thoại (không có thanh Admin)
  if (isCustomerRoute) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
        {children}
      </div>
    );
  }

  // 2. Web App Admin giữ nguyên 100% như cũ (Sidebar bên trái, Topbar ở trên, nội dung ở giữa)
  return (
    <div className="flex bg-background text-on-surface antialiased min-h-screen">
      {/* Sidebar của Admin */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Vùng nội dung chính của Admin */}
      <div className="ml-0 md:ml-sidebar-width flex-1 flex flex-col min-w-0 min-h-screen">
        <Topbar
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />
        <main className="mt-topbar-height p-3 sm:p-gutter-md flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
