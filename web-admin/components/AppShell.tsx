'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { Smartphone, ArrowRight, X } from 'lucide-react';

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showMobileBanner, setShowMobileBanner] = useState(false);
  const [autoRedirectCountdown, setAutoRedirectCountdown] = useState<number | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isCustomerRoute = pathname?.startsWith('/customer');

  // Detect mobile device on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth < 768;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isMobile = (isSmallScreen && hasTouch) || isMobileUA;

    // Auto-detect and suggest redirect if user lands on root admin '/' from a mobile phone
    if (isMobile && pathname === '/') {
      const userStayed = sessionStorage.getItem('smartcart_stay_admin');
      if (!userStayed) {
        setShowMobileBanner(true);
        setAutoRedirectCountdown(3);
      }
    }
  }, [pathname]);

  // Handle countdown tick
  useEffect(() => {
    if (autoRedirectCountdown === null) return;

    if (autoRedirectCountdown <= 0) {
      router.push('/customer');
      return;
    }

    countdownTimerRef.current = setTimeout(() => {
      setAutoRedirectCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, [autoRedirectCountdown, router]);

  const handleCancelAutoRedirect = () => {
    if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    setAutoRedirectCountdown(null);
    setShowMobileBanner(false);
    sessionStorage.setItem('smartcart_stay_admin', 'true');
  };

  const handleGoToCustomer = () => {
    if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    setShowMobileBanner(false);
    router.push('/customer');
  };

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  // 1. If customer route: 100% full mobile viewport without ANY desktop admin bars
  if (isCustomerRoute) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
        {children}
      </div>
    );
  }

  // 2. If admin route: Render responsive admin layout
  return (
    <div className="flex bg-background text-on-surface antialiased min-h-screen relative">
      {/* Smart Mobile Detection Prompt Banner */}
      {showMobileBanner && (
        <div className="fixed top-3 left-3 right-3 z-[60] bg-slate-900/95 text-white border border-emerald-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Smartphone className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-100">Phát hiện thiết bị di động</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                  Gợi ý
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Bạn đang duyệt từ điện thoại. Khuyên dùng <b className="text-emerald-400">Ứng dụng Khách Hàng Smart Cart</b> để có trải nghiệm mua sắm cảm ứng mượt mà.
                {autoRedirectCountdown !== null && (
                  <span className="block mt-1 text-slate-400 font-medium">
                    Tự động chuyển sau <span className="text-emerald-400 font-bold font-mono">{autoRedirectCountdown}s</span>...
                  </span>
                )}
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleGoToCustomer}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Chuyển sang App Khách Hàng</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelAutoRedirect}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Ở lại trang Quản trị
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCancelAutoRedirect}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Responsive Left Navigation for Admin */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area for Admin: ml-0 on mobile, ml-sidebar-width on desktop */}
      <div className="ml-0 md:ml-sidebar-width flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-200">
        <Topbar
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />
        <main className="mt-topbar-height p-3 sm:p-4 md:p-gutter-md flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
