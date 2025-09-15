export interface User {
  id: string;
  email: string;
  name: string;
  distributorId: string;
  role: 'distributor';
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  pricePerUnit: number;
  availableQuantity: number;
  unit: string;
  imageUrl?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  distributorId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
  expectedDeliveryDate?: Date;
  notes?: string;
}

export interface Transaction {
  id: string;
  distributorId: string;
  orderId?: string;
  type: 'order' | 'payment' | 'refund' | 'adjustment' | 'sales';
  amount: number;
  currency: 'NPR';
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
  productId?: string;
  productName?: string;
  quantity?: number;
  unitPrice?: number;
}

export interface SalesLogEntry {
  id: string;
  distributorId: string;
  productId: string;
  productName: string;
  quantitySold: number;
  unitPrice: number;
  totalAmount: number;
  customerName?: string;
  customerContact?: string;
  paymentMethod: 'cash' | 'credit' | 'bank_transfer' | 'mobile_payment';
  date: Date;
  notes?: string;
}

export interface DailySalesSheet {
  id: string;
  distributorId: string;
  date: Date;
  productEntries: DailySalesEntry[];
  totalSalesAmount: number;
  remarks?: string;
  submittedAt: Date;
}

export interface DailySalesEntry {
  productId: string;
  productName: string;
  openingStock: number;
  closingStock: number;
  salesQuantity: number;
  unitPrice: number;
  totalSales: number;
  remarks?: string;
}

export interface MonthlyLogSheet {
  id: string;
  distributorId: string;
  month: number;
  year: number;
  productId: string;
  productName: string;
  dailyEntries: DailyLogEntry[];
  totalMonthlySales: number;
  submittedAt: Date;
}

export interface DailyLogEntry {
  day: number;
  openingStock?: number;
  closingStock?: number;
  salesQuantity?: number;
  unitPrice?: number;
  totalSales?: number;
  remarks?: string;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
  thisMonthSpent: number;
  availableProducts: number;
}
