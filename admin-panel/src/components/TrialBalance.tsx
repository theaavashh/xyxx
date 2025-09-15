'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Search, 
  Filter, 
  Calendar, 
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface TrialBalanceAccount {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  debitBalance: number;
  creditBalance: number;
  isActive: boolean;
}

interface TrialBalanceSummary {
  totalDebits: number;
  totalCredits: number;
  difference: number;
  isBalanced: boolean;
}

export default function TrialBalance() {
  const [asOfDate, setAsOfDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [accounts, setAccounts] = useState<TrialBalanceAccount[]>([]);
  const [summary, setSummary] = useState<TrialBalanceSummary>({
    totalDebits: 0,
    totalCredits: 0,
    difference: 0,
    isBalanced: true
  });
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockAccounts: TrialBalanceAccount[] = [
      { id: '1', code: '1000', name: 'Cash', type: 'asset', debitBalance: 150000, creditBalance: 0, isActive: true },
      { id: '2', code: '1100', name: 'Accounts Receivable', type: 'asset', debitBalance: 75000, creditBalance: 0, isActive: true },
      { id: '3', code: '1200', name: 'Inventory', type: 'asset', debitBalance: 200000, creditBalance: 0, isActive: true },
      { id: '4', code: '2000', name: 'Accounts Payable', type: 'liability', debitBalance: 0, creditBalance: 125000, isActive: true },
      { id: '5', code: '3000', name: 'Capital', type: 'equity', debitBalance: 0, creditBalance: 300000, isActive: true },
      { id: '6', code: '4000', name: 'Sales Revenue', type: 'revenue', debitBalance: 0, creditBalance: 500000, isActive: true },
      { id: '7', code: '5000', name: 'Cost of Goods Sold', type: 'expense', debitBalance: 350000, creditBalance: 0, isActive: true },
      { id: '8', code: '6000', name: 'Operating Expenses', type: 'expense', debitBalance: 75000, creditBalance: 0, isActive: true }
    ];

    setAccounts(mockAccounts);

    // Calculate summary
    const totalDebits = mockAccounts.reduce((sum, acc) => sum + acc.debitBalance, 0);
    const totalCredits = mockAccounts.reduce((sum, acc) => sum + acc.creditBalance, 0);
    const difference = Math.abs(totalDebits - totalCredits);
    const isBalanced = difference < 0.01; // Allow for small rounding differences

    setSummary({ totalDebits, totalCredits, difference, isBalanced });
  }, []);

  const handleSearch = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const exportTrialBalance = () => {
    // Export functionality would go here
    console.log('Exporting trial balance...');
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesType = typeFilter === 'all' || account.type === typeFilter;
    const matchesSearch = account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'asset': return 'bg-blue-100 text-blue-800';
      case 'liability': return 'bg-red-100 text-red-800';
      case 'equity': return 'bg-green-100 text-green-800';
      case 'revenue': return 'bg-purple-100 text-purple-800';
      case 'expense': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBalanceColor = (debitBalance: number, creditBalance: number) => {
    const balance = debitBalance - creditBalance;
    return balance >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trial Balance</h1>
          <p className="text-gray-600">Verify accounting equation with debits and credits summary</p>
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
              <Calculator className="h-4 w-4 mr-2" />
            )}
            Calculate
          </button>
          <button
            onClick={exportTrialBalance}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              Account Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="asset">Assets</option>
              <option value="liability">Liabilities</option>
              <option value="equity">Equity</option>
              <option value="revenue">Revenue</option>
              <option value="expense">Expenses</option>
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
          <div className="flex items-end">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Balance Status
              </label>
              <div className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                summary.isBalanced 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {summary.isBalanced ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                {summary.isBalanced ? 'Balanced' : 'Unbalanced'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Total Debits</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.totalDebits)}
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
              <p className="text-sm font-medium text-gray-700">Total Credits</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalCredits)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-4">
              <Calculator className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Difference</p>
              <p className={`text-2xl font-bold ${
                summary.difference === 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(summary.difference)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-4 ${
              summary.isBalanced ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {summary.isBalanced ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Status</p>
              <p className={`text-lg font-bold ${
                summary.isBalanced ? 'text-green-600' : 'text-red-600'
              }`}>
                {summary.isBalanced ? 'Balanced' : 'Needs Review'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trial Balance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Trial Balance as of {formatDate(new Date(asOfDate))}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Debit Balance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit Balance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Balance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAccounts.map((account) => {
                const netBalance = account.debitBalance - account.creditBalance;
                return (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {account.code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {account.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(account.type)}`}>
                        {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {account.debitBalance > 0 ? formatCurrency(account.debitBalance) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {account.creditBalance > 0 ? formatCurrency(account.creditBalance) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <span className={getBalanceColor(account.debitBalance, account.creditBalance)}>
                        {formatCurrency(Math.abs(netBalance))}
                        {netBalance < 0 && ' (Cr)'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50 font-bold">
                <td colSpan={3} className="px-6 py-4 text-sm text-gray-900">
                  TOTALS
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(summary.totalDebits)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(summary.totalCredits)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                  <span className={summary.isBalanced ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(summary.difference)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Balance Check Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start">
          <div className="p-2 bg-blue-100 rounded-lg mr-4">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">Trial Balance Check</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center justify-between">
                <span>• Total Debits: {formatCurrency(summary.totalDebits)}</span>
                <span className="font-medium">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span>• Total Credits: {formatCurrency(summary.totalCredits)}</span>
                <span className="font-medium">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span>• Difference: {formatCurrency(summary.difference)}</span>
                <span className={`font-medium ${summary.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.isBalanced ? '✓ Balanced' : '✗ Unbalanced'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>• Accounting Equation: Assets = Liabilities + Equity</span>
                <span className={`font-medium ${summary.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.isBalanced ? '✓ Valid' : '✗ Invalid'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
