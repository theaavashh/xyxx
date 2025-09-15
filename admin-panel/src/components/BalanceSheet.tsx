'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  Search, 
  Filter, 
  Calendar, 
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  DollarSign,
  Scale
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface BalanceSheetItem {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity';
  category: string;
  currentYear: number;
  previousYear: number;
  change: number;
  changePercent: number;
}

interface BalanceSheetSummary {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  workingCapital: number;
  debtToEquityRatio: number;
  currentRatio: number;
}

export default function BalanceSheet() {
  const [asOfDate, setAsOfDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [items, setItems] = useState<BalanceSheetItem[]>([]);
  const [summary, setSummary] = useState<BalanceSheetSummary>({
    totalAssets: 0,
    totalLiabilities: 0,
    totalEquity: 0,
    workingCapital: 0,
    debtToEquityRatio: 0,
    currentRatio: 0
  });
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockItems: BalanceSheetItem[] = [
      // Assets
      { id: '1', code: '1000', name: 'Cash and Cash Equivalents', type: 'asset', category: 'Current Assets', currentYear: 150000, previousYear: 120000, change: 30000, changePercent: 25.0 },
      { id: '2', code: '1100', name: 'Accounts Receivable', type: 'asset', category: 'Current Assets', currentYear: 75000, previousYear: 60000, change: 15000, changePercent: 25.0 },
      { id: '3', code: '1200', name: 'Inventory', type: 'asset', category: 'Current Assets', currentYear: 200000, previousYear: 180000, change: 20000, changePercent: 11.1 },
      { id: '4', code: '1300', name: 'Prepaid Expenses', type: 'asset', category: 'Current Assets', currentYear: 25000, previousYear: 20000, change: 5000, changePercent: 25.0 },
      { id: '5', code: '1400', name: 'Property, Plant & Equipment', type: 'asset', category: 'Fixed Assets', currentYear: 500000, previousYear: 480000, change: 20000, changePercent: 4.2 },
      { id: '6', code: '1500', name: 'Accumulated Depreciation', type: 'asset', category: 'Fixed Assets', currentYear: -150000, previousYear: -120000, change: -30000, changePercent: -25.0 },
      { id: '7', code: '1600', name: 'Intangible Assets', type: 'asset', category: 'Other Assets', currentYear: 50000, previousYear: 50000, change: 0, changePercent: 0.0 },
      
      // Liabilities
      { id: '8', code: '2000', name: 'Accounts Payable', type: 'liability', category: 'Current Liabilities', currentYear: 125000, previousYear: 100000, change: 25000, changePercent: 25.0 },
      { id: '9', code: '2100', name: 'Short-term Loans', type: 'liability', category: 'Current Liabilities', currentYear: 100000, previousYear: 80000, change: 20000, changePercent: 25.0 },
      { id: '10', code: '2200', name: 'Accrued Expenses', type: 'liability', category: 'Current Liabilities', currentYear: 50000, previousYear: 40000, change: 10000, changePercent: 25.0 },
      { id: '11', code: '2300', name: 'Long-term Debt', type: 'liability', category: 'Long-term Liabilities', currentYear: 300000, previousYear: 320000, change: -20000, changePercent: -6.3 },
      
      // Equity
      { id: '12', code: '3000', name: 'Share Capital', type: 'equity', category: 'Shareholders Equity', currentYear: 300000, previousYear: 300000, change: 0, changePercent: 0.0 },
      { id: '13', code: '3100', name: 'Retained Earnings', type: 'equity', category: 'Shareholders Equity', currentYear: 125000, previousYear: 100000, change: 25000, changePercent: 25.0 },
      { id: '14', code: '3200', name: 'Current Year Earnings', type: 'equity', category: 'Shareholders Equity', currentYear: 50000, previousYear: 40000, change: 10000, changePercent: 25.0 }
    ];

    setItems(mockItems);

    // Calculate summary
    const assets = mockItems.filter(item => item.type === 'asset');
    const liabilities = mockItems.filter(item => item.type === 'liability');
    const equity = mockItems.filter(item => item.type === 'equity');
    
    const currentAssets = assets.filter(item => item.category === 'Current Assets');
    const currentLiabilities = liabilities.filter(item => item.category === 'Current Liabilities');
    
    const totalAssets = assets.reduce((sum, item) => sum + item.currentYear, 0);
    const totalLiabilities = liabilities.reduce((sum, item) => sum + item.currentYear, 0);
    const totalEquity = equity.reduce((sum, item) => sum + item.currentYear, 0);
    
    const workingCapital = currentAssets.reduce((sum, item) => sum + item.currentYear, 0) - 
                          currentLiabilities.reduce((sum, item) => sum + item.currentYear, 0);
    const debtToEquityRatio = totalLiabilities / totalEquity;
    const currentRatio = currentAssets.reduce((sum, item) => sum + item.currentYear, 0) / 
                        currentLiabilities.reduce((sum, item) => sum + item.currentYear, 0);

    setSummary({ totalAssets, totalLiabilities, totalEquity, workingCapital, debtToEquityRatio, currentRatio });
  }, []);

  const handleSearch = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const exportBalanceSheet = () => {
    // Export functionality would go here
    console.log('Exporting balance sheet...');
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSearch = item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'asset': return 'bg-blue-100 text-blue-800';
      case 'liability': return 'bg-red-100 text-red-800';
      case 'equity': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Balance Sheet</h1>
          <p className="text-gray-600">Assets, Liabilities, and Equity statement with year-over-year comparison</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Building className="h-4 w-4 mr-2" />
            )}
            Generate
          </button>
          <button
            onClick={exportBalanceSheet}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              As of Date
            </label>
              <input
                type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="Current Assets">Current Assets</option>
              <option value="Fixed Assets">Fixed Assets</option>
              <option value="Other Assets">Other Assets</option>
              <option value="Current Liabilities">Current Liabilities</option>
              <option value="Long-term Liabilities">Long-term Liabilities</option>
              <option value="Shareholders Equity">Shareholders Equity</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Total Assets</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.totalAssets)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg mr-4">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Total Liabilities</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalLiabilities)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-4">
              <Scale className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Total Equity</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalEquity)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Ratios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">Working Capital</p>
            <p className={`text-2xl font-bold ${summary.workingCapital >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.workingCapital)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {summary.workingCapital >= 0 ? 'Positive' : 'Negative'} working capital
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">Debt-to-Equity Ratio</p>
            <p className={`text-2xl font-bold ${summary.debtToEquityRatio <= 1 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.debtToEquityRatio.toFixed(2)}:1
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {summary.debtToEquityRatio <= 1 ? 'Conservative' : 'High'} leverage
            </p>
          </div>
                </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">Current Ratio</p>
            <p className={`text-2xl font-bold ${summary.currentRatio >= 1.5 ? 'text-green-600' : summary.currentRatio >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
              {summary.currentRatio.toFixed(2)}:1
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {summary.currentRatio >= 1.5 ? 'Strong' : summary.currentRatio >= 1 ? 'Adequate' : 'Weak'} liquidity
            </p>
          </div>
        </div>
      </div>

      {/* Balance Sheet Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Balance Sheet as of {formatDate(new Date(asOfDate))}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Year
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Previous Year
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % Change
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{item.code}</div>
                      <div className="text-sm text-gray-500">{item.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    {formatCurrency(Math.abs(item.currentYear))}
                    {item.currentYear < 0 && ' (Cr)'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(Math.abs(item.previousYear))}
                    {item.previousYear < 0 && ' (Cr)'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="flex items-center justify-end">
                      {getChangeIcon(item.change)}
                      <span className={`ml-1 font-medium ${getChangeColor(item.change)}`}>
                        {formatCurrency(Math.abs(item.change))}
                      </span>
          </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`font-medium ${getChangeColor(item.change)}`}>
                      {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Balance Sheet Equation */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Balance Sheet Equation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm font-medium text-gray-700 mb-2">Assets</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalAssets)}</p>
              </div>
              <div className="text-2xl font-bold text-gray-400">=</div>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm font-medium text-gray-700 mb-2">Liabilities</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(summary.totalLiabilities)}</p>
                </div>
                <div className="text-center text-gray-400">+</div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm font-medium text-gray-700 mb-2">Equity</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(summary.totalEquity)}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {Math.abs(summary.totalAssets - (summary.totalLiabilities + summary.totalEquity)) < 0.01 
                ? '✓ Balance sheet is balanced' 
                : '✗ Balance sheet is not balanced'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
