'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  RotateCcw,
  ChevronDown,
  Key,
  Bell
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
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getNavigationItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'reports', label: 'Reports', icon: FileText }
    ];

    // Debug: Log the current user role
    console.log('Current user role:', user?.role);



    const roleSpecificItems = {
      ADMIN: [
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
        { id: 'employees', label: 'Employee Management', icon: Users },
        { id: 'configuration', label: 'Configuration', icon: Settings },
      ],
      MANAGERIAL: [
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
        { id: 'employees', label: 'Employee Management', icon: Users },
        { id: 'configuration', label: 'Configuration', icon: Settings },
      ],
      SALES_MANAGER: [
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
        { id: 'customers', label: 'Distributors', icon: Users },
        { id: 'approved-distributors', label: 'Approved Distributors', icon: UserCheck },
        { id: 'distributor-sales', label: 'Distributor Sales', icon: TrendingUp },
        { id: 'categories', label: 'Categories', icon: FolderOpen },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'create-distributor', label: 'Create Distributor', icon: UserPlus },
        { id: 'employees', label: 'Employee Management', icon: Users },
        { id: 'configuration', label: 'Configuration', icon: Settings }
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
    setUserDropdownOpen(false);
  };

  const handleChangePassword = () => {
    // TODO: Implement change password functionality
    console.log('Change password clicked');
    setUserDropdownOpen(false);
  };

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: "New Order Received",
      message: "Order #ORD-2024-001 from ABC Distributors",
      time: "2 minutes ago",
      unread: true
    },
    {
      id: 2,
      title: "Payment Confirmed",
      message: "Payment of Rs. 15,000 received from XYZ Company",
      time: "1 hour ago",
      unread: true
    },
    {
      id: 3,
      title: "Low Stock Alert",
      message: "Product 'Widget A' is running low (5 units left)",
      time: "3 hours ago",
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleNotificationClick = (notificationId: number) => {
    // TODO: Handle notification click
    console.log('Notification clicked:', notificationId);
    setNotificationDropdownOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 lg:hidden">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-black">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-6 w-6 text-black" />
          </button>
        </div>

        {/* Company Text */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="text-center">
            <h2 className="text-lg font-bold text-black">Celebrate Multi Industry</h2>
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
                  w-full flex items-center space-x-4 px-4 py-3 text-base font-semibold rounded-lg transition-colors
                  ${activeTab === item.id
                    ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-700'
                    : 'text-black hover:bg-gray-100 hover:text-black'
                  }
                `}
              >
                <Icon className="h-6 w-6" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-4 px-4 py-3 text-base font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-6 w-6" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar with Breadcrumbs, Logo and User Info */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
                className="text-black hover:text-black lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
              
              {/* Breadcrumbs */}
              <div className="hidden md:block">
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
            </div>
            
            {/* Right side - User Info */}
            <div className="flex items-center space-x-4">
              {/* Notification Icon */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                  className="relative p-2 text-black hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-black">Notifications</h3>
                      <p className="text-xs text-black">{unreadCount} unread notifications</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification.id)}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                              notification.unread ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notification.unread ? 'bg-blue-500' : 'bg-gray-300'
                              }`}></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-black">{notification.title}</p>
                                <p className="text-xs text-black mt-1">{notification.message}</p>
                                <p className="text-xs text-black mt-1">{notification.time}</p>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-black">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-black" />
                          <p className="text-sm">No notifications</p>
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="px-4 py-2 border-t border-gray-100">
                        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                          Mark all as read
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Info with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-black">
                      {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`}
                    </p>
                    <p className="text-xs text-black">{getRoleDisplayName(user?.role || '')}</p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold text-sm">
                      {(user?.fullName?.[0] || user?.firstName?.[0] || 'U')}{(user?.fullName?.split(' ')[1]?.[0] || user?.lastName?.[0] || '')}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-black" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={handleChangePassword}
                      className="flex items-center w-full px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors"
                    >
                      <Key className="h-4 w-4 mr-3 text-black" />
                      Change Password
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {/* Page content */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
