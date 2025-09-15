'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MonthlySalesComparison } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface SalesChartProps {
  data: MonthlySalesComparison[];
}

export default function SalesChart({ data }: SalesChartProps) {
  const maxValue = Math.max(...data.flatMap(d => [d.thisYear, d.lastYear]));
  
  const getBarHeight = (value: number) => {
    return (value / maxValue) * 200; // 200px max height
  };

  const getBarColor = (growth: number) => {
    return growth >= 0 ? '#10b981' : '#ef4444';
  };

  return (
    <div className="relative">
      {/* Chart Container */}
      <div className="h-64 overflow-x-auto">
        <div className="flex items-end space-x-2 h-full pb-8" style={{ minWidth: '800px' }}>
          {data.map((month, index) => (
            <div key={month.month} className="flex-1 flex flex-col items-center">
              {/* Bars Container */}
              <div className="flex items-end space-x-1 h-52 mb-2">
                {/* This Year Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: getBarHeight(month.thisYear) }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="w-6 bg-blue-500 rounded-t relative group"
                  style={{ height: `${getBarHeight(month.thisYear)}px` }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                      This Year: {formatCurrency(month.thisYear)}
                    </div>
                    <div className="w-2 h-2 bg-gray-900 transform rotate-45 absolute top-full left-1/2 -translate-x-1/2 -mt-1"></div>
                  </div>
                </motion.div>

                {/* Last Year Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: getBarHeight(month.lastYear) }}
                  transition={{ delay: index * 0.1 + 0.1, duration: 0.5 }}
                  className="w-6 bg-gray-400 rounded-t relative group"
                  style={{ height: `${getBarHeight(month.lastYear)}px` }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                      Last Year: {formatCurrency(month.lastYear)}
                    </div>
                    <div className="w-2 h-2 bg-gray-900 transform rotate-45 absolute top-full left-1/2 -translate-x-1/2 -mt-1"></div>
                  </div>
                </motion.div>
              </div>

              {/* Month Label */}
              <div className="text-xs text-gray-600 text-center">
                <div className="font-medium">{month.month}</div>
                <div 
                  className={`text-xs mt-1 ${month.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {month.growth > 0 ? '+' : ''}{month.growth}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Y-axis Labels */}
      <div className="absolute left-0 top-0 h-52 flex flex-col justify-between text-xs text-gray-500 -ml-16">
        <span>{formatCurrency(maxValue)}</span>
        <span>{formatCurrency(maxValue * 0.75)}</span>
        <span>{formatCurrency(maxValue * 0.5)}</span>
        <span>{formatCurrency(maxValue * 0.25)}</span>
        <span>0</span>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          <span className="text-gray-600">This Year</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
          <span className="text-gray-600">Last Year</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-600">This Year Total</div>
          <div className="font-bold text-blue-900">
            {formatCurrency(data.reduce((sum, month) => sum + month.thisYear, 0))}
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Last Year Total</div>
          <div className="font-bold text-gray-900">
            {formatCurrency(data.reduce((sum, month) => sum + month.lastYear, 0))}
          </div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-sm text-green-600">Overall Growth</div>
          <div className="font-bold text-green-900">
            {(() => {
              const thisYearTotal = data.reduce((sum, month) => sum + month.thisYear, 0);
              const lastYearTotal = data.reduce((sum, month) => sum + month.lastYear, 0);
              const growth = ((thisYearTotal - lastYearTotal) / lastYearTotal * 100);
              return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}










