'use client';

import { useState, useEffect } from 'react';
import KpiCard from '@/components/KpiCard';
import { INITIAL_SMART_CARTS, SmartCart } from '@/data/mockData';
import { ApiService } from '@/services/api';

export default function SmartCartPage() {
  const [carts, setCarts] = useState<SmartCart[]>(INITIAL_SMART_CARTS);
  const [selectedCart, setSelectedCart] = useState<SmartCart | null>(carts[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCartId, setNewCartId] = useState(`SC-0${INITIAL_SMART_CARTS.length + 1}`);
  const [newCartName, setNewCartName] = useState(`Smart Cart #${INITIAL_SMART_CARTS.length + 1}`);
  const [newCartLocation, setNewCartLocation] = useState('Lối vào Cửa Đông');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    ApiService.getSmartCarts().then((data) => {
      if (data && data.length > 0) {
        setCarts(data);
        setSelectedCart(data[0]);
      }
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleAddCart = async (e: React.FormEvent) => {
    e.preventDefault();
    await ApiService.createSmartCart(newCartId);
    const newCart: SmartCart = {
      id: newCartId,
      name: newCartName,
      battery: 100,
      status: 'online',
      location: newCartLocation,
      coordinates: { x: 50 + (Math.random() * 20 - 10), y: 50 + (Math.random() * 20 - 10) },
      lastPing: 'Vừa xong',
    };

    setCarts([...carts, newCart]);
    setShowAddModal(false);
    showToast(`Đã thêm thiết bị ${newCart.id} vào hệ thống Smart Cart IoT`);
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

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Quản lý Smart Cart</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Giám sát thời gian thực vị trí di chuyển, thời lượng pin và trạng thái kết nối mạng IoT của đội xe.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-container transition-all shadow-sm active:scale-95 self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span>Thêm xe mới</span>
        </button>
      </div>

      {/* Row 1: KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-card-gap">
        <KpiCard
          title="Tổng số lượng xe"
          value={carts.length.toString()}
          icon="shopping_basket"
          iconBgColor="bg-primary/10"
          iconTextColor="text-primary"
          subtext="Smart Carts đăng ký trong PostgreSQL"
        />
        <KpiCard
          title="Đang phục vụ"
          value={carts.filter((c) => c.status === 'online').length.toString()}
          icon="check_circle"
          iconBgColor="bg-success/10"
          iconTextColor="text-success"
          trend="Đang phục vụ"
          trendType="up"
          borderColor="border-success/30"
        />
        <KpiCard
          title="Đang sạc pin"
          value={carts.filter((c) => c.status === 'charging').length.toString()}
          icon="battery_charging_full"
          iconBgColor="bg-warning/10"
          iconTextColor="text-warning"
          trend="Tại trạm sạc"
          trendType="warning"
          borderColor="border-warning/30"
        />
        <KpiCard
          title="Mất kết nối (Offline)"
          value={carts.filter((c) => c.status === 'offline').length.toString()}
          icon="error"
          iconBgColor="bg-danger/10"
          iconTextColor="text-danger"
          trend={carts.filter((c) => c.status === 'offline').length > 0 ? "Cần kiểm tra mạng" : "Tất cả ổn định"}
          trendType={carts.filter((c) => c.status === 'offline').length > 0 ? "down" : "neutral"}
          borderColor="border-danger/30"
        />
      </div>

      {/* Row 2: Live Map + Carts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-card-gap">
        {/* Live Map (Takes 2 cols) */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-outline-variant/30 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
            <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">map</span>
              <span>Bản đồ mặt bằng siêu thị (Live Floor Plan)</span>
            </h3>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-success animate-ping"></span>
                <span>Radar Live</span>
              </span>
            </div>
          </div>

          {/* Map Floor Canvas */}
          <div className="relative bg-surface-container-low/50 min-h-[440px] flex items-center justify-center p-6 select-none overflow-hidden">
            {/* Supermarket Schematic Floor Background */}
            <div className="w-full h-[400px] border-2 border-dashed border-outline-variant/50 rounded-2xl relative bg-white shadow-inner p-4 overflow-hidden">
              {/* Floor Layout Aisles Mockup */}
              <div className="absolute inset-0 opacity-15 pointer-events-none grid grid-cols-4 grid-rows-3 gap-4 p-6">
                <div className="border border-primary rounded-xl flex items-center justify-center text-xs font-bold text-primary">
                  KHU A: ĐỒ UỐNG
                </div>
                <div className="border border-primary rounded-xl flex items-center justify-center text-xs font-bold text-primary">
                  KHU B: BÁNH KẸO
                </div>
                <div className="border border-primary rounded-xl flex items-center justify-center text-xs font-bold text-primary">
                  KHU C: THỰC PHẨM
                </div>
                <div className="border border-warning rounded-xl flex items-center justify-center text-xs font-bold text-warning">
                  TRẠM SẠC PIN
                </div>

                <div className="border border-primary rounded-xl flex items-center justify-center text-xs font-bold text-primary">
                  KHU D: GIA DỤNG
                </div>
                <div className="border border-primary rounded-xl flex items-center justify-center text-xs font-bold text-primary">
                  KHU E: HÓA MỸ PHẨM
                </div>
                <div className="border border-primary rounded-xl flex items-center justify-center text-xs font-bold text-primary">
                  KHU F: TƯƠI SỐNG
                </div>
                <div className="border border-chart-blue rounded-xl flex items-center justify-center text-xs font-bold text-chart-blue">
                  CỬA VÀO / EXIT
                </div>

                <div className="col-span-4 border-2 border-primary/40 rounded-xl flex items-center justify-center text-xs font-bold text-primary">
                  DÃY QUẦY THU NGÂN TỰ ĐỘNG (CHECKOUT COUNTERS #01 - #10)
                </div>
              </div>

              {/* Dynamic Interactive Cart Markers */}
              {carts.map((cart) => {
                const isSelected = selectedCart?.id === cart.id;
                return (
                  <div
                    key={cart.id}
                    onClick={() => setSelectedCart(cart)}
                    style={{ left: `${cart.coordinates.x}%`, top: `${cart.coordinates.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300 z-20 group ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                    }`}
                  >
                    {/* Ping Indicator */}
                    <div className="relative flex items-center justify-center">
                      {cart.status === 'online' && (
                        <>
                          <div className="absolute w-8 h-8 rounded-full bg-success/30 animate-ping"></div>
                          <div className="w-5 h-5 rounded-full bg-success border-2 border-white shadow-lg flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-white"></span>
                          </div>
                        </>
                      )}
                      {cart.status === 'charging' && (
                        <div className="w-5 h-5 rounded-full bg-warning border-2 border-white shadow-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-[10px] text-white">bolt</span>
                        </div>
                      )}
                      {cart.status === 'offline' && (
                        <div className="w-5 h-5 rounded-full bg-danger border-2 border-white shadow-lg flex items-center justify-center opacity-80">
                          <span className="material-symbols-outlined text-[10px] text-white">close</span>
                        </div>
                      )}
                    </div>

                    {/* Tag label */}
                    <div
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md border mt-1 whitespace-nowrap transition-colors ${
                        isSelected
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface-container-lowest text-on-surface border-outline-variant/40'
                      }`}
                    >
                      {cart.id} ({cart.battery}%)
                    </div>
                  </div>
                );
              })}

              {/* Selected Cart Tooltip Card */}
              {selectedCart && (
                <div className="absolute bottom-3 left-3 bg-surface-container-lowest/95 backdrop-blur-md p-4 rounded-xl border border-outline-variant/40 shadow-xl max-w-xs z-30 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-primary">{selectedCart.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedCart.status === 'online'
                          ? 'bg-success/10 text-success'
                          : selectedCart.status === 'charging'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-danger/10 text-danger'
                      }`}
                    >
                      {selectedCart.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-on-surface">
                    <strong>Vị trí:</strong> {selectedCart.location}
                  </div>
                  <div className="text-on-surface flex items-center gap-1">
                    <strong>Thời lượng pin:</strong>
                    <span className="font-bold text-primary">{selectedCart.battery}%</span>
                  </div>
                  {selectedCart.customerName && (
                    <div className="text-on-surface">
                      <strong>Khách đang đẩy:</strong> {selectedCart.customerName}
                    </div>
                  )}
                  <div className="text-on-surface-variant text-[11px]">
                    Cập nhật tín hiệu: {selectedCart.lastPing}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Carts Status List (Takes 1 col) */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-outline-variant/30 flex flex-col h-[520px]">
          <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
            <div>
              <h3 className="text-base font-bold text-on-surface">Danh sách xe đẩy</h3>
              <p className="text-xs text-on-surface-variant">Chọn xe để định vị trên bản đồ</p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              {carts.length} Xe
            </span>
          </div>

          <div className="overflow-y-auto flex-1 p-0">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container-low text-on-surface-variant text-[11px] font-bold uppercase tracking-wider border-b border-outline-variant/30 z-10">
                <tr>
                  <th className="py-3 px-4">Cart ID</th>
                  <th className="py-3 px-4 text-center">Pin</th>
                  <th className="py-3 px-4 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {carts.map((cart) => {
                  const isSelected = selectedCart?.id === cart.id;
                  return (
                    <tr
                      key={cart.id}
                      onClick={() => setSelectedCart(cart)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary-fixed/40 font-semibold'
                          : 'hover:bg-surface-container-low/40'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              cart.status === 'online'
                                ? 'bg-success'
                                : cart.status === 'charging'
                                ? 'bg-warning'
                                : 'bg-danger'
                            }`}
                          ></span>
                          <span className="font-mono font-bold text-on-surface">{cart.id}</span>
                        </div>
                        <div className="text-[11px] text-on-surface-variant pl-4">{cart.location}</div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 font-semibold text-xs">
                          <span
                            className={`material-symbols-outlined text-[16px] ${
                              cart.battery > 50
                                ? 'text-success'
                                : cart.battery > 20
                                ? 'text-warning'
                                : 'text-danger'
                            }`}
                          >
                            {cart.battery > 80
                              ? 'battery_full'
                              : cart.battery > 20
                              ? 'battery_5_bar'
                              : 'battery_1_bar'}
                          </span>
                          <span>{cart.battery}%</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {cart.status === 'online' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-success/10 text-success">
                            Online
                          </span>
                        )}
                        {cart.status === 'charging' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-warning/10 text-warning">
                            Đang sạc
                          </span>
                        )}
                        {cart.status === 'offline' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-danger/10 text-danger">
                            Offline
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add New Smart Cart Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/30 space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_circle</span>
                <span>Thêm xe Smart Cart mới</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-on-surface-variant hover:text-danger rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddCart} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-on-surface mb-1">Mã định danh (Cart ID) *</label>
                <input
                  type="text"
                  required
                  value={newCartId}
                  onChange={(e) => setNewCartId(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-2.5 font-mono text-xs outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Tên xe / Gợi nhớ</label>
                <input
                  type="text"
                  required
                  value={newCartName}
                  onChange={(e) => setNewCartName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Vị trí xuất phát ban đầu</label>
                <select
                  value={newCartLocation}
                  onChange={(e) => setNewCartLocation(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Lối vào Cửa Tây">Lối vào Cửa Tây</option>
                  <option value="Lối vào Cửa Đông">Lối vào Cửa Đông</option>
                  <option value="Trạm sạc Kỹ thuật #1">Trạm sạc Kỹ thuật #1</option>
                  <option value="Trạm sạc Kỹ thuật #2">Trạm sạc Kỹ thuật #2</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant/60 text-on-surface-variant font-semibold hover:bg-surface-container-high"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-container shadow-sm active:scale-95"
                >
                  Thêm vào hệ thống
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
