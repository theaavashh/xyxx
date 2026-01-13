import { httpClient, apiCall } from '@/lib/api';
import { PaymentConfig } from '@/types';

class PaymentConfigService {
  private endpoint = '/payment-config';

  async getPaymentConfigs(): Promise<PaymentConfig[]> {
    const response = await apiCall(() => httpClient.get<PaymentConfig[]>(this.endpoint));
    return response || [];
  }

  async getPaymentConfig(id: string): Promise<PaymentConfig | null> {
    return await apiCall(() => httpClient.get<PaymentConfig>(`${this.endpoint}/${id}`));
  }

  async createPaymentConfig(config: Omit<PaymentConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentConfig | null> {
    return await apiCall(() => httpClient.post<PaymentConfig>(this.endpoint, config), true, 'Payment configuration created successfully');
  }

  async updatePaymentConfig(id: string, config: Partial<PaymentConfig>): Promise<PaymentConfig | null> {
    return await apiCall(() => httpClient.put<PaymentConfig>(`${this.endpoint}/${id}`, config), true, 'Payment configuration updated successfully');
  }

  async deletePaymentConfig(id: string): Promise<boolean> {
    const result = await apiCall(() => httpClient.delete(`${this.endpoint}/${id}`), true, 'Payment configuration deleted successfully');
    return result !== null;
  }
}

export const paymentConfigService = new PaymentConfigService();