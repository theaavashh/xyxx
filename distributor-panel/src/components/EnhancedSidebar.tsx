'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore, useUIStore, useUISelectors } from '@/stores';
import { NavigationItem } from '@/types';
import {
  Home,
  ShoppingCart,
  Package,
  FileText,
  BarChart3,
  DollarSign,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  Plus,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export const EnhancedSidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar, notifications } = useUIStore();
  const { unreadCount, highPriorityCount } = useUISelectors();

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['sales']));

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'HomeIcon',
      path: '/dashboard',
    },
    {
      id: 'orders',
      title: 'My Orders',
      icon: 'ShoppingCart',
      path: '/orders',
      badge: 0, // Will be updated with pending orders count
    },
    {
      id: 'products',
      title: 'Products',
      icon: 'Package',
      path: '/products',
    },
    {
      id: 'sales',
      title: 'Sales',
      icon: 'FileText',
      path: '/sales',
      children: [
        {
          id: 'current-sales',
          title: 'Current Sales',
          icon: 'BarChart3',
          path: '/sales/current',
        },
        {
          id: 'daily-log',
          title: 'Daily Log Book',
          icon: 'FileText',
          path: '/sales/daily-log',
        },
        {
          id: 'monthly-log',
          title: 'Monthly Log',
          icon: 'FileText',
          path: '/sales/monthly-log',
        },
        {
          id: 'sales-history',
          title: 'Sales History',
          icon: 'BarChart3',
          path: '/sales/history',
        },
      ],
    },
    {
      id: 'transactions',
      title: 'Transactions',
      icon: 'DollarSign',
      path: '/transactions',
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: 'BarChart3',
      path: '/reports',
      children: [
        {
          id: 'sales-reports',
          title: 'Sales Reports',
          icon: 'BarChart3',
          path: '/reports/sales',
        },
        {
          id: 'inventory-reports',
          title: 'Inventory Reports',
          icon: 'Package',
          path: '/reports/inventory',
        },
        {
          id: 'financial-reports',
          title: 'Financial Reports',
          icon: 'DollarSign',
          path: '/reports/financial',
        },
      ],
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'CogIcon',
      path: '/settings',
    },
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const isActive = (item: NavigationItem) => {
    if (item.path) {
      return pathname === item.path || pathname.startsWith(item.path + '/');
    }
    return false;
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      HomeIcon,
      ShoppingCart,
      Package,
      FileText,
      BarChart3,
      DollarSign,
      BellIcon,
      CogIcon,
      UserIcon,
    };
    return icons[iconName] || FileText;
  };

  const handleLogout = () => {
    logout();
  };

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const Icon = getIcon(item.icon);
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item);

    return (
      <div key={item.id}>
        <Link
          href={item.path || '#'}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpanded(item.id);
            }
          }}
          className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors ${active
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:bg-gray-50'
            } ${level > 0 ? 'ml-' + (level * 4) : ''}`}
        >
          <div className="flex items-center">
            <Icon className="h-5 w-5 mr-3" />
            <span className="text-3xl font-bold text-black">{item.title}</span>
          </div>

          <div className="flex items-center">
            {item.badge && item.badge > 0 && (
              <span className="mr-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                {item.badge}
              </span>
            )}

            {hasChildren && (
              isExpanded ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              ))}
          </div>
        </Link>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {item.children?.map((child) => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full bg-white border-r border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Distributor Panel</h2>
            <p className="text-sm text-gray-600">{user?.companyName || 'Welcome'}</p>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => renderNavigationItem(item))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-base font-bold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <Link
                href="/notifications"
                className="p-2 text-gray-400 hover:text-gray-600 relative"
              >
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className={`absolute -top-1 -right-1 h-4 w-4 rounded-full text-xs flex items-center justify-center text-white ${highPriorityCount > 0 ? 'bg-red-500' : 'bg-blue-500'
                    }`}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Settings */}
            <Link
              href="/settings"
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <CogIcon className="h-5 w-5" />
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Link
            href="/sales/daily-log"
            className="flex items-center justify-center w-full px-3 py-2 bg-blue-600 text-white text-base font-bold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Daily Log
          </Link>

          <Link
            href="/products"
            className="flex items-center justify-center w-full px-3 py-2 bg-green-600 text-white text-base font-bold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Order Products
          </Link>
        </div>
      </div>
    </div>
  );
};

// Mobile Sidebar Wrapper
export const MobileSidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <EnhancedSidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-h-screen">
        {children}
      </div>
    </>
  );
};