'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { 
  Users, 
  FolderOpen, 
  Package, 
  ShoppingCart, 
  Calculator, 
  BarChart3,
  FileText,
  LogOut,
  AlertCircle,
  RotateCcw,
  Receipt,
  CreditCard,
  Target
} from 'lucide-react';

interface NavigationItem {
  id: string;
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
  roles: ('ADMIN' | 'MANAGERIAL' | 'SALES_MANAGER' | 'SALES_REPRESENTATIVE' | 'DISTRIBUTOR')[];
}

const navigationItems: NavigationItem[] = [
  {
    id: 'employees',
    title: 'Employee Management',
    icon: Users,
    path: '/dashboard/employees',
    roles: ['ADMIN', 'MANAGERIAL', 'SALES_MANAGER']
  },
  {
    id: 'distributors',
    title: 'Distributors',
    icon: Users,
    path: '/dashboard/distributors',
    roles: ['ADMIN', 'MANAGERIAL', 'SALES_MANAGER', 'SALES_REPRESENTATIVE']
  },
  {
    id: 'categories',
    title: 'Categories',
    icon: FolderOpen,
    path: '/dashboard/categories',
    roles: ['ADMIN', 'MANAGERIAL', 'SALES_MANAGER']
  },
  {
    id: 'products',
    title: 'Products',
    icon: Package,
    path: '/dashboard/products',
    roles: ['ADMIN', 'MANAGERIAL', 'SALES_MANAGER']
  },
  {
    id: 'orders',
    title: 'All Orders',
    icon: ShoppingCart,
    path: '/dashboard/orders',
    roles: ['ADMIN', 'MANAGERIAL', 'SALES_MANAGER', 'SALES_REPRESENTATIVE']
  },
  {
    id: 'sales-targets',
    title: 'Sales Targets',
    icon: Target,
    path: '/dashboard/sales-targets',
    roles: ['ADMIN', 'MANAGERIAL', 'SALES_MANAGER']
  },
  {
    id: 'target-report',
    title: 'Target Report',
    icon: BarChart3,
    path: '/dashboard/target-report',
    roles: ['ADMIN', 'MANAGERIAL', 'SALES_MANAGER']
  },
  {
    id: 'accounting',
    title: 'Accounting Dashboard',
    icon: Calculator,
    path: '/dashboard/accounting',
    roles: ['ADMIN', 'MANAGERIAL']
  },
  {
    id: 'party-ledger',
    title: 'Party Ledger',
    icon: Users,
    path: '/dashboard/accounting/party',
    roles: ['ADMIN', 'MANAGERIAL']
  },
  {
    id: 'purchase-entry',
    title: 'Purchase Entry',
    icon: ShoppingCart,
    path: '/dashboard/accounting/purchase',
    roles: ['ADMIN', 'MANAGERIAL']
  },
  {
    id: 'purchase-return',
    title: 'Purchase Return',
    icon: RotateCcw,
    path: '/dashboard/accounting/purchase-return',
    roles: ['ADMIN', 'MANAGERIAL']
  },
  {
    id: 'sales-return',
    title: 'Sales Return',
    icon: RotateCcw,
    path: '/dashboard/accounting/sales-return',
    roles: ['ADMIN', 'MANAGERIAL']
  },
  {
    id: 'invoice',
    title: 'Invoice',
    icon: Receipt,
    path: '/dashboard/accounting/invoice',
    roles: ['ADMIN', 'MANAGERIAL']
  },
  {
    id: 'balance-sheet',
    title: 'Balance Sheet',
    icon: Calculator,
    path: '/dashboard/accounting/balance',
    roles: ['ADMIN', 'MANAGERIAL']
  },
  {
    id: 'trial-balance',
    title: 'Trial Balance',
    icon: Calculator,
    path: '/dashboard/accounting/trial',
    roles: ['ADMIN', 'MANAGERIAL']
  },
  {
    id: 'mis-report',
    title: 'MIS Report',
    icon: BarChart3,
    path: '/dashboard/accounting/mis',
    roles: ['ADMIN', 'MANAGERIAL']
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: FileText,
    path: '/dashboard/reports',
    roles: ['ADMIN', 'MANAGERIAL', 'SALES_MANAGER']
  }
];

export default function AccountingSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const isActiveItem = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  // Filter navigation items based on user role
  const filteredNavigationItems = navigationItems.filter(item => {
    if (!user) return false;
    // Debug: Show user role and item roles
    console.log(`User role: ${user.role}, Item: ${item.id}, Required roles: ${item.roles}`);
    return item.roles.includes(user.role);
  });

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Main Navigation */}
      <div className="flex-1 py-6">
        <nav className="space-y-2 px-4">
          {filteredNavigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = isActiveItem(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <IconComponent className={`h-5 w-5 ${
                  isActive ? 'text-indigo-600' : 'text-gray-500'
                }`} />
                <span className={`font-medium ${
                  isActive ? 'text-indigo-700' : 'text-gray-700'
                }`}>
                  {item.title}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-4">
        {/* Sign Out */}
        <button
          onClick={() => router.push('/')}
          className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5 text-red-600" />
          <span className="font-medium">Sign Out</span>
        </button>

        {/* Issue Badge */}
        <div className="mt-3 flex items-center justify-between px-3 py-2 bg-red-100 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">1 Issue</span>
          </div>
          <button className="text-red-600 hover:text-red-800">
            <span className="text-lg font-bold">×</span>
          </button>
        </div>
      </div>
    </div>
  );
}