'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Users, 
  FolderOpen, 
  Package, 
  ShoppingCart, 
  Calculator, 
  BarChart3,
  FileText,
  LogOut,
  AlertCircle
} from 'lucide-react';

interface NavigationItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  path: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'employees',
    title: 'Employee Management',
    icon: Users,
    path: '/dashboard/employees'
  },
  {
    id: 'distributors',
    title: 'Distributors',
    icon: Users,
    path: '/dashboard/distributors'
  },
  {
    id: 'categories',
    title: 'Categories',
    icon: FolderOpen,
    path: '/dashboard/categories'
  },
  {
    id: 'products',
    title: 'Products',
    icon: Package,
    path: '/dashboard/products'
  },
  {
    id: 'orders',
    title: 'All Orders',
    icon: ShoppingCart,
    path: '/dashboard/orders'
  },
  {
    id: 'accounting',
    title: 'Accounting Dashboard',
    icon: Calculator,
    path: '/dashboard/accounting'
  },
  {
    id: 'balance-sheet',
    title: 'Balance Sheet',
    icon: Calculator,
    path: '/dashboard/accounting/balance'
  },
  {
    id: 'trial-balance',
    title: 'Trial Balance',
    icon: Calculator,
    path: '/dashboard/accounting/trial'
  },
  {
    id: 'mis-report',
    title: 'MIS Report',
    icon: BarChart3,
    path: '/dashboard/accounting/mis'
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: FileText,
    path: '/dashboard/reports'
  }
];

export default function AccountingSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const isActiveItem = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Main Navigation */}
      <div className="flex-1 py-6">
        <nav className="space-y-2 px-4">
          {navigationItems.map((item) => {
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
