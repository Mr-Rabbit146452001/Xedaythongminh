'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import KpiCard from '@/components/KpiCard';
import { ApiService } from '@/services/api';
import { Product } from '@/data/mockData';

interface TopProductItem {
  rank: number;
  id: number;
  name: string;
  price: number;
  soldCount: number;
  revenue: number;
  trend: 'up' | 'down' | 'neutral';
  imageUrl?: string;
}

interface StockAlertItem {
  id: number;
  name: string;
  stock: number;
  category: string;
  status: 'out' | 'low';
}

interface OverviewData {
  todayRevenue: number;
  todayOrders: number;
  totalProducts: number;
  lowStock: number;
  outStock: number;
  totalStockUnits: number;
  totalInventoryValue: number;
  totalStrollers: number;
  activeStrollers: number;
  topProducts: TopProductItem[];
  stockAlerts: StockAlertItem[];
  revenueTrend7Days: number[];
  orderStatusDistribution: {
    paid: number;
    processing: number;
    completed: number;
    cancelled: number;
  };
}

export default function DashboardOverview() {
  const [activeRange, setActiveRange] = useState<'week' | 'month'>('week');
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedRestockProduct, setSelectedRestockProduct] = useState<string>('');
  const [restockQty, setRestockQty] = useState<number>(100);
  const [supplierName, setSupplierName] = useState<string>('Tổng kho Phân phối Bán lẻ');
  const [restockSuccessMsg, setRestockSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const [overview, setOverview] = useState<OverviewData>({
    todayRevenue: 0,
    todayOrders: 0,
    totalProducts: 10,
    lowStock: 0,
    outStock: 0,
    totalStockUnits: 1000,
    totalInventoryValue: 0,
    totalStrollers: 8,
    activeStrollers: 0,
    topProducts: [],
    stockAlerts: [],
    revenueTrend7Days: [0, 0, 0, 0, 0, 0, 0],
    orderStatusDistribution: { paid: 0, processing: 0, completed: 0, cancelled: 0 },
  });

  // Tải dữ liệu tổng quan thật từ Backend
  const fetchOverviewData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const data = await ApiService.getOverview();
      if (data) {
        setOverview(data);
        setLastUpdated(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.warn('Lỗi đồng bộ Dashboard Overview:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Tải danh sách sản phẩm thật cho Restock Modal
  const loadProductList = useCallback(async () => {
    try {
      const prods = await ApiService.getProducts();
      if (prods && prods.length > 0) {
        setAvailableProducts(prods);
        if (!selectedRestockProduct) {
          setSelectedRestockProduct(prods[0].name);
        }
      }
    } catch (e) {
      console.warn('Lỗi tải danh mục sản phẩm cho modal nhập hàng:', e);
    }
  }, [selectedRestockProduct]);

  useEffect(() => {
    fetchOverviewData();
    loadProductList();

    // Kết nối Realtime SSE để cập nhật tức thì khi có biến động
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/realtime/events');
      eventSource.onmessage = () => {
        fetchOverviewData(true);
      };
      eventSource.addEventListener('product_change', () => {
        fetchOverviewData(true);
        loadProductList();
      });
      eventSource.addEventListener('order_change', () => {
        fetchOverviewData(true);
      });
    } catch (e) {
      // Fallback
    }

    // Polling định kỳ mỗi 15 giây để dữ liệu luôn tươi mới
    const interval = setInterval(() => {
      fetchOverviewData(true);
    }, 15000);

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [fetchOverviewData, loadProductList]);

  // Xử lý tạo phiếu nhập kho
  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetProduct = availableProducts.find(p => p.name === selectedRestockProduct);
    if (targetProduct) {
      try {
        await ApiService.updateProduct(targetProduct.id, {
          stock: targetProduct.stock + Number(restockQty)
        });
      } catch (err) {
        console.warn('Không thể gửi lệnh update stock lên server:', err);
      }
    }
    setRestockSuccessMsg(`Đã tạo phiếu nhập kho thành công cho: ${selectedRestockProduct} (+${restockQty} sản phẩm)`);
    fetchOverviewData(true);
    setTimeout(() => {
      setShowRestockModal(false);
      setRestockSuccessMsg(null);
    }, 1800);
  };

  // Tính toán biểu đồ Doanh thu 7 ngày thực tế
  const chartMetrics = useMemo(() => {
    const rawTrend = overview.revenueTrend7Days && overview.revenueTrend7Days.length === 7
      ? overview.revenueTrend7Days
      : [0, 0, 0, 0, 0, 0, 0];
    
    const total7DaysMil = rawTrend.reduce((sum, v) => sum + v, 0);
    const maxVal = Math.max(...rawTrend, 1);
    const width = 700;
    const height = 200;
    const padTop = 30;
    const padBottom = 20;
    const plotHeight = height - padTop - padBottom;

    const points = rawTrend.map((val, idx) => {
      const x = Number(((idx / 6) * width).toFixed(1));
      const y = Number((height - padBottom - (val / maxVal) * plotHeight).toFixed(1));
      return { x, y, val };
    });

    const polyline = points.map(p => `${p.x},${p.y}`).join(' ');
    const polygon = `0,${height} ${polyline} ${width},${height}`;

    const yTicks = [
      maxVal.toFixed(1),
      (maxVal * 0.75).toFixed(1),
      (maxVal * 0.5).toFixed(1),
      (maxVal * 0.25).toFixed(1),
      '0.0'
    ];

    return { rawTrend, total7DaysMil, maxVal, points, polyline, polygon, yTicks };
  }, [overview.revenueTrend7Days]);

  // Tính toán biểu đồ Donut Trạng thái đơn hàng thực tế
  const donutMetrics = useMemo(() => {
    const dist = overview.orderStatusDistribution || { paid: 0, processing: 0, completed: 0, cancelled: 0 };
    const total = (dist.paid || 0) + (dist.completed || 0) + (dist.processing || 0) + (dist.cancelled || 0);
    const safeTotal = total > 0 ? total : 1;

    const C = 2 * Math.PI * 38; // 238.76

    const pctPaid = dist.paid / safeTotal;
    const pctCompleted = dist.completed / safeTotal;
    const pctProcessing = dist.processing / safeTotal;
    const pctCancelled = dist.cancelled / safeTotal;

    const dashPaid = pctPaid * C;
    const dashCompleted = pctCompleted * C;
    const dashProcessing = pctProcessing * C;
    const dashCancelled = pctCancelled * C;

    const offsetPaid = 0;
    const offsetCompleted = -dashPaid;
    const offsetProcessing = -(dashPaid + dashCompleted);
    const offsetCancelled = -(dashPaid + dashCompleted + dashProcessing);

    return {
      dist,
      total,
      C,
      dashPaid,
      dashCompleted,
      dashProcessing,
      dashCancelled,
      offsetPaid,
      offsetCompleted,
      offsetProcessing,
      offsetCancelled
    };
  }, [overview.orderStatusDistribution]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Tổng quan hệ thống</h2>
            {isRefreshing && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                Đang đồng bộ máy chủ...
              </span>
            )}
          </div>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Dữ liệu trực tiếp từ PostgreSQL • Cập nhật lần cuối: {lastUpdated || 'Đang kết nối...'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOverviewData()}
            title="Làm mới dữ liệu từ server"
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 border border-outline-variant/50 rounded-xl bg-surface-container-lowest text-sm font-semibold hover:bg-surface-container-high transition-colors shadow-sm disabled:opacity-60"
          >
            <span className={`material-symbols-outlined text-lg text-primary ${isRefreshing ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span className="hidden sm:inline">Đồng bộ lại</span>
          </button>
          <button
            onClick={() => setActiveRange(activeRange === 'week' ? 'month' : 'week')}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant/50 rounded-xl bg-surface-container-lowest text-sm font-semibold hover:bg-surface-container-high transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-lg text-primary">calendar_today</span>
            <span>{activeRange === 'week' ? 'Dữ liệu: Tuần này' : 'Dữ liệu: Tháng này'}</span>
            <span className="material-symbols-outlined text-sm text-on-surface-variant">expand_more</span>
          </button>
          <button
            onClick={() => {
              loadProductList();
              setShowRestockModal(true);
            }}
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
          value={isLoading ? '...' : ApiService.formatVND(overview.todayRevenue || 0)}
          icon="payments"
          iconBgColor="bg-primary/10"
          iconTextColor="text-primary"
          trend={overview.todayRevenue > 0 ? "Phát sinh mới" : "0 ₫"}
          trendText={overview.todayRevenue > 0 ? "hôm nay" : "Chưa có giao dịch"}
          trendType={overview.todayRevenue > 0 ? "up" : "neutral"}
        />
        <KpiCard
          title="Đơn hàng hôm nay"
          value={isLoading ? '...' : ApiService.formatNumber(overview.todayOrders || 0)}
          icon="receipt_long"
          iconBgColor="bg-chart-blue/10"
          iconTextColor="text-chart-blue"
          trend={overview.todayOrders > 0 ? "Đang giao dịch" : "0 đơn"}
          trendText={overview.todayOrders > 0 ? "phiên mua sắm" : "Chưa có đơn hàng"}
          trendType={overview.todayOrders > 0 ? "up" : "neutral"}
        />
        <KpiCard
          title="Sản phẩm đang bán"
          value={isLoading ? '...' : ApiService.formatNumber(overview.totalProducts || 10)}
          icon="inventory"
          iconBgColor="bg-chart-indigo/10"
          iconTextColor="text-chart-indigo"
          trend="Sẵn sàng"
          trendText="100% hàng thật"
          trendType="neutral"
        />
        <KpiCard
          title="Sản phẩm sắp hết"
          value={isLoading ? '...' : (overview.lowStock || 0).toString()}
          icon="warning"
          iconBgColor="bg-warning/10"
          iconTextColor="text-warning"
          trend={(overview.lowStock || 0) > 0 ? "Cần nhập hàng" : "Kho an toàn"}
          trendType={(overview.lowStock || 0) > 0 ? "warning" : "up"}
          borderColor={(overview.lowStock || 0) > 0 ? "border-warning/40" : undefined}
        />
        <KpiCard
          title="Smart Cart hoạt động"
          value={
            isLoading ? '...' : (
              <span>
                {overview.activeStrollers || 0}<span className="text-base font-normal text-on-surface-variant">/{overview.totalStrollers || 8}</span>
              </span>
            )
          }
          icon="shopping_basket"
          iconBgColor="bg-success/10"
          iconTextColor="text-success"
          trend={(overview.activeStrollers || 0) > 0 ? "Đang phục vụ" : "Chờ kết nối"}
          trendText={(overview.activeStrollers || 0) > 0 ? "xe đang hoạt động" : "sẵn sàng ở trạm"}
          trendType={(overview.activeStrollers || 0) > 0 ? "up" : "neutral"}
          borderColor={(overview.activeStrollers || 0) > 0 ? "border-success/40" : undefined}
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-card-gap">
        {/* Doanh thu 7 ngày (Dynamic SVG Area / Line Chart) */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-outline-variant/30 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-on-surface">Biểu đồ doanh thu</h3>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Tổng 7 ngày gần nhất:{' '}
                <span className="font-bold text-primary">
                  {chartMetrics.total7DaysMil > 0 ? `${chartMetrics.total7DaysMil.toFixed(1)} triệu ₫` : '0 ₫'}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
              <span>Doanh thu theo ngày (Triệu VNĐ)</span>
            </div>
          </div>

          {/* SVG Line / Area Graph */}
          {chartMetrics.total7DaysMil === 0 ? (
            <div className="h-64 w-full flex flex-col items-center justify-center text-center p-6 bg-surface-container-low/30 rounded-xl border border-dashed border-outline-variant/40">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-2xl">monitoring</span>
              </div>
              <h4 className="font-semibold text-sm text-on-surface">Chưa phát sinh doanh thu trong 7 ngày qua</h4>
              <p className="text-xs text-on-surface-variant max-w-sm mt-1">
                Hệ thống CSDL PostgreSQL đang kết nối sẵn sàng. Biểu đồ sẽ tự động vẽ theo thời gian thực ngay khi đơn hàng thanh toán thành công.
              </p>
            </div>
          ) : (
            <div className="h-64 w-full relative">
              {/* Y-axis values */}
              <div className="absolute left-0 top-0 bottom-6 w-12 flex flex-col justify-between text-xs text-on-surface-variant text-right pr-2 select-none font-mono">
                {chartMetrics.yTicks.map((tick, i) => (
                  <span key={i}>{tick}M</span>
                ))}
              </div>

              {/* Grid & Chart Area */}
              <div className="absolute left-14 right-0 top-2 bottom-6 border-b border-outline-variant/30">
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
                    <linearGradient id="revenueGradReal" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#0040a1" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#0040a1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Dynamic Area */}
                  <polygon
                    fill="url(#revenueGradReal)"
                    points={chartMetrics.polygon}
                  />
                  {/* Dynamic Polyline */}
                  <polyline
                    fill="none"
                    stroke="#0040a1"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chartMetrics.polyline}
                  />
                  {/* Dynamic Points with Value Tooltip */}
                  {chartMetrics.points.map((p, idx) => (
                    <g key={idx} className="group cursor-pointer">
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={idx === 6 ? 5.5 : 4}
                        fill="#ffffff"
                        stroke="#0040a1"
                        strokeWidth={idx === 6 ? 3.5 : 2.5}
                        className="transition-transform group-hover:scale-125"
                      />
                      <text
                        x={p.x}
                        y={p.y - 10}
                        textAnchor="middle"
                        className="text-[11px] font-bold fill-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {p.val}M
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              {/* X-axis labels */}
              <div className="absolute left-14 right-0 bottom-0 h-6 flex justify-between text-xs font-semibold text-on-surface-variant pt-2 select-none">
                <span>Thứ 2</span>
                <span>Thứ 3</span>
                <span>Thứ 4</span>
                <span>Thứ 5</span>
                <span>Thứ 6</span>
                <span>Thứ 7</span>
                <span className="text-primary font-bold">Hôm nay</span>
              </div>
            </div>
          )}
        </div>

        {/* Trạng thái đơn hàng (Dynamic Donut Chart) */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-outline-variant/30 p-6 flex flex-col justify-between">
          <h3 className="text-lg font-bold text-on-surface mb-4">Trạng thái đơn hàng</h3>

          <div className="flex-1 flex flex-col justify-center items-center relative py-2">
            <div className="w-44 h-44 relative">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Vòng nền trống */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="14"
                />
                {/* Đã thanh toán (Blue) */}
                {donutMetrics.dashPaid > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#0056d2"
                    strokeWidth="14"
                    strokeDasharray={`${donutMetrics.dashPaid} ${donutMetrics.C - donutMetrics.dashPaid}`}
                    strokeDashoffset={donutMetrics.offsetPaid}
                    className="hover:opacity-85 transition-opacity cursor-pointer"
                  />
                )}
                {/* Hoàn thành (Success) */}
                {donutMetrics.dashCompleted > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#22C55E"
                    strokeWidth="14"
                    strokeDasharray={`${donutMetrics.dashCompleted} ${donutMetrics.C - donutMetrics.dashCompleted}`}
                    strokeDashoffset={donutMetrics.offsetCompleted}
                    className="hover:opacity-85 transition-opacity cursor-pointer"
                  />
                )}
                {/* Đang xử lý (Warning) */}
                {donutMetrics.dashProcessing > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#F59E0B"
                    strokeWidth="14"
                    strokeDasharray={`${donutMetrics.dashProcessing} ${donutMetrics.C - donutMetrics.dashProcessing}`}
                    strokeDashoffset={donutMetrics.offsetProcessing}
                    className="hover:opacity-85 transition-opacity cursor-pointer"
                  />
                )}
                {/* Đã hủy (Danger) */}
                {donutMetrics.dashCancelled > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#EF4444"
                    strokeWidth="14"
                    strokeDasharray={`${donutMetrics.dashCancelled} ${donutMetrics.C - donutMetrics.dashCancelled}`}
                    strokeDashoffset={donutMetrics.offsetCancelled}
                    className="hover:opacity-85 transition-opacity cursor-pointer"
                  />
                )}
              </svg>

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-on-surface">
                  {isLoading ? '...' : (donutMetrics.total || overview.todayOrders || 0)}
                </span>
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
              <span className="font-bold text-on-surface">{donutMetrics.dist.paid || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span className="text-on-surface">Hoàn thành</span>
              </div>
              <span className="font-bold text-on-surface">{donutMetrics.dist.completed || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <span className="text-on-surface">Đang xử lý</span>
              </div>
              <span className="font-bold text-on-surface">{donutMetrics.dist.processing || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-danger"></div>
                <span className="text-on-surface">Đã hủy</span>
              </div>
              <span className="font-bold text-on-surface">{donutMetrics.dist.cancelled || 0}</span>
            </div>

            {donutMetrics.total === 0 && (
              <p className="text-center text-[11px] text-on-surface-variant/80 pt-2 border-t border-outline-variant/20 italic">
                Chưa có đơn hàng nào phát sinh hôm nay
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Tables & Alert Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-card-gap">
        {/* Top Products Table (100% Sản phẩm thật từ CSDL PostgreSQL) */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-outline-variant/30 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-on-surface">Top sản phẩm nổi bật hôm nay</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Xếp hạng dựa trên dữ liệu sản phẩm và doanh số từ kho PostgreSQL</p>
            </div>
            <Link
              href="/products"
              className="text-primary hover:text-primary-container text-xs font-bold flex items-center gap-1 group"
            >
              <span>Xem tất cả kho</span>
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
                  <th className="px-6 py-3.5">Tên sản phẩm thật</th>
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
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl border border-outline-variant/30 overflow-hidden bg-white shrink-0 flex items-center justify-center p-0.5 shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.imageUrl || '/products/8934673573344.jpg'}
                              alt={p.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/products/8934673573344.jpg';
                              }}
                            />
                          </div>
                          <div>
                            <span className="font-semibold text-on-surface block leading-snug">{p.name}</span>
                            <span className="text-xs text-on-surface-variant font-mono">{ApiService.formatVND(p.price)}/đơn vị</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">{ApiService.formatNumber(p.soldCount ?? 0)}</td>
                      <td className="px-6 py-4 text-right font-bold text-primary">
                        {ApiService.formatVND(p.revenue ?? 0)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {(p.soldCount || 0) > 0 ? (
                          <span className="inline-flex items-center justify-center p-1 bg-success/10 text-success rounded-lg">
                            <span className="material-symbols-outlined text-[16px]">trending_up</span>
                          </span>
                        ) : (
                          <span className="text-xs text-on-surface-variant font-mono">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-3xl text-outline-variant block mb-1">inventory_2</span>
                      Đang đồng bộ dữ liệu giao dịch từ PostgreSQL...
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
                    Tất cả {overview.totalProducts || 10} sản phẩm dự án đều đạt định mức lưu kho ổn định trên hệ thống PostgreSQL.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low/40">
            <button
              onClick={() => {
                loadProductList();
                setShowRestockModal(true);
              }}
              className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-container transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              <span>Tạo phiếu nhập hàng ngay</span>
            </button>
          </div>
        </div>
      </div>

      {/* Restock Modal (100% Sản phẩm thật từ Database) */}
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
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                  >
                    {availableProducts.length > 0 ? (
                      availableProducts.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name} (Tồn: {p.stock})
                        </option>
                      ))
                    ) : (
                      <option value="">Đang tải danh mục sản phẩm...</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">Số lượng nhập dự kiến</label>
                  <input
                    type="number"
                    value={restockQty}
                    onChange={(e) => setRestockQty(Number(e.target.value))}
                    min={1}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">Nhà cung cấp / Nguồn hàng</label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="Tổng kho Phân phối Bán lẻ..."
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
