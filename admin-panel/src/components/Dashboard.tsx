'use client';

import React from 'react';
import { useAuth } from './AuthProvider';
import { 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Factory, 
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  UserPlus,
  FileText,
  BarChart3,
  Calendar,
  CreditCard,
  Package,
  UserCheck,
  Activity
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { mockDashboardStats, mockOrders, mockVATBills } from '@/lib/mockData';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: string;
}

function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">
              <TrendingUp className="h-4 w-4 inline mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, ${user?.firstName}!`;
  };

  const getTodaysMetrics = () => {
    return [
      {
        title: "Today's Revenue",
        value: formatCurrency(mockDashboardStats.todayRevenue || 0),
        icon: DollarSign,
        color: 'bg-green-500',
        trend: '+15% vs yesterday'
      },
      {
        title: "Today's Orders",
        value: mockDashboardStats.todayOrders || 0,
        icon: ShoppingCart,
        color: 'bg-blue-500',
        trend: '+3 new orders'
      },
      {
        title: "New Distributors",
        value: mockDashboardStats.todayNewDistributors || 0,
        icon: UserPlus,
        color: 'bg-purple-500',
        trend: '1 registered today'
      },
      {
        title: "Completed Orders",
        value: mockDashboardStats.todayCompletedOrders || 0,
        icon: CheckCircle,
        color: 'bg-emerald-500',
        trend: '2 delivered today'
      }
    ];
  };

  const getRoleSpecificStats = () => {
    switch (user?.role) {
      case 'MANAGERIAL':
      case 'ADMIN':
        return [
          {
            title: 'Total Orders',
            value: mockDashboardStats.totalOrders,
            icon: ShoppingCart,
            color: 'bg-blue-500',
            trend: '+12% from last month'
          },
          {
            title: 'Monthly Revenue',
            value: formatCurrency(mockDashboardStats.monthlyRevenue),
            icon: DollarSign,
            color: 'bg-green-500',
            trend: '+8% from last month'
          },
          {
            title: 'Active Employees',
            value: mockDashboardStats.activeEmployees,
            icon: Users,
            color: 'bg-purple-500'
          },
          {
            title: 'Production Orders',
            value: mockDashboardStats.inProductionOrders,
            icon: Factory,
            color: 'bg-orange-500'
          }
        ];

      case 'SALES_MANAGER':
      case 'SALES_REPRESENTATIVE':
        return [
          {
            title: 'Pending Orders',
            value: mockDashboardStats.pendingOrders,
            icon: Clock,
            color: 'bg-yellow-500'
          },
          {
            title: 'Completed Orders',
            value: mockDashboardStats.completedOrders,
            icon: CheckCircle,
            color: 'bg-green-500'
          },
          {
            title: 'Monthly Revenue',
            value: formatCurrency(mockDashboardStats.monthlyRevenue),
            icon: DollarSign,
            color: 'bg-blue-500'
          },
          {
            title: 'Active Distributors',
            value: mockDashboardStats.activeDistributors || 0,
            icon: Users,
            color: 'bg-purple-500'
          }
        ];

      case 'accounting':
        return [
          {
            title: 'Pending VAT Bills',
            value: mockDashboardStats.pendingVATBills,
            icon: AlertTriangle,
            color: 'bg-red-500'
          },
          {
            title: 'Monthly Revenue',
            value: formatCurrency(mockDashboardStats.monthlyRevenue),
            icon: DollarSign,
            color: 'bg-green-500'
          },
          {
            title: 'Total Orders',
            value: mockDashboardStats.totalOrders,
            icon: ShoppingCart,
            color: 'bg-blue-500'
          },
          {
            title: 'Total Revenue',
            value: formatCurrency(mockDashboardStats.totalRevenue),
            icon: TrendingUp,
            color: 'bg-purple-500'
          }
        ];

      case 'production':
        return [
          {
            title: 'Production Orders',
            value: mockDashboardStats.inProductionOrders,
            icon: Factory,
            color: 'bg-orange-500'
          },
          {
            title: 'Pending Orders',
            value: mockDashboardStats.pendingOrders,
            icon: Clock,
            color: 'bg-yellow-500'
          },
          {
            title: 'Completed Orders',
            value: mockDashboardStats.completedOrders,
            icon: CheckCircle,
            color: 'bg-green-500'
          },
          {
            title: 'Low Stock Products',
            value: mockDashboardStats.lowStockProducts,
            icon: AlertTriangle,
            color: 'bg-red-500'
          }
        ];

      default:
        return [];
    }
  };

  const stats = getRoleSpecificStats();

  // Get recent orders for quick overview
  const recentOrders = mockOrders.slice(0, 5);
  const pendingVATBills = mockVATBills.filter(bill => bill.status === 'draft').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">{getWelcomeMessage()}</h1>
        <p className="text-gray-600 mt-1">
          Welcome to your {user?.role} dashboard. Here's what's happening today.
        </p>
      </div>

      {/* Today's Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Today's Overview</h2>
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          <Calendar className="h-6 w-6 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getTodaysMetrics().map((metric, index) => (
            <StatCard key={index} {...metric} />
          ))}
        </div>
      </div>

      {/* Role-specific Statistics Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Overall Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Today's Distributor Report */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Today's Distributor Activity</h2>
          <p className="text-sm text-gray-500">Real-time distributor performance and activity</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <UserCheck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">New Registrations</h3>
              <p className="text-2xl font-bold text-blue-600">{mockDashboardStats.todayNewDistributors || 0}</p>
              <p className="text-sm text-gray-500">distributors registered today</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Active Today</h3>
              <p className="text-2xl font-bold text-green-600">{mockDashboardStats.activeDistributors || 0}</p>
              <p className="text-sm text-gray-500">distributors placing orders</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Package className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Orders Today</h3>
              <p className="text-2xl font-bold text-purple-600">{mockDashboardStats.todayOrders || 0}</p>
              <p className="text-sm text-gray-500">orders placed by distributors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role-specific sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders (for sales, managerial) */}
        {(user?.role === 'SALES_MANAGER' || user?.role === 'SALES_REPRESENTATIVE' || user?.role === 'MANAGERIAL' || user?.role === 'ADMIN') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{order.distributorName}</p>
                      <p className="text-sm text-gray-500">{order.items.length} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(order.totalAmount)}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'in_production' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'ready' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Today's Payment Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Today's Payment Status</h2>
            <p className="text-sm text-gray-500">Payment tracking and pending amounts</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="bg-yellow-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Pending Payments</h3>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(mockDashboardStats.todayPendingPayments || 0)}</p>
                <p className="text-sm text-gray-500">awaiting payment confirmation</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Collected Today</h3>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(mockDashboardStats.todayRevenue || 0)}</p>
                <p className="text-sm text-gray-500">revenue collected today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending VAT Bills (for accounting, managerial) */}
        {(user?.role === 'ADMIN' || user?.role === 'MANAGERIAL') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Pending VAT Bills</h2>
            </div>
            <div className="p-6">
              {pendingVATBills.length > 0 ? (
                <div className="space-y-4">
                  {pendingVATBills.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{bill.vendorName}</p>
                        <p className="text-sm text-gray-500">{bill.billNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(bill.totalAmount)}</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Draft
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No pending VAT bills</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(user?.role === 'MANAGERIAL' || user?.role === 'ADMIN') && (
            <>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <UserPlus className="h-6 w-6 text-indigo-600 mb-2" />
                <p className="font-medium text-gray-900">Create Employee</p>
                <p className="text-sm text-gray-500">Add new team member</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <FileText className="h-6 w-6 text-green-600 mb-2" />
                <p className="font-medium text-gray-900">View Reports</p>
                <p className="text-sm text-gray-500">Check performance metrics</p>
              </button>
            </>
          )}
          
          {(user?.role === 'SALES_MANAGER' || user?.role === 'SALES_REPRESENTATIVE') && (
            <>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <UserPlus className="h-6 w-6 text-blue-600 mb-2" />
                <p className="font-medium text-gray-900">Create Distributor</p>
                <p className="text-sm text-gray-500">Register new distributor</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <ShoppingCart className="h-6 w-6 text-green-600 mb-2" />
                <p className="font-medium text-gray-900">View Orders</p>
                <p className="text-sm text-gray-500">Check today's orders</p>
              </button>
            </>
          )}

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <BarChart3 className="h-6 w-6 text-orange-600 mb-2" />
            <p className="font-medium text-gray-900">Today's Analytics</p>
            <p className="text-sm text-gray-500">View today's detailed insights</p>
          </button>
        </div>
      </div>
    </div>
  );
}
