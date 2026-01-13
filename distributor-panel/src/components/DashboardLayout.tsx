'use client';

import { useState, useEffect, useRef } from 'react';
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
import { useUIStore } from '@/stores/uiStore';
import toast from 'react-hot-toast';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  children?: NavigationItem[];
}

import { TabType, TabConfig } from '@/app/page';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  tabs?: TabConfig[];
  currentTabConfig?: TabConfig;
}

export default function DashboardLayout({ children, activeTab, onTabChange, tabs, currentTabConfig }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['sales']);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { addNotification } = useUIStore();

  // Use provided tabs or fallback to hardcoded navigation
  const navigationTabs = tabs || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const navigationItems = navigationTabs.length > 0 ? navigationTabs : getNavigationItems();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    setProfileDropdownOpen(false);
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
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-md bg-indigo-600 flex items-center justify-center">
                  <img src="/zipzip-logo.svg" alt="ZipZip Logo" className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {currentTabConfig ? `${currentTabConfig.label} - Distributor Panel` : 'Distributor Panel'}
                </span>
              </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 font-semibold">
                {user?.name?.[0] || 'D'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'Distributor'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
{navigationItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedSections.includes(item.id);
            const isActive = activeTab === item.id;
            const itemConfig = navigationTabs.find(tab => tab.id === item.id);
            
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
                    ${isActive
                      ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  title={itemConfig?.description || item.label}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{itemConfig?.icon || <Icon className="h-5 w-5" />}</span>
                    <span className="text-3xl font-bold text-black">{itemConfig?.label || item.label}</span>
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
                      const isChildActive = activeTab === child.id;
                      const childConfig = navigationTabs.find(tab => tab.id === child.id);
                      return (
              <button
                          key={child.id}
                          onClick={() => {
                            onTabChange(child.id);
                            setSidebarOpen(false);
                          }}
                          className={`
                            w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors
                            ${isChildActive
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }
                          `}
                          title={childConfig?.description || child.label}
                        >
                          <span className="text-lg">{childConfig?.icon || <ChildIcon className="h-4 w-4" />}</span>
                          <span className="text-2xl font-bold">{childConfig?.label || child.label}</span>
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
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 rounded-md bg-indigo-600 flex items-center justify-center">
                <img src="/zipzip-logo.svg" alt="ZipZip Logo" className="h-4 w-4" />
              </div>
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
                  {currentTabConfig ? currentTabConfig.label : 'Dashboard'}
                </h1>
                <p className="text-gray-600">
                  {currentTabConfig ? currentTabConfig.description : 'Welcome to your distributor dashboard'}
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
                <div className="relative">
                  <button 
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-3 focus:outline-none"
                  >
                     <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">Hey, {user?.name || 'Distributor'}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                   
                  </button>
                  
                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div ref={profileDropdownRef} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Account</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Change Password</a>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="p-6">
            {children}
          </div>
        </main>

        {/* Bottom Navigation for Mobile */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex justify-around items-center overflow-x-auto">
{navigationItems.filter(item => !item.children).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const itemConfig = navigationTabs.find(tab => tab.id === item.id);
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    // Close any open sidebar
                    setSidebarOpen(false);
                  }}
                  className={`flex flex-col items-center py-2 px-3 min-w-0 flex-shrink-0 transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-gray-500'
                  }`}
                  title={itemConfig?.description || item.label}
                >
                  <span className="text-lg">{itemConfig?.icon || <Icon className="h-5 w-5" />}</span>
                  <span className="text-xs mt-1 font-medium">{itemConfig?.label || item.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className={`flex flex-col items-center py-2 px-4 ${profileDropdownOpen ? 'text-indigo-600' : 'text-gray-500'}`}
            >
              <User className="h-5 w-5" />
              <span className="text-xs mt-1">Profile</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}