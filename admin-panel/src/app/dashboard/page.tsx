'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Dashboard from '@/components/Dashboard';
import EmployeeManagement from '@/components/EmployeeManagement';
import OrderManagement from '@/components/OrderManagement';
import VATBills from '@/components/VATBills';
import ProductionOrders from '@/components/ProductionOrders';
import ProductionDashboard from '@/components/ProductionDashboard';
import RawMaterialManagement from '@/components/RawMaterialManagement';
import ProductionRecords from '@/components/ProductionRecords';
import ProductionPlanning from '@/components/ProductionPlanning';
import CreateDistributor from '@/components/CreateDistributor';
import DistributorManagement from '@/components/DistributorManagement';
import SalesAnalytics from '@/components/SalesAnalytics';
import CategoryManagement from '@/components/CategoryManagement';
import ProductManagement from '@/components/ProductManagement';
import AccountingDashboard from '@/components/AccountingDashboard';
import JournalEntry from '@/components/JournalEntry';
import PurchaseEntry from '@/components/PurchaseEntry';
import VATReportNepal from '@/components/VATReportNepal';
import TrialBalance from '@/components/TrialBalance';
import BalanceSheet from '@/components/BalanceSheet';
import PartyLedger from '@/components/PartyLedger';
import DebtorsCreditors from '@/components/DebtorsCreditors';
import PurchaseSalesReports from '@/components/PurchaseSalesReports';
import MISReport from '@/components/MISReport';
import LedgerManagement from '@/components/LedgerManagement';
import ApprovedDistributors from '@/components/ApprovedDistributors';
import ConfigurationManagement from '@/components/ConfigurationManagement';
import PurchaseReturn from '@/components/PurchaseReturn';
import SalesReturn from '@/components/SalesReturn';
import Invoice from '@/components/Invoice';
import DistributorSalesViewer from '@/components/DistributorSalesViewer';

// Placeholder components for modules not yet implemented
function VATBillsComponent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">VAT Bills Management</h1>
        <p className="text-gray-600 mt-1">Manage VAT bills and tax compliance</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">VAT Bills management module coming soon...</p>
      </div>
    </div>
  );
}

function ProductionOrdersComponent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Production Orders</h1>
        <p className="text-gray-600 mt-1">View and manage production orders</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Production orders module coming soon...</p>
      </div>
    </div>
  );
}

function ProductionPlanningComponent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Production Planning</h1>
        <p className="text-gray-600 mt-1">Plan and schedule production activities</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Production planning module coming soon...</p>
      </div>
    </div>
  );
}

function CustomersComponent() {
  return <DistributorManagement />;
}

function ReportsComponent() {
  return <SalesAnalytics />;
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.push('/');
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      
      // Admin/Manager role components
      case 'employees':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL' || user.role === 'SALES_MANAGER') ? 
          <EmployeeManagement /> : <div>Access Denied</div>;

      case 'reports':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL' || user.role === 'SALES_MANAGER') ? 
          <ReportsComponent /> : <div>Access Denied</div>;
      
      // Sales role components
      case 'orders':
        return (user.role === 'SALES_MANAGER' || user.role === 'SALES_REPRESENTATIVE' || user.role === 'ADMIN' || user.role === 'MANAGERIAL') ? 
          <OrderManagement /> : <div>Access Denied</div>;
      case 'customers':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL' || user.role === 'SALES_MANAGER' || user.role === 'SALES_REPRESENTATIVE') ? 
          <CustomersComponent /> : <div>Access Denied</div>;
      case 'approved-distributors':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL' || user.role === 'SALES_MANAGER') ? 
          <ApprovedDistributors /> : <div>Access Denied</div>;
      case 'create-distributor':
        return (user.role === 'SALES_MANAGER' || user.role === 'SALES_REPRESENTATIVE' || user.role === 'ADMIN') ? 
          <CreateDistributor /> : <div>Access Denied</div>;
      case 'categories':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL' || user.role === 'SALES_MANAGER') ? 
          <CategoryManagement /> : <div>Access Denied</div>;
      case 'products':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL' || user.role === 'SALES_MANAGER') ? 
          <ProductManagement /> : <div>Access Denied</div>;
      
      // Accounting role components
      case 'accounting':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL') ? 
          <AccountingDashboard /> : <div>Access Denied</div>;
      
      // Production role components
      case 'production-dashboard':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL') ? 
          <ProductionDashboard /> : <div>Access Denied</div>;
      case 'raw-materials':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL') ? 
          <RawMaterialManagement /> : <div>Access Denied</div>;
      case 'production-records':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL') ? 
          <ProductionRecords /> : <div>Access Denied</div>;
      case 'production-planning':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL') ? 
          <ProductionPlanning /> : <div>Access Denied</div>;
      case 'configuration':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL') ? 
          <ConfigurationManagement /> : <div>Access Denied</div>;
      case 'production-orders':
        return user.role === 'ADMIN' ? 
          <ProductionOrders /> : <div>Access Denied</div>;
      
      // Accounting role components
      case 'journal':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL') ? 
          <JournalEntry /> : <div>Access Denied</div>;
      case 'ledger':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL') ? 
          <LedgerManagement /> : <div>Access Denied</div>;
      case 'party-ledger':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL') ? 
          <PartyLedger /> : <div>Access Denied</div>;
      case 'purchase-entry':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL') ? 
          <PurchaseEntry /> : <div>Access Denied</div>;
      case 'purchase-return':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL') ? 
          <PurchaseReturn /> : <div>Access Denied</div>;
      case 'sales-return':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL') ? 
          <SalesReturn /> : <div>Access Denied</div>;
      case 'invoice':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL') ? 
          <Invoice /> : <div>Access Denied</div>;
      case 'debtors-creditors':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL') ? 
          <DebtorsCreditors /> : <div>Access Denied</div>;
      case 'purchase-sales-reports':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL') ? 
          <PurchaseSalesReports /> : <div>Access Denied</div>;
      case 'vat-report':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL') ? 
          <VATReportNepal /> : <div>Access Denied</div>;
      case 'balance-sheet':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL') ? 
          <BalanceSheet /> : <div>Access Denied</div>;
      case 'trial-balance':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL') ? 
          <TrialBalance /> : <div>Access Denied</div>;
      case 'mis-report':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL') ? 
          <MISReport /> : <div>Access Denied</div>;
      case 'distributor-sales':
        return (user.role === 'ADMIN' || user.role === 'MANAGERIAL' || user.role === 'SALES_MANAGER') ? 
          <DistributorSalesViewer /> : <div>Access Denied</div>;
      
      default:
        return <Dashboard />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
}
