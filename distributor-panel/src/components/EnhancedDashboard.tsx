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
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
              {changeType === 'increase' ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Date Range Filter</h3>
            <p className="text-xs text-gray-500">
              {value.startDate && value.endDate 
                ? `${formatDate(new Date(value.startDate))} - ${formatDate(new Date(value.endDate))}`
                : 'Select a date range'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {presetRanges.slice(0, 5).map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetClick(preset.value)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-gray-300"></div>

          <button
            onClick={() => handlePresetClick('custom')}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            Custom
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
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
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6 animate-pulse h-80"></div>
          <div className="bg-white rounded-lg shadow p-6 animate-pulse h-80"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track your sales, orders, and performance metrics
          </p>
        </div>
      </div>

      {/* Date Range Filter Row */}
      <div>
        <DateRangeSelector
          value={dateRange}
          onChange={setDateRange}
          onRefresh={handleRefresh}
          loading={dashboardLoading}
        />
      </div>

      {/* Order Processing Info Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Processing Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Orders</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {formatNumber(dashboardStats.totalOrders)}
              </p>
              <p className="text-xs text-blue-500 mt-1">
                {dashboardStats.totalOrders > 0 ? '+12.5% from last month' : 'No orders yet'}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">
                {dashboardStats.recentOrders.filter(order => order.status === 'pending').length}
              </p>
              <p className="text-xs text-yellow-500 mt-1">
                {dashboardStats.recentOrders.length > 0 
                  ? `${Math.round((dashboardStats.recentOrders.filter(order => order.status === 'pending').length / dashboardStats.recentOrders.length) * 100)}% of recent orders`
                  : 'No pending orders'
                }
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div>
              <p className="text-sm font-medium text-green-600">Delivered</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {dashboardStats.recentOrders.filter(order => order.status === 'delivered').length}
              </p>
              <p className="text-xs text-green-500 mt-1">
                {dashboardStats.recentOrders.length > 0 
                  ? `${Math.round((dashboardStats.recentOrders.filter(order => order.status === 'delivered').length / dashboardStats.recentOrders.length) * 100)}% success rate`
                  : 'No delivered orders'
                }
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <p className="text-sm font-medium text-red-600">Not Delivered</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {dashboardStats.recentOrders.filter(order => order.status === 'cancelled' || order.status === 'failed').length}
              </p>
              <p className="text-xs text-red-500 mt-1">
                {dashboardStats.recentOrders.length > 0 
                  ? `${Math.round((dashboardStats.recentOrders.filter(order => order.status === 'cancelled' || order.status === 'failed').length / dashboardStats.recentOrders.length) * 100)}% of recent orders`
                  : 'No failed orders'
                }
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">View:</span>
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
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    revenueFilter === filter.value
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={getRevenueData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 12 }}
              angle={revenueFilter === 'daily' ? -45 : 0}
              textAnchor={revenueFilter === 'daily' ? 'end' : 'middle'}
              height={revenueFilter === 'daily' ? 60 : 40}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value).split('.')[0]}
            />
            <Tooltip
              formatter={(value: any) => [formatCurrency(value), 'Revenue']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sales by Category - Half Width */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={dashboardStats.salesByCategory}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="sales"
            >
              {dashboardStats.salesByCategory.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => [formatNumber(value), 'Sales']} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Target Achievement Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Target Achievement</h3>
              <p className="text-sm text-gray-500">Track your performance against set targets</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Achieved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Not Achieved</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Product Target Cards */}
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
              <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-${item.color}-50 rounded-lg`}>
                      <div className={`text-${item.color}-600`}>{item.icon}</div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-500">Target this period</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isAchieved 
                      ? 'bg-green-100 text-green-800' 
                      : isInProgress 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {isAchieved ? 'Achieved' : isInProgress ? 'In Progress' : 'Not Achieved'}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Achieved</span>
                    <span className="font-semibold text-gray-900">
                      {item.unit === 'USD' ? formatCurrency(item.achieved) : formatNumber(item.achieved)} {item.unit}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Target</span>
                    <span className="font-semibold text-gray-500">
                      {item.unit === 'USD' ? formatCurrency(item.target) : formatNumber(item.target)} {item.unit}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Progress</span>
                      <span className={`font-medium ${
                        isAchieved ? 'text-green-600' : isInProgress ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isAchieved ? 'bg-green-500' : isInProgress ? 'bg-blue-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {item.achieved < item.target && (
                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-md">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">83%</div>
              <div className="text-sm text-gray-600">Overall Achievement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">2</div>
              <div className="text-sm text-gray-600">Targets Achieved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">3</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">1</div>
              <div className="text-sm text-gray-600">Not Achieved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardStats.topProducts.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: any, name: string) => [
                  name === 'sales' ? formatNumber(value) : formatCurrency(value),
                  name === 'sales' ? 'Sales' : 'Revenue'
                ]}
              />
              <Legend />
              <Bar dataKey="sales" fill="#10B981" />
              <Bar dataKey="revenue" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders vs Sales */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders vs Sales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardStats.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#F59E0B"
                strokeWidth={2}
                name="Orders"
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#10B981"
                strokeWidth={2}
                name="Sales"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardStats.recentOrders.slice(0, 5).map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.orderDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'delivered'
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">
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
  );
};