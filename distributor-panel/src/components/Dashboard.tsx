'use client';

import React from 'react';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ThumbsUp,
  Target,
  BarChart3,
  Users,
  CreditCard,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function Dashboard() {
  const stats = [
    {
      name: 'Total Orders',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      name: 'Products Sold',
      value: '156',
      change: '+8%',
      changeType: 'positive',
      icon: Package,
      color: 'bg-green-500'
    },
    {
      name: 'Revenue',
      value: '₹45,230',
      change: '+23%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-purple-500'
    },
    {
      name: 'Pending Orders',
      value: '3',
      change: '-2',
      changeType: 'negative',
      icon: Clock,
      color: 'bg-orange-500'
    }
  ];

  const recentOrders = [
    { 
      id: 'ORD-001', 
      product: 'Product A', 
      customer: 'John Doe', 
      amount: '₹2,500',
      status: 'Completed',
      date: '2024-01-15',
      statusColor: 'bg-green-100 text-green-800'
    },
    { 
      id: 'ORD-002', 
      product: 'Product B', 
      customer: 'Jane Smith', 
      amount: '₹1,800',
      status: 'Processing',
      date: '2024-01-14',
      statusColor: 'bg-blue-100 text-blue-800'
    },
    { 
      id: 'ORD-003', 
      product: 'Product C', 
      customer: 'Mike Johnson', 
      amount: '₹3,200',
      status: 'Pending',
      date: '2024-01-13',
      statusColor: 'bg-yellow-100 text-yellow-800'
    },
    { 
      id: 'ORD-004', 
      product: 'Product D', 
      customer: 'Sarah Wilson', 
      amount: '₹1,500',
      status: 'Completed',
      date: '2024-01-12',
      statusColor: 'bg-green-100 text-green-800'
    }
  ];

  const quickActions = [
    { name: 'New Order', icon: ShoppingCart, color: 'bg-blue-500' },
    { name: 'View Products', icon: Package, color: 'bg-green-500' },
    { name: 'Sales Report', icon: BarChart3, color: 'bg-purple-500' },
    { name: 'Transactions', icon: CreditCard, color: 'bg-orange-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
            return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ml-1 ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">from last month</span>
                  </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <button className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">
                  View all
                </button>
              </div>
          </div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.id}</div>
                        <div className="text-sm text-gray-500">{order.product}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.statusColor}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.name}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-2`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{action.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance</h3>
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Sales chart will be displayed here</p>
              </div>
                    </div>
                  </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">Order ORD-001 completed</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
          </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">New order received</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
        </div>
      </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">Payment received for ORD-002</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}