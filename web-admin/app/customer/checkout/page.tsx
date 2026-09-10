'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Coins, 
  Receipt, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  QrCode,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import PinModal from '@/components/customer/PinModal';
import { CustomerApiService, CustomerCartSummary, BankAccount } from '@/services/customerApi';

export default function CustomerCheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CustomerCartSummary | null>(null);
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [receiptData, setReceiptData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const [cartData, accData] = await Promise.all([
        CustomerApiService.getCart(),
        CustomerApiService.getAccount('ACC_CUSTOMER_01')
      ]);
      setCart(cartData);
      setAccount(accData);
    };
    load();
  }, []);

  const totalAmount = cart ? cart.totalAmount : 0;
  const tokenAmount = Math.ceil(totalAmount / 10);
  const currentTokenBalance = account ? account.tokenBalance : 0;
  const isBalanceEnough = currentTokenBalance >= tokenAmount;

  const handleConfirmPin = async (pin: string) => {
    setIsPinOpen(false);
    setIsProcessing(true);
    setErrorMsg('');

    try {
      // 1. Tạo chuỗi QR giả lập đơn hàng
      const orderId = 'ORD_' + Date.now();
      const qrData = JSON.stringify({
        orderId,
        storeAccount: 'ACC_STORE_MAIN',
        tokenAmount,
        vndAmount: totalAmount,
        timestamp: Date.now()
      });

      // 2. Gọi API thanh toán Mock Bank
      const payRes = await CustomerApiService.payQr(qrData, pin);
      if (!payRes.success) {
        throw new Error(payRes.message || payRes.errorCode || 'Thanh toán thất bại');
      }

      // 3. Hoàn tất đơn hàng trên Shop Server (xóa giỏ và lưu lịch sử)
      await CustomerApiService.checkout('QR_TOKEN', 'CUST_001');

      // 4. Lưu dữ liệu hóa đơn điện tử
      setReceiptData({
        orderId,
        items: cart?.items || [],
        totalVnd: totalAmount,
        totalToken: tokenAmount,
        balanceAfter: payRes.data?.tokenBalanceAfter ?? (currentTokenBalance - tokenAmount),
        paidAt: new Date().toLocaleString('vi-VN'),
        gateBarcode: 'EXIT_' + Math.random().toString(36).substring(2, 10).toUpperCase()
      });
    } catch (e: any) {
      setErrorMsg(e.message || 'Lỗi xử lý thanh toán');
    } finally {
      setIsProcessing(false);
    }
  };

  // MÀN HÌNH HÓA ĐƠN ĐIỆN TỬ (E-RECEIPT) KHI THANH TOÁN THÀNH CÔNG
  if (receiptData) {
    return (
      <div className="flex flex-col flex-1 p-4 space-y-4 animate-in fade-in duration-300">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-100">Thanh Toán Thành Công!</h2>
          <p className="text-xs text-slate-400 mt-1">Hóa đơn điện tử đã được ghi nhận</p>
        </div>

        {/* Khung Hóa Đơn E-Receipt Phong Cách Vé Điện Tử */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 relative">
          <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Mã đơn hàng</span>
              <span className="text-xs font-mono font-bold text-slate-200">{receiptData.orderId}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Thời gian</span>
              <span className="text-xs font-medium text-slate-300">{receiptData.paidAt}</span>
            </div>
          </div>

          {/* Danh sách món */}
          <div className="space-y-2 py-1 max-h-48 overflow-y-auto">
            {receiptData.items.map((item: any) => (
              <div key={item.Barcode} className="flex justify-between text-xs">
                <span className="text-slate-300 truncate max-w-[180px]">
                  {item.Name} × {item.Quantity}
                </span>
                <span className="font-semibold text-slate-200">
                  {(item.TotalPrice || item.Price * item.Quantity).toLocaleString('vi-VN')} đ
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-dashed border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Tổng tiền VNĐ:</span>
              <span className="font-bold text-slate-100">{receiptData.totalVnd.toLocaleString('vi-VN')} VNĐ</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Đã trừ Token:</span>
              <span>-{receiptData.totalToken.toLocaleString('vi-VN')} Token</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Số dư Token còn lại:</span>
              <span className="font-mono text-slate-200">{receiptData.balanceAfter.toLocaleString('vi-VN')} Token</span>
            </div>
          </div>

          {/* MÃ VẠCH QUA CỔNG KIỂM SOÁT RA VỀ */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 bg-slate-950/60 rounded-2xl p-4 text-center space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block">
              Mã vạch qua cửa kiểm soát (Exit Gate)
            </span>
            <div className="w-full h-14 bg-white rounded-lg p-2 flex items-center justify-center shadow-inner">
              {/* Giả lập Barcode bằng CSS stripes */}
              <div className="w-full h-full bg-[repeating-linear-gradient(90deg,#000,#000_2px,#fff_2px,#fff_4px,#000_4px,#000_8px,#fff_8px,#fff_10px)]" />
            </div>
            <span className="text-xs font-mono font-bold tracking-widest text-slate-300 block">
              {receiptData.gateBarcode}
            </span>
            <p className="text-[10px] text-slate-500">
              Đưa mã vạch này lên máy quét tại cổng ra để mở cửa tự động.
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/customer')}
          className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
        >
          Hoàn tất & Mua sắm phiên mới
        </button>
      </div>
    );
  }

  // MÀN HÌNH XÁC NHẬN THANH TOÁN
  return (
    <div className="flex flex-col flex-1 p-4 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <Link
          href="/customer"
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-bold text-slate-100 tracking-tight">Xác Nhận Thanh Toán</h1>
        <div className="w-9" />
      </div>

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/40 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Chi tiết đơn hàng */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-slate-200 uppercase tracking-wider">
          <Receipt className="w-4 h-4 text-emerald-400" />
          <span>Tóm Tắt Đơn Hàng</span>
        </div>

        <div className="space-y-2 py-1 max-h-40 overflow-y-auto">
          {cart?.items.map((item) => (
            <div key={item.Barcode} className="flex justify-between text-xs">
              <span className="text-slate-300 truncate max-w-[200px]">
                {item.Name} × <b className="text-emerald-400">{item.Quantity}</b>
              </span>
              <span className="font-semibold text-slate-200">
                {(item.TotalPrice || item.Price * item.Quantity).toLocaleString('vi-VN')} đ
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-800 space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Tổng giá trị đơn:</span>
            <span className="font-semibold text-slate-200">{totalAmount.toLocaleString('vi-VN')} VNĐ</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-slate-400">Số Token cần thanh toán:</span>
            <span className="text-xl font-black text-emerald-400 flex items-center gap-1">
              <Coins className="w-5 h-5 text-emerald-400" />
              {tokenAmount.toLocaleString('vi-VN')} Token
            </span>
          </div>
        </div>
      </div>

      {/* Số dư ví người dùng */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center justify-between shadow-lg">
        <div>
          <span className="text-[11px] text-slate-400 block">Ví thanh toán ({account?.accountNumber || 'ACC_CUSTOMER_01'})</span>
          <span className="text-sm font-bold text-slate-100">
            Số dư: <b className="text-emerald-400">{currentTokenBalance.toLocaleString('vi-VN')} Token</b>
          </span>
        </div>
        {!isBalanceEnough && (
          <Link
            href="/customer/wallet"
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs font-bold text-rose-300"
          >
            Nạp thêm Token
          </Link>
        )}
      </div>

      {!isBalanceEnough && (
        <p className="text-xs text-rose-400 text-center font-medium">
          Số dư Token không đủ để thanh toán. Vui lòng vào mục Ví Token để nạp thêm.
        </p>
      )}

      {/* Nút Kích Hoạt Nhập PIN */}
      <button
        onClick={() => setIsPinOpen(true)}
        disabled={!isBalanceEnough || isProcessing || totalAmount <= 0}
        className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 active:scale-[0.98] disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all mt-auto"
      >
        <ShieldCheck className="w-4 h-4" />
        <span>{isProcessing ? 'Đang giao dịch...' : 'Xác Nhận & Nhập PIN'}</span>
      </button>

      {/* Modal Bàn Phím Số PIN */}
      <PinModal
        isOpen={isPinOpen}
        onClose={() => setIsPinOpen(false)}
        onConfirm={handleConfirmPin}
        amountToken={tokenAmount}
        amountVnd={totalAmount}
        isLoading={isProcessing}
      />
    </div>
  );
}
