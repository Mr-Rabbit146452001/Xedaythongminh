'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Smartphone, 
  RotateCcw, 
  QrCode, 
  ArrowLeft, 
  Wifi, 
  BatteryMedium, 
  Sparkles, 
  ExternalLink, 
  Maximize2,
  ZoomIn,
  Check,
  Copy,
  X
} from 'lucide-react';
import CustomerBottomNav from '@/components/customer/CustomerBottomNav';

interface CustomerDeviceShellProps {
  children: React.ReactNode;
}

type DeviceType = 'iphone' | 'android' | 'responsive';

export default function CustomerDeviceShell({ children }: CustomerDeviceShellProps) {
  const pathname = usePathname();

  const [isMobileScreen, setIsMobileScreen] = useState<boolean | null>(null);
  const [deviceType, setDeviceType] = useState<DeviceType>('iphone');
  const [scale, setScale] = useState<number>(100);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState('09:41');
  const [currentUrl, setCurrentUrl] = useState('');

  // Detect screen size and setup live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);

    const checkIsMobile = () => {
      if (typeof window === 'undefined') return false;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmall = window.innerWidth < 768;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      return (isSmall && isTouch) || isSmall || isMobileUA;
    };

    setIsMobileScreen(checkIsMobile());
    setCurrentUrl(typeof window !== 'undefined' ? window.location.href : '');

    const handleResize = () => {
      setIsMobileScreen(checkIsMobile());
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleCopyUrl = async () => {
    if (!currentUrl) return;
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  // Prevent flash during hydration: if state not yet determined, render dark placeholder
  if (isMobileScreen === null) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // 1. MOBILE DEVICE VIEW: 100% Full Viewport, Edge-to-Edge Native PWA
  if (isMobileScreen) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col relative pb-20 selection:bg-emerald-500 selection:text-slate-950">
        {children}
        <CustomerBottomNav />
      </div>
    );
  }

  // 2. DESKTOP VIEW: High-end Studio Mockup Experience
  const deviceWidth = deviceType === 'iphone' ? 'w-[393px]' : deviceType === 'android' ? 'w-[412px]' : 'w-full max-w-md';

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col items-center justify-start relative overflow-x-hidden selection:bg-emerald-500 selection:text-slate-950 py-4 px-4">
      {/* Studio Ambient Backlight Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-primary/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Studio Header Toolbar */}
      <header className="w-full max-w-5xl mb-4 z-20 flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl px-4 py-2.5 shadow-2xl">
        {/* Left: Back to Admin & App Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-xs font-semibold text-slate-200 transition-all hover:text-emerald-400 active:scale-95"
            title="Quay lại trang quản trị cửa hàng"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Admin Dashboard</span>
          </Link>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Smart Cart PWA
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Mobile Studio
            </span>
          </div>
        </div>

        {/* Center: Device Type Switcher */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setDeviceType('iphone')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              deviceType === 'iphone'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>iPhone 16 Pro</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceType('android')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              deviceType === 'android'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Galaxy / Pixel</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceType('responsive')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              deviceType === 'responsive'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Toàn màn hình</span>
          </button>
        </div>

        {/* Right: Scale & QR Real Device Testing */}
        <div className="flex items-center gap-2">
          {/* Zoom Selector */}
          <div className="flex items-center bg-slate-950/80 px-1 py-0.5 rounded-xl border border-slate-800 text-xs text-slate-300">
            <button
              onClick={() => setScale(85)}
              className={`px-2 py-0.5 rounded-lg text-[11px] transition-colors ${scale === 85 ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400'}`}
            >
              85%
            </button>
            <button
              onClick={() => setScale(90)}
              className={`px-2 py-0.5 rounded-lg text-[11px] transition-colors ${scale === 90 ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400'}`}
            >
              90%
            </button>
            <button
              onClick={() => setScale(100)}
              className={`px-2 py-0.5 rounded-lg text-[11px] transition-colors ${scale === 100 ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400'}`}
            >
              100%
            </button>
          </div>

          {/* QR Code Button */}
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-semibold text-emerald-400 active:scale-95 transition-all shadow-sm"
            title="Quét QR để mở trên điện thoại thật"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Thử trên ĐT</span>
          </button>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <div 
        className="relative z-10 transition-transform duration-300 origin-top flex justify-center w-full"
        style={{ transform: `scale(${scale / 100})` }}
      >
        {deviceType === 'responsive' ? (
          /* Responsive Mode: Simple sleek centered frame */
          <div className="w-full max-w-md min-h-[820px] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col pb-20">
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
            <CustomerBottomNav />
          </div>
        ) : (
          /* Phone Mockup Frame: Luxury Titanium Hardware Simulation */
          <div className="relative">
            {/* Realistic Side Buttons on Mockup Exterior */}
            {/* Volume Up */}
            <div className="absolute -left-[14px] top-[140px] w-[5px] h-[48px] bg-slate-700/80 rounded-l-md shadow-inner" />
            {/* Volume Down */}
            <div className="absolute -left-[14px] top-[200px] w-[5px] h-[48px] bg-slate-700/80 rounded-l-md shadow-inner" />
            {/* Action Button */}
            <div className="absolute -left-[14px] top-[95px] w-[5px] h-[26px] bg-emerald-600/80 rounded-l-md shadow-inner" />
            {/* Power Button */}
            <div className="absolute -right-[14px] top-[160px] w-[5px] h-[65px] bg-slate-700/80 rounded-r-md shadow-inner" />

            {/* Hardware Outer Bezel */}
            <div 
              className={`${deviceWidth} h-[844px] bg-slate-950 border-[10px] ${
                deviceType === 'iphone' ? 'border-[#262b35] rounded-[54px]' : 'border-[#1e232d] rounded-[44px]'
              } shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95),0_0_50px_rgba(16,185,129,0.12)] ring-1 ring-white/10 relative overflow-hidden flex flex-col transform-gpu`}
            >
              {/* Glass Reflection Highlight on Bezel */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-white/5 to-transparent rounded-full pointer-events-none z-50" />

              {/* Status Bar */}
              <div className="h-11 px-6 pt-2 shrink-0 flex items-center justify-between z-40 bg-slate-950/80 backdrop-blur-md select-none text-slate-300">
                {/* Time */}
                <span className="text-xs font-semibold tracking-tight font-mono">{currentTime}</span>

                {/* Camera / Dynamic Island Center */}
                {deviceType === 'iphone' ? (
                  <div className="w-[105px] h-[26px] bg-black rounded-full flex items-center justify-between px-3 shadow-inner ring-1 ring-white/5 mx-auto">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-emerald-500/80 animate-pulse" />
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                  </div>
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full bg-black ring-2 ring-slate-800 mx-auto flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  </div>
                )}

                {/* Status Icons: 5G, Wifi, Battery */}
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="text-[10px] font-bold tracking-tighter">5G</span>
                  <Wifi className="w-3.5 h-3.5 text-slate-300" />
                  <div className="flex items-center gap-0.5">
                    <div className="w-5 h-2.5 rounded-[4px] border border-slate-300 p-0.5 flex items-center">
                      <div className="w-full h-full bg-emerald-400 rounded-[2px]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone Display Screen (Scrollable Body) */}
              <div className="flex-1 overflow-y-auto relative flex flex-col pb-20 custom-device-scroll">
                {children}
              </div>

              {/* Pinned Bottom Navigation Inside Phone Screen */}
              <CustomerBottomNav />

              {/* Bottom Home Indicator Bar */}
              <div className="h-5 shrink-0 bg-slate-950 flex items-center justify-center pointer-events-none z-40">
                <div className="w-32 h-1 rounded-full bg-slate-600/70" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Real Device Testing QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative flex flex-col items-center text-center">
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-100 mb-1">Quét Mở Trên Điện Thoại</h3>
            <p className="text-xs text-slate-400 mb-4">
              Mở Camera điện thoại hoặc Zalo để quét mã và trải nghiệm ứng dụng trực tiếp trên màn hình cảm ứng thật.
            </p>

            {/* QR Code Container */}
            <div className="p-3 bg-white rounded-2xl shadow-xl mb-4 border-2 border-emerald-500/30">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  currentUrl || 'http://localhost:3001/customer'
                )}`}
                alt="QR Code Smart Cart Customer App"
                width={180}
                height={180}
                className="rounded-lg"
              />
            </div>

            {/* URL Display & Copy */}
            <div className="w-full flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs mb-3">
              <span className="text-slate-400 truncate flex-1 text-left font-mono">
                {currentUrl || 'http://localhost:3001/customer'}
              </span>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-2 py-1 rounded-lg bg-slate-800 text-slate-200 hover:text-emerald-400 transition-colors flex items-center gap-1 font-semibold text-[11px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã sao chép' : 'Copy'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              💡 Mẹo: Đảm bảo điện thoại và máy tính kết nối cùng mạng Wi-Fi (dùng IP LAN) hoặc đường hầm Ngrok.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
