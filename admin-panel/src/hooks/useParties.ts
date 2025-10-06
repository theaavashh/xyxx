import { useState, useEffect, useCallback, useRef } from 'react';
import { httpClient, apiCall } from '@/lib/api';

export interface Party {
  id: string;
  partyName: string;
  partyType: 'customer' | 'supplier' | 'sundry_debtor' | 'sundry_creditor' | 'bank' | 'cash' | 'expense' | 'income' | 'asset' | 'liability';
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PartyFilters {
  type?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PartyResponse {
  partyLedgers: Party[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useParties = (filters: PartyFilters = {}) => {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(filters.page || 1);
  const [totalPages, setTotalPages] = useState(0);
  
  // Add debouncing and rate limiting
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);
  const lastApiCallRef = useRef<number>(0);
  const minApiCallInterval = 1000; // Minimum 1 second between API calls

  const fetchParties = useCallback(async (currentFilters: PartyFilters) => {
    // Rate limiting: prevent too many API calls
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCallRef.current;
    
    if (timeSinceLastCall < minApiCallInterval) {
      console.log('Rate limiting: skipping API call, too soon since last call');
      return;
    }
    
    lastApiCallRef.current = now;
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentFilters.page || 1,
        limit: currentFilters.limit || 100,
        ...(currentFilters.type && { type: currentFilters.type }),
        ...(currentFilters.search && { search: currentFilters.search }),
        ...(currentFilters.isActive !== undefined && { isActive: currentFilters.isActive }),
      };

      console.log('useParties: Making API call with params:', params);
      
      const data = await apiCall<PartyResponse>(
        () => httpClient.get('/accounting/party-ledger', params)
      );
      
      console.log('useParties: API call result:', data);

      if (data && data.partyLedgers) {
        // Convert string balances to numbers
        const partiesWithNumericBalances = data.partyLedgers.map(party => ({
          ...party,
          openingBalance: parseFloat(String(party.openingBalance)) || 0,
          currentBalance: parseFloat(String(party.currentBalance)) || 0
        }));
        
        setParties(partiesWithNumericBalances);
        setTotal(data.pagination?.total || 0);
        setPage(data.pagination?.page || 1);
        setTotalPages(data.pagination?.totalPages || 0);
      } else {
        // Fallback to mock data when API fails (e.g., no authentication)
        const mockParties: Party[] = [
          {
            id: '1',
            partyName: 'ABC Company Ltd',
            partyType: 'customer',
            contactPerson: 'John Doe',
            email: 'contact@abccompany.com',
            phone: '+977-1-1234567',
            address: 'Kathmandu, Nepal',
            openingBalance: 50000,
            currentBalance: 50000,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '2',
            partyName: 'XYZ Suppliers',
            partyType: 'supplier',
            contactPerson: 'Jane Smith',
            email: 'info@xyzsuppliers.com',
            phone: '+977-1-7654321',
            address: 'Pokhara, Nepal',
            openingBalance: -25000,
            currentBalance: -25000,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '3',
            partyName: 'Nepal Bank Ltd',
            partyType: 'bank',
            contactPerson: 'Bank Manager',
            email: 'info@nepalbank.com',
            phone: '+977-1-4444444',
            address: 'Kathmandu, Nepal',
            openingBalance: 100000,
            currentBalance: 100000,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        // Filter mock data based on filters
        let filteredParties = mockParties;
        if (currentFilters.type) {
          filteredParties = filteredParties.filter(party => party.partyType === currentFilters.type);
        }
        if (currentFilters.search) {
          filteredParties = filteredParties.filter(party => 
            party.partyName.toLowerCase().includes(currentFilters.search!.toLowerCase()) ||
            (party.email && party.email.toLowerCase().includes(currentFilters.search!.toLowerCase()))
          );
        }
        if (currentFilters.isActive !== undefined) {
          filteredParties = filteredParties.filter(party => party.isActive === currentFilters.isActive);
        }

        setParties(filteredParties);
        setTotal(filteredParties.length);
        setPage(1);
        setTotalPages(1);
        setError('Using demo data. Please login to access real data.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch parties');
      setParties([]);
      setTotal(0);
      setPage(1);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced effect for filters
  useEffect(() => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      fetchParties(filters);
    }, isInitialLoadRef.current ? 0 : 300); // No delay for initial load, 300ms for subsequent calls

    // Mark that initial load is complete
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
    }

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [filters, fetchParties]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const createParty = async (partyData: Omit<Party, 'id' | 'currentBalance' | 'createdAt' | 'updatedAt'>) => {
    try {
      const data = await apiCall<Party>(
        () => httpClient.post('/accounting/party-ledger', partyData),
        true,
        'Party created successfully'
      );

      if (data) {
        // Convert string balances to numbers
        const partyWithNumericBalances = {
          ...data,
          openingBalance: parseFloat(String(data.openingBalance)) || 0,
          currentBalance: parseFloat(String(data.currentBalance)) || 0
        };
        
        setParties(prev => [partyWithNumericBalances, ...prev]);
        return partyWithNumericBalances;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create party');
    }
    return null;
  };

  const updateParty = async (id: string, partyData: Partial<Party>) => {
    try {
      const data = await apiCall<Party>(
        () => httpClient.put(`/accounting/party-ledger/${id}`, partyData),
        true,
        'Party updated successfully'
      );

      if (data) {
        // Convert string balances to numbers
        const partyWithNumericBalances = {
          ...data,
          openingBalance: parseFloat(String(data.openingBalance)) || 0,
          currentBalance: parseFloat(String(data.currentBalance)) || 0
        };
        
        setParties(prev => prev.map(party => party.id === id ? partyWithNumericBalances : party));
        return partyWithNumericBalances;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update party');
    }
    return null;
  };

  const deleteParty = async (id: string) => {
    try {
      const success = await apiCall<boolean>(
        () => httpClient.delete(`/accounting/party-ledger/${id}`),
        true,
        'Party deleted successfully'
      );

      if (success) {
        setParties(prev => prev.filter(party => party.id !== id));
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete party');
    }
    return false;
  };

  const getPartyById = async (id: string) => {
    try {
      const data = await apiCall<Party>(
        () => httpClient.get(`/accounting/party-ledger/${id}`)
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch party');
      return null;
    }
  };

  const getPartiesByType = (type: Party['partyType']) => {
    return (parties || []).filter(party => party.partyType === type && party.isActive);
  };

  const getCustomers = () => getPartiesByType('customer');
  const getSuppliers = () => getPartiesByType('supplier');
  const getSundryDebtors = () => getPartiesByType('sundry_debtor');
  const getSundryCreditors = () => getPartiesByType('sundry_creditor');

  // Manual refresh function that bypasses rate limiting
  const refreshParties = useCallback(() => {
    lastApiCallRef.current = 0; // Reset rate limiting
    fetchParties(filters);
  }, [filters, fetchParties]);

  return {
    parties,
    loading,
    error,
    total,
    page,
    totalPages,
    fetchParties,
    refreshParties,
    createParty,
    updateParty,
    deleteParty,
    getPartyById,
    getPartiesByType,
    getCustomers,
    getSuppliers,
    getSundryDebtors,
    getSundryCreditors,
  };
};

export default useParties;
