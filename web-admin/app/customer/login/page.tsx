'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  CustomerApiService, 
  CustomerUser 
} from '@/services/customerApi';
import { 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  LogOut, 
  ShieldCheck, 
  Coins, 
  Award, 
  ChevronLeft,
  KeyRound,
  Zap,
  ShoppingBag,
  Gift
} from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(null);

  // Form states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [strollerId, setStrollerId] = useState('STR_001');
  const [sessionId, setSessionId] = useState<string>('STR_001');

  useEffect(() => {
    const user = CustomerApiService.getStoredCustomer();
    if (user) {
      setCurrentUser(user);
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sId = params.get('session');
      const strId = params.get('stroller');

      if (sId) {
        setSessionId(sId);
        localStorage.setItem('smartcart_session_id', sId);
        if (user) {
          CustomerApiService.confirmLogin(sId, user.id);
        }
      }
      if (strId) {
        setStrollerId(strId);
        localStorage.setItem('smartcart_stroller_id', strId);
      }
    }
  }, []);

  const clearNotifications = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const switchMode = (newMode: AuthMode) => {
    clearNotifications();
    setMode(newMode);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // 1. Fill demo VIP user
  const handleFillDemoUser = () => {
    setPhoneNumber('0987654321');
    setPassword('123456');
    clearNotifications();
  };

  // 2. Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearNotifications();

    if (!phoneNumber.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ số điện thoại và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const res = await CustomerApiService.customerLogin(phoneNumber.trim(), password.trim(), sessionId || strollerId);
      if (res.success && res.customer) {
        setCurrentUser(res.customer);
        setSuccessMessage('Đăng nhập thành công! Xe đẩy đã được đồng bộ.');
        setTimeout(() => {
          router.push('/customer');
        }, 1200);
      } else {
        setErrorMessage(res.message || 'Số điện thoại hoặc mật khẩu không chính xác.');
      }
    } catch (err: any) {
      setErrorMessage('Không thể kết nối máy chủ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearNotifications();

    if (!fullName.trim() || !phoneNumber.trim() || !password.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ họ tên, số điện thoại và mật khẩu.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu cần tối thiểu 6 ký tự để đảm bảo an toàn.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await CustomerApiService.customerRegister(
        fullName.trim(),
        phoneNumber.trim(),
        password.trim(),
        sessionId || strollerId
      );
      if (res.success && res.customer) {
        setCurrentUser(res.customer);
        setSuccessMessage('Đăng ký thành công! Bạn được tặng 50.000 Token vào ví.');
        setTimeout(() => {
          router.push('/customer');
        }, 1500);
      } else {
        setErrorMessage(res.message || 'Đăng ký thất bại. Số điện thoại có thể đã tồn tại.');
      }
    } catch (err: any) {
      setErrorMessage('Lỗi kết nối máy chủ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearNotifications();

    if (!phoneNumber.trim()) {
      setErrorMessage('Vui lòng nhập số điện thoại cần khôi phục.');
      return;
    }

    if (!otpSent) {
      setOtpSent(true);
      setOtp('888888');
      setSuccessMessage('Mã OTP xác thực đã được gửi: 888888');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Vui lòng nhập mật khẩu mới.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu mới tối thiểu 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await CustomerApiService.customerForgotPassword(phoneNumber.trim(), password.trim());
      if (res.success) {
        setSuccessMessage('Đặt lại mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.');
        setTimeout(() => {
          switchMode('login');
        }, 1500);
      } else {
        setErrorMessage(res.message || 'Không tìm thấy số điện thoại trong hệ thống.');
      }
    } catch (err: any) {
      setErrorMessage('Lỗi kết nối: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Handle Logout
  const handleLogout = () => {
    CustomerApiService.clearStoredCustomer();
    setCurrentUser(null);
    setPhoneNumber('');
    setPassword('');
    setConfirmPassword('');
    clearNotifications();
    setSuccessMessage('Đã đăng xuất tài khoản thành công.');
    setMode('login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        {currentUser ? (
          <Link
            href="/customer"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-colors p-1 -ml-1 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Về Giỏ Hàng</span>
          </Link>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cổng Đăng Nhập</span>
          </div>
        )}
        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          {currentUser ? 'Tài Khoản Thành Viên' : mode === 'login' ? 'Đăng Nhập' : mode === 'register' ? 'Đăng Ký Mới' : 'Quên Mật Khẩu'}
        </span>
        <div className="w-16"></div>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto px-4 py-6 flex flex-col justify-center">
        {/* Brand Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 shadow-xl shadow-emerald-500/20 border border-emerald-400/40 mb-3">
            <User className="w-7 h-7 text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-100">
            Smart Cart Member
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Hệ sinh thái mua sắm thông minh & Ví thanh toán không chạm Smart Cart
          </p>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successMessage}</div>
          </div>
        )}

        {/* ALREADY LOGGED IN: PROFILE VIEW */}
        {currentUser ? (
          <div className="space-y-4 animate-fadeIn">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/30 p-5 shadow-xl shadow-emerald-500/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-black text-lg">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{currentUser.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{currentUser.phoneNumber}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" />
                  {currentUser.membershipLevel}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-800/80">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Coins className="w-3 h-3 text-emerald-400" />
                    <span>Số Dư Ví Token</span>
                  </div>
                  <div className="text-base font-black text-emerald-400 mt-1">
                    {Number(currentUser.tokenBalance || 0).toLocaleString('vi-VN')} T
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Điểm Tích Lũy</span>
                  </div>
                  <div className="text-base font-black text-amber-400 mt-1">
                    {currentUser.points} điểm
                  </div>
                </div>
              </div>

              {/* Perks & Vouchers */}
              {currentUser.vouchers && currentUser.vouchers.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-slate-800/80">
                  <div className="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-pink-400" />
                    <span>Ưu đãi & Voucher khả dụng</span>
                  </div>
                  <div className="space-y-1">
                    {currentUser.vouchers.map((v, i) => (
                      <div key={i} className="text-xs text-slate-300 bg-pink-500/10 border border-pink-500/20 px-2.5 py-1.5 rounded-lg flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                        <span className="truncate">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-2.5">
              <Link
                href="/customer"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98]"
              >
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                <span>Tiếp Tục Mua Sắm Trên Xe {strollerId}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 text-xs font-semibold transition-all active:scale-[0.98]"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng Xuất Tài Khoản</span>
              </button>
            </div>
          </div>
        ) : (
          /* AUTH FORMS (LOGIN / REGISTER / FORGOT) */
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-2xl backdrop-blur-xl">
            {/* Mode Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 mb-5">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Đăng Nhập
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'register'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Đăng Ký Mới
              </button>
            </div>

            {/* TAB 1: LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Phone field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0987654321"
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Mật khẩu
                    </label>
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:opacity-95 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>ĐĂNG NHẬP NGAY</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>

                {/* Quick Demo Fill Button */}
                <button
                  type="button"
                  onClick={handleFillDemoUser}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Điền nhanh tài khoản VIP mẫu (0987654321)</span>
                </button>
              </form>
            )}

            {/* TAB 2: REGISTER FORM */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                {/* Full name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0912345678"
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mật khẩu (tối thiểu 6 ký tự)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Gift Callout */}
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                  <Coins className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tặng ngay <b>50.000 Token</b> và <b>100 điểm thưởng</b> khi đăng ký!</span>
                </div>

                {/* Submit Register */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:opacity-95 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>TẠO TÀI KHOẢN & NHẬN QUÀ</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 3: FORGOT PASSWORD */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-3.5">
                <div className="text-xs text-slate-400 mb-2">
                  Nhập số điện thoại đã đăng ký để nhận mã xác thực và đặt mật khẩu mới.
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Số điện thoại tài khoản
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0987654321"
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition-all"
                      required
                    />
                  </div>
                </div>

                {/* OTP code if sent */}
                {otpSent && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Mã xác thực OTP (Demo: 888888)
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="888888"
                          className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-emerald-400 font-bold font-mono tracking-widest focus:outline-none focus:border-emerald-500 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Mật khẩu mới
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nhập lại mật khẩu mới
                      </label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-all"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Submit Forgot */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:opacity-95 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{otpSent ? 'XÁC NHẬN ĐỔI MẬT KHẨU' : 'GỬI MÃ XÁC THỰC OTP'}</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors text-center"
                >
                  ← Quay lại Đăng nhập
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
