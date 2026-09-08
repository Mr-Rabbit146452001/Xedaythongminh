'use client';

import { useState, useMemo, useEffect } from 'react';
import KpiCard from '@/components/KpiCard';
import { INITIAL_ORDERS, Order } from '@/data/mockData';
import { ApiService } from '@/services/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    ApiService.getOrders().then((data) => {
      if (data && data.length > 0) setOrders(data);
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone.includes(searchTerm);
      const matchStatus = statusFilter ? order.status === statusFilter : true;
      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Mã đơn,Khách hàng,Số điện thoại,Thời gian,Số sản phẩm,Tổng tiền,Thanh toán,Trạng thái']
        .concat(
          filteredOrders.map(
            (o) =>
              `${o.id},"${o.customerName}",${o.customerPhone},"${o.createdAt}",${o.itemCount},${o.totalAmount},"${o.paymentMethod}",${o.status}`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh_sach_don_hang_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã xuất danh sách đơn hàng ra tệp CSV thành công!');
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const orderStats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      shipping: orders.filter((o) => o.status === 'shipping').length,
      completed: orders.filter((o) => o.status === 'completed').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-xl">check_circle</span>
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Quản lý đơn hàng</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Theo dõi dòng tiền, phiên giỏ hàng và lịch sử thanh toán qua Smart Cart & Mock Bank.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 border border-primary text-primary hover:bg-primary-fixed/40 rounded-xl font-semibold text-sm transition-colors shadow-sm self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-lg">download</span>
          <span>Xuất báo cáo (CSV)</span>
        </button>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-card-gap">
        <KpiCard
          title="Tổng đơn hàng"
          value={ApiService.formatNumber(orderStats.total)}
          icon="shopping_cart"
          iconBgColor="bg-primary/10"
          iconTextColor="text-primary"
          trend="Thời gian thực"
          trendText="từ cơ sở dữ liệu"
          trendType="up"
        />
        <KpiCard
          title="Chờ xử lý"
          value={orderStats.pending.toString()}
          icon="pending_actions"
          iconBgColor="bg-warning/10"
          iconTextColor="text-warning"
          trend={orderStats.pending > 0 ? `${orderStats.pending} đơn cần duyệt` : "Bình thường"}
          trendType={orderStats.pending > 0 ? "warning" : "neutral"}
          borderColor="border-warning/30"
        />
        <KpiCard
          title="Đang mua sắm"
          value={orderStats.shipping.toString()}
          icon="local_shipping"
          iconBgColor="bg-chart-blue/10"
          iconTextColor="text-chart-blue"
          subtext="Đang hoạt động tại quầy"
        />
        <KpiCard
          title="Hoàn thành"
          value={orderStats.completed.toString()}
          icon="check_circle"
          iconBgColor="bg-success/10"
          iconTextColor="text-success"
          trend="Đã thanh toán"
          trendText="thành công"
          trendType="up"
        />
        <KpiCard
          title="Đã hủy"
          value={orderStats.cancelled.toString()}
          icon="cancel"
          iconBgColor="bg-danger/10"
          iconTextColor="text-danger"
          trend="Tỷ lệ hủy thấp"
          trendType="neutral"
        />
      </div>

      {/* Row 2: Orders Table Card */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-outline-variant/30 overflow-hidden flex flex-col">
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-bright">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex items-center bg-surface-container-low rounded-xl px-3 py-2 w-64 border border-outline-variant/40 focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant text-lg mr-2">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm mã đơn, khách hàng..."
                className="bg-transparent border-none outline-none w-full text-xs font-medium text-on-surface placeholder:text-on-surface-variant focus:ring-0 p-0"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-container-low rounded-xl px-3 py-2 text-xs font-semibold text-on-surface border border-outline-variant/40 outline-none focus:border-primary"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="shipping">Đang giao / đi chợ</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>

            {/* Date range picker button */}
            <div className="flex items-center bg-surface-container-low rounded-xl px-3 py-2 border border-outline-variant/40 text-xs font-semibold text-on-surface cursor-pointer hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-sm mr-2 text-primary">calendar_today</span>
              <span>Hôm nay (07 Thg 09, 2026)</span>
            </div>
          </div>

          <div className="text-xs font-semibold text-on-surface-variant">
            Hiển thị <span className="text-primary font-bold">{filteredOrders.length}</span> đơn hàng
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant uppercase text-[11px] font-bold tracking-wider border-b border-outline-variant/30">
                <th className="py-3.5 px-4 w-10">
                  <input type="checkbox" className="rounded border-outline-variant text-primary focus:ring-primary" />
                </th>
                <th className="py-3.5 px-4">Mã đơn</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-4 text-right">Số lượng SP</th>
                <th className="py-3.5 px-4 text-right">Tổng tiền</th>
                <th className="py-3.5 px-4">Phương thức thanh toán</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-center w-16">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-on-surface-variant font-medium">
                    Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <input type="checkbox" className="rounded border-outline-variant text-primary focus:ring-primary" />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">
                      #{order.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-on-surface">{order.customerName}</div>
                      <div className="text-xs text-on-surface-variant font-mono">{order.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-on-surface-variant">{order.createdAt}</td>
                    <td className="py-3.5 px-4 text-right font-semibold">{order.itemCount} SP</td>
                    <td className="py-3.5 px-4 text-right font-bold text-primary">
                      {ApiService.formatVND(order.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-on-surface flex items-center gap-1.5 mt-2">
                      <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                      {order.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {order.status === 'completed' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">
                          Hoàn thành
                        </span>
                      )}
                      {order.status === 'pending' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning/10 text-warning border border-warning/20">
                          Chờ xử lý
                        </span>
                      )}
                      {order.status === 'shipping' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-chart-blue/10 text-chart-blue border border-chart-blue/20">
                          Đang giao
                        </span>
                      )}
                      {order.status === 'cancelled' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-danger/10 text-danger border border-danger/20">
                          Đã hủy
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleViewDetail(order)}
                        className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors"
                        title="Xem chi tiết đơn"
                      >
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {isDetailOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/30 space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <div>
                <h3 className="text-lg font-bold text-on-surface">Đơn hàng #{selectedOrder.id}</h3>
                <p className="text-xs text-on-surface-variant">{selectedOrder.createdAt}</p>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-1 text-on-surface-variant hover:text-danger rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3 bg-surface-container-low rounded-xl space-y-1">
                <div className="text-xs text-on-surface-variant">Khách hàng</div>
                <div className="font-bold text-on-surface">{selectedOrder.customerName}</div>
                <div className="text-xs font-mono text-on-surface-variant">{selectedOrder.customerPhone}</div>
              </div>

              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Phương thức thanh toán:</span>
                <span className="font-semibold text-on-surface">{selectedOrder.paymentMethod}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Số mặt hàng:</span>
                <span className="font-semibold text-on-surface">{selectedOrder.itemCount} sản phẩm</span>
              </div>

              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Trạng thái:</span>
                <span className="font-bold text-primary capitalize">{selectedOrder.status}</span>
              </div>

              <div className="flex justify-between py-2 bg-primary/5 p-3 rounded-xl">
                <span className="font-bold text-on-surface">Tổng thanh toán:</span>
                <span className="font-bold text-lg text-primary">
                  {ApiService.formatVND(selectedOrder.totalAmount)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  alert(`Đang in hóa đơn cho đơn hàng #${selectedOrder.id}...`);
                }}
                className="px-4 py-2 rounded-xl border border-primary text-primary font-semibold hover:bg-primary-fixed/30 flex items-center gap-1.5 text-xs"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                In hóa đơn
              </button>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-container text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
