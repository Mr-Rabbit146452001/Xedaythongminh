'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShoppingBag, 
  AlertTriangle, 
  ArrowRight, 
  QrCode, 
  Sparkles, 
  CheckCircle2, 
  Coins, 
  ShieldAlert,
  Plus,
  Minus
} from 'lucide-react';
import MobileHeader from '@/components/customer/MobileHeader';
import { CustomerApiService, CustomerCartItem, CustomerCartSummary } from '@/services/customerApi';

export default function CustomerHomePage() {
  const [cart, setCart] = useState<CustomerCartSummary>({
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
    anomalyDetected: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [strollerId, setStrollerId] = useState('STR_001');

  const fetchCart = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true);
    try {
      const data = await CustomerApiService.getCart();
      setCart(data);
    } catch (err) {
      console.warn('Lỗi fetchCart:', err);
    } finally {
      setIsLoading(false);
      if (showIndicator) setIsRefreshing(false);
    }
  }, []);

  const [pendingSession, setPendingSession] = useState<string | null>(null);
  const [loginStatus, setLoginStatus] = useState<'idle' | 'logging_in' | 'success'>('idle');

  const confirmLoginOnCart = async (sessionId: string) => {
    setLoginStatus('logging_in');
    try {
      const res = await CustomerApiService.confirmLogin(sessionId, 'CUSTOMER_888');
      if (res.status === 'Thành công') {
        setLoginStatus('success');
      }
    } catch (e) {
      console.warn('Lỗi confirmLoginOnCart:', e);
    }
  };

  useEffect(() => {
    // Đọc mã xe và session từ URL nếu khách vừa quét QR trên màn hình đăng nhập xe
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sessionParam = params.get('session');
      const strollerParam = params.get('stroller');

      if (strollerParam) {
        setStrollerId(strollerParam);
        localStorage.setItem('smartcart_stroller_id', strollerParam);
      } else {
        const savedStroller = localStorage.getItem('smartcart_stroller_id') || 'STR_001';
        setStrollerId(savedStroller);
      }

      if (sessionParam) {
        setPendingSession(sessionParam);
        localStorage.setItem('smartcart_session_id', sessionParam);
        // Tự động kích hoạt đăng nhập xe đẩy
        confirmLoginOnCart(sessionParam);
      }
    }

    fetchCart();
    // Tự động thăm dò giỏ hàng mỗi 2.5 giây
    const interval = setInterval(() => {
      fetchCart(false);
    }, 2500);

    return () => clearInterval(interval);
  }, [fetchCart]);

  const tokenAmount = Math.ceil(cart.totalAmount / 10);

  return (
    <div className="flex flex-col flex-1">
      <MobileHeader 
        strollerId={strollerId} 
        onRefresh={() => fetchCart(true)} 
        isRefreshing={isRefreshing}
        itemCount={cart.totalQuantity}
      />

      <main className="p-4 space-y-4 flex-1">
        {/* Banner thông báo khi vừa quét mã QR từ màn hình xe đẩy */}
        {pendingSession && (
          <div className="bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-500/20 border border-emerald-500/40 rounded-2xl p-3.5 shadow-lg flex items-center justify-between animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider block">
                  {loginStatus === 'success' ? 'Đã liên kết xe đẩy thành công' : 'Đang ghép nối với xe đẩy...'}
                </span>
                <p className="text-xs text-slate-200">
                  {loginStatus === 'success' ? 'Màn hình xe đẩy đã tự động đăng nhập!' : 'Đang đồng bộ phiên mua sắm...'}
                </p>
              </div>
            </div>
            {loginStatus !== 'success' && (
              <button
                onClick={() => confirmLoginOnCart(pendingSession)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md active:scale-95 transition-all"
              >
                Đăng nhập
              </button>
            )}
          </div>
        )}

        {/* Banner trạng thái xe đẩy */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-3.5 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">Phiên mua sắm</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <p className="text-sm font-bold text-slate-100">
                Xe đẩy: <span className="text-emerald-400">{strollerId}</span>
              </p>
            </div>
          </div>
          <Link
            href="/customer/scan"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all active:scale-95"
          >
            Đổi xe
          </Link>
        </div>

        {/* Cảnh báo trọng lượng bất thường nếu có */}
        {cart.anomalyDetected && (
          <div className="bg-rose-500/10 border border-rose-500/40 rounded-2xl p-3.5 flex items-start gap-3 animate-pulse">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-rose-300">Cảnh báo chênh lệch trọng lượng!</p>
              <p className="text-rose-200/80 mt-0.5">
                Hệ thống phát hiện trọng lượng trong giỏ không khớp với mã quét. Vui lòng kiểm tra lại món hàng.
              </p>
            </div>
          </div>
        )}

        {/* Tiêu đề danh sách giỏ hàng */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Giỏ Hàng Trong Xe ({cart.totalQuantity})
            </h2>
          </div>
          <span className="text-xs text-slate-400">Tự động đồng bộ</span>
        </div>

        {/* Danh sách món hàng */}
        {isLoading ? (
          <div className="space-y-3 py-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-900/60 rounded-2xl animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : cart.items.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center my-4">
            <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mb-3">
              <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-slate-200 mb-1">Giỏ hàng đang trống</h3>
            <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed mb-4">
              Hãy quét mã vạch sản phẩm và đặt vào xe đẩy thông minh để bắt đầu mua sắm!
            </p>
            <Link
              href="/customer/products"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-emerald-500/20 transition-all"
            >
              Xem danh mục sản phẩm
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {cart.items.map((item) => {
              const itemTotal = item.TotalPrice || item.Price * item.Quantity;
              return (
                <div
                  key={item.Id || item.Barcode}
                  className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-3 flex items-center gap-3 shadow-md transition-all"
                >
                  <div className="w-14 h-14 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-700/50">
                    {item.ImageUrl ? (
                      <img
                        src={`/images/${item.ImageUrl.replace(/^\/images\//, '')}`}
                        alt={item.Name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback icon khi ảnh lỗi
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-100 truncate">{item.Name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.Price.toLocaleString('vi-VN')} đ × <b className="text-emerald-400">{item.Quantity}</b>
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono">Barcode: {item.Barcode}</span>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-bold text-slate-100 block">
                      {itemTotal.toLocaleString('vi-VN')} đ
                    </span>
                    <span className="text-[11px] text-emerald-400 font-medium block">
                      ≈ {Math.ceil(itemTotal / 10).toLocaleString('vi-VN')} Token
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tóm tắt chi phí & Nút Thanh Toán */}
        {cart.items.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-xl mt-4">
            <div className="space-y-1.5 text-xs text-slate-400 pb-3 border-b border-slate-800">
              <div className="flex justify-between">
                <span>Tổng số lượng:</span>
                <span className="font-semibold text-slate-200">{cart.totalQuantity} món</span>
              </div>
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span className="font-semibold text-slate-200">{cart.totalAmount.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Ưu đãi thành viên:</span>
                <span className="font-semibold">Miễn phí dịch vụ</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Tổng thanh toán
                </span>
                <span className="text-xl font-black text-slate-100">
                  {cart.totalAmount.toLocaleString('vi-VN')} <span className="text-sm font-normal text-slate-400">VNĐ</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Quy đổi Token:</span>
                <span className="text-lg font-extrabold text-emerald-400 flex items-center justify-end gap-1">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  {tokenAmount.toLocaleString('vi-VN')}
                </span>
              </div>
            </div>

            <Link
              href="/customer/checkout"
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 active:scale-[0.98] text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all mt-2"
            >
              <span>Thanh Toán Bằng Ví Token</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
