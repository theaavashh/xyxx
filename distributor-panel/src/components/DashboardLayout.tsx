'use client';

import { useState } from 'react';
import { 
  Building2, 
  LogOut, 
  Menu, 
  X, 
  BarChart3, 
  Users, 
  ShoppingCart, 
  FileText, 
  Package,
  Calendar,
  User,
  Bell,
  Settings,
  HelpCircle,
  Plus,
  Phone,
  Video,
  MoreHorizontal,
  TrendingUp,
  Target,
  ClipboardList,
  Receipt,
  CreditCard,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import toast from 'react-hot-toast';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  children?: NavigationItem[];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['sales']);
  const { user, logout } = useAuth();

  const getNavigationItems = (): NavigationItem[] => {
    const commonItems: NavigationItem[] = [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 }
    ];

    const distributorItems: NavigationItem[] = [
      { id: 'orders', label: 'My Orders', icon: ShoppingCart },
      { id: 'products', label: 'Products', icon: Package },
      { 
        id: 'sales', 
        label: 'Sales', 
        icon: TrendingUp,
        children: [
          { id: 'current-sales', label: 'Current Sales', icon: Target },
          { id: 'sales-log', label: 'Sales Log', icon: FileText }
        ]
      },
      { id: 'transactions', label: 'Transactions', icon: CreditCard },
      { id: 'reports', label: 'Reports', icon: BarChart3 },
      { id: 'settings', label: 'Settings', icon: Settings }
    ];

    return [...commonItems, ...distributorItems];
  };

  const navigationItems = getNavigationItems();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
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
            <span className="text-xl font-bold text-gray-900">Distributor Panel</span>
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
                {user?.name?.[0] || 'D'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user?.name || 'Distributor'}
              </p>
              <p className="text-xs text-gray-500">Distributor</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedSections.includes(item.id);
            
            return (
              <div key={item.id}>
              <button
                  onClick={() => {
                    if (hasChildren) {
                      toggleSection(item.id);
                    } else {
                      onTabChange(item.id);
                      setSidebarOpen(false);
                    }
                  }}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${activeTab === item.id
                      ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                  {hasChildren && (
                    isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )
                  )}
              </button>
                
                {/* Sub-items */}
                {hasChildren && isExpanded && item.children && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      return (
              <button
                          key={child.id}
                          onClick={() => {
                            onTabChange(child.id);
                            setSidebarOpen(false);
                          }}
                          className={`
                            w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors
                            ${activeTab === child.id
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }
                          `}
                        >
                          <ChildIcon className="h-4 w-4" />
                          <span>{child.label}</span>
              </button>
                      );
                    })}
                  </div>
                )}
            </div>
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
              <span className="font-semibold text-gray-900">Distributor Panel</span>
            </div>
            <div className="w-6" /> {/* Placeholder for symmetry */}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {/* Breadcrumb */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {(() => {
                    // Find the active tab in main items
                    const mainItem = navigationItems.find(item => item.id === activeTab);
                    if (mainItem) return mainItem.label;
                    
                    // Find the active tab in sub-items
                    for (const item of navigationItems) {
                      if (item.children) {
                        const subItem = item.children.find(child => child.id === activeTab);
                        if (subItem) return subItem.label;
                      }
                    }
                    return 'Dashboard';
                  })()}
                </h1>
                <p className="text-gray-600">
                  {activeTab === 'dashboard' 
                    ? 'Welcome to your distributor dashboard' 
                    : activeTab === 'current-sales'
                    ? 'View your active sales and ongoing transactions'
                    : activeTab === 'sales-log'
                    ? 'Track your daily sales activities'
                    : `Manage your ${activeTab.toLowerCase().replace('-', ' ')} here`
                  }
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                    <Bell className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
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