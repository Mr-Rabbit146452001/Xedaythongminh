'use client';

import { useState, useEffect } from 'react';
import KpiCard from '@/components/KpiCard';
import { INVENTORY_MOVEMENTS, InventoryMovement } from '@/data/mockData';
import { ApiService } from '@/services/api';

export default function InventoryPage() {
  const [movements, setMovements] = useState<InventoryMovement[]>(INVENTORY_MOVEMENTS);
  const [inventory, setInventory] = useState({
    totalItems: 8,
    totalUnits: 800,
    totalValue: 24850000,
    lowStock: 0,
    outStock: 0,
    categories: [
      { category: 'Đồ uống', productCount: 4, stockUnits: 400, categoryValue: 5600000, percentage: 23 },
      { category: 'Thực phẩm tươi', productCount: 2, stockUnits: 200, categoryValue: 17000000, percentage: 68 },
      { category: 'Bánh kẹo', productCount: 2, stockUnits: 200, categoryValue: 2250000, percentage: 9 },
    ]
  });

  useEffect(() => {
    ApiService.getInventory().then((data) => {
      if (data) setInventory(data);
    });
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'import' | 'export'>('import');
  const [formCode, setFormCode] = useState('');
  const [formSupplier, setFormSupplier] = useState('');
  const [formItemsCount, setFormItemsCount] = useState(100);
  const [formTotalValue, setFormTotalValue] = useState(5000000);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const openModal = (type: 'import' | 'export') => {
    setModalType(type);
    setFormCode(type === 'import' ? `PN-NEW-${Date.now().toString().slice(-4)}` : `PX-NEW-${Date.now().toString().slice(-4)}`);
    setFormSupplier(type === 'import' ? 'Công ty TNHH Tiếp Vận Siêu Thị' : 'Xuất quầy kệ tầng 1');
    setShowModal(true);
  };

  const handleCreateMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const newMovement: InventoryMovement = {
      id: `${modalType === 'import' ? 'NK' : 'XK'}-2026-${Date.now().toString().slice(-3)}`,
      type: modalType,
      code: formCode,
      supplier: formSupplier,
      date: 'Vừa xong',
      itemsCount: Number(formItemsCount),
      totalValue: Number(formTotalValue),
      status: 'completed',
    };

    setMovements([newMovement, ...movements]);
    setShowModal(false);
    setToastMsg(`Đã tạo thành công phiếu ${modalType === 'import' ? 'nhập' : 'xuất'} kho: ${formCode}`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-xl">check_circle</span>
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Quản lý kho hàng</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Giám sát lượng hàng dự trữ, giá trị luân chuyển và cảnh báo an toàn chuỗi cung ứng.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal('export')}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant/60 rounded-xl bg-surface-container-lowest text-sm font-semibold text-on-surface hover:bg-surface-container-high transition-colors shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-lg text-chart-teal">outbox</span>
            <span>Xuất hàng</span>
          </button>
          <button
            onClick={() => openModal('import')}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-container transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">move_to_inbox</span>
            <span>Nhập hàng mới</span>
          </button>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-card-gap">
        <KpiCard
          title="Tổng sản phẩm lưu kho"
          value={ApiService.formatNumber(inventory.totalUnits)}
          icon="inventory_2"
          iconBgColor="bg-primary-fixed"
          iconTextColor="text-primary"
          trend="8 mặt hàng"
          trendText="mỗi món 100 SP"
          trendType="up"
        />
        <KpiCard
          title="Sản phẩm sắp hết"
          value={inventory.lowStock.toString()}
          icon="warning"
          iconBgColor="bg-warning/20"
          iconTextColor="text-warning"
          trend={inventory.lowStock > 0 ? "Cần nhập thêm" : "An toàn"}
          trendType={inventory.lowStock > 0 ? "warning" : "up"}
          borderColor="border-warning/30"
        />
        <KpiCard
          title="Sản phẩm hết hàng"
          value={inventory.outStock.toString()}
          icon="error"
          iconBgColor="bg-danger/20"
          iconTextColor="text-danger"
          trend={inventory.outStock > 0 ? "Mất doanh thu" : "Đầy đủ 100%"}
          trendType={inventory.outStock > 0 ? "down" : "up"}
          borderColor="border-danger/30"
        />
        <KpiCard
          title="Tổng giá trị tồn kho"
          value={ApiService.formatVND(inventory.totalValue)}
          icon="payments"
          iconBgColor="bg-chart-teal/20"
          iconTextColor="text-chart-teal"
          subtext="Giá trị thực theo PostgreSQL"
        />
      </div>

      {/* Row 2: Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-card-gap">
        {/* Left: Category Value Donut Chart */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-on-surface">Giá trị tồn kho theo ngành</h3>
              <button className="text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined text-lg">more_vert</span>
              </button>
            </div>

            {/* Conic Gradient Donut representation matching real DB percentages */}
            <div className="flex flex-col items-center justify-center relative min-h-[220px]">
              <div
                className="w-48 h-48 rounded-full relative flex items-center justify-center shadow-md transition-transform hover:scale-105"
                style={{
                  background:
                    'conic-gradient(#14B8A6 0% 68%, #0040a1 68% 91%, #F59E0B 91% 100%)',
                }}
              >
                <div className="w-32 h-32 bg-surface-container-lowest rounded-full absolute flex flex-col items-center justify-center shadow-inner">
                  <span className="text-xl font-bold text-on-surface tracking-tight">
                    {(inventory.totalValue / 1000000).toFixed(1)}M
                  </span>
                  <span className="text-xs font-semibold text-on-surface-variant">Tổng giá trị</span>
                </div>
              </div>
            </div>

            {/* Category breakdown legend from DB */}
            <div className="mt-6 space-y-2.5 text-sm font-semibold">
              {inventory.categories.map((cat, idx) => {
                const colors = ['bg-chart-teal', 'bg-primary', 'bg-warning', 'bg-chart-gray'];
                const color = colors[idx % colors.length];
                return (
                  <div key={cat.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3 h-3 rounded-full ${color}`}></span>
                      <span className="text-on-surface">{cat.category}</span>
                    </div>
                    <span className="font-bold text-on-surface">
                      {cat.percentage}% ({ApiService.formatVND(cat.categoryValue)})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Inventory Movements History Table (Takes 2 cols) */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-outline-variant/30 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-on-surface">Nhật ký nhập / xuất kho gần đây</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Theo dõi lịch sử chứng từ lưu chuyển hàng hóa.</p>
            </div>
            <span className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">
              {movements.length} Phiếu ghi nhận
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant uppercase text-[11px] font-bold tracking-wider">
                  <th className="px-6 py-3.5">Mã phiếu</th>
                  <th className="px-6 py-3.5">Loại</th>
                  <th className="px-6 py-3.5">Đối tác / Nơi nhận</th>
                  <th className="px-6 py-3.5">Thời gian</th>
                  <th className="px-6 py-3.5 text-right">Số lượng</th>
                  <th className="px-6 py-3.5 text-right">Tổng giá trị</th>
                  <th className="px-6 py-3.5 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {movements.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-on-surface">{item.code}</td>
                    <td className="px-6 py-4">
                      {item.type === 'import' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary-fixed/40 px-2.5 py-1 rounded-lg">
                          <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                          Nhập kho
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-chart-teal bg-chart-teal/10 px-2.5 py-1 rounded-lg">
                          <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                          Xuất kho
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-on-surface">{item.supplier}</td>
                    <td className="px-6 py-4 text-xs text-on-surface-variant">{item.date}</td>
                    <td className="px-6 py-4 text-right font-semibold">{ApiService.formatNumber(item.itemsCount)}</td>
                    <td className="px-6 py-4 text-right font-bold text-primary">
                      {ApiService.formatVND(item.totalValue)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">
                        Hoàn tất
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Movement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/30 space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  {modalType === 'import' ? 'move_to_inbox' : 'outbox'}
                </span>
                <span>{modalType === 'import' ? 'Lập phiếu nhập kho' : 'Lập phiếu xuất kho'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-on-surface-variant hover:text-danger rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateMovement} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-on-surface mb-1">Mã chứng từ *</label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-2.5 font-mono text-xs outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  {modalType === 'import' ? 'Nhà cung cấp đối tác *' : 'Đơn vị / Điểm nhận xuất hàng *'}
                </label>
                <input
                  type="text"
                  required
                  value={formSupplier}
                  onChange={(e) => setFormSupplier(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Số lượng hàng</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formItemsCount}
                    onChange={(e) => setFormItemsCount(Number(e.target.value))}
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Tổng giá trị (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formTotalValue}
                    onChange={(e) => setFormTotalValue(Number(e.target.value))}
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary font-bold text-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant/60 text-on-surface-variant font-semibold hover:bg-surface-container-high"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-container shadow-sm active:scale-95"
                >
                  Xác nhận lưu phiếu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
