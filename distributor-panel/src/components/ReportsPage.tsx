'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
} from 'recharts';
import { useDataStore } from '@/stores';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  BarChart3,
  Download,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Trophy,
  Users,
  FileText,
  Printer,
  Mail,
} from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

interface PerformanceMetric {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
}

const MetricCard: React.FC<{ metric: PerformanceMetric }> = ({ metric }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: metric.color }}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{metric.title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
          {metric.change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
              {metric.changeType === 'increase' ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              {Math.abs(metric.change)}% from last period
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg`} style={{ backgroundColor: `${metric.color}15` }}>
          <div style={{ color: metric.color }}>{metric.icon}</div>
        </div>
      </div>
    </div>
  );
};

const ReportsPage: React.FC = () => {
  const { dashboardStats } = useDataStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock performance metrics
  const performanceMetrics: PerformanceMetric[] = [
    {
      title: 'Total Revenue',
      value: formatCurrency(125000),
      change: 15.3,
      changeType: 'increase',
      icon: <DollarSign className="h-6 w-6" />,
      color: '#3B82F6'
    },
    {
      title: 'Total Orders',
      value: formatNumber(847),
      change: 8.7,
      changeType: 'increase',
      icon: <ShoppingCart className="h-6 w-6" />,
      color: '#10B981'
    },
    {
      title: 'Products Sold',
      value: formatNumber(2341),
      change: -3.2,
      changeType: 'decrease',
      icon: <Package className="h-6 w-6" />,
      color: '#F59E0B'
    },
    {
      title: 'Average Order Value',
      value: formatCurrency(148),
      change: 5.1,
      changeType: 'increase',
      icon: <BarChart3 className="h-6 w-6" />,
      color: '#8B5CF6'
    },
    {
      title: 'Target Achievement',
      value: '87%',
      change: 12.4,
      changeType: 'increase',
      icon: <Target className="h-6 w-6" />,
      color: '#EC4899'
    },
    {
      title: 'Customer Satisfaction',
      value: '4.8/5',
      change: 2.1,
      changeType: 'increase',
      icon: <Users className="h-6 w-6" />,
      color: '#059669'
    }
  ];

  // Mock sales data
  const salesData = [
    { month: 'Jan', revenue: 85000, orders: 120, customers: 85 },
    { month: 'Feb', revenue: 92000, orders: 145, customers: 102 },
    { month: 'Mar', revenue: 88000, orders: 132, customers: 91 },
    { month: 'Apr', revenue: 95000, orders: 158, customers: 115 },
    { month: 'May', revenue: 103000, orders: 172, customers: 128 },
    { month: 'Jun', revenue: 110000, orders: 189, customers: 142 },
    { month: 'Jul', revenue: 108000, orders: 181, customers: 135 },
    { month: 'Aug', revenue: 115000, orders: 195, customers: 148 },
    { month: 'Sep', revenue: 125000, orders: 210, customers: 162 },
    { month: 'Oct', revenue: 122000, orders: 205, customers: 158 },
    { month: 'Nov', revenue: 118000, orders: 198, customers: 152 },
    { month: 'Dec', revenue: 135000, orders: 225, customers: 175 }
  ];

  // Mock product performance data
  const productPerformance = [
    {
      name: 'Product A',
      category: 'Electronics',
      target: 1000,
      actual: 950,
      revenue: 285000,
      growth: 12.5,
      marketShare: 15.2
    },
    {
      name: 'Product B',
      category: 'Clothing',
      target: 800,
      actual: 890,
      revenue: 178000,
      growth: 18.7,
      marketShare: 9.8
    },
    {
      name: 'Product C',
      category: 'Accessories',
      target: 600,
      actual: 520,
      revenue: 104000,
      growth: -5.3,
      marketShare: 6.7
    },
    {
      name: 'Product D',
      category: 'Electronics',
      target: 500,
      actual: 480,
      revenue: 192000,
      growth: 8.9,
      marketShare: 10.3
    },
    {
      name: 'Product E',
      category: 'Clothing',
      target: 400,
      actual: 420,
      revenue: 84000,
      growth: 15.2,
      marketShare: 4.6
    }
  ];

  // Mock regional data
  const regionalData = [
    { region: 'North', revenue: 320000, orders: 540, customers: 320 },
    { region: 'South', revenue: 280000, orders: 480, customers: 285 },
    { region: 'East', revenue: 350000, orders: 590, customers: 350 },
    { region: 'West', revenue: 290000, orders: 490, customers: 290 },
    { region: 'Central', revenue: 210000, orders: 360, customers: 215 }
  ];

  const handleExportPDF = () => {
    alert('Exporting PDF functionality would be implemented here');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    alert('Email report functionality would be implemented here');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Reports</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive analysis of your distribution performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            {['monthly', 'quarterly', 'yearly'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period as any)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedPeriod === period
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export PDF"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Print"
            >
              <Printer className="h-5 w-5" />
            </button>
            <button
              onClick={handleEmail}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Email"
            >
              <Mail className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {performanceMetrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Revenue & Orders Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value).split('.')[0]} />
              <Tooltip formatter={(value: any) => [formatCurrency(value), 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders vs Customers</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} name="Orders" />
              <Line type="monotone" dataKey="customers" stroke="#F59E0B" strokeWidth={2} name="Customers" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Performance Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Product Performance</h3>
          <p className="text-sm text-gray-500 mt-1">Detailed performance analysis by product</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Achievement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Market Share
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productPerformance.map((product, index) => {
                const achievement = Math.round((product.actual / product.target) * 100);
                const isPositive = product.growth >= 0;
                
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(product.target)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(product.actual)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${
                          achievement >= 100 ? 'text-green-600' : achievement >= 80 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {achievement}%
                        </span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              achievement >= 100 ? 'bg-green-500' : achievement >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(achievement, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center text-sm ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                        {Math.abs(product.growth)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.marketShare}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regional Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Revenue Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={regionalData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ region, revenue }) => `${region}: ${formatCurrency(revenue)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="revenue"
              >
                {regionalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [formatCurrency(value), 'Revenue']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
              <Bar dataKey="orders" fill="#10B981" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Report Summary</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">$1,445,000</div>
            <div className="text-sm text-blue-800">Total Revenue</div>
            <div className="text-xs text-blue-600 mt-1">+15.3% growth</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">2,460</div>
            <div className="text-sm text-green-800">Total Orders</div>
            <div className="text-xs text-green-600 mt-1">+8.7% increase</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">87%</div>
            <div className="text-sm text-yellow-800">Target Achievement</div>
            <div className="text-xs text-yellow-600 mt-1">+12.4% improvement</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">1,362</div>
            <div className="text-sm text-purple-800">Total Customers</div>
            <div className="text-xs text-purple-600 mt-1">+18.2% growth</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;