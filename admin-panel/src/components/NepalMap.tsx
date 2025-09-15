'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ProvinceSales } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface NepalMapProps {
  data: ProvinceSales[];
  selectedProvince: string | null;
  onProvinceSelect: (province: string) => void;
}

export default function NepalMap({ data, selectedProvince, onProvinceSelect }: NepalMapProps) {
  // Get sales value for a province
  const getProvinceSales = (provinceName: string) => {
    const province = data.find(p => p.province === provinceName);
    return province ? province.sales : 0;
  };

  // Get color based on sales value
  const getProvinceColor = (provinceName: string) => {
    const sales = getProvinceSales(provinceName);
    const maxSales = Math.max(...data.map(p => p.sales));
    
    if (sales === 0) return '#f3f4f6';
    
    const intensity = sales / maxSales;
    if (selectedProvince === provinceName) {
      return '#4f46e5'; // Indigo for selected
    }
    
    // Blue gradient based on sales intensity
    if (intensity >= 0.8) return '#1e40af';
    if (intensity >= 0.6) return '#3b82f6';
    if (intensity >= 0.4) return '#60a5fa';
    if (intensity >= 0.2) return '#93c5fd';
    return '#dbeafe';
  };

  const getProvinceData = (provinceName: string) => {
    return data.find(p => p.province === provinceName);
  };

  return (
    <div className="relative">
      {/* SVG Map of Nepal with Provinces */}
      <svg
        viewBox="0 0 800 400"
        className="w-full h-80 border border-gray-200 rounded-lg"
        style={{ maxHeight: '320px' }}
      >
        {/* Background */}
        <rect width="800" height="400" fill="#f8fafc" />
        
        {/* Koshi Province (East) */}
        <motion.path
          d="M600 100 L750 100 L750 200 L680 250 L600 200 Z"
          fill={getProvinceColor('Koshi')}
          stroke="#e5e7eb"
          strokeWidth="2"
          className="cursor-pointer transition-all duration-200 hover:opacity-80"
          onClick={() => onProvinceSelect('Koshi')}
          whileHover={{ scale: 1.02 }}
        />
        
        {/* Madhesh Province (South East) */}
        <motion.path
          d="M600 200 L680 250 L750 200 L750 280 L600 280 Z"
          fill={getProvinceColor('Madhesh')}
          stroke="#e5e7eb"
          strokeWidth="2"
          className="cursor-pointer transition-all duration-200 hover:opacity-80"
          onClick={() => onProvinceSelect('Madhesh')}
          whileHover={{ scale: 1.02 }}
        />
        
        {/* Bagmati Province (Center) */}
        <motion.path
          d="M400 120 L600 100 L600 200 L480 220 L400 180 Z"
          fill={getProvinceColor('Bagmati')}
          stroke="#e5e7eb"
          strokeWidth="2"
          className="cursor-pointer transition-all duration-200 hover:opacity-80"
          onClick={() => onProvinceSelect('Bagmati')}
          whileHover={{ scale: 1.02 }}
        />
        
        {/* Gandaki Province (Center West) */}
        <motion.path
          d="M250 140 L400 120 L400 180 L320 200 L250 180 Z"
          fill={getProvinceColor('Gandaki')}
          stroke="#e5e7eb"
          strokeWidth="2"
          className="cursor-pointer transition-all duration-200 hover:opacity-80"
          onClick={() => onProvinceSelect('Gandaki')}
          whileHover={{ scale: 1.02 }}
        />
        
        {/* Lumbini Province (South West) */}
        <motion.path
          d="M320 200 L480 220 L600 200 L600 280 L320 280 Z"
          fill={getProvinceColor('Lumbini')}
          stroke="#e5e7eb"
          strokeWidth="2"
          className="cursor-pointer transition-all duration-200 hover:opacity-80"
          onClick={() => onProvinceSelect('Lumbini')}
          whileHover={{ scale: 1.02 }}
        />
        
        {/* Karnali Province (North West) */}
        <motion.path
          d="M100 80 L250 140 L250 180 L150 160 L80 120 Z"
          fill={getProvinceColor('Karnali')}
          stroke="#e5e7eb"
          strokeWidth="2"
          className="cursor-pointer transition-all duration-200 hover:opacity-80"
          onClick={() => onProvinceSelect('Karnali')}
          whileHover={{ scale: 1.02 }}
        />
        
        {/* Sudurpashchim Province (Far West) */}
        <motion.path
          d="M50 120 L150 160 L250 180 L320 200 L320 280 L50 280 Z"
          fill={getProvinceColor('Sudurpashchim')}
          stroke="#e5e7eb"
          strokeWidth="2"
          className="cursor-pointer transition-all duration-200 hover:opacity-80"
          onClick={() => onProvinceSelect('Sudurpashchim')}
          whileHover={{ scale: 1.02 }}
        />

        {/* Province Labels */}
        <text x="675" y="150" textAnchor="middle" className="text-xs font-medium fill-gray-700">
          Koshi
        </text>
        <text x="675" y="240" textAnchor="middle" className="text-xs font-medium fill-gray-700">
          Madhesh
        </text>
        <text x="500" y="160" textAnchor="middle" className="text-xs font-medium fill-gray-700">
          Bagmati
        </text>
        <text x="325" y="160" textAnchor="middle" className="text-xs font-medium fill-gray-700">
          Gandaki
        </text>
        <text x="460" y="250" textAnchor="middle" className="text-xs font-medium fill-gray-700">
          Lumbini
        </text>
        <text x="175" y="130" textAnchor="middle" className="text-xs font-medium fill-gray-700">
          Karnali
        </text>
        <text x="185" y="230" textAnchor="middle" className="text-xs font-medium fill-gray-700">
          Sudurpashchim
        </text>
      </svg>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-200 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Low Sales</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">High Sales</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-indigo-600 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Selected</span>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Total: {formatCurrency(data.reduce((sum, p) => sum + p.sales, 0))}
        </div>
      </div>

      {/* Selected Province Details */}
      {selectedProvince && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg"
        >
          {(() => {
            const provinceData = getProvinceData(selectedProvince);
            if (!provinceData) return null;
            
            return (
              <div>
                <h4 className="font-semibold text-indigo-900 mb-2">
                  {selectedProvince} Province
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-indigo-600">Sales</p>
                    <p className="font-medium text-indigo-900">
                      {formatCurrency(provinceData.sales)}
                    </p>
                  </div>
                  <div>
                    <p className="text-indigo-600">Distributors</p>
                    <p className="font-medium text-indigo-900">
                      {provinceData.distributors}
                    </p>
                  </div>
                  <div>
                    <p className="text-indigo-600">Orders</p>
                    <p className="font-medium text-indigo-900">
                      {provinceData.orders}
                    </p>
                  </div>
                  <div>
                    <p className="text-indigo-600">Growth</p>
                    <p className={`font-medium ${
                      provinceData.growth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {provinceData.growth > 0 ? '+' : ''}{provinceData.growth}%
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}










