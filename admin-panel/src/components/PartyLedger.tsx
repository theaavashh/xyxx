'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  MapPin,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Building2,
  User,
  CreditCard,
  FileText,
  ChevronDown,
  MoreVertical,
  Copy,
  ExternalLink
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useParties, Party } from '@/hooks/useParties';

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

// Party interface is now imported from useParties hook

interface PartyFormData {
  name: string;
  type: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  openingBalance: number;
}

export default function PartyLedger() {
  const [selectedParty, setSelectedParty] = useState<string>('');
  const [partyType, setPartyType] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState<PartyTransaction[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<PartyFormData>({
    name: '',
    type: 'customer',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    openingBalance: 0
  });

  // Use the useParties hook for real API data
  const {
    parties,
    loading,
    error,
    createParty,
    updateParty,
    deleteParty,
    refreshParties
  } = useParties({
    type: partyType === 'all' ? undefined : partyType,
    search: searchTerm,
    isActive: true
  });

  // Mock transactions for demonstration (will be replaced with real API later)
  useEffect(() => {
    const mockTransactions: PartyTransaction[] = [
      { id: '1', date: new Date('2024-08-25'), description: 'Opening Balance', reference: 'OB', debitAmount: 0, creditAmount: 0, balance: 50000, type: 'invoice' },
      { id: '2', date: new Date('2024-08-26'), description: 'Sales Invoice', reference: 'SI001', debitAmount: 25000, creditAmount: 0, balance: 75000, type: 'invoice' },
      { id: '3', date: new Date('2024-08-27'), description: 'Customer Payment', reference: 'CP001', debitAmount: 0, creditAmount: 20000, balance: 55000, type: 'payment' },
      { id: '4', date: new Date('2024-08-28'), description: 'Credit Note', reference: 'CN001', debitAmount: 0, creditAmount: 5000, balance: 50000, type: 'credit_note' },
      { id: '5', date: new Date('2024-08-29'), description: 'Sales Invoice', reference: 'SI002', debitAmount: 25000, creditAmount: 0, balance: 75000, type: 'invoice' }
    ];

    setTransactions(mockTransactions);
  }, []);

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePartyChange = (partyId: string) => {
    setSelectedParty(partyId);
    // In a real app, you would fetch transactions for the selected party
  };

  const handleSearch = () => {
    // The search is handled automatically by the useParties hook
    // when searchTerm changes
  };

  const exportPartyLedger = () => {
    // Export functionality would go here
    console.log('Exporting party ledger...');
  };

  const handleCreateParty = () => {
    setShowCreateForm(true);
    setEditingParty(null);
    setFormData({
      name: '',
      type: 'customer',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      openingBalance: 0
    });
  };

  const handleEditParty = (party: Party) => {
    setEditingParty(party);
    setShowCreateForm(true);
    setFormData({
      name: party.partyName,
      type: party.partyType,
      contactPerson: party.contactPerson || '',
      email: party.email || '',
      phone: party.phone || '',
      address: party.address || '',
      openingBalance: party.openingBalance
    });
  };

  const handleSaveParty = async () => {
    try {
      if (editingParty) {
        // Update existing party
        await updateParty(editingParty.id, {
          partyName: formData.name,
          partyType: formData.type as Party['partyType'],
          contactPerson: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          openingBalance: formData.openingBalance,
        });
      } else {
        // Create new party
        await createParty({
          partyName: formData.name,
          partyType: formData.type as Party['partyType'],
          contactPerson: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          openingBalance: formData.openingBalance,
          isActive: true,
        });
      }
      setShowCreateForm(false);
      setEditingParty(null);
    } catch (error) {
      console.error('Error saving party:', error);
    }
  };

  const handleDeleteParty = async (partyId: string) => {
    if (confirm('Are you sure you want to delete this party?')) {
      await deleteParty(partyId);
    }
  };

  const handleDropdownToggle = (partyId: string) => {
    setOpenDropdownId(openDropdownId === partyId ? null : partyId);
  };

  const handleCopyPartyInfo = (party: Party) => {
    const partyInfo = `Name: ${party.partyName}\nType: ${party.partyType}\nContact: ${party.contactPerson}\nEmail: ${party.email}\nPhone: ${party.phone}\nAddress: ${party.address}\nBalance: ${formatCurrency(party.currentBalance)}`;
    navigator.clipboard.writeText(partyInfo);
    setOpenDropdownId(null);
  };

  const handleViewDetails = (party: Party) => {
    setSelectedParty(party.id);
    setOpenDropdownId(null);
  };

  const handleQuickEdit = (party: Party) => {
    handleEditParty(party);
    setOpenDropdownId(null);
  };

  const partyTypes = [
    { value: 'customer', label: 'Customer', icon: User },
    { value: 'supplier', label: 'Supplier', icon: Building2 },
    { value: 'sundry_debtor', label: 'Sundry Debtor', icon: CreditCard },
    { value: 'sundry_creditor', label: 'Sundry Creditor', icon: FileText },
    { value: 'bank', label: 'Bank', icon: Building2 },
    { value: 'cash', label: 'Cash', icon: CreditCard },
    { value: 'expense', label: 'Expense', icon: FileText },
    { value: 'income', label: 'Income', icon: TrendingUp },
    { value: 'asset', label: 'Asset', icon: Building2 },
    { value: 'liability', label: 'Liability', icon: TrendingDown }
  ];

  const accountGroups = [
    'Sundry Debtors',
    'Sundry Creditors', 
    'Bank Accounts',
    'Cash Accounts',
    'Direct Expenses',
    'Indirect Expenses',
    'Direct Income',
    'Indirect Income',
    'Fixed Assets',
    'Current Assets',
    'Current Liabilities',
    'Long Term Liabilities'
  ];

  // Parties are already filtered by the useParties hook based on type and search
  const filteredParties = parties || [];

  const selectedPartyData = parties?.find(party => party.id === selectedParty);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getPartyTypeColor = (type: string) => {
    const colors = {
      customer: 'bg-blue-100 text-blue-800',
      supplier: 'bg-green-100 text-green-800',
      sundry_debtor: 'bg-purple-100 text-purple-800',
      sundry_creditor: 'bg-orange-100 text-orange-800',
      bank: 'bg-indigo-100 text-indigo-800',
      cash: 'bg-yellow-100 text-yellow-800',
      expense: 'bg-red-100 text-red-800',
      income: 'bg-emerald-100 text-emerald-800',
      asset: 'bg-cyan-100 text-cyan-800',
      liability: 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
            onClick={refreshParties}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            title="Refresh parties"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleCreateParty}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Party
          </button>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <Search className="h-4 w-4 mr-2" />
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
              <option value="sundry_debtor">Sundry Debtors</option>
              <option value="sundry_creditor">Sundry Creditors</option>
              <option value="bank">Bank Accounts</option>
              <option value="cash">Cash Accounts</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
              <option value="asset">Assets</option>
              <option value="liability">Liabilities</option>
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
                  {party.partyName}
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
              {selectedPartyData.partyName}
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPartyTypeColor(selectedPartyData.partyType)}`}>
              {selectedPartyData.partyType.charAt(0).toUpperCase() + selectedPartyData.partyType.slice(1)}
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
                <User className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Contact Person</span>
              </div>
              <p className="text-sm text-gray-900">{selectedPartyData.contactPerson || 'N/A'}</p>
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
              <p className="text-sm font-medium text-gray-700">Created Date</p>
              <p className="text-lg font-bold text-gray-900">
                {formatDate(selectedPartyData.createdAt)}
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
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParties.map((party) => (
                <tr key={party.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => handleDropdownToggle(party.id)}
                        className="flex items-center justify-between w-full text-left hover:bg-gray-100 rounded-md p-2 -m-2 group"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 group-hover:text-indigo-600">
                            {party.partyName}
                          </div>
                          <div className="text-sm text-gray-500">{party.address}</div>
                        </div>
                        <ChevronDown 
                          className={`h-4 w-4 text-gray-400 transition-transform ${
                            openDropdownId === party.id ? 'rotate-180' : ''
                          }`} 
                        />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {openDropdownId === party.id && (
                        <div className="absolute left-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                          <div className="py-1">
                            {/* Party Details */}
                            <div className="px-4 py-3 border-b border-gray-100">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  {party.partyType === 'customer' ? (
                                    <User className="h-8 w-8 text-blue-500" />
                                  ) : party.partyType === 'supplier' ? (
                                    <Building2 className="h-8 w-8 text-green-500" />
                                  ) : (
                                    <CreditCard className="h-8 w-8 text-purple-500" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {party.partyName}
                                  </p>
                                  <p className="text-sm text-gray-500 capitalize">
                                    {party.partyType.replace('_', ' ')}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Contact Information */}
                            <div className="px-4 py-3 border-b border-gray-100">
                              <div className="space-y-2">
                                {party.contactPerson && (
                                  <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-600">{party.contactPerson}</span>
                                  </div>
                                )}
                                {party.email && (
                                  <div className="flex items-center space-x-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-600">{party.email}</span>
                                  </div>
                                )}
                                {party.phone && (
                                  <div className="flex items-center space-x-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-600">{party.phone}</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-2">
                                  <CreditCard className="h-4 w-4 text-gray-400" />
                                  <span className={`text-sm font-medium ${getBalanceColor(party.currentBalance)}`}>
                                    Balance: {formatCurrency(Math.abs(party.currentBalance))}
                                    {party.currentBalance < 0 && ' (Cr)'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="py-1">
                              <button
                                onClick={() => handleViewDetails(party)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Eye className="h-4 w-4 mr-3 text-gray-400" />
                                View Details
                              </button>
                              <button
                                onClick={() => handleQuickEdit(party)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="h-4 w-4 mr-3 text-gray-400" />
                                Quick Edit
                              </button>
                              <button
                                onClick={() => handleCopyPartyInfo(party)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Copy className="h-4 w-4 mr-3 text-gray-400" />
                                Copy Info
                              </button>
                              <button
                                onClick={() => handleDeleteParty(party.id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-3 text-red-400" />
                                Delete Party
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPartyTypeColor(party.partyType)}`}>
                      {party.partyType.charAt(0).toUpperCase() + party.partyType.slice(1)}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handlePartyChange(party.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View Ledger"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditParty(party)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Party"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteParty(party.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Party"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
                {formatCurrency(filteredParties.filter(p => p.partyType === 'customer' && p.currentBalance > 0).reduce((sum, p) => sum + p.currentBalance, 0))}
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
                {formatCurrency(Math.abs(filteredParties.filter(p => p.partyType === 'supplier' && p.currentBalance < 0).reduce((sum, p) => sum + p.currentBalance, 0)))}
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

      {/* Create/Edit Party Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingParty ? 'Edit Party' : 'Create New Party'}
                </h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Party Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Party Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter party name"
                    />
                  </div>

                  {/* Party Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Party Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {partyTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Contact Person */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter contact person name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email address"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter complete address"
                    />
                  </div>

                  {/* Opening Balance */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opening Balance
                    </label>
                    <input
                      type="number"
                      value={formData.openingBalance}
                      onChange={(e) => setFormData({...formData, openingBalance: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveParty}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingParty ? 'Update Party' : 'Create Party'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
              </div>
    </div>
  );
}

