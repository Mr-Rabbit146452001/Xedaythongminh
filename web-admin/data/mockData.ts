export interface Product {
  id: number;
  barcode: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'low' | 'out';
  imageUrl: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  createdAt: string;
  itemCount: number;
  totalAmount: number;
  paymentMethod: string;
  status: 'pending' | 'shipping' | 'completed' | 'cancelled';
}

export interface SmartCart {
  id: string;
  name: string;
  battery: number;
  status: 'online' | 'charging' | 'offline';
  location: string;
  currentSessionId?: string;
  customerName?: string;
  coordinates: { x: number; y: number }; // percentage on floor plan
  lastPing: string;
}

export interface InventoryMovement {
  id: string;
  type: 'import' | 'export';
  code: string;
  supplier: string;
  date: string;
  itemsCount: number;
  totalValue: number;
  status: 'completed' | 'processing';
}

// Toàn bộ dữ liệu khởi tạo mặc định đều để rỗng — 100% lấy từ Server PostgreSQL thực tế
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_SMART_CARTS: SmartCart[] = [];
export const INVENTORY_MOVEMENTS: InventoryMovement[] = [];
