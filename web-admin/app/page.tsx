'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import KpiCard from '@/components/KpiCard';
import { ApiService } from '@/services/api';

export default function DashboardOverview() {
  const [activeRange, setActiveRange] = useState<'week' | 'month'>('week');
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedRestockProduct, setSelectedRestockProduct] = useState<string>('Bánh Oreo socola 137g');
  const [restockSuccessMsg, setRestockSuccessMsg] = useState<string | null>(null);

  const [overview, setOverview] = useState<any>({
    todayRevenue: 12500000,
    todayOrders: 12,
    totalProducts: 8,
    lowStock: 0,
    outStock: 0,
    totalStrollers: 8,
    activeStrollers: 6,
    topProducts: [
      { rank: 1, id: 3, name: 'Táo Envy New Zealand', price: 125000, soldCount: 48, revenue: 6000000, trend: 'up' },
      { rank: 2, id: 2, name: 'Bơ sáp loại 1 (KG)', price: 45000, soldCount: 32, revenue: 1440000, trend: 'up' },
      { rank: 3, id: 1, name: 'Sữa tươi tiệt trùng ít đường 1L', price: 34000, soldCount: 55, revenue: 1870000, trend: 'up' },
      { rank: 4, id: 7, name: 'Bánh quy kẹp kem Oreo socola 137g', price: 18000, soldCount: 60, revenue: 1080000, trend: 'up' },
    ],
    stockAlerts: [],
    revenueTrend7Days: [10.5, 12.2, 9.8, 14.5, 11.0, 15.2, 12.5],
    orderStatusDistribution: { paid: 8, processing: 2, completed: 2, cancelled: 0 }
  });

  useEffect(() => {
    ApiService.getOverview().then(data => {
      if (data) setOverview(data);
    });
  }, []);

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRestockSuccessMsg(`Đã tạo phiếu nhập kho thành công cho: ${selectedRestockProduct}`);
    setTimeout(() => {
      setShowRestockModal(false);
      setRestockSuccessMsg(null);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Tổng quan hệ thống</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Theo dõi hiệu suất và trạng thái hoạt động trong ngày của chuỗi Smart Cart.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveRange(activeRange === 'week' ? 'month' : 'week')}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant/50 rounded-xl bg-surface-container-lowest text-sm font-semibold hover:bg-surface-container-high transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-lg text-primary">calendar_today</span>
            <span>{activeRange === 'week' ? 'Dữ liệu: Tuần này' : 'Dữ liệu: Tháng này'}</span>
            <span className="material-symbols-outlined text-sm text-on-surface-variant">expand_more</span>
          </button>
          <button
            onClick={() => setShowRestockModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-container transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
            <span>Tạo phiếu nhập hàng</span>
          </button>
        </div>
      </div>

      {/* Row 1: KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-card-gap">
        <KpiCard
          title="Doanh thu hôm nay"
          value={ApiService.formatVND(overview.todayRevenue)}
          icon="payments"
          iconBgColor="bg-primary/10"
          iconTextColor="text-primary"
          trend="+12.5%"
          trendText="so với hôm qua"
          trendType="up"
        />
        <KpiCard
          title="Đơn hàng hôm nay"
          value={ApiService.formatNumber(overview.todayOrders)}
          icon="receipt_long"
          iconBgColor="bg-chart-blue/10"
          iconTextColor="text-chart-blue"
          trend="+8.2%"
          trendText="so với hôm qua"
          trendType="up"
        />
        <KpiCard
          title="Sản phẩm đang bán"
          value={ApiService.formatNumber(overview.totalProducts)}
          icon="inventory"
          iconBgColor="bg-chart-indigo/10"
          iconTextColor="text-chart-indigo"
          trend="Ổn định"
          trendType="neutral"
        />
        <KpiCard
          title="Sản phẩm sắp hết"
          value={overview.lowStock.toString()}
          icon="warning"
          iconBgColor="bg-warning/10"
          iconTextColor="text-warning"
          trend="Cần nhập hàng"
          trendType="warning"
          borderColor="border-warning/40"
        />
        <KpiCard
          title="Smart Cart hoạt động"
          value={
            <span>
              {overview.activeStrollers}<span className="text-base font-normal text-on-surface-variant">/{overview.totalStrollers}</span>
            </span>
          }
          icon="shopping_basket"
          iconBgColor="bg-success/10"
          iconTextColor="text-success"
          trend="Đang kết nối"
          trendType="up"
          borderColor="border-success/40"
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-card-gap">
        {/* Doanh thu 7 ngày (Area/Line Chart) */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-outline-variant/30 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-on-surface">Biểu đồ doanh thu</h3>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Tổng 7 ngày gần nhất:{' '}
                <span className="font-bold text-primary">891.4 triệu ₫</span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
              <span>Doanh thu theo ngày (Triệu VNĐ)</span>
            </div>
          </div>

          {/* SVG Line / Area Graph */}
          <div className="h-64 w-full relative">
            {/* Y-axis values */}
            <div className="absolute left-0 top-0 bottom-6 w-10 flex flex-col justify-between text-xs text-on-surface-variant text-right pr-2 select-none">
              <span>200M</span>
              <span>150M</span>
              <span>100M</span>
              <span>50M</span>
              <span>0M</span>
            </div>

            {/* Grid & Chart Area */}
            <div className="absolute left-12 right-0 top-2 bottom-6 border-b border-outline-variant/30">
              {/* Horizontal gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="w-full h-px bg-outline-variant/15"></div>
                <div className="w-full h-px bg-outline-variant/15"></div>
                <div className="w-full h-px bg-outline-variant/15"></div>
                <div className="w-full h-px bg-outline-variant/15"></div>
                <div className="w-full h-px"></div>
              </div>

              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 200">
                <defs>
                  <linearGradient id="revenueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0040a1" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#0040a1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Area */}
                <polygon
                  fill="url(#revenueGrad)"
                  points="0,200 0,110 116,90 233,135 350,60 466,85 583,40 700,20 700,200"
                />
                {/* Line */}
                <polyline
                  fill="none"
                  stroke="#0040a1"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="0,110 116,90 233,135 350,60 466,85 583,40 700,20"
                />
                {/* Points */}
                <circle cx="0" cy="110" r="4" fill="#ffffff" stroke="#0040a1" strokeWidth="2.5" />
                <circle cx="116" cy="90" r="4" fill="#ffffff" stroke="#0040a1" strokeWidth="2.5" />
                <circle cx="233" cy="135" r="4" fill="#ffffff" stroke="#0040a1" strokeWidth="2.5" />
                <circle cx="350" cy="60" r="4" fill="#ffffff" stroke="#0040a1" strokeWidth="2.5" />
                <circle cx="466" cy="85" r="4" fill="#ffffff" stroke="#0040a1" strokeWidth="2.5" />
                <circle cx="583" cy="40" r="4" fill="#ffffff" stroke="#0040a1" strokeWidth="2.5" />
                <circle cx="700" cy="20" r="5" fill="#ffffff" stroke="#0040a1" strokeWidth="3" />
              </svg>
            </div>

            {/* X-axis labels */}
            <div className="absolute left-12 right-0 bottom-0 h-6 flex justify-between text-xs font-semibold text-on-surface-variant pt-2 select-none">
              <span>Thứ 2</span>
              <span>Thứ 3</span>
              <span>Thứ 4</span>
              <span>Thứ 5</span>
              <span>Thứ 6</span>
              <span>Thứ 7</span>
              <span className="text-primary font-bold">Chủ nhật (Hôm nay)</span>
            </div>
          </div>
        </div>

        {/* Trạng thái đơn hàng (Donut Chart) */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-outline-variant/30 p-6 flex flex-col justify-between">
          <h3 className="text-lg font-bold text-on-surface mb-4">Trạng thái đơn hàng</h3>

          <div className="flex-1 flex flex-col justify-center items-center relative py-2">
            <div className="w-44 h-44 relative">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Đã thanh toán (Blue) 280/356 ~ 78% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#0056d2"
                  strokeWidth="14"
                  strokeDasharray="238.7"
                  strokeDashoffset="52"
                  className="hover:opacity-85 transition-opacity cursor-pointer"
                />
                {/* Hoàn thành (Success) 42/356 ~ 12% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#22C55E"
                  strokeWidth="14"
                  strokeDasharray="238.7"
                  strokeDashoffset="210"
                  transform="rotate(282 50 50)"
                  className="hover:opacity-85 transition-opacity cursor-pointer"
                />
                {/* Đang xử lý (Warning) 26/356 ~ 7% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth="14"
                  strokeDasharray="238.7"
                  strokeDashoffset="222"
                  transform="rotate(325 50 50)"
                  className="hover:opacity-85 transition-opacity cursor-pointer"
                />
                {/* Đã hủy (Danger) 8/356 ~ 2% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#EF4444"
                  strokeWidth="14"
                  strokeDasharray="238.7"
                  strokeDashoffset="233.9"
                  transform="rotate(350 50 50)"
                  className="hover:opacity-85 transition-opacity cursor-pointer"
                />
              </svg>

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-on-surface">{overview.todayOrders}</span>
                <span className="text-xs font-semibold text-on-surface-variant">Tổng đơn</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="w-full mt-4 flex flex-col gap-2.5 text-xs font-semibold">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-container"></div>
                <span className="text-on-surface">Đã thanh toán</span>
              </div>
              <span className="font-bold text-on-surface">{overview.orderStatusDistribution?.paid || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span className="text-on-surface">Hoàn thành</span>
              </div>
              <span className="font-bold text-on-surface">{overview.orderStatusDistribution?.completed || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <span className="text-on-surface">Đang xử lý</span>
              </div>
              <span className="font-bold text-on-surface">{overview.orderStatusDistribution?.processing || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-danger"></div>
                <span className="text-on-surface">Đã hủy</span>
              </div>
              <span className="font-bold text-on-surface">{overview.orderStatusDistribution?.cancelled || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Tables & Alert Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-card-gap">
        {/* Top Products Table */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-outline-variant/30 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center">
            <h3 className="text-lg font-bold text-on-surface">Top sản phẩm nổi bật hôm nay</h3>
            <Link
              href="/products"
              className="text-primary hover:text-primary-container text-xs font-bold flex items-center gap-1 group"
            >
              <span>Xem tất cả</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant uppercase text-[11px] font-bold tracking-wider">
                  <th className="px-6 py-3.5 w-12">#</th>
                  <th className="px-6 py-3.5">Tên sản phẩm</th>
                  <th className="px-6 py-3.5 text-right">Đã bán</th>
                  <th className="px-6 py-3.5 text-right">Doanh thu</th>
                  <th className="px-6 py-3.5 text-center">Xu hướng</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-outline-variant/20">
                {overview.topProducts && overview.topProducts.length > 0 ? (
                  overview.topProducts.map((p: any, idx: number) => (
                    <tr key={p.id || idx} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-on-surface-variant">{p.rank || idx + 1}</td>
                      <td className="px-6 py-4 font-semibold text-on-surface">{p.name}</td>
                      <td className="px-6 py-4 text-right font-semibold">{ApiService.formatNumber(p.soldCount || 45)}</td>
                      <td className="px-6 py-4 text-right font-bold text-primary">
                        {ApiService.formatVND(p.revenue || p.price * 45)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center p-1 bg-success/10 text-success rounded-lg">
                          <span className="material-symbols-outlined text-[16px]">trending_up</span>
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                      Chưa có dữ liệu giao dịch
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cảnh báo tồn kho */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="text-lg font-bold text-on-surface">Cảnh báo tồn kho</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                overview.stockAlerts && overview.stockAlerts.length > 0
                  ? 'bg-danger/10 text-danger border-danger/20'
                  : 'bg-success/10 text-success border-success/20'
              }`}>
                {overview.stockAlerts && overview.stockAlerts.length > 0
                  ? `${overview.stockAlerts.length} Mặt hàng`
                  : 'Kho an toàn 100%'}
              </span>
            </div>

            <div className="p-4 space-y-3">
              {overview.stockAlerts && overview.stockAlerts.length > 0 ? (
                overview.stockAlerts.map((alert: any) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant/30">
                    <div className="mt-0.5 p-1.5 bg-danger/10 text-danger rounded-lg">
                      <span className="material-symbols-outlined text-lg">error</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-on-surface text-sm">{alert.name}</h4>
                        <span className="text-[11px] font-bold text-danger bg-danger/10 px-2 py-0.5 rounded-full">
                          {alert.status === 'out' ? 'Hết hàng' : `Còn ${alert.stock}`}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">Kho: {alert.stock} • Ngành: {alert.category}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mb-1">
                    <span className="material-symbols-outlined text-2xl">verified</span>
                  </div>
                  <h4 className="font-bold text-on-surface text-sm">Kho hàng an toàn tuyệt đối</h4>
                  <p className="text-xs text-on-surface-variant max-w-xs">
                    Tất cả 8 sản phẩm đều đạt định mức 100 sản phẩm theo cấu hình kho thực tế.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low/40">
            <button
              onClick={() => setShowRestockModal(true)}
              className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-container transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              <span>Tạo phiếu nhập hàng ngay</span>
            </button>
          </div>
        </div>
      </div>

      {/* Restock Modal */}
      {showRestockModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/30 space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_shopping_cart</span>
                <span>Tạo phiếu nhập hàng kho</span>
              </h3>
              <button
                onClick={() => setShowRestockModal(false)}
                className="p-1 text-on-surface-variant hover:text-danger rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {restockSuccessMsg ? (
              <div className="p-4 bg-success/10 border border-success/30 rounded-xl text-success font-semibold text-sm text-center">
                {restockSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleRestockSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Chọn sản phẩm cần nhập</label>
                  <select
                    value={selectedRestockProduct}
                    onChange={(e) => setSelectedRestockProduct(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Bánh Oreo socola 137g">Bánh Oreo socola 137g (Tồn: 0)</option>
                    <option value="Nước ngọt Coca Cola 330ml">Nước ngọt Coca Cola 330ml (Tồn: 0)</option>
                    <option value="Nước khoáng La Vie 500ml">Nước khoáng La Vie 500ml (Tồn: 42)</option>
                    <option value="Táo Envy New Zealand">Táo Envy New Zealand (Tồn: 18)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">Số lượng nhập dự kiến</label>
                  <input
                    type="number"
                    defaultValue={200}
                    min={1}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">Nhà cung cấp</label>
                  <input
                    type="text"
                    defaultValue="Công ty Cổ phần Mondelez Kinh Đô"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRestockModal(false)}
                    className="px-4 py-2 rounded-xl border border-outline-variant text-on-surface-variant font-semibold hover:bg-surface-container-high"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-container shadow-sm active:scale-95"
                  >
                    Xác nhận nhập hàng
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
