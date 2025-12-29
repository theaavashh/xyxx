// API utility for authenticated requests
export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4444/api') {
    this.baseUrl = baseUrl;
    this.token = typeof window !== 'undefined' ? localStorage.getItem('distributor_token') : null;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        this.token = null;
        localStorage.removeItem('distributor_token');
        localStorage.removeItem('distributor_user');
        throw new Error('Authentication failed');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();

// Enhanced API services
export const api = {
  // Dashboard
  async getDashboardStats() {
    return apiClient.get('/analytics/dashboard');
  },

  // Products
  async getProducts() {
    return apiClient.get('/products');
  },

  async getDistributorProducts(distributorId: string) {
    return apiClient.get(`/distributors/${distributorId}/products`);
  },

  // Orders
  async getOrders() {
    return apiClient.get('/orders');
  },

  async createOrder(orderData: any) {
    return apiClient.post('/orders', orderData);
  },

  async updateOrderStatus(orderId: string, status: string) {
    return apiClient.put(`/orders/${orderId}/status`, { status });
  },

  // Daily Sales Sheets
  async getDailySalesSheets() {
    return apiClient.get('/sales/daily-sheets');
  },

  async createDailySalesSheet(sheetData: any) {
    return apiClient.post('/sales/daily-sheets', sheetData);
  },

  async updateDailySalesSheet(sheetId: string, data: any) {
    return apiClient.put(`/sales/daily-sheets/${sheetId}`, data);
  },

  async submitDailySalesSheet(sheetId: string) {
    return apiClient.post(`/sales/daily-sheets/${sheetId}/submit`);
  },

  async deleteDailySalesSheet(sheetId: string) {
    return apiClient.delete(`/sales/daily-sheets/${sheetId}`);
  },

  // Transactions
  async getTransactions() {
    return apiClient.get('/transactions');
  },

  // Reports
  async generateReport(type: string, params: any) {
    return apiClient.post(`/reports/${type}`, params);
  },
};












