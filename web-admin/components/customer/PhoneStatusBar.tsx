'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wifi, BatteryMedium, Sparkles, Smartphone, LayoutDashboard } from 'lucide-react';

interface PhoneStatusBarProps {
  strollerId?: string;
  isOnline?: boolean;
}

export default function PhoneStatusBar({
  strollerId = 'STR_001',
  isOnline = true
}: PhoneStatusBarProps) {
  const [timeStr, setTimeStr] = useState('18:30');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full select-none bg-black/90 backdrop-blur-md border-b border-slate-800/60 sticky top-0 z-50 pt-2 pb-1.5 px-4 transition-all">
      {/* Top Status Bar: Clock, Dynamic Island, Network/Battery */}
      <div className="flex items-center justify-between h-7 text-slate-200">
        {/* Real-time Clock */}
        <div className="w-20 flex items-center">
          <span className="text-[13px] font-bold font-mono tracking-tight text-slate-100 pl-1">
            {timeStr}
          </span>
        </div>

        {/* Dynamic Island Notch */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className={`cursor-pointer transition-all duration-300 ease-out bg-black border border-slate-800/90 rounded-full flex items-center justify-between px-2.5 py-1 shadow-md shadow-black/80 hover:border-emerald-500/40 ${
            isExpanded ? 'w-56 h-8' : 'w-28 h-6'
          }`}
          title="Nhấn để mở rộng Dynamic Island"
        >
          {/* Camera Punch Hole with Lens Reflection */}
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800 relative flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-emerald-500/80 animate-ping" />
            </div>
            {isExpanded && (
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
                SmartCart
              </span>
            )}
          </div>

          {/* Dynamic Island Status Content */}
          <div className="flex items-center gap-1">
            {isExpanded ? (
              <span className="text-[10px] text-slate-300 font-mono">
                {strollerId} • {isOnline ? 'Online' : 'Offline'}
              </span>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold font-mono text-slate-300">
                  {strollerId}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Status Indicators: 5G, Wi-Fi, Battery */}
        <div className="w-20 flex items-center justify-end gap-1.5 text-slate-300">
          {/* 5G Signal bars */}
          <div className="flex items-end gap-[1.5px] h-2.5" title="Sóng 5G">
            <span className="w-[2.5px] h-1 bg-slate-300 rounded-[0.5px]" />
            <span className="w-[2.5px] h-1.5 bg-slate-300 rounded-[0.5px]" />
            <span className="w-[2.5px] h-2 bg-slate-300 rounded-[0.5px]" />
            <span className="w-[2.5px] h-2.5 bg-emerald-400 rounded-[0.5px]" />
          </div>

          {/* Wi-Fi Icon */}
          <Wifi className="w-3.5 h-3.5 text-slate-200 stroke-[2.2]" />

          {/* Battery Icon with Indicator */}
          <div className="flex items-center gap-0.5" title="Pin: 92%">
            <div className="w-5 h-2.5 rounded-[3.5px] border border-slate-300/80 p-[1px] flex items-center">
              <div className="h-full w-[85%] bg-emerald-400 rounded-[1.5px]" />
            </div>
            <div className="w-[1.5px] h-1 bg-slate-400/80 rounded-r-[1px]" />
          </div>
        </div>
      </div>

      {/* Switch View Quick Bar: Mobile Customer <-> Admin Supermarket */}
      <div className="mt-1.5 pt-1.5 border-t border-slate-800/40 flex items-center justify-between px-1">
        <div className="flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Chế độ hiển thị
          </span>
        </div>

        <div className="flex items-center bg-slate-900/90 border border-slate-800 p-0.5 rounded-lg shadow-inner">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30 shadow-sm">
            <Smartphone className="w-3 h-3 stroke-[2.5]" />
            <span>Khách Hàng</span>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 font-medium text-[10px] transition-all"
            title="Chuyển sang Giao Diện Quản Trị Siêu Thị"
          >
            <LayoutDashboard className="w-3 h-3" />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
