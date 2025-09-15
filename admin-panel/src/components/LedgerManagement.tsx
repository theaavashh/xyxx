'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface LedgerEntry {
  id: string;
  date: Date;
  description: string;
  reference: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  type: 'debit' | 'credit';
}

interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  isActive: boolean;
}

export default function LedgerManagement() {
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockAccounts: Account[] = [
      { id: '1', code: '1000', name: 'Cash', type: 'asset', balance: 150000, isActive: true },
      { id: '2', code: '1100', name: 'Accounts Receivable', type: 'asset', balance: 75000, isActive: true },
      { id: '3', code: '1200', name: 'Inventory', type: 'asset', balance: 200000, isActive: true },
      { id: '4', code: '2000', name: 'Accounts Payable', type: 'liability', balance: 125000, isActive: true },
      { id: '5', code: '3000', name: 'Capital', type: 'equity', balance: 300000, isActive: true },
      { id: '6', code: '4000', name: 'Sales Revenue', type: 'revenue', balance: 500000, isActive: true },
      { id: '7', code: '5000', name: 'Cost of Goods Sold', type: 'expense', balance: 350000, isActive: true },
      { id: '8', code: '6000', name: 'Operating Expenses', type: 'expense', balance: 75000, isActive: true }
    ];

    const mockLedgerEntries: LedgerEntry[] = [
      { id: '1', date: new Date('2024-08-25'), description: 'Opening Balance', reference: 'OB', debitAmount: 0, creditAmount: 0, balance: 150000, type: 'debit' },
      { id: '2', date: new Date('2024-08-26'), description: 'Cash Sale', reference: 'CS001', debitAmount: 50000, creditAmount: 0, balance: 200000, type: 'debit' },
      { id: '3', date: new Date('2024-08-27'), description: 'Payment to Supplier', reference: 'PS001', debitAmount: 0, creditAmount: 25000, balance: 175000, type: 'credit' },
      { id: '4', date: new Date('2024-08-28'), description: 'Customer Payment', reference: 'CP001', debitAmount: 30000, creditAmount: 0, balance: 205000, type: 'debit' },
      { id: '5', date: new Date('2024-08-29'), description: 'Purchase Inventory', reference: 'PI001', debitAmount: 0, creditAmount: 40000, balance: 165000, type: 'credit' }
    ];

    setAccounts(mockAccounts);
    setLedgerEntries(mockLedgerEntries);
  }, []);

  const handleAccountChange = (accountId: string) => {
    setSelectedAccount(accountId);
    // In a real app, you would fetch ledger entries for the selected account
  };

  const handleSearch = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const exportLedger = () => {
    // Export functionality would go here
    console.log('Exporting ledger...');
  };

  const filteredEntries = ledgerEntries.filter(entry => {
    const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.reference.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const selectedAccountData = accounts.find(acc => acc.id === selectedAccount);

  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ledger Management</h1>
          <p className="text-gray-600">View and manage account ledgers with transaction history</p>
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
              <Search className="h-4 w-4 mr-2" />
            )}
            Search
              </button>
              <button
            onClick={exportLedger}
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
              Account
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => handleAccountChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.code} - {account.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Account Summary */}
      {selectedAccountData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedAccountData.code} - {selectedAccountData.name}
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedAccountData.type === 'asset' || selectedAccountData.type === 'expense' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {selectedAccountData.type.charAt(0).toUpperCase() + selectedAccountData.type.slice(1)}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Current Balance</p>
              <p className={`text-2xl font-bold ${
                selectedAccountData.balance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(Math.abs(selectedAccountData.balance))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Account Status</p>
              <p className={`text-lg font-medium ${
                selectedAccountData.isActive ? 'text-green-600' : 'text-red-600'
              }`}>
                {selectedAccountData.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{filteredEntries.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Ledger Entries */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Ledger Entries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Debit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(entry.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {entry.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.reference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {entry.debitAmount > 0 ? formatCurrency(entry.debitAmount) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {entry.creditAmount > 0 ? formatCurrency(entry.creditAmount) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <span className={`${
                      entry.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(Math.abs(entry.balance))}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
              <div>
              <p className="text-sm font-medium text-gray-700">Total Debits</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(filteredEntries.reduce((sum, entry) => sum + entry.debitAmount, 0))}
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
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(filteredEntries.reduce((sum, entry) => sum + entry.creditAmount, 0))}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-4">
              <FileText className="h-6 w-6 text-blue-600" />
              </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Net Movement</p>
              <p className={`text-2xl font-bold ${
                filteredEntries.reduce((sum, entry) => sum + entry.debitAmount - entry.creditAmount, 0) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {formatCurrency(Math.abs(filteredEntries.reduce((sum, entry) => sum + entry.debitAmount - entry.creditAmount, 0)))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

