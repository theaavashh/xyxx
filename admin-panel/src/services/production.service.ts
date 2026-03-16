import { 
  RawMaterial, 
  RawMaterialCategory, 
  RawMaterialTransaction, 
  RawMaterialForm,
  ProductionOrder, 
  ProductionRecord, 
  ProductionOrderForm,
  ProductionRecordForm,
  WorkCenter, 
  Machine, 
  ProductionSchedule,
  BillOfMaterials,
  BOMForm,
  ProductionKPIs,
  ProductionReport,
  ProductionChart,
  ProductionChartForm
} from '@/types';
import { config } from '@/lib/config';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getToken = () => {
  return localStorage.getItem(config.tokenKey);
};

class ProductionService {
  // Raw Material Management APIs
  async getRawMaterials(): Promise<RawMaterial[]> {
    const response = await fetch(`${API_BASE_URL}/production/raw-materials`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch raw materials');
    }
    
    return response.json();
  }

  async getRawMaterial(id: string): Promise<RawMaterial> {
    const response = await fetch(`${API_BASE_URL}/production/raw-materials/${id}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch raw material');
    }
    
    return response.json();
  }

  async createRawMaterial(data: RawMaterialForm): Promise<RawMaterial> {
    const response = await fetch(`${API_BASE_URL}/production/raw-materials`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create raw material');
    }
    
    return response.json();
  }

  async updateRawMaterial(id: string, data: Partial<RawMaterialForm> | { isActive: boolean }): Promise<RawMaterial> {
    const response = await fetch(`${API_BASE_URL}/production/raw-materials/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update raw material');
    }
    
    return response.json();
  }

