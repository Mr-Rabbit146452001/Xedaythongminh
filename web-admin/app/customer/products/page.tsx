'use client';

import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Tag, Package, Sparkles, Coins } from 'lucide-react';
import { CustomerApiService, CustomerProduct } from '@/services/customerApi';

export default function CustomerProductsPage() {
  const [products, setProducts] = useState<CustomerProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await CustomerApiService.getProducts();
      setProducts(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const categories = ['Tất cả', ...Array.from(new Set(products.map((p) => p.Category || 'Khác')))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.Name.toLowerCase().includes(searchTerm.toLowerCase()) || p.Barcode.includes(searchTerm);
    const matchesCategory = selectedCategory === 'Tất cả' || p.Category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col flex-1 p-4 space-y-4 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-base font-bold text-slate-100 tracking-tight">Sản Phẩm Siêu Thị</h1>
          <p className="text-[11px] text-slate-400">Tra cứu giá & tồn kho tại kệ hàng</p>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          {products.length} Món
        </span>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo tên sản phẩm hoặc mã vạch..."
          className="w-full h-12 bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors shadow-inner"
        />
      </div>

      {/* Bộ lọc danh mục */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 border border-emerald-400'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Danh sách sản phẩm */}
      {isLoading ? (
        <div className="space-y-3 py-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-900/60 rounded-2xl animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          Không tìm thấy sản phẩm phù hợp.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredProducts.map((p) => (
            <div
              key={p.Id || p.Barcode}
              className="bg-slate-900/90 border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl p-3.5 flex items-center gap-3.5 shadow-md transition-all active:scale-[0.99]"
            >
              <div className="w-16 h-16 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-700/60">
                {p.ImageUrl ? (
                  <img
                    src={p.ImageUrl.startsWith('http') ? p.ImageUrl : `/images/${p.ImageUrl.replace(/^(\/images\/|\/products\/|\/)/, '')}`}
                    alt={p.Name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/sua_vinamilk.jpg';
                    }}
                  />
                ) : (
                  <Package className="w-7 h-7 text-slate-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold border border-slate-700/50">
                    {p.Category || 'Siêu thị'}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    Còn {p.Stock ?? 100}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-100 truncate mt-1.5 tracking-tight">{p.Name}</h4>
                <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{p.Barcode}</span>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-xs font-black text-slate-100 block font-mono">
                  {p.Price.toLocaleString('vi-VN')} đ
                </span>
                <span className="text-[11px] text-emerald-400 font-bold flex items-center justify-end gap-0.5 mt-0.5 font-mono">
                  <Coins className="w-3 h-3 text-emerald-400" />
                  {Math.ceil(p.Price / 10).toLocaleString('vi-VN')} T
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
