'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ApiService, CustomerItem } from '@/services/api';
import { 
  Users, 
  Search, 
  UserPlus, 
  Award, 
  Coins, 
  Phone, 
  Sparkles, 
  Send, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  ShoppingBag,
  X,
  CreditCard,
  Mail
} from 'lucide-react';

export default function CustomersManagementPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');

  // Notification state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal create/edit state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTier, setFormTier] = useState('Hội viên Thân Thiết');
  const [formPoints, setFormPoints] = useState<number>(100);
  const [formToken, setFormToken] = useState<number>(50000);
  const [formLoading, setFormLoading] = useState(false);

  // Stroller target session for 1-click sync
  const [strollerId, setStrollerId] = useState('STR_001');
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ApiService.getCustomers(search, tierFilter);
      setCustomers(data);
    } catch (err) {
      console.warn('Lỗi fetchCustomers:', err);
    } finally {
      setLoading(false);
    }
  }, [search, tierFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Đồng bộ khách hàng lên xe đẩy 1-click
  const handleSyncToStroller = async (customer: CustomerItem) => {
    setSyncingId(customer.id);
    try {
      const res = await ApiService.syncCustomerToStroller(customer.id, strollerId);
      if (res.success) {
        showToast(`Đã đồng bộ thông tin của ${customer.name} (${customer.membershipLevel}) lên xe đẩy ${strollerId} thành công!`, 'success');
      } else {
        showToast(res.message || 'Đồng bộ thất bại', 'error');
      }
    } catch (err: any) {
      showToast('Lỗi mạng khi đồng bộ: ' + err.message, 'error');
    } finally {
      setSyncingId(null);
    }
  };

  // 2. Mở modal thêm mới
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedCustomer(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormTier('Hội viên Thân Thiết');
    setFormPoints(100);
    setFormToken(50000);
    setShowModal(true);
  };

  // 3. Mở modal sửa
  const handleOpenEditModal = (c: CustomerItem) => {
    setModalMode('edit');
    setSelectedCustomer(c);
    setFormName(c.name);
    setFormPhone(c.phoneNumber);
    setFormEmail(c.email || '');
    setFormTier(c.membershipLevel);
    setFormPoints(c.points);
    setFormToken(c.tokenBalance);
    setShowModal(true);
  };

  // 4. Lưu biểu mẫu
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      showToast('Vui lòng điền họ tên và số điện thoại!', 'error');
      return;
    }

    setFormLoading(true);
    try {
      if (modalMode === 'create') {
        const res = await ApiService.createCustomer({
          name: formName.trim(),
          phoneNumber: formPhone.trim(),
          email: formEmail.trim(),
          membershipLevel: formTier,
          points: formPoints,
          tokenBalance: formToken
        });
        if (res.success) {
          showToast('Đã thêm khách hàng mới vào CSDL thành công!', 'success');
          setShowModal(false);
          fetchCustomers();
        } else {
          showToast(res.message, 'error');
        }
      } else if (selectedCustomer) {
        const res = await ApiService.updateCustomer(selectedCustomer.id, {
          name: formName.trim(),
          phoneNumber: formPhone.trim(),
          email: formEmail.trim(),
          membershipLevel: formTier,
          points: formPoints,
          tokenBalance: formToken
        });
        if (res.success) {
          showToast('Đã cập nhật thông tin khách hàng thành công!', 'success');
          setShowModal(false);
          fetchCustomers();
        } else {
          showToast(res.message, 'error');
        }
      }
    } catch (err: any) {
      showToast('Lỗi: ' + err.message, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // 5. Xóa khách hàng
  const handleDeleteCustomer = async (c: CustomerItem) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa khách hàng "${c.name}" (${c.phoneNumber}) khỏi cơ sở dữ liệu?`)) {
      return;
    }
    try {
      const res = await ApiService.deleteCustomer(c.id);
      if (res.success) {
        showToast(`Đã xóa khách hàng ${c.name} thành công.`, 'success');
        fetchCustomers();
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast('Lỗi khi xóa: ' + err.message, 'error');
    }
  };

  // Thống kê nhanh
  const totalCustomers = customers.length;
  const vipCount = customers.filter(c => c.membershipLevel.includes('Kim Cương') || c.membershipLevel.includes('VIP')).length;
  const totalPoints = customers.reduce((sum, c) => sum + (c.points || 0), 0);
  const totalTokens = customers.reduce((sum, c) => sum + (c.tokenBalance || 0), 0);

  const getBadgeColor = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes('kim cương')) return 'bg-purple-500/15 text-purple-600 border-purple-500/30 dark:text-purple-400';
    if (l.includes('vip')) return 'bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400';
    if (l.includes('vàng')) return 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30 dark:text-yellow-400';
    if (l.includes('bạc')) return 'bg-slate-400/15 text-slate-700 border-slate-400/30 dark:text-slate-300';
    return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">Quản Lý Khách Hàng (PostgreSQL)</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              Live DB
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Danh sách hồ sơ thành viên, điểm thưởng tích lũy, số dư ví và đồng bộ thời gian thực lên xe đẩy Smart Cart.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCustomers}
            disabled={loading}
            className="p-2.5 rounded-xl border border-outline-variant hover:bg-surface-container transition-colors text-on-surface-variant hover:text-primary"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary/90 font-semibold text-sm shadow-sm active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Khách Hàng</span>
          </button>
        </div>
      </div>

      {/* Toast alert */}
      {toast && (
        <div className={`p-3.5 rounded-xl flex items-center gap-3 border shadow-lg text-sm animate-fadeIn ${
          toast.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <div className="flex-1 font-medium">{toast.message}</div>
          <button onClick={() => setToast(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-on-surface-variant">Tổng Khách Hàng</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-on-surface">{totalCustomers}</div>
          <p className="text-[11px] text-on-surface-variant mt-1">Đã đồng bộ trên PostgreSQL</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-on-surface-variant">Hội Viên VIP & Kim Cương</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600">{vipCount}</div>
          <p className="text-[11px] text-on-surface-variant mt-1">Khách hàng đặc quyền ưu tiên</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-on-surface-variant">Tổng Điểm Tích Lũy</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{ApiService.formatNumber(totalPoints)}</div>
          <p className="text-[11px] text-on-surface-variant mt-1">Điểm thưởng sẵn sàng đổi quà</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-on-surface-variant">Tổng Số Dư Token Ví</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{ApiService.formatNumber(totalTokens)} T</div>
          <p className="text-[11px] text-on-surface-variant mt-1">Tương đương {ApiService.formatVND(totalTokens * 10)}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, SĐT hoặc mã ID..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-surface-container border border-outline-variant focus:outline-none focus:border-primary text-on-surface transition-colors"
          />
        </div>

        {/* Tier filter tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['ALL', 'Hội viên Kim Cương', 'Hội viên VIP', 'Hội viên Vàng', 'Hội viên Bạc', 'Hội viên Thân Thiết'].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tierFilter === tier
                  ? 'bg-primary text-on-primary font-bold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              {tier === 'ALL' ? 'Tất cả' : tier.replace('Hội viên ', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Table */}
      <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/40 bg-surface-container/50 text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Số Điện Thoại</th>
                <th className="py-3 px-4">Cấp Bậc Thẻ</th>
                <th className="py-3 px-4">Điểm Tích Lũy</th>
                <th className="py-3 px-4">Số Dư Ví Token</th>
                <th className="py-3 px-4 text-right">Thao Tác Đồng Bộ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Đang tải dữ liệu khách hàng từ PostgreSQL...</span>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                    <Users className="w-8 h-8 text-on-surface-variant/40 mx-auto mb-2" />
                    <span>Không tìm thấy khách hàng nào phù hợp.</span>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container/40 transition-colors">
                    {/* User Profile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0 border border-primary/20">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-on-surface text-sm">{c.name}</div>
                          <div className="text-[11px] text-on-surface-variant font-mono">{c.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 font-mono text-on-surface">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-on-surface-variant" />
                        <span>{c.phoneNumber}</span>
                      </div>
                    </td>

                    {/* Tier badge */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${getBadgeColor(c.membershipLevel)}`}>
                        <Award className="w-3 h-3" />
                        {c.membershipLevel}
                      </span>
                    </td>

                    {/* Points */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-amber-600 font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{ApiService.formatNumber(c.points)}</span>
                      </div>
                    </td>

                    {/* Tokens */}
                    <td className="py-3.5 px-4">
                      <div className="font-black text-emerald-600">
                        {ApiService.formatNumber(c.tokenBalance)} T
                      </div>
                      <div className="text-[10px] text-on-surface-variant">
                        ≈ {ApiService.formatVND(c.tokenBalance * 10)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1-Click Sync to Stroller Screen */}
                        <button
                          onClick={() => handleSyncToStroller(c)}
                          disabled={syncingId === c.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold active:scale-95 transition-all shadow-xs"
                          title={`Kích hoạt tài khoản ${c.name} lên màn hình xe đẩy STR_001`}
                        >
                          <Send className={`w-3.5 h-3.5 ${syncingId === c.id ? 'animate-bounce' : ''}`} />
                          <span>{syncingId === c.id ? 'Đang gửi...' : 'Bắn lên Xe STR_001'}</span>
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          className="p-1.5 rounded-lg border border-outline-variant hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
                          title="Sửa thông tin"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteCustomer(c)}
                          className="p-1.5 rounded-lg border border-outline-variant hover:bg-rose-500/10 text-on-surface-variant hover:text-rose-500 transition-colors"
                          title="Xóa khách hàng"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm / Sửa Khách Hàng */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-on-surface mb-1">
              {modalMode === 'create' ? 'Thêm Khách Hàng Mới' : 'Cập Nhật Khách Hàng'}
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Thông tin sẽ được cập nhật trực tiếp vào cơ sở dữ liệu PostgreSQL `stroller_db`.
            </p>

            <form onSubmit={handleSubmitForm} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-surface-container border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="0987654321"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-surface-container border border-outline-variant focus:outline-none focus:border-primary text-on-surface font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Email (tùy chọn)</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-surface-container border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Hạng thành viên</label>
                  <select
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-surface-container border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
                  >
                    <option value="Hội viên Mới">Hội viên Mới</option>
                    <option value="Hội viên Thân Thiết">Hội viên Thân Thiết</option>
                    <option value="Hội viên Bạc">Hội viên Bạc</option>
                    <option value="Hội viên Vàng">Hội viên Vàng</option>
                    <option value="Hội viên Kim Cương">Hội viên Kim Cương</option>
                    <option value="Hội viên VIP">Hội viên VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Điểm thưởng</label>
                  <input
                    type="number"
                    value={formPoints}
                    onChange={(e) => setFormPoints(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-surface-container border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Số dư Ví Token</label>
                <input
                  type="number"
                  value={formToken}
                  onChange={(e) => setFormToken(parseFloat(e.target.value) || 0)}
                  placeholder="50000"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-surface-container border border-outline-variant focus:outline-none focus:border-primary text-on-surface font-mono"
                />
                <p className="text-[10px] text-on-surface-variant mt-1">1 Token = 10 VNĐ. Khách hàng dùng Token để thanh toán QR hoặc tự động.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {formLoading ? 'Đang lưu...' : modalMode === 'create' ? 'Thêm Khách Hàng' : 'Cập Nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
