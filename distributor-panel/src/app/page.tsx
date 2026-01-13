'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AuthProvider, useAuth } from '@/components/AuthProvider';
import { EnhancedLoginForm } from '@/components/EnhancedLoginForm';
import DashboardLayout from '@/components/DashboardLayout';
import { EnhancedDashboard } from '@/components/EnhancedDashboard';
import { DailySalesLogBook } from '@/components/DailySalesLogBook';
import { ProductOrdering } from '@/components/ProductOrdering';
import Orders  from '@/components/Orders';
import Transactions  from '@/components/Transactions';
import CurrentSales  from '@/components/CurrentSales';
import  ReportsPage from '@/components/ReportsPage';
import SettingsPage  from '@/components/SettingsPage';

// Types and Interfaces
type TabType = 'dashboard' | 'products' | 'orders' | 'transactions' | 'current-sales' | 'sales-log' | 'reports' | 'settings';

interface TabConfig {
  id: TabType;
  label: string;
  icon: string;
  component: React.ComponentType;
  description: string;
  requiredRole?: string[];
}

// Form Schema for tab navigation (for future enhancements)
const tabFormSchema = yup.object().shape({
  activeTab: yup.string().oneOf<TabType>(['dashboard', 'products', 'orders', 'transactions', 'current-sales', 'sales-log', 'reports', 'settings']).default('dashboard'),
  searchQuery: yup.string().optional(),
  filters: yup.object().optional(),
});

type TabFormData = yup.InferType<typeof tabFormSchema>;

// Tab Configuration - Centralized and maintainable
const TAB_CONFIG: TabConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    component: EnhancedDashboard,
    description: 'Overview of your sales and performance metrics'
  },
  {
    id: 'products',
    label: 'Products',
    icon: '📦',
    component: ProductOrdering,
    description: 'Browse and order products'
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: '🛒',
    component: Orders,
    description: 'View and manage your orders'
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: '💳',
    component: Transactions,
    description: 'Transaction history and details'
  },
  {
    id: 'current-sales',
    label: 'Current Sales',
    icon: '📈',
    component: CurrentSales,
    description: 'Track current month sales'
  },
  {
    id: 'sales-log',
    label: 'Sales Log',
    icon: '📝',
    component: DailySalesLogBook,
    description: 'Daily sales log book'
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: '📋',
    component: ReportsPage,
    description: 'Generate and view reports'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',
    component: SettingsPage,
    description: 'Manage your account settings'
  }
];

// Custom Hook for Tab Management
const useTabManagement = () => {
  const { user, isLoading } = useAuth();
  
  // Initialize React Hook Form
  const methods = useForm<TabFormData>({
    resolver: yupResolver(tabFormSchema),
    defaultValues: {
      activeTab: 'dashboard',
      searchQuery: '',
      filters: {}
    },
    mode: 'onChange'
  });

  const { watch, setValue, getValues } = methods;
  const activeTab = watch('activeTab') as TabType;

  // Memoized active component for performance
  const ActiveComponent = useMemo(() => {
    const tabConfig = TAB_CONFIG.find(tab => tab.id === activeTab);
    return tabConfig?.component || EnhancedDashboard;
  }, [activeTab]);

  // Memoized tab config for current active tab
  const currentTabConfig = useMemo(() => {
    return TAB_CONFIG.find(tab => tab.id === activeTab) || TAB_CONFIG[0];
  }, [activeTab]);

  // Handle tab change with validation
  const handleTabChange = useCallback((newTab: TabType) => {
    try {
      setValue('activeTab', newTab, {
        shouldValidate: true,
        shouldDirty: true
      });
    } catch (error) {
      console.error('Error changing tab:', error);
    }
  }, [setValue]);

  // Get tab accessibility based on user role
  const getTabAccessibility = useCallback((tabId: TabType) => {
    const tabConfig = TAB_CONFIG.find(tab => tab.id === tabId);
    
    if (!tabConfig?.requiredRole || !user) {
      return { accessible: true, reason: null };
    }

    const hasRequiredRole = tabConfig.requiredRole.includes(user.role);
    return {
      accessible: hasRequiredRole,
      reason: hasRequiredRole ? null : `Requires ${tabConfig.requiredRole.join(' or ')} role`
    };
  }, [user]);

  // Filter tabs based on accessibility
  const accessibleTabs = useMemo(() => {
    return TAB_CONFIG.filter(tab => getTabAccessibility(tab.id).accessible);
  }, [getTabAccessibility]);

  return {
    methods,
    activeTab,
    ActiveComponent,
    currentTabConfig,
    handleTabChange,
    accessibleTabs,
    getTabAccessibility,
    user,
    isLoading
  };
};

// Loading Component with better UX
const LoadingState: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <div className="relative">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-8 w-8 bg-blue-600 rounded-full opacity-20 animate-pulse"></div>
      </div>
    </div>
    <div className="mt-6 text-center space-y-2">
      <p className="text-lg font-medium text-gray-700">Loading your dashboard</p>
      <p className="text-sm text-gray-500">Please wait while we set things up...</p>
    </div>
  </div>
);

// Main App Content Component
const AppContent: React.FC = () => {
  const {
    methods,
    activeTab,
    ActiveComponent,
    currentTabConfig,
    handleTabChange,
    accessibleTabs,
    getTabAccessibility,
    user,
    isLoading
  } = useTabManagement();

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyboardNavigation = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        const key = event.key;
        const currentIndex = accessibleTabs.findIndex(tab => tab.id === activeTab);
        
        switch (key) {
          case 'ArrowLeft':
            event.preventDefault();
            if (currentIndex > 0) {
              handleTabChange(accessibleTabs[currentIndex - 1].id);
            }
            break;
          case 'ArrowRight':
            event.preventDefault();
            if (currentIndex < accessibleTabs.length - 1) {
              handleTabChange(accessibleTabs[currentIndex + 1].id);
            }
            break;
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
            event.preventDefault();
            const tabIndex = parseInt(key) - 1;
            if (tabIndex < accessibleTabs.length) {
              handleTabChange(accessibleTabs[tabIndex].id);
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyboardNavigation);
    return () => window.removeEventListener('keydown', handleKeyboardNavigation);
  }, [activeTab, accessibleTabs, handleTabChange]);

  // Handle browser history for navigation
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tabFromUrl = urlParams.get('tab') as TabType;
      
      if (tabFromUrl && TAB_CONFIG.find(tab => tab.id === tabFromUrl)) {
        handleTabChange(tabFromUrl);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handleTabChange]);

  // Update URL when tab changes
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', activeTab);
    window.history.pushState({}, '', url.toString());
    
    // Update page title
    document.title = `${currentTabConfig.label} - Distributor Panel`;
  }, [activeTab, currentTabConfig]);

  // Handle form submission (for future search/filter functionality)
  const handleFormSubmit = useCallback((data: TabFormData) => {
    console.log('Form submitted:', data);
    // Handle search/filters logic here
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EnhancedLoginForm />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleFormSubmit)} className="h-full">
        <DashboardLayout 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          tabs={accessibleTabs}
          currentTabConfig={currentTabConfig}
        >
          <div className="h-full">
            <ActiveComponent />
          </div>
        </DashboardLayout>
      </form>
    </FormProvider>
  );
};

// Main App Component with error boundary
const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </div>
  );
};

export default App;

// Export types for external use
export type { TabType, TabConfig, TabFormData };
export { TAB_CONFIG };