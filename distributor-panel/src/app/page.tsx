'use client';

import { useState } from 'react';
import { AuthProvider, useAuth } from '@/components/AuthProvider';
import { EnhancedLoginForm } from '@/components/EnhancedLoginForm';
import DashboardLayout from '@/components/DashboardLayout';
import { EnhancedDashboard } from '@/components/EnhancedDashboard';
import { DailySalesLogBook } from '@/components/DailySalesLogBook';
import { ProductOrdering } from '@/components/ProductOrdering';
import Orders from '@/components/Orders';
import Transactions from '@/components/Transactions';
import CurrentSales from '@/components/CurrentSales';
import ReportsPage from '@/components/ReportsPage';
import SettingsPage from '@/components/SettingsPage';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <EnhancedLoginForm />;
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <EnhancedDashboard />;
      case 'products':
        return <ProductOrdering />;
      case 'orders':
        return <Orders />;
      case 'transactions':
        return <Transactions />;
      case 'current-sales':
        return <CurrentSales />;
      case 'sales-log':
        return <DailySalesLogBook />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <EnhancedDashboard />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderActiveComponent()}
    </DashboardLayout>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}