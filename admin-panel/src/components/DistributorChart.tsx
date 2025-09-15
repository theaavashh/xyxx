'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, MapPin, ShoppingCart, Building } from 'lucide-react';
import { DistributorSales } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface DistributorChartProps {
  data: DistributorSales[];
  selectedProvince?: string | null;
}

export default function DistributorChart({ data, selectedProvince }: DistributorChartProps) {
  const [viewMode, setViewMode] = useState<'thisMonth' | 'thisYear'>('thisMonth');
  const [sortBy, setSortBy] = useState<'sales' | 'growth'>('sales');

  const sortedData = [...data].sort((a, b) => {
    if (sortBy === 'sales') {
      const aValue = viewMode === 'thisMonth' ? a.thisMonth : a.thisYear;
      const bValue = viewMode === 'thisMonth' ? b.thisMonth : b.thisYear;
      return bValue - aValue;
    } else {
      return b.growth - a.growth;
    }
  });

  const maxValue = Math.max(...sortedData.map(d => 
    viewMode === 'thisMonth' ? d.thisMonth : d.thisYear
  ));

  const getBarWidth = (value: number) => {
    return (value / maxValue) * 100;
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

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('thisMonth')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              viewMode === 'thisMonth' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setViewMode('thisYear')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              viewMode === 'thisYear' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            This Year
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'sales' | 'growth')}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="sales">Sales Amount</option>
            <option value="growth">Growth Rate</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-3">
        {sortedData.map((distributor, index) => {
          const currentValue = viewMode === 'thisMonth' ? distributor.thisMonth : distributor.thisYear;
          const previousValue = viewMode === 'thisMonth' ? distributor.lastMonth : distributor.lastYear;
          
          return (
            <motion.div
              key={distributor.distributorId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <h4 className="font-medium text-gray-900 truncate">
                      {distributor.distributorName}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {distributor.district}, {distributor.province}
                    </div>
                    <div className="flex items-center">
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      {distributor.orders} orders
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(currentValue)}
                  </div>
                  <div className="flex items-center justify-end">
                    {getGrowthIcon(distributor.growth)}
                    <span className={`text-sm ml-1 ${getGrowthColor(distributor.growth)}`}>
                      {distributor.growth > 0 ? '+' : ''}{distributor.growth}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getBarWidth(currentValue)}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                    className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
                  />
                </div>
                
                {/* Comparison with previous period */}
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>
                    {viewMode === 'thisMonth' ? 'Last Month' : 'Last Year'}: {formatCurrency(previousValue)}
                  </span>
                  <span>
                    Rank: #{index + 1}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-sm text-blue-600">
            Total {viewMode === 'thisMonth' ? 'This Month' : 'This Year'}
          </div>
          <div className="font-bold text-blue-900 text-lg">
            {formatCurrency(sortedData.reduce((sum, d) => 
              sum + (viewMode === 'thisMonth' ? d.thisMonth : d.thisYear), 0
            ))}
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-sm text-green-600">Average Growth</div>
          <div className="font-bold text-green-900 text-lg">
            {(() => {
              const avgGrowth = sortedData.reduce((sum, d) => sum + d.growth, 0) / sortedData.length;
              return `${avgGrowth > 0 ? '+' : ''}${avgGrowth.toFixed(1)}%`;
            })()}
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-sm text-purple-600">
            {selectedProvince ? `${selectedProvince} Distributors` : 'Total Distributors'}
          </div>
          <div className="font-bold text-purple-900 text-lg">
            {sortedData.length}
          </div>
        </div>
      </div>

      {/* Top Performer Highlight */}
      {sortedData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-semibold text-orange-900">
                🏆 Top Performer ({viewMode === 'thisMonth' ? 'This Month' : 'This Year'})
              </h5>
              <p className="text-orange-700">
                {sortedData[0].distributorName} • {sortedData[0].province}
              </p>
            </div>
            <div className="text-right">
              <div className="font-bold text-orange-900">
                {formatCurrency(viewMode === 'thisMonth' ? sortedData[0].thisMonth : sortedData[0].thisYear)}
              </div>
              <div className="text-sm text-orange-700">
                {sortedData[0].growth > 0 ? '+' : ''}{sortedData[0].growth}% growth
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

