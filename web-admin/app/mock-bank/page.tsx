'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Landmark, 
  Search, 
  PlusCircle, 
  Coins, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  RefreshCw, 
  CreditCard, 
  Phone, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles,
  ArrowUpRight,
  UserCheck,
  TrendingUp,
  SlidersHorizontal,
  Eye,
  EyeOff
} from 'lucide-react';
import { BankAdminService, BankAccountAdminItem, BankSummary } from '@/services/bankAdminApi';

export default function MockBankManagementPage() {
  const [accounts, setAccounts] = useState<BankAccountAdminItem[]>([]);
  const [summary, setSummary] = useState<BankSummary>({ totalAccounts: 0, totalToken: 0, totalVnd: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'LOCKED'>('ALL');

  // Toast notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal Register State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regFullName, setRegFullName] = useState('');
  const [regCccd, setRegCccd] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPin, setRegPin] = useState('652001');
  const [regLoading, setRegLoading] = useState(false);

  // Modal Adjust Balance State
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccountAdminItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(50000);
  const [adjustAction, setAdjustAction] = useState<'add' | 'set'>('add');
  const [adjustLoading, setAdjustLoading] = useState(false);

  // Visible PIN state map: accountNumber -> boolean
  const [visiblePins, setVisiblePins] = useState<Record<string, boolean>>({});

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await BankAdminService.getAccounts();
      if (res.success) {
        setAccounts(res.data);
        setSummary(res.summary);
      }
    } catch (err: any) {
      showToast('Không thể tải danh sách tài khoản: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Handle Quick Faucet (+50,000 Token)
  const handleQuickFaucet = async (acc: BankAccountAdminItem) => {
    const res = await BankAdminService.adjustBalance(acc.accountNumber, 50000, 'add');
    if (res.success) {
      showToast(`Đã bơm thành công +50.000 Token vào tài khoản ${acc.accountNumber}`);
      fetchAccounts();
    } else {
      showToast(res.message || 'Lỗi bơm Token', 'error');
    }
  };

  // Handle Toggle Lock / Unlock Status
  const handleToggleStatus = async (acc: BankAccountAdminItem) => {
    const targetStatus = !acc.isActive;
    const res = await BankAdminService.toggleStatus(acc.accountNumber, targetStatus);
    if (res.success) {
      showToast(`Đã ${targetStatus ? 'mở khóa' : 'khóa'} thành công tài khoản ${acc.accountNumber}`);
      fetchAccounts();
    } else {
      showToast(res.message || 'Lỗi cập nhật trạng thái', 'error');
    }
  };

  // Handle Reset PIN
  const handleResetPin = async (acc: BankAccountAdminItem) => {
    const res = await BankAdminService.resetPin(acc.accountNumber, '652001');
    if (res.success) {
      showToast(`Đã đặt lại mã PIN cho tài khoản ${acc.accountNumber} về mặc định (652001)`);
      fetchAccounts();
    } else {
      showToast(res.message || 'Lỗi đặt lại PIN', 'error');
    }
  };

  // Submit Register New Account
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regCccd.trim() || !regPhone.trim()) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'error');
      return;
    }
    if (!/^\d{12}$/.test(regCccd.trim())) {
      showToast('Số Căn cước công dân (CCCD) phải bao gồm đúng 12 chữ số!', 'error');
      return;
    }
    if (!/^(0[3|5|7|8|9])\d{8}$/.test(regPhone.trim())) {
      showToast('Số điện thoại không đúng chuẩn di động Việt Nam (10 số)!', 'error');
      return;
    }
    if (!/^\d{4,6}$/.test(regPin.trim())) {
      showToast('Mã PIN bảo mật phải gồm từ 4 đến 6 chữ số!', 'error');
      return;
    }

    setRegLoading(true);
    try {
      const res = await BankAdminService.registerAccount({
        fullName: regFullName.trim(),
        idCardNumber: regCccd.trim(),
        phoneNumber: regPhone.trim(),
        pin: regPin.trim()
      });

      if (res.success) {
        showToast(res.message || 'Mở tài khoản MockBank thành công!');
        setShowRegisterModal(false);
        setRegFullName('');
        setRegCccd('');
        setRegPhone('');
        setRegPin('652001');
        fetchAccounts();
      } else {
        showToast(res.message || 'Đăng ký thất bại', 'error');
      }
    } catch (err: any) {
      showToast('Lỗi kết nối: ' + err.message, 'error');
    } finally {
      setRegLoading(false);
    }
  };

  // Submit Adjust Balance
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    setAdjustLoading(true);
    try {
      const res = await BankAdminService.adjustBalance(selectedAccount.accountNumber, adjustAmount, adjustAction);
      if (res.success) {
        showToast(res.message || 'Cập nhật số dư thành công!');
        setShowAdjustModal(false);
        fetchAccounts();
      } else {
        showToast(res.message || 'Lỗi điều chỉnh số dư', 'error');
      }
    } catch (err: any) {
      showToast('Lỗi: ' + err.message, 'error');
    } finally {
      setAdjustLoading(false);
    }
  };

  // Filter accounts
  const filteredAccounts = accounts.filter(acc => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || 
      acc.accountNumber.toLowerCase().includes(q) ||
      acc.ownerName.toLowerCase().includes(q) ||
      acc.phoneNumber.includes(q) ||
      acc.idCardNumber.includes(q);

    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && acc.isActive && !acc.isLocked) ||
      (statusFilter === 'LOCKED' && (!acc.isActive || acc.isLocked));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto text-[#1A1A1A]">
      {/* Toast Alert */}
      {toast && (
        <div 
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold transition-all animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === 'success' 
              ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]' 
              : 'bg-[#FFEBEE] text-[#C62828] border-[#EF9A9A]'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white/90 shadow-[0_8px_30px_rgba(13,71,161,0.06)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0D47A1] to-[#1976D2] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Landmark className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-[#0D47A1] tracking-tight uppercase">
                Quản Lý Tài Khoản MockBank
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0D47A1] text-xs font-black">
                FinTech Core
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-500 font-medium mt-0.5">
              Hệ thống tài khoản thanh toán số định danh CCCD/SĐT — Server Cổng 4000
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAccounts}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 active:scale-95 transition-all shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 text-[#0D47A1] ${loading ? 'animate-spin' : ''}`} />
            <span>Làm Mới</span>
          </button>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0D47A1] hover:bg-[#1565C0] text-white font-black text-xs active:scale-95 transition-all shadow-lg shadow-blue-900/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Mở Tài Khoản Mới</span>
          </button>
        </div>
      </div>

      {/* KPI 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng Tài Khoản */}
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Tổng Tài Khoản
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#0D47A1]">
                {summary.totalAccounts.toLocaleString('vi-VN')}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Hoạt động
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0D47A1] flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Tổng Token Lưu Hành */}
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Tổng Token Lưu Hành
            </span>
            <span className="text-2xl font-black text-[#0D47A1] font-mono">
              {summary.totalToken.toLocaleString('vi-VN')}
            </span>
            <span className="block text-[11px] font-semibold text-gray-500 mt-0.5">
              Ví điện tử FinTech
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Giá Trị Quy Đổi VNĐ */}
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Giá Trị Quy Đổi (1:10)
            </span>
            <span className="text-2xl font-black text-emerald-700 font-mono">
              {summary.totalVnd.toLocaleString('vi-VN')} đ
            </span>
            <span className="block text-[11px] font-semibold text-gray-500 mt-0.5">
              Bảo chứng ngân hàng
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Master Security PIN */}
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Master Key PIN
            </span>
            <span className="text-2xl font-black text-[#0D47A1] font-mono tracking-widest bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
              652001
            </span>
            <span className="block text-[11px] font-semibold text-gray-500 mt-0.5">
              Hợp lệ cho mọi tài khoản
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Key className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo Số TK, Họ tên, SĐT, CCCD..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-medium focus:bg-white focus:border-[#0D47A1] focus:ring-2 focus:ring-blue-100 transition-all outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Lọc:
          </span>
          {(['ALL', 'ACTIVE', 'LOCKED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-[#0D47A1] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st === 'ACTIVE' ? 'Hoạt động' : 'Bị tạm khóa'}
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                <th className="py-4 px-5">Số Tài Khoản</th>
                <th className="py-4 px-5">Chủ Tài Khoản</th>
                <th className="py-4 px-5">Định Danh CCCD</th>
                <th className="py-4 px-5">Số Điện Thoại</th>
                <th className="py-4 px-5 text-right">Số Dư Token</th>
                <th className="py-4 px-5 text-right">Quy Đổi VNĐ</th>
                <th className="py-4 px-5 text-center">Trạng Thái</th>
                <th className="py-4 px-5 text-center">Mã PIN</th>
                <th className="py-4 px-5 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0D47A1]" />
                    Đang tải danh sách tài khoản MockBank...
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    Không tìm thấy tài khoản ngân hàng nào khớp với tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => {
                  const isPinVisible = visiblePins[acc.accountNumber] || false;
                  return (
                    <tr key={acc.accountNumber} className="hover:bg-blue-50/40 transition-colors group">
                      {/* Số TK */}
                      <td className="py-3.5 px-5 font-mono font-bold text-[#0D47A1]">
                        <span className="bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
                          {acc.accountNumber}
                        </span>
                      </td>

                      {/* Họ Tên */}
                      <td className="py-3.5 px-5 font-bold text-gray-800">
                        {acc.ownerName}
                      </td>

                      {/* CCCD */}
                      <td className="py-3.5 px-5 font-mono font-medium text-gray-600">
                        {acc.idCardNumber ? (
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px] font-semibold text-gray-700">
                            {acc.idCardNumber}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Chưa liên kết</span>
                        )}
                      </td>

                      {/* SĐT */}
                      <td className="py-3.5 px-5 font-mono text-gray-700">
                        {acc.phoneNumber ? (
                          <span className="flex items-center gap-1 font-semibold">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {acc.phoneNumber}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">-</span>
                        )}
                      </td>

                      {/* Số Dư Token */}
                      <td className="py-3.5 px-5 text-right font-mono font-black text-amber-700 text-sm">
                        {acc.tokenBalance.toLocaleString('vi-VN')}
                      </td>

                      {/* Số Dư VNĐ */}
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-emerald-700 text-xs">
                        {acc.vndBalance.toLocaleString('vi-VN')} đ
                      </td>

                      {/* Trạng Thái */}
                      <td className="py-3.5 px-5 text-center">
                        {acc.isLocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <ShieldAlert className="w-3 h-3" /> Tạm khóa PIN
                          </span>
                        ) : acc.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <ShieldCheck className="w-3 h-3" /> Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                            <Lock className="w-3 h-3" /> Vô hiệu hóa
                          </span>
                        )}
                      </td>

                      {/* Mã PIN */}
                      <td className="py-3.5 px-5 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-lg">
                          <span className="font-mono font-black text-[11px] text-gray-700">
                            {isPinVisible ? '652001' : '••••••'}
                          </span>
                          <button
                            onClick={() => setVisiblePins(prev => ({ ...prev, [acc.accountNumber]: !prev[acc.accountNumber] }))}
                            className="text-gray-400 hover:text-gray-700"
                            title={isPinVisible ? 'Ẩn PIN' : 'Hiện PIN'}
                          >
                            {isPinVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Thao Tác */}
                      <td className="py-3.5 px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Nút Bơm Nhanh 50k Token */}
                          <button
                            onClick={() => handleQuickFaucet(acc)}
                            className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                            title="Bơm nhanh +50.000 Token"
                          >
                            <Coins className="w-4 h-4" />
                          </button>

                          {/* Nút Điều Chỉnh Số Dư */}
                          <button
                            onClick={() => {
                              setSelectedAccount(acc);
                              setAdjustAmount(50000);
                              setAdjustAction('add');
                              setShowAdjustModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-blue-50 text-[#0D47A1] hover:bg-blue-100 transition-colors"
                            title="Điều chỉnh số dư"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>

                          {/* Nút Khóa / Mở Khóa */}
                          <button
                            onClick={() => handleToggleStatus(acc)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              acc.isActive 
                                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                            title={acc.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          >
                            {acc.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>

                          {/* Nút Cấp Lại PIN về 652001 */}
                          <button
                            onClick={() => handleResetPin(acc)}
                            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                            title="Reset PIN về 652001"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: MỞ TÀI KHOẢN MỚI (ĐỊNH DANH CCCD & SĐT) */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 text-[#1A1A1A]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2 text-[#0D47A1]">
                <PlusCircle className="w-5 h-5" />
                <h3 className="text-base font-black uppercase">Đăng Ký Tài Khoản MockBank Mới</h3>
              </div>
              <button 
                onClick={() => setShowRegisterModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Họ và tên chủ tài khoản *</label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="VD: NGUYEN VAN A"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:bg-white focus:border-[#0D47A1] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Số Căn cước công dân (12 chữ số) *</label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  value={regCccd}
                  onChange={(e) => setRegCccd(e.target.value.replace(/\D/g, ''))}
                  placeholder="VD: 001200001234"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono font-semibold focus:bg-white focus:border-[#0D47A1] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Số điện thoại di động (10 chữ số) *</label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="VD: 0987654321"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono font-semibold focus:bg-white focus:border-[#0D47A1] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mã PIN bảo mật thanh toán & đăng nhập *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="VD: 652001"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono font-semibold focus:bg-white focus:border-[#0D47A1] outline-hidden"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Mặc định gợi ý mã PIN chủ Master: <strong>652001</strong>
                </span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs font-semibold">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Tài khoản mới sẽ được tặng ngay <strong>100.000 Token (1.000.000 VNĐ)</strong> để thử nghiệm thanh toán xe đẩy.</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={regLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D47A1] hover:bg-[#1565C0] text-white font-bold text-xs shadow-md shadow-blue-900/20"
                >
                  {regLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Tạo Tài Khoản Ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ĐIỀU CHỈNH / NẠP TOKEN */}
      {showAdjustModal && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 text-[#1A1A1A]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2 text-[#0D47A1]">
                <Coins className="w-5 h-5" />
                <h3 className="text-base font-black uppercase">Điều Chỉnh Số Dư Token</h3>
              </div>
              <button 
                onClick={() => setShowAdjustModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tài khoản:</span>
                  <span className="font-mono font-bold text-[#0D47A1]">{selectedAccount.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Chủ tài khoản:</span>
                  <span className="font-bold">{selectedAccount.ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số dư hiện tại:</span>
                  <span className="font-mono font-black text-amber-700">{selectedAccount.tokenBalance.toLocaleString('vi-VN')} Token</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phương thức điều chỉnh</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustAction('add')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      adjustAction === 'add'
                        ? 'bg-blue-50 border-[#0D47A1] text-[#0D47A1]'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    + Nạp Thêm Token
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustAction('set')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      adjustAction === 'set'
                        ? 'bg-blue-50 border-[#0D47A1] text-[#0D47A1]'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    = Thiết Lập Số Dư Cố Định
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Số lượng Token *</label>
                <input
                  type="number"
                  required
                  min={0}
                  step={1000}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-mono font-bold text-[#0D47A1] focus:bg-white focus:border-[#0D47A1] outline-hidden"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Tương đương: <strong>{(adjustAmount * 10).toLocaleString('vi-VN')} VNĐ</strong>
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={adjustLoading}
                  className="px-5 py-2 rounded-xl bg-[#0D47A1] hover:bg-[#1565C0] text-white font-bold text-xs shadow-md"
                >
                  {adjustLoading ? 'Đang lưu...' : 'Xác Nhận Cập Nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
