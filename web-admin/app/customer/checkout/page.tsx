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
  ArrowRight,
  Wallet,
  Sparkles
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
      <div className="flex flex-col flex-1 p-4 space-y-4 animate-in fade-in duration-300 pb-16 bg-[#F8F9FA] text-[#1A1A1A]">
        <div className="text-center py-4">
          <div className="w-18 h-18 rounded-3xl bg-[#E3F2FD] border-2 border-[#0D47A1] flex items-center justify-center mx-auto mb-3 shadow-xl">
            <CheckCircle2 className="w-10 h-10 text-[#0D47A1] stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black text-[#0D47A1] tracking-tight uppercase">Thanh Toán Thành Công!</h2>
          <p className="text-xs font-semibold text-[#666666] mt-1">Hóa đơn điện tử & vé thông hành cổng ra</p>
        </div>

        {/* Khung Hóa Đơn E-Receipt Phong Cách Vé Điện Tử */}
        <div className="bg-white border border-[#E0E0E0] rounded-3xl p-5 shadow-xl space-y-4 relative">
          <div className="flex items-center justify-between pb-3 border-b border-dashed border-gray-300">
            <div>
              <span className="text-[10px] text-[#666666] uppercase tracking-wider block font-bold">Mã đơn hàng</span>
              <span className="text-xs font-mono font-black text-[#0D47A1]">{receiptData.orderId}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#666666] uppercase tracking-wider block font-bold">Thời gian</span>
              <span className="text-xs font-semibold text-[#1A1A1A]">{receiptData.paidAt}</span>
            </div>
          </div>

          {/* Danh sách món */}
          <div className="space-y-2 py-1 max-h-48 overflow-y-auto">
            {receiptData.items.map((item: any) => (
              <div key={item.Barcode} className="flex justify-between text-xs py-1 border-b border-gray-100">
                <span className="text-[#1A1A1A] truncate max-w-[180px] font-medium">
                  {item.Name} × <b className="text-[#0D47A1]">{item.Quantity}</b>
                </span>
                <span className="font-bold text-[#0D47A1] font-mono">
                  {(item.TotalPrice || item.Price * item.Quantity).toLocaleString('vi-VN')} đ
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-dashed border-gray-300 space-y-2 text-xs">
            <div className="flex justify-between text-[#666666]">
              <span>Tổng tiền VNĐ:</span>
              <span className="font-bold text-[#1A1A1A] font-mono">{receiptData.totalVnd.toLocaleString('vi-VN')} VNĐ</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Đã thanh toán Token:</span>
              <span className="font-mono">-{receiptData.totalToken.toLocaleString('vi-VN')} Token</span>
            </div>
            <div className="flex justify-between text-[#666666]">
              <span>Số dư Token còn lại:</span>
              <span className="font-mono font-bold text-[#0D47A1]">{receiptData.balanceAfter.toLocaleString('vi-VN')} Token</span>
            </div>
          </div>

          {/* MÃ VẠCH QUA CỔNG KIỂM SOÁT RA VỀ */}
          <div className="mt-4 pt-4 border-t border-gray-200 bg-[#E3F2FD] rounded-2xl p-4 text-center space-y-2.5 border border-blue-200">
            <div className="flex items-center justify-center gap-1 text-[11px] uppercase tracking-wider text-[#0D47A1] font-black">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mã vạch qua cửa kiểm soát (Exit Gate)</span>
            </div>
            <div className="w-full h-16 bg-white rounded-xl p-2.5 flex items-center justify-center shadow-inner border border-blue-200">
              {/* Giả lập Barcode bằng CSS stripes */}
              <div className="w-full h-full bg-[repeating-linear-gradient(90deg,#000,#000_2px,#fff_2px,#fff_4px,#000_4px,#000_8px,#fff_8px,#fff_10px)] rounded" />
            </div>
            <span className="text-sm font-mono font-black tracking-widest text-[#0D47A1] block">
              {receiptData.gateBarcode}
            </span>
            <p className="text-[11px] text-[#666666] font-medium">
              Đưa mã vạch này lên máy quét tại cổng ra để mở cửa tự động không cần thu ngân.
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/customer')}
          className="w-full h-14 rounded-2xl bg-[#0D47A1] hover:bg-[#1565C0] text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-blue-900/20 active:scale-98"
        >
          Hoàn tất & Mua sắm phiên mới
        </button>
      </div>
    );
  }

  // MÀN HÌNH XÁC NHẬN THANH TOÁN
  return (
    <div className="flex flex-col flex-1 p-4 space-y-4 pb-16 bg-[#F8F9FA] text-[#1A1A1A]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E0E0E0]">
        <Link
          href="/customer"
          className="p-2.5 rounded-xl bg-white border border-[#E0E0E0] text-[#0D47A1] hover:bg-gray-100 transition-colors active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-black text-[#0D47A1] tracking-tight uppercase">Xác Nhận Thanh Toán</h1>
        <div className="w-10" />
      </div>

      {errorMsg && (
        <div className="bg-[#FFEBEE] border border-[#D32F2F]/40 rounded-2xl p-3.5 flex items-center gap-3 text-xs text-[#D32F2F] font-bold shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Chi tiết đơn hàng */}
      <div className="bg-white border border-[#E0E0E0] rounded-3xl p-5 space-y-3.5 shadow-md">
        <div className="flex items-center gap-2 pb-2.5 border-b border-gray-200 text-xs font-black text-[#0D47A1] uppercase tracking-wider">
          <Receipt className="w-4 h-4 text-[#0D47A1]" />
          <span>Tóm Tắt Đơn Hàng</span>
        </div>

        <div className="space-y-2 py-1 max-h-44 overflow-y-auto">
          {cart?.items.map((item) => (
            <div key={item.Barcode} className="flex justify-between text-xs py-1 border-b border-gray-100">
              <span className="text-[#1A1A1A] truncate max-w-[200px] font-medium">
                {item.Name} × <b className="text-[#0D47A1] font-mono">{item.Quantity}</b>
              </span>
              <span className="font-bold text-[#0D47A1] font-mono">
                {(item.TotalPrice || item.Price * item.Quantity).toLocaleString('vi-VN')} đ
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-gray-200 space-y-2.5">
          <div className="flex justify-between text-xs text-[#666666]">
            <span>Tổng giá trị đơn:</span>
            <span className="font-bold text-[#1A1A1A] font-mono">{totalAmount.toLocaleString('vi-VN')} VNĐ</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-[#666666] font-bold">Token cần thanh toán:</span>
            <span className="text-2xl font-black text-[#0D47A1] flex items-center gap-1 font-mono">
              <Coins className="w-5 h-5 text-emerald-600" />
              {tokenAmount.toLocaleString('vi-VN')} T
            </span>
          </div>
        </div>
      </div>

      {/* Số dư ví người dùng */}
      <div className="bg-white border border-[#E0E0E0] rounded-3xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E3F2FD] border border-blue-200 flex items-center justify-center text-[#0D47A1]">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[#666666] block font-semibold">
              Ví thanh toán ({account?.accountNumber || 'ACC_CUSTOMER_01'})
            </span>
            <span className="text-sm font-bold text-[#1A1A1A] font-mono">
              Số dư: <b className="text-emerald-700">{currentTokenBalance.toLocaleString('vi-VN')} Token</b>
            </span>
          </div>
        </div>
        {!isBalanceEnough && (
          <Link
            href="/customer/wallet"
            className="px-3.5 py-2 rounded-xl bg-[#FFEBEE] border border-[#D32F2F]/40 text-xs font-bold text-[#D32F2F] active:scale-95 transition-all"
          >
            Nạp thêm
          </Link>
        )}
      </div>

      {!isBalanceEnough && (
        <div className="p-3 rounded-2xl bg-[#FFEBEE] border border-[#D32F2F]/30 text-xs text-[#D32F2F] text-center font-bold">
          Số dư Token không đủ để thanh toán. Vui lòng vào mục Ví Token để bơm thêm tiền.
        </div>
      )}

      {/* Nút Kích Hoạt Nhập PIN */}
      <button
        onClick={() => setIsPinOpen(true)}
        disabled={!isBalanceEnough || isProcessing || totalAmount <= 0}
        className="w-full h-14 rounded-2xl bg-[#0D47A1] hover:bg-[#1565C0] active:scale-[0.98] disabled:opacity-40 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-blue-900/20 transition-all mt-auto"
      >
        <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
        <span>{isProcessing ? 'Đang xác thực giao dịch...' : 'Xác Nhận & Nhập PIN'}</span>
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
