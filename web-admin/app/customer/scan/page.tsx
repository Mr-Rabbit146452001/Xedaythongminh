'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, ArrowLeft, Camera, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { CustomerApiService } from '@/services/customerApi';

export default function CustomerScanPage() {
  const router = useRouter();
  const [manualCode, setManualCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isPairing, setIsPairing] = useState(false);
  const [scannerStarted, setScannerStarted] = useState(false);
  const scannerRef = useRef<any>(null);

  const handlePair = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Vui lòng nhập mã xe hoặc quét QR');
      return;
    }

    setIsPairing(true);
    setErrorMsg('');
    try {
      // Lưu mã xe vào localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('smartcart_stroller_id', cleanCode);
      }

      // Gửi tín hiệu ghép nối phiên lên Backend
      await CustomerApiService.pairSession(cleanCode, 'CUST_001');
      setSuccessMsg(`Ghép nối thành công với xe ${cleanCode}!`);

      // Dừng camera nếu đang chạy
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (_) {}
      }

      setTimeout(() => {
        router.push('/customer');
      }, 1200);
    } catch (e: any) {
      setErrorMsg(e.message || 'Lỗi ghép nối phiên');
    } finally {
      setIsPairing(false);
    }
  };

  useEffect(() => {
    // Khởi tạo camera quét mã bằng html5-qrcode
    let html5QrCode: any = null;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        html5QrCode = new Html5Qrcode('qr-reader-container');
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 }
          },
          (decodedText: string) => {
            // Đọc được QR thành công
            handlePair(decodedText);
          },
          () => {}
        );
        setScannerStarted(true);
      } catch (err: any) {
        console.warn('Không thể mở camera:', err);
        setScannerStarted(false);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => {});
        } catch (_) {}
      }
    };
  }, []);

  return (
    <div className="flex flex-col flex-1 p-4 space-y-4 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <Link
          href="/customer"
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-bold text-slate-100 tracking-tight">Ghép Nối Xe Đẩy</h1>
        <div className="w-10" />
      </div>

      {/* Khung Camera Quét QR */}
      <div className="relative bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col items-center justify-center min-h-[300px]">
        <div id="qr-reader-container" className="w-full aspect-square max-w-[280px]" />

        {!scannerStarted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/95 backdrop-blur-md z-10">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 shadow-inner">
              <Camera className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-slate-200 mb-1">Đang kích hoạt Camera Scanner...</p>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Vui lòng cho phép truy cập Camera hoặc sử dụng ô nhập mã xe bên dưới.
            </p>
          </div>
        )}

        {/* Khung ngắm định vị Cyber HUD */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-56 h-56 border-2 border-emerald-400/80 rounded-2xl relative shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl-sm -mt-0.5 -ml-0.5" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr-sm -mt-0.5 -mr-0.5" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl-sm -mb-0.5 -ml-0.5" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br-sm -mb-0.5 -mr-0.5" />
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse absolute top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Thông báo lỗi / thành công */}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/40 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-rose-300 shadow-md">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-300 shadow-md">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Nhập mã thủ công */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3.5 shadow-xl">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Nhập Mã Xe Đẩy Thủ Công
          </h3>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Ví dụ: STR_001"
            className="flex-1 h-14 bg-slate-800/80 border border-slate-700 rounded-2xl px-4 text-base font-mono font-black text-slate-100 uppercase tracking-wider focus:outline-none focus:border-emerald-400 transition-colors shadow-inner"
          />
          <button
            onClick={() => handlePair(manualCode)}
            disabled={isPairing || !manualCode.trim()}
            className="h-14 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 active:scale-95 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
          >
            {isPairing ? 'Đang ghép...' : 'Ghép Xe'}
          </button>
        </div>
        <p className="text-[11px] text-slate-400">
          Mã số xe được in tại góc trên màn hình điều khiển gắn trên tay cầm xe đẩy.
        </p>
      </div>
    </div>
  );
}
