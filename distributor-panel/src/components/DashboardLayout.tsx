'use client';

import { useState, useEffect } from 'react';
import { 
  Home, 
  ShoppingCart, 
  FileText, 
  LogOut, 
  Menu, 
  X, 
  User,
  Package,
  Bell,
  Settings,
  ChevronDown,
  Calendar,
  MapPin,
  Grid3X3,
  ClipboardList,
  HelpCircle,
  Plus,
  Phone,
  Video,
  MoreHorizontal,
  Paperclip,
  Mic,
  ThumbsUp,
  Download,
  Clock,
  TrendingUp,
  Target,
  BarChart3,
  Users
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import toast from 'react-hot-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'orders' | 'products' | 'transactions';
  onTabChange: (tab: 'dashboard' | 'orders' | 'products' | 'transactions') => void;
}

export default function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [nepalDate, setNepalDate] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();

  // Get Nepal date
  useEffect(() => {
    const getNepalDate = () => {
      const now = new Date();
      const nepalTime = new Date(now.getTime() + (5.75 * 60 * 60 * 1000)); // Nepal is UTC+5:45
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      };
      return nepalTime.toLocaleDateString('en-US', options);
    };
    
    setNepalDate(getNepalDate());
    
    // Update every minute
    const interval = setInterval(() => {
      setNepalDate(getNepalDate());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    setShowUserMenu(false);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Branding */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">logip</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`${
                activeTab === 'dashboard'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              } group flex items-center px-3 py-2 text-sm font-medium rounded-lg w-full text-left transition-colors`}
            >
              <Home className="mr-3 h-5 w-5" />
              Home
            </button>
            
            <div className="flex items-center justify-between">
              <button
                onClick={() => onTabChange('orders')}
                className={`${
                  activeTab === 'orders'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                } group flex items-center px-3 py-2 text-sm font-medium rounded-lg flex-1 text-left transition-colors`}
              >
                <Grid3X3 className="mr-3 h-5 w-5" />
                Projects
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <button
                onClick={() => onTabChange('products')}
                className={`${
                  activeTab === 'products'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                } group flex items-center px-3 py-2 text-sm font-medium rounded-lg flex-1 text-left transition-colors`}
              >
                <ClipboardList className="mr-3 h-5 w-5" />
                Tasks
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <button
              onClick={() => onTabChange('transactions')}
              className={`${
                activeTab === 'transactions'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              } group flex items-center px-3 py-2 text-sm font-medium rounded-lg w-full text-left transition-colors`}
            >
              <Users className="mr-3 h-5 w-5" />
              Team
            </button>
            
            <button className="text-gray-600 hover:bg-gray-100 group flex items-center px-3 py-2 text-sm font-medium rounded-lg w-full text-left transition-colors">
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </button>
          </nav>

          {/* Upgrade Section */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Upgrade to Pro</h3>
              <p className="text-xs text-gray-600 mb-3">Get 1 month free and unlock</p>
              <button className="w-full bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors">
                Upgrade
              </button>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="px-4 py-4 border-t border-gray-200 space-y-2">
            <button className="text-gray-600 hover:bg-gray-100 group flex items-center px-3 py-2 text-sm font-medium rounded-lg w-full text-left transition-colors">
              <HelpCircle className="mr-3 h-5 w-5" />
              Help & information
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:bg-gray-100 group flex items-center px-3 py-2 text-sm font-medium rounded-lg w-full text-left transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Left side - Mobile menu and greeting */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden mr-4"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hello, {user?.name?.split(' ')[0] || 'User'}</h1>
                <p className="text-gray-600">Track team progress here. You almost reach a goal!</p>
              </div>
            </div>

            {/* Right side - Date and User Profile */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">{nepalDate}</span>
              </div>
              
              {/* User Profile */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                    <Video className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}
    </div>
  );
}