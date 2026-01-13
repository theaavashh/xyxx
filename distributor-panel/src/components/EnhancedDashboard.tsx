'use client';

import React, { useEffect, useState } from 'react';
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
} from 'recharts';
import { useDataStore, useUIStore } from '@/stores';
import { DashboardStats, DateRangeFilter } from '@/types';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  BarChart3,
  Calendar,
  RefreshCw,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  Target,
  Trophy,
  AlertCircle,
} from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-20 mb-3 animate-pulse"></div>
            <div className="h-8 sm:h-10 lg:h-12 bg-gray-200 rounded w-24 sm:w-32 mb-3 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg ml-3 flex-shrink-0 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-xs sm:text-sm font-medium ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
              {changeType === 'increase' ? (
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg ml-3 flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
};

interface DateRangeSelectorProps {
  value: DateRangeFilter;
  onChange: (range: DateRangeFilter) => void;
  onRefresh: () => void;
  loading?: boolean;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  value,
  onChange,
  onRefresh,
  loading = false,
}) => {
  const presetRanges = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Quarter', value: 'quarter' },
    { label: 'This Year', value: 'year' },
    { label: 'Custom', value: 'custom' },
  ];

  const handlePresetClick = (preset: string) => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date = today;

    switch (preset) {
      case 'today':
        startDate = today;
        break;
      case 'week':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        return;
    }

    onChange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900">Date Range Filter</h3>
            <p className="text-xs sm:text-sm text-gray-500">
              {value.startDate && value.endDate 
                ? `${formatDate(new Date(value.startDate))} - ${formatDate(new Date(value.endDate))}`
                : 'Select a date range'
              }
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {presetRanges.slice(0, 5).map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetClick(preset.value)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="hidden sm:block h-6 w-px bg-gray-300"></div>

          <button
            onClick={() => handlePresetClick('custom')}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            Custom
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 sm:p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
          >
            <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const EnhancedDashboard: React.FC = () => {
  const {
    dashboardStats,
    dashboardLoading,
    fetchDashboardStats,
  } = useDataStore();

  const { setLoading } = useUIStore();
  const [dateRange, setDateRange] = useState<DateRangeFilter>({
    startDate: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [revenueFilter, setRevenueFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  // Generate mock data based on selected filter
  const getRevenueData = () => {
    const data = [];
    const today = new Date();
    
    switch (revenueFilter) {
      case 'daily':
        // Last 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
          data.push({
            key: date.toISOString().split('T')[0],
            label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: Math.floor(Math.random() * 5000) + 1000,
          });
        }
        break;
      case 'weekly':
        // Last 12 weeks
        for (let i = 11; i >= 0; i--) {
          const date = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000);
          data.push({
            key: `Week ${12 - i}`,
            label: `Week ${12 - i}`,
            revenue: Math.floor(Math.random() * 35000) + 15000,
          });
        }
        break;
      case 'monthly':
        // Last 12 months
        return dashboardStats.monthlyRevenue;
      case 'yearly':
        // Last 5 years
        for (let i = 4; i >= 0; i--) {
          const year = today.getFullYear() - i;
          data.push({
            key: year.toString(),
            label: year.toString(),
            revenue: Math.floor(Math.random() * 500000) + 200000,
          });
        }
        break;
    }
    
    return data;
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const handleRefresh = async () => {
    setLoading('dashboard', true);
    await fetchDashboardStats();
    setLoading('dashboard', false);
  };

  if (dashboardLoading || !dashboardStats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Header Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="h-8 sm:h-10 lg:h-12 bg-gray-200 rounded w-48 sm:w-64 lg:w-80 mb-3 animate-pulse"></div>
                  <div className="h-4 sm:h-5 bg-gray-200 rounded w-64 sm:w-80 lg:w-96 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-20 sm:w-24 mb-3"></div>
                  <div className="h-8 sm:h-10 lg:h-12 bg-gray-200 rounded w-24 sm:w-32 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 animate-pulse h-64 sm:h-80"></div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 animate-pulse h-64 sm:h-80"></div>
            </div>

            {/* Table Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6 bg-gray-50 h-16 sm:h-20 animate-pulse"></div>
              <div className="p-4 sm:p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 sm:h-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                  Analytics Dashboard
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-2">
                  Track your sales, orders, and performance metrics
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live Data</span>
                </div>
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <DateRangeSelector
              value={dateRange}
              onChange={setDateRange}
              onRefresh={handleRefresh}
              loading={dashboardLoading}
            />
          </div>

          {/* Order Processing Info Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Order Processing Overview</h2>
              <div className="p-2 bg-blue-50 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <div className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-200">
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-bold text-blue-700">Total Orders</p>
                  <p className="text-2xl sm:text-3xl font-black text-blue-900 mt-1">
                    {formatNumber(dashboardStats.totalOrders)}
                  </p>
                  <p className="text-xs sm:text-sm text-blue-600 mt-2 hidden sm:block font-medium">
                    {dashboardStats.totalOrders > 0 ? '+12.5% from last month' : 'No orders yet'}
                  </p>
                </div>
                <div className="p-3 sm:p-4 bg-white/80 backdrop-blur rounded-xl ml-3 sm:ml-0 shadow-sm">
                  <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 hover:shadow-lg transition-all duration-200">
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-bold text-yellow-700">Pending</p>
                  <p className="text-2xl sm:text-3xl font-black text-yellow-900 mt-1">
                    {dashboardStats.recentOrders.filter(order => order.status === 'pending').length}
                  </p>
                  <p className="text-xs sm:text-sm text-yellow-600 mt-2 hidden sm:block font-medium">
                    {dashboardStats.recentOrders.length > 0 
                      ? `${Math.round((dashboardStats.recentOrders.filter(order => order.status === 'pending').length / dashboardStats.recentOrders.length) * 100)}% of recent orders`
                      : 'No pending orders'
                    }
                  </p>
                </div>
                <div className="p-3 sm:p-4 bg-white/80 backdrop-blur rounded-xl ml-3 sm:ml-0 shadow-sm">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-200">
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-bold text-green-700">Delivered</p>
                  <p className="text-2xl sm:text-3xl font-black text-green-900 mt-1">
                    {dashboardStats.recentOrders.filter(order => order.status === 'delivered').length}
                  </p>
                  <p className="text-xs sm:text-sm text-green-600 mt-2 hidden sm:block font-medium">
                    {dashboardStats.recentOrders.length > 0 
                      ? `${Math.round((dashboardStats.recentOrders.filter(order => order.status === 'delivered').length / dashboardStats.recentOrders.length) * 100)}% success rate`
                      : 'No delivered orders'
                    }
                  </p>
                </div>
                <div className="p-3 sm:p-4 bg-white/80 backdrop-blur rounded-xl ml-3 sm:ml-0 shadow-sm">
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 hover:shadow-lg transition-all duration-200">
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-bold text-red-700">Not Delivered</p>
                  <p className="text-2xl sm:text-3xl font-black text-red-900 mt-1">
                    {dashboardStats.recentOrders.filter(order => order.status === 'cancelled' || order.status === 'failed').length}
                  </p>
                  <p className="text-xs sm:text-sm text-red-600 mt-2 hidden sm:block font-medium">
                    {dashboardStats.recentOrders.length > 0 
                      ? `${Math.round((dashboardStats.recentOrders.filter(order => order.status === 'cancelled' || order.status === 'failed').length / dashboardStats.recentOrders.length) * 100)}% of recent orders`
                      : 'No failed orders'
                    }
                  </p>
                </div>
                <div className="p-3 sm:p-4 bg-white/80 backdrop-blur rounded-xl ml-3 sm:ml-0 shadow-sm">
                  <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <KPICard
              title="Total Revenue"
              value={formatCurrency(dashboardStats.totalRevenue)}
              change={dashboardStats.growthRate}
              changeType={dashboardStats.growthRate >= 0 ? 'increase' : 'decrease'}
              icon={<DollarSign className="h-6 w-6 text-blue-600" />}
            />

            <KPICard
              title="Total Orders"
              value={formatNumber(dashboardStats.totalOrders)}
              change={12.5}
              changeType="increase"
              icon={<ShoppingCart className="h-6 w-6 text-green-600" />}
            />

            <KPICard
              title="Products Sold"
              value={formatNumber(dashboardStats.totalSales)}
              change={8.2}
              changeType="increase"
              icon={<Package className="h-6 w-6 text-purple-600" />}
            />

            <KPICard
              title="Average Order Value"
              value={formatCurrency(dashboardStats.averageOrderValue)}
              change={-2.4}
              changeType="decrease"
              icon={<BarChart3 className="h-6 w-6 text-orange-600" />}
            />
          </div>

          {/* Revenue Trend - Full Width */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Revenue Trend</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600 font-medium">View:</span>
                <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                  {[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'yearly', label: 'Yearly' },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setRevenueFilter(filter.value as any)}
                      className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                        revenueFilter === filter.value
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
              <ResponsiveContainer width="100%" height={300} minHeight={250}>
                <AreaChart data={getRevenueData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    angle={revenueFilter === 'daily' ? -45 : 0}
                    textAnchor={revenueFilter === 'daily' ? 'end' : 'middle'}
                    height={revenueFilter === 'daily' ? 60 : 40}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickFormatter={(value) => formatCurrency(value).split('.')[0]}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      backdropFilter: 'blur(8px)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    fill="url(#colorGradient)"
                    strokeWidth={2.5}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 1 - Two Column Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Sales by Category */}
            <div className="xl:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Sales by Category</h2>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                <ResponsiveContainer width="100%" height={280} minHeight={250}>
                  <PieChart>
                    <Pie
                      data={dashboardStats.salesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => window.innerWidth >= 768 ? `${name} ${percentage}%` : ''}
                      outerRadius={window.innerWidth >= 768 ? 80 : 60}
                      fill="#8884d8"
                      dataKey="sales"
                    >
                      {dashboardStats.salesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [formatNumber(value), 'Sales']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        backdropFilter: 'blur(8px)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Target Achievement */}
            <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Target Achievement</h2>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="hidden sm:inline text-gray-600">Achieved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="hidden sm:inline text-gray-600">In Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="hidden sm:inline text-gray-600">Not Achieved</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[
                  {
                    name: 'Product A - Electronics',
                    target: 1000,
                    achieved: 850,
                    unit: 'units',
                    icon: <Package className="h-5 w-5" />,
                    color: 'blue'
                  },
                  {
                    name: 'Product B - Clothing',
                    target: 500,
                    achieved: 520,
                    unit: 'units',
                    icon: <ShoppingCart className="h-5 w-5" />,
                    color: 'green'
                  },
                  {
                    name: 'Product C - Accessories',
                    target: 750,
                    achieved: 450,
                    unit: 'units',
                    icon: <Trophy className="h-5 w-5" />,
                    color: 'purple'
                  },
                  {
                    name: 'Revenue Target',
                    target: 100000,
                    achieved: 85000,
                    unit: 'USD',
                    icon: <DollarSign className="h-5 w-5" />,
                    color: 'yellow'
                  },
                  {
                    name: 'New Customers',
                    target: 200,
                    achieved: 180,
                    unit: 'customers',
                    icon: <TrendingUp className="h-5 w-5" />,
                    color: 'indigo'
                  },
                  {
                    name: 'Market Coverage',
                    target: 80,
                    achieved: 65,
                    unit: '%',
                    icon: <BarChart3 className="h-5 w-5" />,
                    color: 'pink'
                  }
                ].map((item, index) => {
                  const percentage = Math.round((item.achieved / item.target) * 100);
                  const isAchieved = percentage >= 100;
                  const isInProgress = percentage >= 50 && percentage < 100;
                  const statusColor = isAchieved ? 'green' : isInProgress ? 'blue' : 'red';
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all duration-200 hover:border-blue-200">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`p-2 bg-gradient-to-br ${item.color === 'blue' ? 'from-blue-50 to-blue-100' : item.color === 'green' ? 'from-green-50 to-green-100' : item.color === 'purple' ? 'from-purple-50 to-purple-100' : item.color === 'yellow' ? 'from-yellow-50 to-yellow-100' : item.color === 'indigo' ? 'from-indigo-50 to-indigo-100' : 'from-pink-50 to-pink-100'} rounded-lg`}>
                            <div className={`text-${item.color}-600`}>{item.icon}</div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-xs sm:text-sm">{item.name}</h4>
                            <p className="text-xs text-gray-500 hidden sm:block">Target this period</p>
                          </div>
                        </div>
                        <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${
                          isAchieved 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : isInProgress 
                              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                              : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          <span className="hidden sm:inline">{isAchieved ? 'Achieved' : isInProgress ? 'In Progress' : 'Not Achieved'}</span>
                          <span className="sm:hidden">{isAchieved ? '✓' : isInProgress ? '→' : '✗'}</span>
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 font-medium">Achieved</span>
                          <span className="font-bold text-gray-900">
                            {item.unit === 'USD' ? formatCurrency(item.achieved) : formatNumber(item.achieved)} {item.unit}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 font-medium">Target</span>
                          <span className="font-bold text-gray-500">
                            {item.unit === 'USD' ? formatCurrency(item.target) : formatNumber(item.target)} {item.unit}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 font-medium">Progress</span>
                            <span className={`font-bold ${
                              isAchieved ? 'text-green-600' : isInProgress ? 'text-blue-600' : 'text-red-600'
                            }`}>
                              {percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5 overflow-hidden">
                            <div 
                              className={`h-2 sm:h-2.5 rounded-full transition-all duration-700 ${
                                isAchieved ? 'bg-green-500' : isInProgress ? 'bg-blue-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {item.achieved < item.target && (
                          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded-lg">
                            <AlertCircle className="h-3 w-3 flex-shrink-0" />
                            <span className="font-medium">
                              Need {item.unit === 'USD' 
                                ? formatCurrency(item.target - item.achieved) 
                                : formatNumber(item.target - item.achieved)} more {item.unit}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600">83%</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">Overall Achievement</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">2</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">Targets Achieved</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-yellow-600">3</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">In Progress</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-red-600">1</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">Not Achieved</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 2 - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Top Products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Top Products</h2>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                <ResponsiveContainer width="100%" height={280} minHeight={250}>
                  <BarChart data={dashboardStats.topProducts.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <Tooltip
                      formatter={(value: any, name: string) => [
                        name === 'sales' ? formatNumber(value) : formatCurrency(value),
                        name === 'sales' ? 'Sales' : 'Revenue'
                      ]}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        backdropFilter: 'blur(8px)',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="sales" fill="#10B981" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="revenue" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Orders vs Sales */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Orders vs Sales</h2>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4">
                <ResponsiveContainer width="100%" height={280} minHeight={250}>
                  <LineChart data={dashboardStats.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        backdropFilter: 'blur(8px)',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#F59E0B"
                      strokeWidth={3}
                      dot={{ fill: '#F59E0B', r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Orders"
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ fill: '#10B981', r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Sales"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Date
                    </th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardStats.recentOrders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                        <div className="sm:hidden">
                          <div className="font-medium">{order.orderNumber}</div>
                          <div className="text-xs text-gray-500">{formatDate(order.orderDate)}</div>
                        </div>
                        <div className="hidden sm:block">{order.orderNumber}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`px-2 sm:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : order.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 font-medium hover:underline transition-colors">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};