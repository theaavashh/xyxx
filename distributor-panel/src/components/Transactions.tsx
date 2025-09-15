'use client';

import { useState } from 'react';
import { Filter, Download, Calendar, Search, TrendingDown, TrendingUp, Plus, FileText, CalendarDays } from 'lucide-react';
import { mockTransactions } from '@/lib/mockData';
import { formatCurrency, formatDateTime, generateId } from '@/lib/utils';
import { Transaction, SalesLogEntry, DailySalesSheet, MonthlyLogSheet } from '@/types';
import { useAuth } from './AuthProvider';
import SalesLogForm from './SalesLogForm';
import DailySalesSheetForm from './DailySalesSheet';
import MonthlyLogSheetForm from './MonthlyLogSheet';

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showSalesForm, setShowSalesForm] = useState(false);
  const [showDailySalesSheet, setShowDailySalesSheet] = useState(false);
  const [showMonthlyLogSheet, setShowMonthlyLogSheet] = useState(false);

  const types = ['all', 'order', 'payment', 'refund', 'adjustment', 'sales'];
  const statuses = ['all', 'completed', 'pending', 'failed'];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const now = new Date();
      const transactionDate = new Date(transaction.date);
      
      switch (dateFilter) {
        case 'today':
          matchesDate = transactionDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = transactionDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = transactionDate >= monthAgo;
          break;
      }
    }
    
    return matchesType && matchesStatus && matchesSearch && matchesDate;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order': return 'bg-blue-100 text-blue-800';
      case 'payment': return 'bg-green-100 text-green-800';
      case 'refund': return 'bg-yellow-100 text-yellow-800';
      case 'adjustment': return 'bg-purple-100 text-purple-800';
      case 'sales': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalAmount = () => {
    return filteredTransactions.reduce((total, transaction) => total + transaction.amount, 0);
  };

  const exportTransactions = () => {
    // Here you would implement CSV/PDF export functionality
    alert('Export functionality would be implemented here');
  };

  const handleAddSalesTransaction = (salesEntry: SalesLogEntry) => {
    // Convert sales log entry to transaction
    const newTransaction: Transaction = {
      id: generateId(),
      distributorId: salesEntry.distributorId,
      type: 'sales',
      amount: salesEntry.totalAmount,
      currency: 'NPR',
      description: `Sales: ${salesEntry.productName} (${salesEntry.quantitySold} units)${salesEntry.customerName ? ` to ${salesEntry.customerName}` : ''}`,
      date: salesEntry.date,
      status: 'completed',
      reference: `SALES-${salesEntry.id}`,
      productId: salesEntry.productId,
      productName: salesEntry.productName,
      quantity: salesEntry.quantitySold,
      unitPrice: salesEntry.unitPrice,
    };

    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleSubmitDailySalesSheet = (salesSheet: DailySalesSheet) => {
    // Convert daily sales sheet to multiple transactions
    const newTransactions: Transaction[] = salesSheet.productEntries.map(entry => ({
      id: generateId(),
      distributorId: salesSheet.distributorId,
      type: 'sales',
      amount: entry.totalSales,
      currency: 'NPR',
      description: `Daily Sales: ${entry.productName} (${entry.salesQuantity} units sold)`,
      date: salesSheet.date,
      status: 'completed',
      reference: `DAILY-${salesSheet.id}`,
      productId: entry.productId,
      productName: entry.productName,
      quantity: entry.salesQuantity,
      unitPrice: entry.unitPrice,
    }));

    // Add a summary transaction for the total daily sales
    const summaryTransaction: Transaction = {
      id: generateId(),
      distributorId: salesSheet.distributorId,
      type: 'sales',
      amount: salesSheet.totalSalesAmount,
      currency: 'NPR',
      description: `Daily Sales Summary - ${salesSheet.productEntries.length} products (${formatCurrency(salesSheet.totalSalesAmount)})`,
      date: salesSheet.date,
      status: 'completed',
      reference: `SUMMARY-${salesSheet.id}`,
    };

    setTransactions(prev => [summaryTransaction, ...newTransactions, ...prev]);
  };

  const handleSubmitMonthlyLogSheet = (monthlyLogs: MonthlyLogSheet[]) => {
    const allNewTransactions: Transaction[] = [];

    monthlyLogs.forEach(monthlyLog => {
      // Convert monthly log sheet to transactions for each day with sales
      const newTransactions: Transaction[] = monthlyLog.dailyEntries
        .filter(entry => (entry.totalSales || 0) > 0)
        .map(entry => ({
          id: generateId(),
          distributorId: monthlyLog.distributorId,
          type: 'sales',
          amount: entry.totalSales || 0,
          currency: 'NPR',
          description: `Monthly Log: ${monthlyLog.productName} - Day ${entry.day} (${entry.salesQuantity || 0} units)`,
          date: new Date(monthlyLog.year, monthlyLog.month - 1, entry.day),
          status: 'completed',
          reference: `MONTHLY-${monthlyLog.id}-D${entry.day}`,
          productId: monthlyLog.productId,
          productName: monthlyLog.productName,
          quantity: entry.salesQuantity,
          unitPrice: entry.unitPrice,
        }));

      // Add a monthly summary transaction for this product
      const summaryTransaction: Transaction = {
        id: generateId(),
        distributorId: monthlyLog.distributorId,
        type: 'sales',
        amount: monthlyLog.totalMonthlySales,
        currency: 'NPR',
        description: `Monthly Sales Summary - ${monthlyLog.productName} (${monthlyLog.month}/${monthlyLog.year})`,
        date: new Date(monthlyLog.year, monthlyLog.month - 1, 1),
        status: 'completed',
        reference: `MONTHLY-SUMMARY-${monthlyLog.id}`,
        productId: monthlyLog.productId,
        productName: monthlyLog.productName,
      };

      allNewTransactions.push(summaryTransaction, ...newTransactions);
    });

    setTransactions(prev => [...allNewTransactions, ...prev]);
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Transaction Log</h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowMonthlyLogSheet(true)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Monthly Log Sheet
            </button>
            <button
              onClick={() => setShowDailySalesSheet(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Daily Sales Sheet
            </button>
            <button
              onClick={() => setShowSalesForm(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Quick Sales Entry
            </button>
            <button
              onClick={exportTransactions}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Credits</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(filteredTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0))}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Debits</p>
                <p className="text-lg font-semibold text-red-600">
                  {formatCurrency(Math.abs(filteredTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)))}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Net Balance</p>
                <p className={`text-lg font-semibold ${getTotalAmount() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(getTotalAmount())}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setTypeFilter('all');
                  setStatusFilter('all');
                  setSearchTerm('');
                  setDateFilter('all');
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(transaction.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.description}
                      {transaction.orderId && (
                        <div className="text-xs text-gray-500">Order: {transaction.orderId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                        {transaction.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.reference || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Sales Log Form Modal */}
        <SalesLogForm
          isOpen={showSalesForm}
          onClose={() => setShowSalesForm(false)}
          onSubmit={handleAddSalesTransaction}
          distributorId={user?.distributorId || ''}
        />

        {/* Daily Sales Sheet Modal */}
        <DailySalesSheetForm
          isOpen={showDailySalesSheet}
          onClose={() => setShowDailySalesSheet(false)}
          onSubmit={handleSubmitDailySalesSheet}
          distributorId={user?.distributorId || ''}
        />

        {/* Monthly Log Sheet Modal */}
        <MonthlyLogSheetForm
          isOpen={showMonthlyLogSheet}
          onClose={() => setShowMonthlyLogSheet(false)}
          onSubmit={handleSubmitMonthlyLogSheet}
          distributorId={user?.distributorId || ''}
        />
      </div>
    </div>
  );
}
