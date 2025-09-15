'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign,
  MapPin,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { SalesAnalytics as SalesAnalyticsType, ProvinceSales, DistributorSales, MonthlySalesComparison } from '@/types';
import NepalMap from './NepalMap';
import SalesChart from './SalesChart';
import DistributorChart from './DistributorChart';
import { formatCurrency } from '@/lib/utils';

export default function SalesAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<SalesAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState('this-year');

  // Mock data for demonstration
  const mockAnalyticsData: SalesAnalyticsType = {
    totalSales: 12500000, // NPR 1.25 Crore
    totalOrders: 1250,
    totalDistributors: 45,
    avgOrderValue: 10000,
    growth: 15.5,
    provinceSales: [
      { province: 'Bagmati', sales: 4500000, distributors: 15, orders: 450, growth: 18.2 },
      { province: 'Gandaki', sales: 2100000, distributors: 8, orders: 210, growth: 12.5 },
      { province: 'Lumbini', sales: 1800000, distributors: 7, orders: 180, growth: -5.2 },
      { province: 'Koshi', sales: 1500000, distributors: 6, orders: 150, growth: 22.1 },
      { province: 'Sudurpashchim', sales: 1200000, distributors: 4, orders: 120, growth: 8.7 },
      { province: 'Karnali', sales: 800000, distributors: 3, orders: 80, growth: 35.5 },
      { province: 'Madhesh', sales: 600000, distributors: 2, orders: 60, growth: -12.3 }
    ],
    distributorSales: [
      {
        distributorId: '1',
        distributorName: 'Sharma Trading Pvt. Ltd.',
        province: 'Bagmati',
        district: 'Kathmandu',
        thisMonth: 450000,
        lastMonth: 380000,
        thisYear: 4500000,
        lastYear: 3800000,
        growth: 18.4,
        orders: 45
      },
      {
        distributorId: '2',
        distributorName: 'Mountain View Enterprises',
        province: 'Gandaki',
        district: 'Kaski',
        thisMonth: 320000,
        lastMonth: 290000,
        thisYear: 3200000,
        lastYear: 2900000,
        growth: 10.3,
        orders: 32
      },
      {
        distributorId: '3',
        distributorName: 'Himalayan Distributors',
        province: 'Koshi',
        district: 'Morang',
        thisMonth: 280000,
        lastMonth: 250000,
        thisYear: 2800000,
        lastYear: 2200000,
        growth: 27.3,
        orders: 28
      },
      {
        distributorId: '4',
        distributorName: 'Terai Sales Corp',
        province: 'Lumbini',
        district: 'Rupandehi',
        thisMonth: 180000,
        lastMonth: 220000,
        thisYear: 1800000,
        lastYear: 2100000,
        growth: -14.3,
        orders: 18
      },
      {
        distributorId: '5',
        distributorName: 'Far West Trading',
        province: 'Sudurpashchim',
        district: 'Kailali',
        thisMonth: 150000,
        lastMonth: 140000,
        thisYear: 1500000,
        lastYear: 1300000,
        growth: 15.4,
        orders: 15
      }
    ],
    monthlySales: [
      { month: 'Mangsir', thisYear: 1200000, lastYear: 1050000, growth: 14.3 },
      { month: 'Poush', thisYear: 1100000, lastYear: 980000, growth: 12.2 },
      { month: 'Magh', thisYear: 1050000, lastYear: 920000, growth: 14.1 },
      { month: 'Falgun', thisYear: 980000, lastYear: 850000, growth: 15.3 },
      { month: 'Chaitra', thisYear: 1150000, lastYear: 950000, growth: 21.1 },
      { month: 'Baisakh', thisYear: 1300000, lastYear: 1100000, growth: 18.2 },
      { month: 'Jestha', thisYear: 1250000, lastYear: 1080000, growth: 15.7 },
      { month: 'Ashadh', thisYear: 1180000, lastYear: 1020000, growth: 15.7 },
      { month: 'Shrawan', thisYear: 1220000, lastYear: 1050000, growth: 16.2 },
      { month: 'Bhadra', thisYear: 1280000, lastYear: 1100000, growth: 16.4 },
      { month: 'Ashwin', thisYear: 1350000, lastYear: 1150000, growth: 17.4 },
      { month: 'Kartik', thisYear: 1400000, lastYear: 1200000, growth: 16.7 }
    ],
    topProducts: [
      { name: 'Premium Electronics', sales: 3500000, orders: 350 },
      { name: 'Home Appliances', sales: 2800000, orders: 280 },
      { name: 'Mobile Accessories', sales: 2200000, orders: 440 },
      { name: 'Computer Hardware', sales: 1900000, orders: 190 },
      { name: 'Gaming Equipment', sales: 1500000, orders: 150 }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setAnalyticsData(mockAnalyticsData);
      setLoading(false);
    }, 1000);
  }, [timeFilter]);

  const handleProvinceSelect = (province: string) => {
    setSelectedProvince(selectedProvince === province ? null : province);
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!analyticsData) return null;

  const filteredDistributors = selectedProvince 
    ? analyticsData.distributorSales.filter(d => d.province === selectedProvince)
    : analyticsData.distributorSales;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Analytics</h1>
          <p className="text-gray-600">Sales performance analysis across Nepal</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="this-month">This Month</option>
            <option value="this-year">This Year</option>
            <option value="last-year">Last Year</option>
            <option value="all-time">All Time</option>
          </select>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <RefreshCw className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analyticsData.totalSales)}
              </p>
              <div className="flex items-center mt-1">
                {getGrowthIcon(analyticsData.growth)}
                <span className={`text-sm ml-1 ${getGrowthColor(analyticsData.growth)}`}>
                  {analyticsData.growth > 0 ? '+' : ''}{analyticsData.growth}%
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData.totalOrders.toLocaleString()}
              </p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+12.5%</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Distributors</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData.totalDistributors}
              </p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+8.3%</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analyticsData.avgOrderValue)}
              </p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+5.7%</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <MapPin className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nepal Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sales by Province</h3>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              Click provinces for details
            </div>
          </div>
          <NepalMap
            data={analyticsData.provinceSales}
            selectedProvince={selectedProvince}
            onProvinceSelect={handleProvinceSelect}
          />
        </motion.div>

        {/* Monthly Sales Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Sales Comparison</h3>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              This Year vs Last Year
            </div>
          </div>
          <SalesChart data={analyticsData.monthlySales} />
        </motion.div>
      </div>

      {/* Distributor Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Distributor Performance
            {selectedProvince && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({selectedProvince} Province)
              </span>
            )}
          </h3>
          {selectedProvince && (
            <button
              onClick={() => setSelectedProvince(null)}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Show All Provinces
            </button>
          )}
        </div>
        <DistributorChart
          data={filteredDistributors}
          selectedProvince={selectedProvince}
        />
      </motion.div>

      {/* Top Products & Province Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Products</h3>
          <div className="space-y-4">
            {analyticsData.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-indigo-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(product.sales)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Province Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Province Performance</h3>
          <div className="space-y-4">
            {analyticsData.provinceSales
              .sort((a, b) => b.sales - a.sales)
              .map((province, index) => (
                <div 
                  key={province.province}
                  className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                    selectedProvince === province.province
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleProvinceSelect(province.province)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{province.province}</p>
                      <p className="text-sm text-gray-500">
                        {province.distributors} distributors • {province.orders} orders
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(province.sales)}
                      </p>
                      <div className="flex items-center justify-end">
                        {getGrowthIcon(province.growth)}
                        <span className={`text-sm ml-1 ${getGrowthColor(province.growth)}`}>
                          {province.growth > 0 ? '+' : ''}{province.growth}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}










