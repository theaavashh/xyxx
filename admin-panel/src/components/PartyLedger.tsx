'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  RefreshCw,
  UserPlus,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PartyTransaction {
  id: string;
  date: Date;
  description: string;
  reference: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  type: 'invoice' | 'payment' | 'credit_note' | 'debit_note';
}

interface Party {
  id: string;
  name: string;
  type: 'customer' | 'supplier';
  email: string;
  phone: string;
  address: string;
  openingBalance: number;
  currentBalance: number;
  creditLimit: number;
  isActive: boolean;
  lastTransactionDate: Date;
}

export default function PartyLedger() {
  const [selectedParty, setSelectedParty] = useState<string>('');
  const [partyType, setPartyType] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState<PartyTransaction[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockParties: Party[] = [
      {
        id: '1',
        name: 'ABC Distribution Pvt. Ltd.',
        type: 'customer',
        email: 'info@abcdistribution.com',
        phone: '01-4444444',
        address: 'Kathmandu, Nepal',
        openingBalance: 50000,
        currentBalance: 75000,
        creditLimit: 100000,
        isActive: true,
        lastTransactionDate: new Date('2024-08-29')
      },
      {
        id: '2',
        name: 'XYZ Suppliers Ltd.',
        type: 'supplier',
        email: 'contact@xyzsuppliers.com',
        phone: '01-5555555',
        address: 'Lalitpur, Nepal',
        openingBalance: 0,
        currentBalance: -25000,
        creditLimit: 50000,
        isActive: true,
        lastTransactionDate: new Date('2024-08-28')
      },
      {
        id: '3',
        name: 'Nepal Trading Co.',
        type: 'customer',
        email: 'sales@nepaltrading.com',
        phone: '01-6666666',
        address: 'Pokhara, Nepal',
        openingBalance: 30000,
        currentBalance: 45000,
        creditLimit: 75000,
        isActive: true,
        lastTransactionDate: new Date('2024-08-27')
      },
      {
        id: '4',
        name: 'Raw Material Suppliers Ltd.',
        type: 'supplier',
        email: 'info@rawmaterials.com',
        phone: '01-7777777',
        address: 'Biratnagar, Nepal',
        openingBalance: 0,
        currentBalance: -40000,
        creditLimit: 80000,
        isActive: true,
        lastTransactionDate: new Date('2024-08-26')
      }
    ];

    const mockTransactions: PartyTransaction[] = [
      { id: '1', date: new Date('2024-08-25'), description: 'Opening Balance', reference: 'OB', debitAmount: 0, creditAmount: 0, balance: 50000, type: 'invoice' },
      { id: '2', date: new Date('2024-08-26'), description: 'Sales Invoice', reference: 'SI001', debitAmount: 25000, creditAmount: 0, balance: 75000, type: 'invoice' },
      { id: '3', date: new Date('2024-08-27'), description: 'Customer Payment', reference: 'CP001', debitAmount: 0, creditAmount: 20000, balance: 55000, type: 'payment' },
      { id: '4', date: new Date('2024-08-28'), description: 'Credit Note', reference: 'CN001', debitAmount: 0, creditAmount: 5000, balance: 50000, type: 'credit_note' },
      { id: '5', date: new Date('2024-08-29'), description: 'Sales Invoice', reference: 'SI002', debitAmount: 25000, creditAmount: 0, balance: 75000, type: 'invoice' }
    ];

    setParties(mockParties);
    setTransactions(mockTransactions);
  }, []);

  const handlePartyChange = (partyId: string) => {
    setSelectedParty(partyId);
    // In a real app, you would fetch transactions for the selected party
  };

  const handleSearch = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const exportPartyLedger = () => {
    // Export functionality would go here
    console.log('Exporting party ledger...');
  };

  const filteredParties = parties.filter(party => {
    const matchesType = partyType === 'all' || party.type === partyType;
    const matchesSearch = party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         party.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const selectedPartyData = parties.find(party => party.id === selectedParty);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getPartyTypeColor = (type: string) => {
    return type === 'customer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const getBalanceColor = (balance: number) => {
    return balance >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Party Ledger</h1>
          <p className="text-gray-600">Track customer and supplier account balances and transactions</p>
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
            onClick={exportPartyLedger}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
            <Download className="h-4 w-4 mr-2" />
            Export
        </button>
        </div>
      </div>

      {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Party Type
            </label>
            <select
              value={partyType}
              onChange={(e) => setPartyType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Parties</option>
              <option value="customer">Customers</option>
              <option value="supplier">Suppliers</option>
            </select>
          </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Party
            </label>
            <select
              value={selectedParty}
              onChange={(e) => handlePartyChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Party</option>
              {filteredParties.map((party) => (
                <option key={party.id} value={party.id}>
                  {party.name}
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
            placeholder="Search parties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
          </div>
        </div>
      </div>

      {/* Party Summary */}
      {selectedPartyData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedPartyData.name}
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPartyTypeColor(selectedPartyData.type)}`}>
              {selectedPartyData.type.charAt(0).toUpperCase() + selectedPartyData.type.slice(1)}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center mb-2">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Email</span>
              </div>
              <p className="text-sm text-gray-900">{selectedPartyData.email}</p>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Phone</span>
              </div>
              <p className="text-sm text-gray-900">{selectedPartyData.phone}</p>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Address</span>
              </div>
              <p className="text-sm text-gray-900">{selectedPartyData.address}</p>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Last Transaction</span>
              </div>
              <p className="text-sm text-gray-900">{formatDate(selectedPartyData.lastTransactionDate)}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Opening Balance</p>
              <p className={`text-lg font-bold ${getBalanceColor(selectedPartyData.openingBalance)}`}>
                {formatCurrency(Math.abs(selectedPartyData.openingBalance))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Current Balance</p>
              <p className={`text-lg font-bold ${getBalanceColor(selectedPartyData.currentBalance)}`}>
                {formatCurrency(Math.abs(selectedPartyData.currentBalance))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Credit Limit</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(selectedPartyData.creditLimit)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Status</p>
              <p className={`text-lg font-medium ${
                selectedPartyData.isActive ? 'text-green-600' : 'text-red-600'
              }`}>
                {selectedPartyData.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Parties List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Parties</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Party Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Balance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit Limit
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParties.map((party) => (
                <tr key={party.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                      <div>
                      <div className="font-medium text-gray-900">{party.name}</div>
                      <div className="text-sm text-gray-500">{party.address}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPartyTypeColor(party.type)}`}>
                      {party.type.charAt(0).toUpperCase() + party.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{party.email}</div>
                    <div className="text-sm text-gray-500">{party.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`font-medium ${getBalanceColor(party.currentBalance)}`}>
                      {formatCurrency(Math.abs(party.currentBalance))}
                      {party.currentBalance < 0 && ' (Cr)'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {formatCurrency(party.creditLimit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    <button
                      onClick={() => handlePartyChange(party.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="View Ledger"
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

      {/* Transactions List */}
      {selectedPartyData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
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
                        </tr>
                      </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(transaction.date)}
                              </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                  {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.reference}
                              </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === 'invoice' ? 'bg-blue-100 text-blue-800' :
                        transaction.type === 'payment' ? 'bg-green-100 text-green-800' :
                        transaction.type === 'credit_note' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {transaction.type.replace('_', ' ').charAt(0).toUpperCase() + transaction.type.replace('_', ' ').slice(1)}
                      </span>
                              </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {transaction.debitAmount > 0 ? formatCurrency(transaction.debitAmount) : '-'}
                              </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {transaction.creditAmount > 0 ? formatCurrency(transaction.creditAmount) : '-'}
                              </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                <span className={getBalanceColor(transaction.balance)}>
                                  {formatCurrency(Math.abs(transaction.balance))}
                                </span>
                              </td>
                            </tr>
                ))}
                      </tbody>
                    </table>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Total Parties</p>
              <p className="text-2xl font-bold text-gray-900">{filteredParties.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Total Receivables</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(filteredParties.filter(p => p.type === 'customer' && p.currentBalance > 0).reduce((sum, p) => sum + p.currentBalance, 0))}
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
              <p className="text-sm font-medium text-gray-700">Total Payables</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(Math.abs(filteredParties.filter(p => p.type === 'supplier' && p.currentBalance < 0).reduce((sum, p) => sum + p.currentBalance, 0)))}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-4">
              <UserPlus className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Active Parties</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredParties.filter(p => p.isActive).length}
              </p>
                  </div>
                </div>
              </div>
              </div>
    </div>
  );
}

