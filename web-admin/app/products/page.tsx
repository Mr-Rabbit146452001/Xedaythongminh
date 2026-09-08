'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { INITIAL_PRODUCTS, Product } from '@/data/mockData';
import { ApiService } from '@/services/api';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Load products from backend on mount
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ApiService.getProducts();
      if (data && data.length > 0) {
        setProducts(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    name: '',
    sku: '',
    barcode: '',
    category: 'Đồ uống',
    price: 10000,
    stock: 50,
    status: 'active',
    imageUrl: INITIAL_PRODUCTS[0].imageUrl,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.includes(searchTerm);
      const matchCat = categoryFilter ? p.category === categoryFilter : true;
      const matchStatus = statusFilter ? p.status === statusFilter : true;
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  // Actions
  const handleOpenCreate = () => {
    setModalMode('create');
    setCurrentProduct({
      name: '',
      sku: `SKU-${(products.length + 1).toString().padStart(3, '0')}`,
      barcode: `893${Date.now().toString().slice(-10)}`,
      category: 'Đồ uống',
      price: 25000,
      stock: 100,
      status: 'active',
      imageUrl: '/products/sua_vinamilk.jpg',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setModalMode('edit');
    setCurrentProduct({ ...product });
    setIsModalOpen(true);
  };

  const handleOpenView = (product: Product) => {
    setModalMode('view');
    setCurrentProduct({ ...product });
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa sản phẩm "${name}"?`)) {
      await ApiService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(`Đã xóa sản phẩm ${name} thành công trên hệ thống`);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct.name || !currentProduct.price) {
      alert('Vui lòng điền đầy đủ tên và giá sản phẩm!');
      return;
    }

    if (modalMode === 'create') {
      const saved = await ApiService.createProduct(currentProduct);
      setProducts((prev) => [saved, ...prev]);
      showToast(`Đã thêm sản phẩm mới vào CSDL: ${saved.name}`);
    } else if (modalMode === 'edit' && currentProduct.id) {
      await ApiService.updateProduct(currentProduct.id, currentProduct);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === currentProduct.id
            ? ({
                ...p,
                ...currentProduct,
                price: Number(currentProduct.price),
                stock: Number(currentProduct.stock),
                status:
                  Number(currentProduct.stock) <= 0
                    ? 'out'
                    : Number(currentProduct.stock) < 20
                    ? 'low'
                    : 'active',
              } as Product)
            : p
        )
      );
      showToast(`Đã cập nhật sản phẩm trong CSDL: ${currentProduct.name}`);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-xl">check_circle</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Danh sách sản phẩm</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Quản lý kho hàng, barcode và giá niêm yết trên hệ thống xe đẩy Smart Cart.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm sản phẩm, SKU, Barcode..."
              className="pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none shadow-sm w-64"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-2 pl-3 pr-8 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none shadow-sm"
          >
            <option value="">Tất cả danh mục</option>
            <option value="Đồ uống">Đồ uống</option>
            <option value="Bánh kẹo">Bánh kẹo</option>
            <option value="Thực phẩm tươi">Thực phẩm tươi</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 pl-3 pr-8 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none shadow-sm"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang bán</option>
            <option value="low">Sắp hết</option>
            <option value="out">Hết hàng</option>
          </select>

          {/* Add Product Button */}
          <button
            onClick={handleOpenCreate}
            className="bg-primary hover:bg-primary-container text-white font-semibold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant/30">
              <tr className="text-on-surface-variant uppercase text-[11px] font-bold tracking-wider">
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">SKU / Barcode</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4 text-right">Giá niêm yết</th>
                <th className="px-6 py-4 text-right">Tồn kho</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant font-medium">
                    Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-surface-container-low/40 transition-colors group h-table-row-height"
                  >
                    {/* Name + Image */}
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl border border-outline-variant/30 overflow-hidden bg-white shrink-0 relative">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface leading-snug">{product.name}</p>
                          <p className="text-xs text-on-surface-variant font-mono">#{product.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* SKU & Barcode */}
                    <td className="px-6 py-3 font-mono text-xs text-on-surface-variant">
                      <div>{product.sku}</div>
                      <div className="text-[11px] text-outline font-normal">{product.barcode}</div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-3 font-medium text-on-surface-variant">{product.category}</td>

                    {/* Price */}
                    <td className="px-6 py-3 text-right font-bold text-primary">
                      {ApiService.formatVND(product.price)}
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-3 text-right font-semibold text-on-surface">
                      {product.stock}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-3 text-center">
                      {product.status === 'active' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">
                          Đang bán
                        </span>
                      )}
                      {product.status === 'low' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning/10 text-warning border border-warning/20">
                          Sắp hết
                        </span>
                      )}
                      {product.status === 'out' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-danger/10 text-danger border border-danger/20">
                          Hết hàng
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenView(product)}
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-1.5 text-on-surface-variant hover:text-warning hover:bg-surface-container-high rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="p-1.5 text-on-surface-variant hover:text-danger hover:bg-surface-container-high rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
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

      {/* Product Modal (Create / Edit / View) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant/30 space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  {modalMode === 'create' ? 'add_box' : modalMode === 'edit' ? 'edit_note' : 'info'}
                </span>
                <span>
                  {modalMode === 'create'
                    ? 'Thêm sản phẩm mới'
                    : modalMode === 'edit'
                    ? 'Chỉnh sửa sản phẩm'
                    : 'Chi tiết sản phẩm'}
                </span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-on-surface-variant hover:text-danger rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-on-surface mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  disabled={modalMode === 'view'}
                  value={currentProduct.name}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                  placeholder="Nhập tên sản phẩm..."
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary disabled:opacity-75"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Mã SKU</label>
                  <input
                    type="text"
                    disabled={modalMode === 'view'}
                    value={currentProduct.sku}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, sku: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary disabled:opacity-75 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Mã Barcode *</label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === 'view'}
                    value={currentProduct.barcode}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, barcode: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary disabled:opacity-75 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Danh mục</label>
                  <select
                    disabled={modalMode === 'view'}
                    value={currentProduct.category}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary disabled:opacity-75"
                  >
                    <option value="Đồ uống">Đồ uống</option>
                    <option value="Bánh kẹo">Bánh kẹo</option>
                    <option value="Thực phẩm tươi">Thực phẩm tươi</option>
                    <option value="Gia dụng">Gia dụng</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Giá (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    disabled={modalMode === 'view'}
                    value={currentProduct.price}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary disabled:opacity-75 font-semibold text-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Tồn kho</label>
                  <input
                    type="number"
                    min={0}
                    disabled={modalMode === 'view'}
                    value={currentProduct.stock}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, stock: Number(e.target.value) })}
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary disabled:opacity-75"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Đường dẫn ảnh (URL)</label>
                <input
                  type="text"
                  disabled={modalMode === 'view'}
                  value={currentProduct.imageUrl}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary disabled:opacity-75 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant/60 text-on-surface-variant font-semibold hover:bg-surface-container-high"
                >
                  Đóng
                </button>
                {modalMode !== 'view' && (
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-container shadow-sm active:scale-95"
                  >
                    {modalMode === 'create' ? 'Tạo sản phẩm' : 'Lưu thay đổi'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
