import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  DashboardStats, 
  Order, 
  Product, 
  DailySalesSheet, 
  Transaction, 
  Notification,
  SalesFilter,
  OrderFilter,
  DateRangeFilter 
} from '@/types';

interface DataStore {
  // Dashboard data
  dashboardStats: DashboardStats | null;
  dashboardLoading: boolean;
  dashboardError: string | null;
  
  // Orders data
  orders: Order[];
  ordersLoading: boolean;
  ordersError: string | null;
  ordersPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Products data
  products: Product[];
  productsLoading: boolean;
  productsError: string | null;
  categories: string[];
  
  // Daily sales sheets
  dailySalesSheets: DailySalesSheet[];
  dailySalesSheetsLoading: boolean;
  dailySalesSheetsError: string | null;
  
  // Transactions
  transactions: Transaction[];
  transactionsLoading: boolean;
  transactionsError: string | null;
  
  // Filters
  salesFilter: SalesFilter;
  orderFilter: OrderFilter;
  
  // Actions
  fetchDashboardStats: () => Promise<void>;
  fetchOrders: (page?: number, filter?: OrderFilter) => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchDailySalesSheets: (dateRange?: DateRangeFilter) => Promise<void>;
  fetchTransactions: (dateRange?: DateRangeFilter) => Promise<void>;
  
  // Order actions
  createOrder: (orderData: any) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<boolean>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  
  // Daily sales sheet actions
  createDailySalesSheet: (sheetData: any) => Promise<DailySalesSheet | null>;
  updateDailySalesSheet: (sheetId: string, data: any) => Promise<DailySalesSheet | null>;
  submitDailySalesSheet: (sheetId: string) => Promise<boolean>;
  deleteDailySalesSheet: (sheetId: string) => Promise<boolean>;
  
  // Filter actions
  setSalesFilter: (filter: Partial<SalesFilter>) => void;
  setOrderFilter: (filter: Partial<OrderFilter>) => void;
  clearFilters: () => void;
  
  // Real-time updates
  updateOrder: (order: Order) => void;
  addNotification: (notification: Notification) => void;
  
  // Cache management
  invalidateCache: (key: string) => void;
  clearAllCache: () => void;
}

export const useDataStore = create<DataStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      dashboardStats: null,
      dashboardLoading: false,
      dashboardError: null,
      
      orders: [],
      ordersLoading: false,
      ordersError: null,
      ordersPagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
      
      products: [],
      productsLoading: false,
      productsError: null,
      categories: [],
      
      dailySalesSheets: [],
      dailySalesSheetsLoading: false,
      dailySalesSheetsError: null,
      
      transactions: [],
      transactionsLoading: false,
      transactionsError: null,
      
      salesFilter: {},
      orderFilter: {},
      
      // Dashboard actions
      fetchDashboardStats: async () => {
        const { dashboardLoading } = get();
        if (dashboardLoading) return;
        
        set({ dashboardLoading: true, dashboardError: null });
        
        // Always use hardcoded demo data
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const demoData: DashboardStats = {
              totalOrders: 245,
              pendingOrders: 15,
              completedOrders: 185,
              totalSpent: 125000,
              thisMonthSpent: 25000,
              availableProducts: 42,
              todaySales: 12,
              todayOrders: 8,
              monthSales: 320,
              monthOrders: 245,
              averageOrderValue: 510.20,
              growthRate: 12.5,
              topProducts: [
                { id: '1', name: 'Product 1', category: 'Category A', sales: 45, revenue: 22500, growth: 12.5, stock: 120 },
                { id: '2', name: 'Product 2', category: 'Category B', sales: 38, revenue: 19000, growth: 8.2, stock: 85 },
                { id: '3', name: 'Product 3', category: 'Category C', sales: 32, revenue: 16000, growth: 5.7, stock: 65 },
                { id: '4', name: 'Product 4', category: 'Category D', sales: 28, revenue: 14000, growth: 3.1, stock: 50 },
                { id: '5', name: 'Product 5', category: 'Category A', sales: 25, revenue: 12500, growth: 15.3, stock: 42 },
              ],
              recentOrders: [
                { id: 'ORD-001', distributorId: 'demo-distributor-1', items: [], totalAmount: 1250, status: 'delivered', orderDate: new Date('2023-06-15') },
                { id: 'ORD-002', distributorId: 'demo-distributor-1', items: [], totalAmount: 890, status: 'delivered', orderDate: new Date('2023-06-16') },
                { id: 'ORD-003', distributorId: 'demo-distributor-1', items: [], totalAmount: 2100, status: 'pending', orderDate: new Date('2023-06-17') },
                { id: 'ORD-004', distributorId: 'demo-distributor-1', items: [], totalAmount: 1650, status: 'shipped', orderDate: new Date('2023-06-18') },
                { id: 'ORD-005', distributorId: 'demo-distributor-1', items: [], totalAmount: 750, status: 'pending', orderDate: new Date('2023-06-19') },
              ],
              salesByCategory: [
                { category: 'Category A', sales: 120, revenue: 60000, percentage: 48, color: '#3B82F6' },
                { category: 'Category B', sales: 85, revenue: 42500, percentage: 34, color: '#10B981' },
                { category: 'Category C', sales: 65, revenue: 32500, percentage: 26, color: '#F59E0B' },
                { category: 'Category D', sales: 50, revenue: 25000, percentage: 20, color: '#EF4444' },
              ],
              monthlyRevenue: [
                { month: 'Jan', revenue: 85000, orders: 180, sales: 220, profit: 17000 },
                { month: 'Feb', revenue: 92000, orders: 195, sales: 240, profit: 18400 },
                { month: 'Mar', revenue: 78000, orders: 160, sales: 195, profit: 15600 },
                { month: 'Apr', revenue: 110000, orders: 210, sales: 270, profit: 22000 },
                { month: 'May', revenue: 95000, orders: 190, sales: 235, profit: 19000 },
                { month: 'Jun', revenue: 125000, orders: 245, sales: 320, profit: 25000 },
              ],
              totalRevenue: 125000,
              totalSales: 320,
              profit: 25000,
            };
            
            set({ 
              dashboardStats: demoData,
              dashboardLoading: false 
            });
          } catch (error) {
            set({ 
              dashboardError: error instanceof Error ? error.message : 'Unknown error',
              dashboardLoading: false 
            });
          }
      },
      
