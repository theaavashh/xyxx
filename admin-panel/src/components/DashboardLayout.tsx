'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { 
  Building2, 
  LogOut, 
  Menu, 
  X, 
  BarChart3, 
  Users, 
  ShoppingCart, 
  FileText, 
  Factory,
  UserPlus,
  Receipt,
  BookOpen,
  ClipboardList,
  Package,
  FolderOpen,
  Calculator,
  Building,
  CreditCard,
  PieChart,
  TrendingUp,
  DollarSign,
  Scale,
  UserCheck,
  Settings,
  RotateCcw
} from 'lucide-react';
import { getRoleDisplayName } from '@/lib/utils';
import Breadcrumb, { getBreadcrumbItems } from './Breadcrumb';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const getNavigationItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 }
    ];

    // Debug: Log the current user role
    console.log('Current user role:', user?.role);



    const roleSpecificItems = {
      ADMIN: [
        { id: 'employees', label: 'Employee Management', icon: Users },
        { id: 'customers', label: 'Distributors', icon: Users },
        { id: 'approved-distributors', label: 'Approved Distributors', icon: UserCheck },
        { id: 'categories', label: 'Categories', icon: FolderOpen },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'orders', label: 'All Orders', icon: ShoppingCart },
        { id: 'accounting', label: 'Accounting Dashboard', icon: Calculator },
        { id: 'journal', label: 'Journal Entries', icon: BookOpen },
        { id: 'ledger', label: 'Ledger Management', icon: FileText },
        { id: 'party-ledger', label: 'Party Ledger', icon: Users },
        { id: 'purchase-entry', label: 'Purchase Entry', icon: ShoppingCart },
        { id: 'purchase-return', label: 'Purchase Return', icon: RotateCcw },
        { id: 'sales-return', label: 'Sales Return', icon: RotateCcw },
        { id: 'invoice', label: 'Invoice', icon: Receipt },
        { id: 'debtors-creditors', label: 'Debtors & Creditors', icon: CreditCard },
        { id: 'purchase-sales-reports', label: 'Purchase & Sales Reports', icon: BarChart3 },
        { id: 'vat-report', label: 'VAT Report (Nepal)', icon: Receipt },
        { id: 'balance-sheet', label: 'Balance Sheet', icon: Building },
        { id: 'trial-balance', label: 'Trial Balance', icon: Calculator },
        { id: 'mis-report', label: 'MIS Report', icon: PieChart },
        { id: 'production-dashboard', label: 'Production Dashboard', icon: BarChart3 },
        { id: 'raw-materials', label: 'Raw Materials', icon: Package },
        { id: 'production-records', label: 'Production Records', icon: ClipboardList },
        { id: 'production-planning', label: 'Production Planning', icon: Factory },
        { id: 'configuration', label: 'Configuration', icon: Settings },
        { id: 'reports', label: 'Reports', icon: FileText }
      ],
      MANAGERIAL: [
        { id: 'employees', label: 'Employee Management', icon: Users },
        { id: 'customers', label: 'Distributors', icon: Users },
        { id: 'approved-distributors', label: 'Approved Distributors', icon: UserCheck },
        { id: 'categories', label: 'Categories', icon: FolderOpen },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'orders', label: 'All Orders', icon: ShoppingCart },
        { id: 'accounting', label: 'Accounting Dashboard', icon: Calculator },
        { id: 'journal', label: 'Journal Entries', icon: BookOpen },
        { id: 'ledger', label: 'Ledger Management', icon: FileText },
        { id: 'party-ledger', label: 'Party Ledger', icon: Users },
        { id: 'purchase-entry', label: 'Purchase Entry', icon: ShoppingCart },
        { id: 'purchase-return', label: 'Purchase Return', icon: RotateCcw },
        { id: 'sales-return', label: 'Sales Return', icon: RotateCcw },
        { id: 'invoice', label: 'Invoice', icon: Receipt },
        { id: 'debtors-creditors', label: 'Debtors & Creditors', icon: CreditCard },
        { id: 'purchase-sales-reports', label: 'Purchase & Sales Reports', icon: BarChart3 },
        { id: 'vat-report', label: 'VAT Report (Nepal)', icon: Receipt },
        { id: 'balance-sheet', label: 'Balance Sheet', icon: Building },
        { id: 'trial-balance', label: 'Trial Balance', icon: Calculator },
        { id: 'mis-report', label: 'MIS Report', icon: PieChart },
        { id: 'production-dashboard', label: 'Production Dashboard', icon: BarChart3 },
        { id: 'raw-materials', label: 'Raw Materials', icon: Package },
        { id: 'production-records', label: 'Production Records', icon: ClipboardList },
        { id: 'production-planning', label: 'Production Planning', icon: Factory },
        { id: 'configuration', label: 'Configuration', icon: Settings },
        { id: 'reports', label: 'Reports', icon: FileText }
      ],
      SALES_MANAGER: [
        { id: 'employees', label: 'Employee Management', icon: Users },
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
        { id: 'customers', label: 'Distributors', icon: Users },
        { id: 'approved-distributors', label: 'Approved Distributors', icon: UserCheck },
        { id: 'distributor-sales', label: 'Distributor Sales', icon: TrendingUp },
        { id: 'categories', label: 'Categories', icon: FolderOpen },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'create-distributor', label: 'Create Distributor', icon: UserPlus },
        { id: 'reports', label: 'Reports', icon: FileText }
      ],
      SALES_REPRESENTATIVE: [
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
        { id: 'customers', label: 'Distributors', icon: Users },
        { id: 'create-distributor', label: 'Create Distributor', icon: UserPlus }
      ],
      DISTRIBUTOR: [
        { id: 'orders', label: 'My Orders', icon: ShoppingCart }
      ]
    };

    return [...commonItems, ...(roleSpecificItems[user?.role as keyof typeof roleSpecificItems] || [])];
  };

  const navigationItems = getNavigationItems();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 font-semibold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{getRoleDisplayName(user?.role || '')}</p>
              <p className="text-xs text-gray-500">{user?.employeeId}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${activeTab === item.id
                    ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-indigo-600" />
              <span className="font-semibold text-gray-900">Admin Panel</span>
            </div>
            <div className="w-6" /> {/* Placeholder for symmetry */}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {/* Breadcrumb */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <Breadcrumb 
              items={getBreadcrumbItems(activeTab)} 
              onNavigate={(href) => {
                // Convert href to tab name for navigation
                const tabMap: Record<string, string> = {
                  '/dashboard': 'dashboard',
                  '/employees': 'employees',
                  '/customers': 'customers',
                  '/orders': 'orders',
                  '/accounting': 'accounting',
                  '/journal': 'journal',
                  '/ledger': 'ledger',
                  '/party-ledger': 'party-ledger',
                  '/purchase-entry': 'purchase-entry',
                  '/purchase-return': 'purchase-return',
                  '/sales-return': 'sales-return',
                  '/invoice': 'invoice',
                  '/debtors-creditors': 'debtors-creditors',
                  '/purchase-sales-reports': 'purchase-sales-reports',
                  '/vat-report': 'vat-report',
                  '/balance-sheet': 'balance-sheet',
                  '/trial-balance': 'trial-balance',
                  '/mis-report': 'mis-report',
                  '/production-dashboard': 'production-dashboard',
                  '/raw-materials': 'raw-materials',
                  '/production-records': 'production-records',
                  '/production-planning': 'production-planning',
                  '/configuration': 'configuration',
                  '/distributor-sales': 'distributor-sales',
                  '/reports': 'reports'
                };
                const tab = tabMap[href] || 'dashboard';
                onTabChange(tab);
              }}
            />
          </div>
          
          {/* Page content */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
