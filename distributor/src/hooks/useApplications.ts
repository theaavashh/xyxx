import { useState, useEffect, useCallback } from 'react';
import { apiService, DistributorApplication, ApplicationFilters, ApplicationsResponse } from '@/lib/api';

export interface UseApplicationsReturn {
  applications: DistributorApplication[];
  loading: boolean;
  error: string | null;
  pagination: ApplicationsResponse['pagination'] | null;
  refetch: () => Promise<void>;
  updateFilters: (newFilters: Partial<ApplicationFilters>) => void;
  updateApplicationStatus: (id: string, status: string, notes?: string) => Promise<void>;
  getApplicationById: (id: string) => Promise<DistributorApplication | null>;
}

export function useApplications(initialFilters: ApplicationFilters = {}) {
  const [applications, setApplications] = useState<DistributorApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ApplicationsResponse['pagination'] | null>(null);
  const [filters, setFilters] = useState<ApplicationFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters,
  });

  console.log('🔄 useApplications: Hook initialized with filters:', filters);

  const fetchApplications = useCallback(async () => {
    console.log('🔄 useApplications: fetchApplications called with filters:', filters);
    setLoading(true);
    setError(null);

    try {
      console.log('🌐 useApplications: Making API call...');
      const response = await apiService.getApplications(filters);
      console.log('📡 useApplications: API response received:', response);
      
      if (response.success) {
        console.log('✅ useApplications: Setting applications data:', response.data);
        setApplications(response.data);
        setPagination(response.pagination);
      } else {
        console.error('❌ useApplications: API returned success: false');
        setError('Failed to fetch applications');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching applications';
      console.error('Error fetching applications:', err);
      
      // In development, show a helpful message and some sample data
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.log('🔄 Development mode: Showing sample data due to API error');
        setError(`API Error: ${errorMessage}. Showing sample data for development.`);
        
        // Set some sample data for development
        const sampleData: DistributorApplication[] = [
          {
            id: '1',
            fullName: 'Ram Sharma',
            email: 'ram.sharma@example.com',
            mobileNumber: '+977-9801234567',
            companyName: 'Sharma Trading Pvt. Ltd.',
            businessType: 'PRIVATE LIMITED',
            status: 'APPROVED',
            createdAt: '2024-01-15T00:00:00Z',
            updatedAt: '2024-01-15T00:00:00Z',
            citizenshipNumber: '12345-67890',
            officeAddress: 'Thamel, Kathmandu',
            permanentAddress: 'Thamel, Kathmandu',
          },
          {
            id: '2',
            fullName: 'Sita Thapa',
            email: 'sita.thapa@example.com',
            mobileNumber: '+977-9812345678',
            companyName: 'Mountain View Enterprises',
            businessType: 'PARTNERSHIP',
            status: 'PENDING',
            createdAt: '2024-02-10T00:00:00Z',
            updatedAt: '2024-02-10T00:00:00Z',
            citizenshipNumber: '23456-78901',
            officeAddress: 'Lakeside, Pokhara',
            permanentAddress: 'Lakeside, Pokhara',
          }
        ];
        
        setApplications(sampleData);
        setPagination({
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        });
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(async () => {
    await fetchApplications();
  }, [fetchApplications]);

  const updateFilters = useCallback((newFilters: Partial<ApplicationFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 when changing filters (except page itself)
      ...(newFilters.page === undefined && Object.keys(newFilters).length > 0 ? { page: 1 } : {}),
    }));
  }, []);

  const updateApplicationStatus = useCallback(async (id: string, status: string, notes?: string) => {
    try {
      const response = await apiService.updateApplicationStatus(id, status, notes);
      
      if (response.success) {
        // Update the application in the local state
        setApplications(prev => 
          prev.map(app => 
            app.id === id 
              ? { ...app, status: status as any, updatedAt: new Date().toISOString() }
              : app
          )
        );
        
        // Refetch to get updated data
        await refetch();
      } else {
        throw new Error('Failed to update application status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update application status';
      setError(errorMessage);
      throw err;
    }
  }, [refetch]);

  const getApplicationById = useCallback(async (id: string): Promise<DistributorApplication | null> => {
    try {
      const response = await apiService.getApplicationById(id);
      
      if (response.success) {
        return response.data.application;
      } else {
        throw new Error('Failed to fetch application');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch application';
      setError(errorMessage);
      console.error('Error fetching application:', err);
      return null;
    }
  }, []);

  // Fetch applications when filters change
  useEffect(() => {
    console.log('🔄 useApplications: useEffect triggered, calling fetchApplications');
    fetchApplications();
  }, [fetchApplications]);

  // Log when hook is mounted
  useEffect(() => {
    console.log('🔄 useApplications: Hook mounted');
  }, []);

  return {
    applications,
    loading,
    error,
    pagination,
    refetch,
    updateFilters,
    updateApplicationStatus,
    getApplicationById,
  };
}

// Hook for getting application statistics
export function useApplicationStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getApplicationStats();
      
      if (response.success) {
        setStats(response.data);
      } else {
        setError('Failed to fetch statistics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching statistics';
      setError(errorMessage);
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