// Orders actions
      fetchOrders: async (page = 1, filter) => {
        const { ordersLoading } = get();
        if (ordersLoading) return;
        
        set({ ordersLoading: true, ordersError: null });
        
        // Use hardcoded demo orders
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const demoOrders: Order[] = [
            {
              id: 'ORD-001',
              distributorId: 'demo-distributor-1',
              items: [
                { productId: '1', productName: 'Product A', quantity: 2, unitPrice: 500, totalPrice: 1000 },
                { productId: '2', productName: 'Product B', quantity: 1, unitPrice: 750, totalPrice: 750 }
              ],
              totalAmount: 1750,
              status: 'delivered',
              orderDate: new Date('2024-01-15'),
              expectedDeliveryDate: new Date('2024-01-17'),
              notes: 'Delivered successfully',
              createdAt: new Date('2024-01-15'),
              updatedAt: new Date('2024-01-17')
            },
            {
              id: 'ORD-002',
              distributorId: 'demo-distributor-1',
              items: [
                { productId: '3', productName: 'Product C', quantity: 3, unitPrice: 300, totalPrice: 900 }
              ],
              totalAmount: 900,
              status: 'shipped',
              orderDate: new Date('2024-01-16'),
              expectedDeliveryDate: new Date('2024-01-18'),
              notes: 'In transit',
              createdAt: new Date('2024-01-16'),
              updatedAt: new Date('2024-01-16')
            },
            {
              id: 'ORD-003',
              distributorId: 'demo-distributor-1',
              items: [
                { productId: '1', productName: 'Product A', quantity: 1, unitPrice: 500, totalPrice: 500 },
                { productId: '4', productName: 'Product D', quantity: 2, unitPrice: 400, totalPrice: 800 }
              ],
              totalAmount: 1300,
              status: 'pending',
              orderDate: new Date('2024-01-17'),
              expectedDeliveryDate: new Date('2024-01-20'),
              notes: 'Order processing',
              createdAt: new Date('2024-01-17'),
              updatedAt: new Date('2024-01-17')
            },
            {
              id: 'ORD-004',
              distributorId: 'demo-distributor-1',
              items: [
                { productId: '2', productName: 'Product B', quantity: 4, unitPrice: 750, totalPrice: 3000 }
              ],
              totalAmount: 3000,
              status: 'processing',
              orderDate: new Date('2024-01-18'),
              expectedDeliveryDate: new Date('2024-01-22'),
              notes: 'Preparing for shipment',
              createdAt: new Date('2024-01-18'),
              updatedAt: new Date('2024-01-18')
            },
            {
              id: 'ORD-005',
              distributorId: 'demo-distributor-1',
              items: [
                { productId: '5', productName: 'Product E', quantity: 2, unitPrice: 600, totalPrice: 1200 }
              ],
              totalAmount: 1200,
              status: 'confirmed',
              orderDate: new Date('2024-01-19'),
              expectedDeliveryDate: new Date('2024-01-23'),
              notes: 'Order confirmed',
              createdAt: new Date('2024-01-19'),
              updatedAt: new Date('2024-01-19')
            }
          ];
          
          set({
            orders: demoOrders,
            ordersPagination: {
              page: 1,
              limit: 20,
              total: demoOrders.length,
              totalPages: 1
            },
            ordersLoading: false,
          });
        } catch (error) {
          set({
            ordersError: error instanceof Error ? error.message : 'Unknown error',
            ordersLoading: false,
          });
        }
      },
      
      createOrder: async (orderData) => {
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
          });
          
          if (!response.ok) {
            throw new Error('Failed to create order');
          }
          
          const data = await response.json();
          const newOrder = data.data;
          
          // Add to orders list
          set((state) => ({
            orders: [newOrder, ...state.orders]
          }));
          
          return newOrder;
        } catch (error) {
          console.error('Create order error:', error);
          return null;
        }
      },
      
      updateOrderStatus: async (orderId, status) => {
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to update order status');
          }
          
          // Update local state
          set((state) => ({
            orders: state.orders.map(order =>
              order.id === orderId ? { ...order, status } : order
            )
          }));
          
          return true;
        } catch (error) {
          console.error('Update order status error:', error);
          return false;
        }
      },
      
      cancelOrder: async (orderId) => {
        return get().updateOrderStatus(orderId, 'cancelled');
      },
      
      // Products actions
      fetchProducts: async () => {
        const { productsLoading } = get();
        if (productsLoading) return;
        
        set({ productsLoading: true, productsError: null });
        
        // Use hardcoded demo products
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 600));
          
          const demoProducts: Product[] = [
            {
              id: '1',
              name: 'Product A',
              description: 'High quality product A',
              category: 'Category A',
              price: 500,
              costPrice: 350,
              stockQuantity: 120,
              minStockLevel: 20,
              sku: 'PROD-A-001',
              isActive: true,
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-15')
            },
            {
              id: '2',
              name: 'Product B',
              description: 'Premium product B',
              category: 'Category B',
              price: 750,
              costPrice: 500,
              stockQuantity: 85,
              minStockLevel: 15,
              sku: 'PROD-B-001',
              isActive: true,
              createdAt: new Date('2024-01-02'),
              updatedAt: new Date('2024-01-14')
            },
            {
              id: '3',
              name: 'Product C',
              description: 'Standard product C',
              category: 'Category C',
              price: 300,
              costPrice: 200,
              stockQuantity: 65,
              minStockLevel: 10,
              sku: 'PROD-C-001',
              isActive: true,
              createdAt: new Date('2024-01-03'),
              updatedAt: new Date('2024-01-13')
            },
            {
              id: '4',
              name: 'Product D',
              description: 'Economy product D',
              category: 'Category D',
              price: 400,
              costPrice: 280,
              stockQuantity: 50,
              minStockLevel: 12,
              sku: 'PROD-D-001',
              isActive: true,
              createdAt: new Date('2024-01-04'),
              updatedAt: new Date('2024-01-12')
            },
            {
              id: '5',
              name: 'Product E',
              description: 'Deluxe product E',
              category: 'Category A',
              price: 600,
              costPrice: 420,
              stockQuantity: 42,
              minStockLevel: 8,
              sku: 'PROD-E-001',
              isActive: true,
              createdAt: new Date('2024-01-05'),
              updatedAt: new Date('2024-01-11')
            }
          ];
          
          // Extract categories
          const categories: string[] = [...new Set(demoProducts.map(p => p.category))];
          
          set({
            products: demoProducts,
            categories,
            productsLoading: false,
          });
        } catch (error) {
          set({
            productsError: error instanceof Error ? error.message : 'Unknown error',
            productsLoading: false,
          });
        }
      },
      
      // Daily sales sheets actions
      fetchDailySalesSheets: async (dateRange) => {
        const { dailySalesSheetsLoading } = get();
        if (dailySalesSheetsLoading) return;
        
        set({ dailySalesSheetsLoading: true, dailySalesSheetsError: null });
        
        try {
          const token = localStorage.getItem('auth_token');
          const params = new URLSearchParams();
          if (dateRange) {
            params.append('startDate', dateRange.startDate);
            params.append('endDate', dateRange.endDate);
          }
          
          const response = await fetch(`/api/sales/daily-sheets?${params}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch daily sales sheets');
          }
          
          const data = await response.json();
          set({
            dailySalesSheets: data.data,
            dailySalesSheetsLoading: false,
          });
        } catch (error) {
          set({
            dailySalesSheetsError: error instanceof Error ? error.message : 'Unknown error',
            dailySalesSheetsLoading: false,
          });
        }
      },
      
      createDailySalesSheet: async (sheetData) => {
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch('/api/sales/daily-sheets', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(sheetData),
          });
          
          if (!response.ok) {
            throw new Error('Failed to create daily sales sheet');
          }
          
          const data = await response.json();
          const newSheet = data.data;
          
          // Add to local state
          set((state) => ({
            dailySalesSheets: [newSheet, ...state.dailySalesSheets]
          }));
          
          return newSheet;
        } catch (error) {
          console.error('Create daily sales sheet error:', error);
          return null;
        }
      },
      
      updateDailySalesSheet: async (sheetId, data) => {
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch(`/api/sales/daily-sheets/${sheetId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
          
          if (!response.ok) {
            throw new Error('Failed to update daily sales sheet');
          }
          
          const updatedSheet = await response.json();
          
          // Update local state
          set((state) => ({
            dailySalesSheets: state.dailySalesSheets.map(sheet =>
              sheet.id === sheetId ? updatedSheet.data : sheet
            )
          }));
          
          return updatedSheet.data;
        } catch (error) {
          console.error('Update daily sales sheet error:', error);
          return null;
        }
      },
      
      submitDailySalesSheet: async (sheetId) => {
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch(`/api/sales/daily-sheets/${sheetId}/submit`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error('Failed to submit daily sales sheet');
          }
          
          // Update local state
          set((state) => ({
            dailySalesSheets: state.dailySalesSheets.map(sheet =>
              sheet.id === sheetId ? { ...sheet, status: 'submitted' } : sheet
            )
          }));
          
          return true;
        } catch (error) {
          console.error('Submit daily sales sheet error:', error);
          return false;
        }
      },
      
      deleteDailySalesSheet: async (sheetId) => {
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch(`/api/sales/daily-sheets/${sheetId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error('Failed to delete daily sales sheet');
          }
          
          // Remove from local state
          set((state) => ({
            dailySalesSheets: state.dailySalesSheets.filter(sheet => sheet.id !== sheetId)
          }));
          
          return true;
        } catch (error) {
          console.error('Delete daily sales sheet error:', error);
          return false;
        }
      },
      
      // Transactions actions
      fetchTransactions: async (dateRange) => {
        const { transactionsLoading } = get();
        if (transactionsLoading) return;
        
        set({ transactionsLoading: true, transactionsError: null });
        
        try {
          const token = localStorage.getItem('auth_token');
          const params = new URLSearchParams();
          if (dateRange) {
            params.append('startDate', dateRange.startDate);
            params.append('endDate', dateRange.endDate);
          }
          
          const response = await fetch(`/api/transactions?${params}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch transactions');
          }
          
          const data = await response.json();
          set({
            transactions: data.data,
            transactionsLoading: false,
          });
        } catch (error) {
          set({
            transactionsError: error instanceof Error ? error.message : 'Unknown error',
            transactionsLoading: false,
          });
        }
      },
      
      // Filter actions
      setSalesFilter: (filter) => {
        set((state) => ({
          salesFilter: { ...state.salesFilter, ...filter }
        }));
      },
      
      setOrderFilter: (filter) => {
        set((state) => ({
          orderFilter: { ...state.orderFilter, ...filter }
        }));
      },
      
      clearFilters: () => {
        set({
          salesFilter: {},
          orderFilter: {},
        });
      },
      
      // Real-time updates
      updateOrder: (order) => {
        set((state) => ({
          orders: state.orders.map(o => o.id === order.id ? order : o)
        }));
      },
      
      addNotification: (notification) => {
        // This will be handled by UI store
        console.log('New notification:', notification);
      },
      
      // Cache management
      invalidateCache: (key) => {
        switch (key) {
          case 'dashboard':
            set({ dashboardStats: null });
            break;
          case 'orders':
            set({ orders: [] });
            break;
          case 'products':
            set({ products: [], categories: [] });
            break;
          case 'dailySalesSheets':
            set({ dailySalesSheets: [] });
            break;
          case 'transactions':
            set({ transactions: [] });
            break;
        }
      },
      
      clearAllCache: () => {
        set({
          dashboardStats: null,
          orders: [],
          products: [],
          categories: [],
          dailySalesSheets: [],
          transactions: [],
        });
      },
    }),
    {
      name: 'distributor-data-storage',
    }
  )
);