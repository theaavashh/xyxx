export interface User {
  id: string;
  email: string;
  name: string;
  role: 'distributor' | 'admin' | 'superadmin';
  distributorId?: string;
  companyName?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
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
  date: string;
  openingStock: StockEntry[];
  sales: SalesEntry[];
  closingStock: StockEntry[];
  totalSales: number;
  totalRevenue: number;
  status: 'draft' | 'submitted' | 'approved';
  submittedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockEntry {
  productId: string;
  productName: string;
  openingQuantity: number;
  closingQuantity: number;
  unit: string;
  price?: number;
}

export interface SalesEntry {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customer?: string;
  customerPhone?: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'mobile_payment' | 'credit';
  notes?: string;
  time?: string;
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
  month: string;
  year: number;
  dailySheets: DailySalesSheet[];
  totalSales: number;
  totalRevenue: number;
  averageDailySales: number;
  profit: number;
  status: 'draft' | 'submitted' | 'approved';
  submittedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
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

// API and Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ValidationError[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface DailySalesSheetForm {
  date: string;
  openingStock: StockEntry[];
  sales: SalesEntry[];
  closingStock: StockEntry[];
  notes?: string;
}

export interface OrderForm {
  items: OrderItem[];
  shippingAddress: Address;
  notes?: string;
}

// Notification Types
export interface Notification {
  id: string;
  distributorId: string;
  type: 'order' | 'payment' | 'system' | 'promotion' | 'low_stock';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  createdAt: string;
  expiresAt?: string;
}

// Report Types
export interface SalesReport {
  id: string;
  distributorId: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  totalSales: number;
  totalRevenue: number;
  totalOrders: number;
  topProducts: TopProduct[];
  salesByCategory: SalesByCategory[];
  generatedAt: string;
  fileUrl?: string;
}

export interface InventoryReport {
  id: string;
  distributorId: string;
  totalProducts: number;
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
  totalValue: number;
  generatedAt: string;
  fileUrl?: string;
}

// Filter and Search Types
export interface DateRangeFilter {
  startDate: string;
  endDate: string;
}

export interface SalesFilter {
  dateRange?: DateRangeFilter;
  category?: string;
  status?: string;
  search?: string;
}

export interface OrderFilter {
  dateRange?: DateRangeFilter;
  status?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Address Type
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Chart Data Types
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

// Export Types
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  dateRange: DateRangeFilter;
  includeCharts: boolean;
  includeDetails: boolean;
}

// UI State Types
export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  loading: Record<string, boolean>;
  errors: Record<string, string>;
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'order_update' | 'notification' | 'price_update' | 'stock_update';
  data: any;
  timestamp: string;
}

// Navigation Types
export interface NavigationItem {
  id: string;
  title: string;
  icon: string;
  path: string;
  badge?: number;
  children?: NavigationItem[];
  isActive?: boolean;
  isExpanded?: boolean;
}

// Settings Types
export interface UserSettings {
  theme: 'light' | 'dark';
  language: 'en' | 'ne';
  currency: 'NPR' | 'USD';
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  autoSave: boolean;
  dateFormat: string;
  numberFormat: string;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
  thisMonthSpent: number;
  availableProducts: number;
  todaySales: number;
  todayOrders: number;
  monthSales: number;
  monthOrders: number;
  averageOrderValue: number;
  growthRate: number;
  topProducts: TopProduct[];
  recentOrders: Order[];
  salesByCategory: SalesByCategory[];
  monthlyRevenue: MonthlyRevenue[];
  totalRevenue: number;
  totalSales: number;
  profit: number;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  growth: number;
  stock: number;
}

export interface SalesByCategory {
  category: string;
  sales: number;
  revenue: number;
  percentage: number;
  color: string;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
  sales: number;
  profit: number;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  growth: number;
  stock: number;
}

export interface SalesByCategory {
  category: string;
  sales: number;
  revenue: number;
  percentage: number;
  color: string;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
  sales: number;
  profit: number;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  growth: number;
  stock: number;
}

export interface SalesByCategory {
  category: string;
  sales: number;
  revenue: number;
  percentage: number;
  color: string;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
  sales: number;
  profit: number;
}
