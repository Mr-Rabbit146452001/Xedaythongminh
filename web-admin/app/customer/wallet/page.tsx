'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wallet, 
  CreditCard, 
  ArrowDownToLine, 
  CheckCircle2, 
  AlertCircle, 
  Coins, 
  ShieldCheck,
  Building2,
  Lock,
  ChevronRight,
  RefreshCw,
  Phone,
  UserCheck,
  PlusCircle,
  Unlink,
  Sparkles,
  X
} from 'lucide-react';
import { CustomerApiService, BankAccount, CustomerUser } from '@/services/customerApi';
import PinModal from '@/components/customer/PinModal';

export default function CustomerWalletPage() {
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(null);
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Link Form States
  const [linkCccd, setLinkCccd] = useState('');
  const [linkPhone, setLinkPhone] = useState('');
  const [isCheckingBank, setIsCheckingBank] = useState(false);
  const [matchedBankAccount, setMatchedBankAccount] = useState<any>(null);

  // Modal PIN States
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinPurpose, setPinPurpose] = useState<'link' | 'withdraw'>('link');

  // Withdraw States
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50000);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Register New MockBank Account Modal
  const [showRegModal, setShowRegModal] = useState(false);
  const [regFullName, setRegFullName] = useState('');
  const [regCccd, setRegCccd] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPin, setRegPin] = useState('652001');
  const [isRegistering, setIsRegistering] = useState(false);

  // Notification Messages
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage('');
    const user = CustomerApiService.getStoredCustomer();
    setCurrentUser(user);

    if (user?.phoneNumber) {
      setLinkPhone(user.phoneNumber);
      setRegPhone(user.phoneNumber);
    }
    if (user?.name) {
      setRegFullName(user.name);
    }
    if (user?.cccd) {
      setLinkCccd(user.cccd);
      setRegCccd(user.cccd);
    }

    // Nếu khách hàng có tài khoản ngân hàng đã liên kết
    if (user?.linkedBankAccount) {
      const acc = await CustomerApiService.getAccount(user.linkedBankAccount);
      setAccount(acc);
    } else {
      setAccount(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();

    const handleAuthChange = () => {
      loadData();
    };
    window.addEventListener('customer_auth_changed', handleAuthChange);
    return () => window.removeEventListener('customer_auth_changed', handleAuthChange);
  }, []);

  const clearNotifications = () => {
    setMessage('');
    setErrorMessage('');
  };

  // 1. Kiểm tra tài khoản MockBank theo CCCD và SĐT để liên kết
  const handleCheckBankLink = async (e: React.FormEvent) => {
    e.preventDefault();
    clearNotifications();

    const cleanCccd = linkCccd.trim();
    const cleanPhone = linkPhone.trim();

    if (!cleanCccd || !/^\d{9,12}$/.test(cleanCccd)) {
      setErrorMessage('Số CCCD phải gồm từ 9 đến 12 chữ số hợp lệ.');
      return;
    }
    if (!cleanPhone || !/^\d{9,11}$/.test(cleanPhone)) {
      setErrorMessage('Số điện thoại phải từ 9 đến 11 chữ số hợp lệ.');
      return;
    }

    setIsCheckingBank(true);
    try {
      const res = await CustomerApiService.checkBankLink(cleanCccd, cleanPhone);
      if (res.success && res.data) {
        setMatchedBankAccount(res.data);
        setPinPurpose('link');
        setIsPinModalOpen(true);
      } else {
        setErrorMessage(res.message || 'Không tìm thấy tài khoản MockBank nào khớp với CCCD và SĐT này.');
      }
    } catch (err: any) {
      setErrorMessage('Lỗi kết nối MockBank: ' + err.message);
    } finally {
      setIsCheckingBank(false);
    }
  };

  // 2. Xác nhận PIN ngân hàng để hoàn tất liên kết
  const handleConfirmLinkPin = async (pin: string) => {
    if (!matchedBankAccount) return;
    setIsCheckingBank(true);
    clearNotifications();

    try {
      const res = await CustomerApiService.confirmBankLink(
        matchedBankAccount.accountNumber,
        pin,
        linkCccd.trim(),
        linkPhone.trim(),
        currentUser?.id
      );

      if (res.success) {
        setMessage('Chúc mừng! Đã liên kết tài khoản MockBank thành công! Mã PIN đã được cài làm PIN thanh toán.');
        setIsPinModalOpen(false);
        await loadData();
      } else {
        setErrorMessage(res.message || 'Mã PIN ngân hàng không chính xác! Vui lòng thử lại.');
      }
    } catch (err: any) {
      setErrorMessage('Lỗi xác nhận mã PIN: ' + err.message);
    } finally {
      setIsCheckingBank(false);
    }
  };

  // 3. Mở Modal rút tiền
  const handleOpenWithdrawModal = () => {
    clearNotifications();
    if (!withdrawAmount || withdrawAmount <= 0) {
      setErrorMessage('Vui lòng chọn hoặc nhập số Token hợp lệ (> 0).');
      return;
    }
    const currentBankBalance = account?.tokenBalance || 0;
    if (currentBankBalance < withdrawAmount) {
      setErrorMessage(`Số dư tài khoản ngân hàng không đủ (${currentBankBalance.toLocaleString('vi-VN')} Token).`);
      return;
    }
    setPinPurpose('withdraw');
    setIsPinModalOpen(true);
  };

  // 4. Xác nhận PIN để rút Token
  const handleConfirmWithdraw = async (pin: string) => {
    if (!account) return;
    setIsWithdrawing(true);
    clearNotifications();

    try {
      const res = await CustomerApiService.withdrawToken(
        account.accountNumber,
        withdrawAmount,
        pin,
        currentUser?.id
      );

      if (res.success) {
        setMessage(res.message || `Rút thành công +${withdrawAmount.toLocaleString('vi-VN')} Token vào Ví giỏ hàng!`);
        setIsPinModalOpen(false);
        await loadData();
      } else {
        setErrorMessage(res.message || 'Mã PIN không chính xác hoặc lỗi hệ thống.');
      }
    } catch (err: any) {
      setErrorMessage('Lỗi rút Token: ' + err.message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  // 5. Hủy liên kết tài khoản ngân hàng
  const handleUnlinkBank = async () => {
    if (!confirm('Bạn có chắc chắn muốn hủy liên kết tài khoản ngân hàng này khỏi ví không?')) {
      return;
    }
    clearNotifications();
    setIsLoading(true);
    try {
      const res = await CustomerApiService.unlinkBank(currentUser?.id, currentUser?.phoneNumber);
      if (res.success) {
        setMessage('Đã hủy liên kết tài khoản ngân hàng thành công.');
        setAccount(null);
        await loadData();
      } else {
        setErrorMessage(res.message || 'Không thể hủy liên kết.');
      }
    } catch (err: any) {
      setErrorMessage('Lỗi: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Đăng ký tài khoản MockBank mới trực tiếp
  const handleRegisterMockBank = async (e: React.FormEvent) => {
    e.preventDefault();
    clearNotifications();

    if (!regFullName.trim() || regFullName.trim().length < 2) {
      setErrorMessage('Họ và tên tối thiểu 2 ký tự.');
      return;
    }
    if (!/^\d{12}$/.test(regCccd.trim())) {
      setErrorMessage('Số CCCD phải gồm đúng 12 chữ số.');
      return;
    }
    if (!/^(0[3|5|7|8|9])\d{8}$/.test(regPhone.trim())) {
      setErrorMessage('Số điện thoại không đúng định dạng di động Việt Nam (10 số).');
      return;
    }
    if (!/^\d{6}$/.test(regPin.trim())) {
      setErrorMessage('Mã PIN ngân hàng phải gồm đúng 6 chữ số.');
      return;
    }

    setIsRegistering(true);
    try {
      const regRes = await CustomerApiService.registerMockBankAccount(
        regFullName.trim(),
        regCccd.trim(),
        regPhone.trim(),
        regPin.trim()
      );

      if (regRes.success && regRes.data) {
        setShowRegModal(false);
        // Tự động liên kết luôn tài khoản vừa tạo
        const linkRes = await CustomerApiService.confirmBankLink(
          regRes.data.accountNumber,
          regPin.trim(),
          regCccd.trim(),
          regPhone.trim(),
          currentUser?.id
        );
        if (linkRes.success) {
          setMessage(`Mở tài khoản thành công! Tặng ngay 100.000 Token và đã liên kết vào Ví của bạn.`);
        } else {
          setMessage('Mở tài khoản MockBank thành công! Hãy nhập mã PIN để liên kết.');
        }
        await loadData();
      } else {
        setErrorMessage(regRes.message || 'Đăng ký tài khoản MockBank thất bại.');
      }
    } catch (err: any) {
      setErrorMessage('Lỗi kết nối: ' + err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  const isLinked = Boolean(currentUser?.linkedBankAccount && account);
  const tokenBalance = account ? account.tokenBalance : 0;
  const vndBalance = tokenBalance * 10;

  return (
    <div className="flex flex-col flex-1 p-4 space-y-4 pb-24 bg-[#F8F9FA] text-[#1A1A1A]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E0E0E0]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E3F2FD] border border-blue-200 flex items-center justify-center text-[#0D47A1]">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-black text-[#0D47A1] tracking-tight uppercase">Ví Điện Tử Thông Minh</h1>
            <p className="text-[11px] font-semibold text-[#666666]">MockBank FinTech 2026</p>
          </div>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="p-1.5 rounded-lg text-[#0D47A1] hover:bg-blue-50 transition-colors"
          title="Làm mới số dư"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Thông báo trạng thái */}
      {message && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-800 font-bold shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="flex-1">{message}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-[#FFEBEE] border border-[#D32F2F]/30 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-[#D32F2F] font-bold shadow-sm animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-[#D32F2F] flex-shrink-0" />
          <span className="flex-1">{errorMessage}</span>
        </div>
      )}

      {/* THẺ TITANIUM: 2 TRẠNG THÁI THẬT (ĐÃ LIÊN KẾT vs CHƯA LIÊN KẾT) */}
      <div 
        className={`relative w-full aspect-[1.6/1] rounded-3xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden group text-white border transition-all duration-300 ${
          isLinked
            ? 'bg-gradient-to-br from-[#0D47A1] via-[#1565C0] to-[#0A2472] border-[#0D47A1]/40'
            : 'bg-gradient-to-br from-[#37474F] via-[#455A64] to-[#263238] border-gray-600/50'
        }`}
      >
        {/* Glow and Reflection elements */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-blue-300/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />

        {/* Top row */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <CreditCard className={`w-6 h-6 ${isLinked ? 'text-amber-300' : 'text-slate-300'}`} />
            <span className="text-xs font-black text-white uppercase tracking-widest">
              SMARTCART TITANIUM
            </span>
          </div>
          {isLinked ? (
            <span className="text-[10px] font-extrabold text-[#0D47A1] uppercase tracking-wider bg-white px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              ĐÃ LIÊN KẾT
            </span>
          ) : (
            <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider bg-amber-300 px-2.5 py-0.5 rounded-full shadow-sm">
              CHƯA LIÊN KẾT
            </span>
          )}
        </div>

        {/* EMV Chip graphic */}
        <div className="relative z-10 my-1 w-10 h-7 rounded-md bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-100 border border-amber-300/60 flex items-center justify-center shadow-sm">
          <div className="w-8 h-5 border border-amber-700/40 rounded-[2px]" />
        </div>

        {/* Middle row: Balance */}
        <div className="relative z-10">
          <span className="text-[10px] text-blue-100 uppercase tracking-wider font-extrabold block mb-0.5">
            {isLinked ? 'Số Dư Khả Dụng Trong Ngân Hàng' : 'Số Dư Tài Khoản'}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight font-mono">
              {isLoading ? '...' : tokenBalance.toLocaleString('vi-VN')}
            </span>
            <span className="text-sm font-black text-amber-300">TOKEN</span>
          </div>
          <span className="text-xs text-blue-100 block font-mono font-medium">
            ≈ {isLoading ? '...' : vndBalance.toLocaleString('vi-VN')} VNĐ (Tỷ giá 1:10)
          </span>
        </div>

        {/* Bottom row: Card Holder & Account */}
        <div className="flex items-end justify-between relative z-10 pt-2 border-t border-white/20">
          <div>
            <span className="text-[9px] text-blue-200 uppercase tracking-wider block font-semibold">Chủ tài khoản</span>
            <span className="text-xs font-bold text-white">
              {isLinked 
                ? (account?.ownerName || currentUser?.name)
                : (currentUser?.name || 'Chưa đăng nhập')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-blue-200 uppercase tracking-wider block font-semibold">Số tài khoản</span>
            <span className="text-xs font-mono font-black text-amber-300">
              {isLinked 
                ? account?.accountNumber
                : '•••• •••• ••••'}
            </span>
          </div>
        </div>
      </div>

      {/* KHỐI 1: NẾU ĐÃ LIÊN KẾT -> RÚT TOKEN & QUẢN LÝ TÀI KHOẢN */}
      {isLinked ? (
        <div className="space-y-4 animate-fadeIn">
          {/* Rút Token vào Ví Xe Đẩy */}
          <div className="bg-white border border-[#E0E0E0] rounded-3xl p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E3F2FD] border border-blue-200 flex items-center justify-center text-[#0D47A1]">
                  <ArrowDownToLine className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#0D47A1] uppercase tracking-wider">
                    Rút Token Vào Ví Xe Đẩy
                  </h3>
                  <p className="text-[10px] font-semibold text-[#666666]">
                    Nguồn: {account?.accountNumber} ({account?.ownerName})
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-[#0D47A1] border border-blue-200 font-mono">
                1 Token = 10 đ
              </span>
            </div>

            {/* Input số Token muốn rút */}
            <div>
              <label className="block text-[11px] font-bold text-[#1A1A1A] mb-1.5">
                Số lượng Token muốn rút:
              </label>
              <div className="relative">
                <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0D47A1]" />
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  value={withdrawAmount || ''}
                  onChange={(e) => setWithdrawAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="50000"
                  className="w-full bg-[#F8F9FA] border border-[#CCCCCC] rounded-2xl pl-10 pr-20 py-3 text-sm font-mono font-black text-[#0D47A1] focus:outline-none focus:border-[#0D47A1] focus:ring-1 focus:ring-[#0D47A1]"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-500 font-mono">
                  TOKEN
                </span>
              </div>
              <span className="text-[11px] font-mono font-semibold text-gray-500 block mt-1 pl-1">
                ≈ {((withdrawAmount || 0) * 10).toLocaleString('vi-VN')} VNĐ
              </span>
            </div>

            {/* Quick Amount Chips */}
            <div className="grid grid-cols-4 gap-2">
              {[10000, 20000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setWithdrawAmount(amt)}
                  className={`py-2 px-1 rounded-xl text-[11px] font-black font-mono transition-all border ${
                    withdrawAmount === amt
                      ? 'bg-[#0D47A1] text-white border-[#0D47A1] shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {(amt / 1000)}K
                </button>
              ))}
            </div>

            {/* Nút Rút Token */}
            <button
              onClick={handleOpenWithdrawModal}
              disabled={isWithdrawing || !withdrawAmount || withdrawAmount <= 0}
              className="w-full h-13 py-3.5 rounded-2xl bg-[#0D47A1] hover:bg-[#1565C0] active:scale-[0.98] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all select-none"
            >
              <Lock className="w-4 h-4 stroke-[2.5]" />
              <span>Rút Token Vào Ví (Xác Thực PIN)</span>
            </button>
          </div>

          {/* Chi tiết tài khoản liên kết & Hủy liên kết */}
          <div className="p-4 rounded-3xl bg-white border border-[#E0E0E0] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-[#0D47A1] shrink-0" />
              <div>
                <h4 className="text-xs font-black text-[#1A1A1A]">Tài khoản: {account?.accountNumber}</h4>
                <p className="text-[10px] text-gray-500 font-semibold">
                  Mã PIN thanh toán: Đã kích hoạt • CCCD: {currentUser?.cccd || 'Đã định danh'}
                </p>
              </div>
            </div>
            <button
              onClick={handleUnlinkBank}
              className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold flex items-center gap-1 shadow-sm transition-all"
            >
              <Unlink className="w-3.5 h-3.5" />
              <span>Hủy liên kết</span>
            </button>
          </div>
        </div>
      ) : (
        /* KHỐI 2: KHI CHƯA LIÊN KẾT -> FORM LIÊN KẾT TRỰC TIẾP & MỞ TÀI KHOẢN MỚI */
        <div className="space-y-4 animate-fadeIn">
          {/* Form Liên Kết Ngân Hàng Bằng CCCD & SĐT */}
          <div className="bg-white border border-[#E0E0E0] rounded-3xl p-5 shadow-md space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E3F2FD] border border-blue-200 flex items-center justify-center text-[#0D47A1]">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-[#0D47A1] uppercase tracking-wider">
                  Liên Kết Tài Khoản MockBank Thực Tế
                </h3>
                <p className="text-[10px] font-semibold text-[#666666]">
                  Xác thực CCCD & Số điện thoại đã mở tại MockBank
                </p>
              </div>
            </div>

            <form onSubmit={handleCheckBankLink} className="space-y-3 pt-1">
              {/* CCCD Input */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Số Căn cước công dân (12 chữ số)
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0D47A1]" />
                  <input
                    type="text"
                    value={linkCccd}
                    onChange={(e) => setLinkCccd(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    placeholder="Ví dụ: 001200001234"
                    className="w-full bg-[#F8F9FA] border border-gray-300 rounded-2xl pl-10 pr-3 py-2.5 text-xs font-mono font-bold text-[#1A1A1A] focus:outline-none focus:border-[#0D47A1]"
                    required
                  />
                </div>
              </div>

              {/* SĐT Input */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Số điện thoại mở tài khoản (10 số)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0D47A1]" />
                  <input
                    type="tel"
                    value={linkPhone}
                    onChange={(e) => setLinkPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="Ví dụ: 0987654321"
                    className="w-full bg-[#F8F9FA] border border-gray-300 rounded-2xl pl-10 pr-3 py-2.5 text-xs font-mono font-bold text-[#1A1A1A] focus:outline-none focus:border-[#0D47A1]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCheckingBank}
                className="w-full py-3.5 rounded-2xl bg-[#0D47A1] hover:bg-[#1565C0] active:scale-[0.98] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all select-none"
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>{isCheckingBank ? 'Đang tra cứu MockBank...' : 'Xác Minh Tài Khoản & Nhập PIN'}</span>
              </button>
            </form>
          </div>

          {/* Banner hỗ trợ mở tài khoản MockBank mới nếu chưa có */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="text-xs font-black text-amber-950">Chưa có tài khoản MockBank?</h4>
                <p className="text-[10px] text-amber-800 font-semibold">
                  Mở ngay chỉ 30 giây • Tặng ngay 100.000 Token (+1.000.000 đ)
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowRegModal(true)}
              className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md shrink-0 transition-all active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Mở Ngay</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: NHẬP PIN (DÙNG CHUNG CHO LIÊN KẾT & RÚT TIỀN) */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onConfirm={pinPurpose === 'link' ? handleConfirmLinkPin : handleConfirmWithdraw}
        title={pinPurpose === 'link' ? 'Xác thực mã PIN MockBank để liên kết' : 'Xác thực mã PIN để rút Token'}
        amountToken={pinPurpose === 'withdraw' ? withdrawAmount : 0}
        amountVnd={pinPurpose === 'withdraw' ? withdrawAmount * 10 : 0}
        isLoading={isCheckingBank || isWithdrawing}
      />

      {/* MODAL 2: MỞ TÀI KHOẢN MOCKBANK MỚI TRỰC TIẾP */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-[#E0E0E0] rounded-3xl p-6 shadow-2xl relative text-[#1A1A1A]">
            <button
              onClick={() => setShowRegModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3 text-[#0D47A1]">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-black uppercase tracking-wider">Mở Tài Khoản MockBank Mới</h3>
            </div>
            <p className="text-xs text-gray-600 mb-4 font-semibold">
              Định danh CCCD & Số điện thoại để kích hoạt ví thanh toán thông minh. Tặng ngay 100.000 Token chào mừng!
            </p>

            <form onSubmit={handleRegisterMockBank} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Họ và tên chủ thẻ</label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full bg-[#F8F9FA] border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-[#1A1A1A] focus:outline-none focus:border-[#0D47A1]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Số CCCD (12 số)</label>
                <input
                  type="text"
                  value={regCccd}
                  onChange={(e) => setRegCccd(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="Ví dụ: 001200001234"
                  className="w-full bg-[#F8F9FA] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#1A1A1A] focus:outline-none focus:border-[#0D47A1]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Số điện thoại (10 số)</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="Ví dụ: 0987654321"
                  className="w-full bg-[#F8F9FA] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#1A1A1A] focus:outline-none focus:border-[#0D47A1]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Mã PIN ngân hàng (6 số - dùng cho thanh toán)</label>
                <input
                  type="password"
                  maxLength={6}
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="652001"
                  className="w-full bg-[#F8F9FA] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#1A1A1A] focus:outline-none focus:border-[#0D47A1]"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="flex-1 py-2.5 rounded-xl bg-[#0D47A1] hover:bg-[#1565C0] text-white text-xs font-black uppercase tracking-wider shadow-md disabled:opacity-50"
                >
                  {isRegistering ? 'Đang tạo...' : 'Mở & Liên Kết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
