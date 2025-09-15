import { useState, useEffect, useCallback } from 'react';
import { distributorApiService, DistributorApplication, ApplicationFilters, ApplicationsResponse } from '@/lib/distributorApi';
import { apiCall } from '@/lib/api';

export interface UseDistributorApplicationsReturn {
  applications: DistributorApplication[];
  loading: boolean;
  error: string | null;
  pagination: ApplicationsResponse['pagination'] | null;
  refetch: () => Promise<void>;
  updateFilters: (newFilters: Partial<ApplicationFilters>) => void;
  updateApplicationStatus: (id: string, status: string, notes?: string) => Promise<void>;
  approveApplication: (id: string, notes?: string) => Promise<void>;
  rejectApplication: (id: string, notes?: string) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  getApplicationById: (id: string) => Promise<DistributorApplication | null>;
}

export function useDistributorApplications(initialFilters: ApplicationFilters = {}) {
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

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await distributorApiService.getApplications(filters);
      
      if (response.success && response.data) {
        // The API returns data directly in response.data array
        setApplications(response.data);
        setPagination(response.pagination);
      } else {
        setError('Failed to fetch applications');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching applications';
      setError(errorMessage);
      console.error('Error fetching applications:', err);
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
      const result = await apiCall(
        () => distributorApiService.updateApplicationStatus(id, status, notes),
        true,
        'Application status updated successfully'
      );
      
      if (result) {
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
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update application status';
      setError(errorMessage);
      throw err;
    }
  }, [refetch]);

  const approveApplication = useCallback(async (id: string, notes?: string) => {
    try {
      const result = await apiCall(
        () => distributorApiService.approveApplication(id, notes),
        true,
        'Application approved successfully'
      );
      
      if (result) {
        // Update the application in the local state
        setApplications(prev => 
          prev.map(app => 
            app.id === id 
              ? { ...app, status: 'APPROVED', updatedAt: new Date().toISOString() }
              : app
          )
        );
        
        // Refetch to get updated data
        await refetch();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve application';
      setError(errorMessage);
      throw err;
    }
  }, [refetch]);

  const rejectApplication = useCallback(async (id: string, notes?: string) => {
    try {
      const result = await apiCall(
        () => distributorApiService.rejectApplication(id, notes),
        true,
        'Application rejected'
      );
      
      if (result) {
        // Update the application in the local state
        setApplications(prev => 
          prev.map(app => 
            app.id === id 
              ? { ...app, status: 'REJECTED', updatedAt: new Date().toISOString() }
              : app
          )
        );
        
        // Refetch to get updated data
        await refetch();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject application';
      setError(errorMessage);
      throw err;
    }
  }, [refetch]);

  const deleteApplication = useCallback(async (id: string) => {
    try {
      const result = await apiCall(
        () => distributorApiService.deleteApplication(id),
        true,
        'Application deleted successfully'
      );
      
      if (result) {
        // Remove the application from the local state
        setApplications(prev => prev.filter(app => app.id !== id));
        
        // Refetch to get updated data
        await refetch();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete application';
      setError(errorMessage);
      throw err;
    }
  }, [refetch]);

  const getApplicationById = useCallback(async (id: string): Promise<DistributorApplication | null> => {
    try {
      const result = await apiCall(
        () => distributorApiService.getApplicationById(id)
      );
      
      return result?.application || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch application';
      setError(errorMessage);
      console.error('Error fetching application:', err);
      return null;
    }
  }, []);

  // Fetch applications when filters change
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    loading,
    error,
    pagination,
    refetch,
    updateFilters,
    updateApplicationStatus,
    approveApplication,
    rejectApplication,
    deleteApplication,
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
      const result = await apiCall(
        () => distributorApiService.getApplicationStats()
      );
      
      if (result) {
        setStats(result);
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