  async deleteRawMaterial(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/production/raw-materials/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete raw material');
    }
  }

  async getRawMaterialTransactions(materialId?: string): Promise<RawMaterialTransaction[]> {
    const url = materialId 
      ? `${API_BASE_URL}/production/raw-materials/${materialId}/transactions`
      : `${API_BASE_URL}/production/raw-materials/transactions`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch raw material transactions');
    }
    
    return response.json();
  }

  async createRawMaterialTransaction(data: Omit<RawMaterialTransaction, 'id' | 'createdAt'>): Promise<RawMaterialTransaction> {
    const response = await fetch(`${API_BASE_URL}/production/raw-materials/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create raw material transaction');
    }
    
    return response.json();
  }

  async getRawMaterialCategories(): Promise<RawMaterialCategory[]> {
    const response = await fetch(`${API_BASE_URL}/production/raw-materials/categories`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch raw material categories');
    }
    
    return response.json();
  }

  // Production Order Management APIs
  async getProductionOrders(): Promise<ProductionOrder[]> {
    const response = await fetch(`${API_BASE_URL}/production/orders`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch production orders');
    }
    
    return response.json();
  }

  async getProductionOrder(id: string): Promise<ProductionOrder> {
    const response = await fetch(`${API_BASE_URL}/production/orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch production order');
    }
    
    return response.json();
  }

  async createProductionOrder(data: ProductionOrderForm): Promise<ProductionOrder> {
    const response = await fetch(`${API_BASE_URL}/production/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create production order');
    }
    
    return response.json();
  }

  async updateProductionOrder(id: string, data: Partial<ProductionOrderForm>): Promise<ProductionOrder> {
    const response = await fetch(`${API_BASE_URL}/production/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update production order');
    }
    
    return response.json();
  }

  async deleteProductionOrder(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/production/orders/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete production order');
    }
  }

  async updateProductionOrderStatus(id: string, status: ProductionOrder['status']): Promise<ProductionOrder> {
    const response = await fetch(`${API_BASE_URL}/production/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update production order status');
    }
    
    return response.json();
  }

  // Production Records APIs
  async getProductionRecords(): Promise<ProductionRecord[]> {
    const response = await fetch(`${API_BASE_URL}/production/records`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch production records');
    }
    
    return response.json();
  }

  async getProductionRecord(id: string): Promise<ProductionRecord> {
    const response = await fetch(`${API_BASE_URL}/production/records/${id}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch production record');
    }
    
    return response.json();
  }

  async createProductionRecord(data: ProductionRecordForm): Promise<ProductionRecord> {
    const response = await fetch(`${API_BASE_URL}/production/records`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create production record');
    }
    
    return response.json();
  }

  async updateProductionRecord(id: string, data: Partial<ProductionRecordForm>): Promise<ProductionRecord> {
    const response = await fetch(`${API_BASE_URL}/production/records/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update production record');
    }
    
    return response.json();
  }

  async deleteProductionRecord(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/production/records/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete production record');
    }
  }

  // Work Centers and Machines APIs
  async getWorkCenters(): Promise<WorkCenter[]> {
    const response = await fetch(`${API_BASE_URL}/production/work-centers`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch work centers');
    }
    
    return response.json();
  }

  async getWorkCenter(id: string): Promise<WorkCenter> {
    const response = await fetch(`${API_BASE_URL}/production/work-centers/${id}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch work center');
    }
    
    return response.json();
  }

  async getMachines(workCenterId?: string): Promise<Machine[]> {
    const url = workCenterId 
      ? `${API_BASE_URL}/production/machines?workCenterId=${workCenterId}`
      : `${API_BASE_URL}/production/machines`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch machines');
    }
    
    return response.json();
  }

  // Production Scheduling APIs
  async getProductionSchedules(date?: string): Promise<ProductionSchedule[]> {
    const url = date 
      ? `${API_BASE_URL}/production/schedules?date=${date}`
      : `${API_BASE_URL}/production/schedules`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch production schedules');
    }
    
    return response.json();
  }

  async createProductionSchedule(data: Omit<ProductionSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductionSchedule> {
    const response = await fetch(`${API_BASE_URL}/production/schedules`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create production schedule');
    }
    
    return response.json();
  }

  // Bill of Materials APIs
  async getBillsOfMaterials(): Promise<BillOfMaterials[]> {
    const response = await fetch(`${API_BASE_URL}/production/bom`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch bills of materials');
    }
    
    return response.json();
  }

  async getBillOfMaterials(id: string): Promise<BillOfMaterials> {
    const response = await fetch(`${API_BASE_URL}/production/bom/${id}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch bill of materials');
    }
    
    return response.json();
  }

  async createBillOfMaterials(data: BOMForm): Promise<BillOfMaterials> {
    const response = await fetch(`${API_BASE_URL}/production/bom`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create bill of materials');
    }
    
    return response.json();
  }

  async updateBillOfMaterials(id: string, data: Partial<BOMForm>): Promise<BillOfMaterials> {
    const response = await fetch(`${API_BASE_URL}/production/bom/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update bill of materials');
    }
    
    return response.json();
  }

  // Analytics and Reports APIs
  async getProductionKPIs(period: 'daily' | 'weekly' | 'monthly' | 'quarterly', fromDate?: string, toDate?: string): Promise<ProductionKPIs> {
    const params = new URLSearchParams({
      period,
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
    });
    
    const response = await fetch(`${API_BASE_URL}/production/analytics/kpis?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch production KPIs');
    }
    
    return response.json();
  }

  async getProductionReport(reportType: 'daily' | 'weekly' | 'monthly' | 'custom', fromDate: string, toDate: string): Promise<ProductionReport> {
    const params = new URLSearchParams({
      reportType,
      fromDate,
      toDate,
    });
    
    const response = await fetch(`${API_BASE_URL}/production/analytics/reports?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch production report');
    }
    
    return response.json();
  }

  async exportProductionReport(reportType: 'daily' | 'weekly' | 'monthly' | 'custom', fromDate: string, toDate: string, format: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
    const params = new URLSearchParams({
      reportType,
      fromDate,
      toDate,
      format,
    });
    
    const response = await fetch(`${API_BASE_URL}/production/analytics/reports/export?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export production report');
    }
    
    return response.blob();
  }

  // Utility methods
  async checkLowStockMaterials(): Promise<RawMaterial[]> {
    const response = await fetch(`${API_BASE_URL}/production/raw-materials/low-stock`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to check low stock materials');
    }
    
    return response.json();
  }

  async getExpiringMaterials(days: number = 30): Promise<RawMaterial[]> {
    const response = await fetch(`${API_BASE_URL}/production/raw-materials/expiring?days=${days}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch expiring materials');
    }
    
    return response.json();
  }

  async getProductionEfficiency(workCenterId?: string, fromDate?: string, toDate?: string): Promise<any> {
    const params = new URLSearchParams({
      ...(workCenterId && { workCenterId }),
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
    });
    
    const response = await fetch(`${API_BASE_URL}/production/analytics/efficiency?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch production efficiency');
    }
    
    return response.json();
  }

  // Raw Material Categories
  async createRawMaterialCategory(data: any): Promise<RawMaterialCategory> {
    const response = await fetch(`${API_BASE_URL}/production/raw-materials/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create raw material category');
    }
    
    return response.json();
  }

  async updateRawMaterialCategory(id: string, data: any): Promise<RawMaterialCategory> {
    const response = await fetch(`${API_BASE_URL}/production/raw-materials/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update raw material category');
    }
    
    return response.json();
  }

  async deleteRawMaterialCategory(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/production/raw-materials/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete raw material category');
    }
  }

  // Work Centers
  async createWorkCenter(data: any): Promise<WorkCenter> {
    const response = await fetch(`${API_BASE_URL}/production/work-centers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create work center');
    }
    
    return response.json();
  }

  async updateWorkCenter(id: string, data: any): Promise<WorkCenter> {
    const response = await fetch(`${API_BASE_URL}/production/work-centers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update work center');
    }
    
    return response.json();
  }

  async deleteWorkCenter(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/production/work-centers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete work center');
    }
  }

  // Machines
  async getMachines(): Promise<Machine[]> {
    const response = await fetch(`${API_BASE_URL}/production/machines`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch machines');
    }
    
    return response.json();
  }

  async createMachine(data: any): Promise<Machine> {
    const response = await fetch(`${API_BASE_URL}/production/machines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create machine');
    }
    
    return response.json();
  }

  async updateMachine(id: string, data: any): Promise<Machine> {
    const response = await fetch(`${API_BASE_URL}/production/machines/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update machine');
    }
    
    return response.json();
  }

  async deleteMachine(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/production/machines/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete machine');
    }
  }

  // Production Chart APIs
  async getProductionCharts(fromDate?: string, toDate?: string): Promise<ProductionChart[]> {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    
    const url = params.toString() 
      ? `${API_BASE_URL}/production/charts?${params}` 
      : `${API_BASE_URL}/production/charts`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch production charts');
    }
    
    return response.json();
  }

  async getProductionChart(id: string): Promise<ProductionChart> {
    const response = await fetch(`${API_BASE_URL}/production/charts/${id}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch production chart');
    }
    
    return response.json();
  }

  async createProductionChart(data: ProductionChartForm): Promise<ProductionChart> {
    const response = await fetch(`${API_BASE_URL}/production/charts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create production chart');
    }
    
    return response.json();
  }

  async updateProductionChart(id: string, data: Partial<ProductionChartForm>): Promise<ProductionChart> {
    const response = await fetch(`${API_BASE_URL}/production/charts/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update production chart');
    }
    
    return response.json();
  }

  async deleteProductionChart(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/production/charts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete production chart');
    }
  }

  async getProductionChartSummary(fromDate?: string, toDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    
    const url = params.toString() 
      ? `${API_BASE_URL}/production/charts/summary?${params}` 
      : `${API_BASE_URL}/production/charts/summary`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch production chart summary');
    }
    
    return response.json();
  }

  // Raw Material Wastage APIs
  async getWastageEntries(params?: { materialId?: string; fromDate?: string; toDate?: string; page?: number; limit?: number }): Promise<{ wastageEntries: any[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    if (params?.materialId) queryParams.append('materialId', params.materialId);
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const url = queryParams.toString() 
      ? `${API_BASE_URL}/production/wastage?${queryParams}` 
      : `${API_BASE_URL}/production/wastage`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch wastage entries');
    }
    
    return response.json();
  }

  async createWastageEntry(data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/production/wastage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create wastage entry');
    }
    
    return response.json();
  }

  async getWastageReasons(): Promise<{ reasons: string[]; usage: any[] }> {
    const response = await fetch(`${API_BASE_URL}/production/wastage/reasons`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch wastage reasons');
    }
    
    return response.json();
  }

  async getWastageSummary(params?: { fromDate?: string; toDate?: string; materialId?: string; categoryId?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    if (params?.materialId) queryParams.append('materialId', params.materialId);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    
    const url = queryParams.toString() 
      ? `${API_BASE_URL}/production/wastage/summary?${queryParams}` 
      : `${API_BASE_URL}/production/wastage/summary`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch wastage summary');
    }
    
    return response.json();
  }
}

export const productionService = new ProductionService();
export default productionService;
