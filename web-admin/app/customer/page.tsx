'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  ArrowRight, 
  QrCode, 
  Sparkles, 
  CheckCircle2, 
  Coins, 
  ShieldAlert,
  PackageSearch,
  ExternalLink,
  Tag,
  Layers,
  Check
} from 'lucide-react';
import MobileHeader from '@/components/customer/MobileHeader';
import { CustomerApiService, CustomerCartSummary } from '@/services/customerApi';

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
      const storedUser = CustomerApiService.getStoredCustomer();
      const customerId = storedUser ? storedUser.id : 'CUSTOMER_888';
      const res = await CustomerApiService.confirmLogin(sessionId, customerId);
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
    <div className="flex flex-col flex-1 pb-10">
      {/* Mobile Top App Bar */}
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
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md active:scale-95 transition-all"
              >
                Đăng nhập
              </button>
            )}
          </div>
        )}

        {/* Card Trạng Thái Xe Đẩy & Phiên IoT */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-medium">Phiên mua sắm IoT</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>
              <p className="text-base font-black text-slate-100 mt-0.5 tracking-tight">
                Xe đẩy: <span className="text-emerald-400 font-mono">{strollerId}</span>
              </p>
            </div>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400 flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Đã kết nối</span>
          </div>
        </div>

        {/* Cảnh báo trọng lượng bất thường nếu có */}
        {cart.anomalyDetected && (
          <div className="bg-rose-500/10 border border-rose-500/40 rounded-2xl p-3.5 flex items-start gap-3 animate-pulse shadow-lg shadow-rose-500/5">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-rose-300">Cảnh báo chênh lệch trọng lượng!</p>
              <p className="text-rose-200/80 mt-0.5 leading-relaxed">
                Hệ thống cảm biến phát hiện trọng lượng trong giỏ không khớp với mã sản phẩm vừa quét. Vui lòng kiểm tra lại món hàng.
              </p>
            </div>
          </div>
        )}

        {/* Tiêu đề danh sách giỏ hàng & Badge số lượng */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Sản Phẩm Trong Xe
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/30">
              {cart.totalQuantity}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Sync
          </span>
        </div>

        {/* Danh sách món hàng vuốt chạm mượt mà */}
        {isLoading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-900/60 rounded-2xl animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : cart.items.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center my-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-slate-500 mb-3 shadow-inner">
              <ShoppingBag className="w-8 h-8 stroke-[1.5] text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-200 mb-1">Giỏ hàng đang trống</h3>
            <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed mb-5">
              Hãy quét mã vạch sản phẩm và đặt vào xe đẩy thông minh để bắt đầu mua sắm!
            </p>
            <Link
              href="/customer/products"
              className="px-5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold text-emerald-400 border border-emerald-500/30 transition-all flex items-center gap-2 active:scale-95"
            >
              <PackageSearch className="w-4 h-4" />
              <span>Khám phá sản phẩm</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {cart.items.map((item) => {
              const itemTotal = item.TotalPrice || item.Price * item.Quantity;
              return (
                <div
                  key={item.Id || item.Barcode}
                  className="bg-slate-900/90 border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl p-3.5 flex items-center gap-3.5 shadow-md transition-all active:scale-[0.99]"
                >
                  {/* Ảnh sản phẩm */}
                  <div className="w-16 h-16 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-700/60 relative">
                    {item.ImageUrl ? (
                      <img
                        src={`/images/${item.ImageUrl.replace(/^\/images\//, '')}`}
                        alt={item.Name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <ShoppingBag className="w-7 h-7 text-slate-600" />
                    )}
                    {/* Badge số lượng trên ảnh */}
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-bold font-mono text-emerald-400 border border-emerald-500/30">
                      x{item.Quantity}
                    </span>
                  </div>

                  {/* Thông tin sản phẩm */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-100 truncate tracking-tight">
                      {item.Name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {item.Price.toLocaleString('vi-VN')} đ × <span className="font-bold text-emerald-400">{item.Quantity}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-500 font-mono bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/50">
                        {item.Barcode}
                      </span>
                    </div>
                  </div>

                  {/* Giá thành & Token */}
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-black text-slate-100 block tracking-tight">
                      {itemTotal.toLocaleString('vi-VN')} đ
                    </span>
                    <span className="text-[11px] text-emerald-400 font-bold flex items-center justify-end gap-1 mt-0.5">
                      <Coins className="w-3 h-3 text-emerald-400" />
                      {Math.ceil(itemTotal / 10).toLocaleString('vi-VN')} T
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tóm Tắt Chi Phí & Nút Thanh Toán Nổi Bật (Thumb-friendly dock) */}
        {cart.items.length > 0 && (
          <div className="bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/90 rounded-3xl p-4 space-y-3.5 shadow-2xl mt-4">
            {/* Chi tiết tính tiền */}
            <div className="space-y-2 text-xs text-slate-400 pb-3.5 border-b border-slate-800">
              <div className="flex justify-between">
                <span>Số lượng sản phẩm:</span>
                <span className="font-semibold text-slate-200 font-mono">{cart.totalQuantity} món</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng tiền hàng:</span>
                <span className="font-semibold text-slate-200 font-mono">{cart.totalAmount.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Ưu đãi thành viên:</span>
                </span>
                <span className="font-bold">Miễn phí dịch vụ IoT</span>
              </div>
            </div>

            {/* Tổng cộng & Quy đổi Token */}
            <div className="flex items-center justify-between pt-0.5">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                  Tổng Thanh Toán
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-slate-100 tracking-tight">
                    {cart.totalAmount.toLocaleString('vi-VN')}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">VNĐ</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                  Quy Đổi Ví Token
                </span>
                <span className="text-xl font-black text-emerald-400 flex items-center justify-end gap-1 mt-0.5">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  {tokenAmount.toLocaleString('vi-VN')}
                </span>
              </div>
            </div>

            {/* Nút Thanh Toán Nổi Bật Chuẩn FinTech */}
            <Link
              href="/customer/checkout"
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 active:scale-[0.98] text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all mt-3 select-none"
            >
              <span>Thanh Toán Bằng Ví Token</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
