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
  BarChart3
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

  const getRoleSpecificStats = () => {
    switch (user?.role) {
      case 'managerial':
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

      case 'sales':
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
            title: 'In Production',
            value: mockDashboardStats.inProductionOrders,
            icon: Factory,
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

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Role-specific sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders (for sales, managerial) */}
        {(user?.role === 'sales' || user?.role === 'managerial' || user?.role === 'production') && (
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

        {/* Pending VAT Bills (for accounting, managerial) */}
        {(user?.role === 'accounting' || user?.role === 'managerial') && (
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
          {user?.role === 'managerial' && (
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
          
          {user?.role === 'accounting' && (
            <>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <FileText className="h-6 w-6 text-blue-600 mb-2" />
                <p className="font-medium text-gray-900">New VAT Bill</p>
                <p className="text-sm text-gray-500">Record new transaction</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <FileText className="h-6 w-6 text-purple-600 mb-2" />
                <p className="font-medium text-gray-900">Journal Entry</p>
                <p className="text-sm text-gray-500">Make accounting entry</p>
              </button>
            </>
          )}

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <BarChart3 className="h-6 w-6 text-orange-600 mb-2" />
            <p className="font-medium text-gray-900">Analytics</p>
            <p className="text-sm text-gray-500">View detailed insights</p>
          </button>
        </div>
      </div>
    </div>
  );
}
