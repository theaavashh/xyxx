'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Building2, Phone, Mail, TrendingUp, BarChart3, FileText, CheckCircle, Package } from 'lucide-react';
import { mockProducts } from '@/lib/mockData';
import { formatCurrency, generateId } from '@/lib/utils';
import { MonthlyLogSheet } from '@/types';
import toast from 'react-hot-toast';

interface MonthlyLogSheetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sheets: MonthlyLogSheet[]) => void;
  distributorId: string;
}

interface ProductDailyData {
  [productId: string]: {
    openingStock?: number;
    closingStock?: number;
    dailyEntries: {
      [day: number]: {
        salesQuantity?: number;
        unitPrice?: number;
        totalSales?: number;
        remarks?: string;
      };
    };
  };
}

export default function MonthlyLogSheetForm({ isOpen, onClose, onSubmit, distributorId }: MonthlyLogSheetFormProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [productData, setProductData] = useState<ProductDailyData>({});
  
  const currentDate = new Date();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get number of days in selected month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);

  // Initialize product data when month/year changes
  useEffect(() => {
    const newProductData: ProductDailyData = {};
    mockProducts.forEach(product => {
      newProductData[product.id] = {
        openingStock: undefined,
        closingStock: undefined,
        dailyEntries: {}
      };
      for (let day = 1; day <= daysInMonth; day++) {
        newProductData[product.id].dailyEntries[day] = {
          salesQuantity: undefined,
          unitPrice: product.pricePerUnit,
          totalSales: undefined,
          remarks: '',
        };
      }
    });
    setProductData(newProductData);
  }, [selectedMonth, selectedYear, daysInMonth]);

  const updateProductDailyEntry = (productId: string, day: number, field: string, value: any) => {
    setProductData(prev => {
      const updated = { ...prev };
      if (!updated[productId]) updated[productId] = { openingStock: undefined, closingStock: undefined, dailyEntries: {} };
      if (!updated[productId].dailyEntries) updated[productId].dailyEntries = {};
      if (!updated[productId].dailyEntries[day]) updated[productId].dailyEntries[day] = {};
      
      updated[productId].dailyEntries[day] = { ...updated[productId].dailyEntries[day], [field]: value };
      
      // Auto-calculate total sales when sales quantity changes
      if (field === 'salesQuantity' && value !== undefined) {
        const product = mockProducts.find(p => p.id === productId);
        const unitPrice = updated[productId].dailyEntries[day].unitPrice || (product ? product.pricePerUnit : 0);
        updated[productId].dailyEntries[day].totalSales = value * unitPrice;
      }
      
      return updated;
    });
  };

  const calculateProductTotal = (productId: string) => {
    if (!productData[productId] || !productData[productId].dailyEntries) return 0;
    let total = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEntry = productData[productId].dailyEntries[day];
      if (dayEntry && dayEntry.totalSales) {
        total += dayEntry.totalSales;
      }
    }
    return total;
  };

  const calculateGrandTotal = () => {
    return mockProducts.reduce((total, product) => {
      return total + calculateProductTotal(product.id);
    }, 0);
  };

  // Calculate performance percentage for a product (assuming target is based on average monthly sales)
  const calculatePerformancePercentage = (productId: string) => {
    const totalSales = calculateProductTotal(productId);
    // Assuming a target based on product price and typical monthly volume
    const product = mockProducts.find(p => p.id === productId);
    if (!product || totalSales === 0) return 0;
    
    // Example target: product price * 100 units per month (adjust as needed)
    const monthlyTarget = product.pricePerUnit * 100;
    if (monthlyTarget === 0) return 0;
    return (totalSales / monthlyTarget) * 100;
  };

  // Get row background color based on performance
  const getPerformanceRowColor = (productId: string) => {
    const percentage = calculatePerformancePercentage(productId);
    
    if (percentage < 10) {
      return 'bg-red-100 hover:bg-red-150'; // Red for < 10%
    } else if (percentage < 30) {
      return 'bg-orange-100 hover:bg-orange-150'; // Orange for 10-30%
    } else if (percentage < 60) {
      return 'bg-yellow-100 hover:bg-yellow-150'; // Yellow for 30-60%
    } else {
      return 'bg-green-100 hover:bg-green-150'; // Green for > 60%
    }
  };

  const handleSubmit = () => {
    const sheets: MonthlyLogSheet[] = [];
    
    mockProducts.forEach(product => {
      const productDataEntry = productData[product.id];
      if (!productDataEntry || !productDataEntry.dailyEntries) return;

      const dailyEntries = Object.entries(productDataEntry.dailyEntries)
        .map(([day, entry]) => ({
          day: parseInt(day),
          openingStock: productDataEntry.openingStock,
          closingStock: productDataEntry.closingStock,
          salesQuantity: entry.salesQuantity,
          unitPrice: entry.unitPrice,
          totalSales: entry.totalSales,
          remarks: entry.remarks,
        }))
        .filter(entry => entry.salesQuantity !== undefined || entry.totalSales !== undefined);

      if (dailyEntries.length > 0) {
        sheets.push({
          id: generateId(),
          distributorId,
          month: selectedMonth,
          year: selectedYear,
          productId: product.id,
          productName: product.name,
          dailyEntries,
          totalMonthlySales: calculateProductTotal(product.id),
          submittedAt: new Date(),
        });
      }
    });

    if (sheets.length === 0) {
      toast.error('Please enter some sales data');
      return;
    }

    onSubmit(sheets);
    onClose();
    toast.success(`Monthly log sheet submitted for ${sheets.length} products!`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
        
        {/* Clean Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Distributor Sales Register</h2>
                <h3 className="text-lg font-medium text-gray-600">Multi Industries Pvt. Ltd.</h3>
                <div className="flex items-center space-x-6 mt-2 text-sm text-gray-500">
                  <span className="flex items-center"><Phone className="h-4 w-4 mr-2" />+977-1-4567890</span>
                  <span className="flex items-center"><Mail className="h-4 w-4 mr-2" />info@multiindustries.com</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          
          {/* Month/Year Selection & Grand Total */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-6">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="bg-white text-gray-900 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-white text-gray-900 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                >
                  {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1].map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Grand Total</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(calculateGrandTotal())}
              </div>
            </div>
          </div>
        </div>

        {/* Google Sheets-like Data Table */}
        <div className="p-6">
          <div className="bg-white border border-gray-300 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                {/* Google Sheets-style Column Headers */}
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 min-w-[200px] border-r border-gray-300 bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-600" />
                        <span>Product Details</span>
                      </div>
                    </th>
                    <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900 min-w-[80px] border-r border-gray-300 bg-gray-50">
                      <div className="flex items-center justify-center space-x-1">
                        <TrendingUp className="h-4 w-4 text-gray-600" />
                        <span>Opening</span>
                      </div>
                    </th>
                    {Array.from({ length: daysInMonth }, (_, index) => {
                      const day = index + 1;
                      const date = new Date(selectedYear, selectedMonth - 1, day);
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                      const isToday = date.toDateString() === new Date().toDateString();
                      
                      return (
                        <th
                          key={day}
                          className={`px-1 py-2 text-center text-xs font-semibold text-gray-700 min-w-[60px] border-r border-gray-300 ${
                            isToday ? 'bg-blue-100 text-blue-800' : isWeekend ? 'bg-gray-200' : 'bg-gray-100'
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-xs">{day}</span>
                            <span className="text-xs text-gray-600">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <span className="text-xs text-gray-500">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                          </div>
                        </th>
                      );
                    })}
                    <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900 min-w-[80px] border-r border-gray-300 bg-gray-50">
                      <div className="flex items-center justify-center space-x-1">
                        <CheckCircle className="h-4 w-4 text-gray-600" />
                        <span>Closing</span>
                      </div>
                    </th>
                  </tr>
                </thead>
            
                {/* Product Rows */}
                <tbody>
                  {mockProducts.map((product, index) => {
                    const performancePercentage = calculatePerformancePercentage(product.id);
                    const performanceColor = performancePercentage < 10 ? 'red' : 
                                          performancePercentage < 30 ? 'orange' : 
                                          performancePercentage < 60 ? 'yellow' : 'green';
                    
                    return (
                      <tr key={product.id} className="border-b border-gray-200 hover:bg-blue-50">
                        {/* Product Details */}
                        <td className="px-3 py-2 border-r border-gray-200 bg-gray-50">
                          <div className="flex items-start space-x-2">
                            <div className={`w-2 h-2 rounded-full mt-2 bg-${performanceColor}-500 flex-shrink-0`}></div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {product.category}
                              </div>
                              <div className="text-xs font-medium text-blue-600 mt-1">
                                @ {formatCurrency(product.pricePerUnit)}
                              </div>
                              <div className="mt-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${performanceColor}-100 text-${performanceColor}-800`}>
                                  {performancePercentage.toFixed(0)}% Performance
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Opening Stock */}
                        <td className="px-2 py-2 text-center border-r border-gray-200 bg-white">
                          <div className="relative">
                            <input
                              type="number"
                              value={productData[product.id]?.openingStock || ''}
                              onChange={(e) => {
                                setProductData(prev => ({
                                  ...prev,
                                  [product.id]: {
                                    ...prev[product.id],
                                    openingStock: parseInt(e.target.value) || undefined
                                  }
                                }));
                              }}
                              className="w-full text-center text-sm font-medium border-0 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-transparent h-8 px-1"
                              placeholder="0"
                              title="Month Opening Stock"
                            />
                            <div className="absolute right-1 top-0 bottom-0 flex flex-col opacity-0 hover:opacity-100 transition-opacity">
                              <button className="h-3 w-3 text-gray-400 hover:text-gray-600 text-xs">▲</button>
                              <button className="h-3 w-3 text-gray-400 hover:text-gray-600 text-xs">▼</button>
                            </div>
                          </div>
                        </td>
                        
                        {/* Daily Sales Columns */}
                        {Array.from({ length: daysInMonth }, (_, dayIndex) => {
                          const day = dayIndex + 1;
                          const date = new Date(selectedYear, selectedMonth - 1, day);
                          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                          const isToday = date.toDateString() === new Date().toDateString();
                          
                          return (
                            <td key={day} className={`px-1 py-2 text-center border-r border-gray-200 ${
                              isToday ? 'bg-blue-50' : isWeekend ? 'bg-gray-100' : 'bg-white'
                            }`}>
                              <div className="relative group">
                                <input
                                  type="number"
                                  value={productData[product.id]?.dailyEntries?.[day]?.salesQuantity || ''}
                                  onChange={(e) => {
                                    const qty = parseInt(e.target.value) || undefined;
                                    const price = productData[product.id]?.dailyEntries?.[day]?.unitPrice || product.pricePerUnit;
                                    updateProductDailyEntry(product.id, day, 'salesQuantity', qty);
                                    if (qty && price) {
                                      updateProductDailyEntry(product.id, day, 'totalSales', qty * price);
                                    }
                                  }}
                                  className={`w-full text-center text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 h-8 px-1 bg-transparent ${
                                    isToday ? 'bg-blue-50' : isWeekend ? 'bg-gray-100' : 'bg-white'
                                  }`}
                                  placeholder="0"
                                  title={`Sales Quantity - Day ${day}`}
                                />
                                <div className="absolute right-1 top-0 bottom-0 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="h-3 w-3 text-gray-400 hover:text-gray-600 text-xs">▲</button>
                                  <button className="h-3 w-3 text-gray-400 hover:text-gray-600 text-xs">▼</button>
                                </div>
                              </div>
                            </td>
                          );
                        })}
                        
                        {/* Closing Stock */}
                        <td className="px-2 py-2 text-center border-r border-gray-200 bg-white">
                          <div className="relative group">
                            <input
                              type="number"
                              value={productData[product.id]?.closingStock || ''}
                              onChange={(e) => {
                                setProductData(prev => ({
                                  ...prev,
                                  [product.id]: {
                                    ...prev[product.id],
                                    closingStock: parseInt(e.target.value) || undefined
                                  }
                                }));
                              }}
                              className="w-full text-center text-sm font-medium border-0 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-transparent h-8 px-1"
                              placeholder="0"
                              title="Month Closing Stock"
                            />
                            <div className="absolute right-1 top-0 bottom-0 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="h-3 w-3 text-gray-400 hover:text-gray-600 text-xs">▲</button>
                              <button className="h-3 w-3 text-gray-400 hover:text-gray-600 text-xs">▼</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              
                  {/* Grand Total Row */}
                  <tr className="bg-gray-200 border-t-2 border-gray-400">
                    <td className="px-3 py-2 border-r border-gray-200 bg-gray-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                        <span className="text-sm font-bold text-gray-900">GRAND TOTAL</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center border-r border-gray-200 bg-gray-200">
                      <span className="text-sm font-medium text-gray-600">-</span>
                    </td>
                    {Array.from({ length: daysInMonth }, (_, index) => {
                      const day = index + 1;
                      const dayTotal = mockProducts.reduce((total, product) => {
                        return total + (productData[product.id]?.dailyEntries?.[day]?.totalSales || 0);
                      }, 0);
                      
                      return (
                        <td key={day} className="px-1 py-2 text-center border-r border-gray-200 bg-gray-200">
                          <span className="text-xs font-medium text-gray-700">
                            {dayTotal > 0 ? formatCurrency(dayTotal).replace('NPR ', '') : '-'}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-2 py-2 text-center bg-gray-200">
                      <span className="text-sm font-medium text-gray-600">-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Clean Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Legend */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span><strong>Opening Stock:</strong> Month starting inventory</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span><strong>Daily Sales:</strong> Enter quantity sold per day</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span><strong>Closing Stock:</strong> Month ending inventory</span>
                </div>
              </div>
              
              {/* Performance Legend */}
              <div className="flex items-center space-x-4 text-sm">
                <span className="font-medium text-gray-700">Performance Indicators:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs">&lt; 10%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-xs">10-30%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs">30-60%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs">&gt; 60%</span>
                </div>
              </div>
            </div>

            {/* Period Display */}
            <div className="text-right">
              <div className="text-sm text-gray-500">Period</div>
              <div className="text-lg font-semibold text-gray-900">
                {months[selectedMonth - 1]} {selectedYear}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors duration-200"
            >
              <Save className="h-5 w-5 mr-2" />
              Submit Monthly Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}