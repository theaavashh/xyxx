'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Save, 
  FileText, 
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react';
import { JournalEntry as JournalEntryType, JournalLineItem, Account } from '@/types';
import { formatCurrency, formatDate, formatDateNepali, formatFiscalYear, getNepaliMonthName } from '@/lib/utils';
import { journalEntryService, accountsService } from '@/services/accounting.service';
import toast from 'react-hot-toast';

interface JournalLineItemForm {
  id?: string;
  accountCode: string; // For form input (user selects by code)
  accountName: string; // For display purposes
  description: string;
  debitAmount: number;
  creditAmount: number;
}

interface CreateJournalEntryRequest {
  date: Date | string; // Accept both Date and string for flexibility
  journalNumber: string;
  companyName: string;
  description: string;
  entries: {
    accountId: string;
    description: string;
    debitAmount: number;
    creditAmount: number;
  }[];
  totalDebit: number;
  totalCredit: number;
  status: 'DRAFT' | 'POSTED';
  createdById: string;
}

interface JournalEntryForm {
  date: string;
  companyName: string;
  description: string;
  entries: JournalLineItemForm[];
}

export default function JournalEntry() {
  const [journalEntries, setJournalEntries] = useState<JournalEntryType[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryType | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState<JournalEntryForm>({
    date: new Date().toISOString().split('T')[0],
    companyName: '',
    description: '',
    entries: [
      { accountCode: '', accountName: '', description: '', debitAmount: 0, creditAmount: 0 },
      { accountCode: '', accountName: '', description: '', debitAmount: 0, creditAmount: 0 }
    ]
  });

  const [accounts, setAccounts] = useState<Account[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [entries, accountsData] = await Promise.all([
          journalEntryService.getJournalEntries(),
          accountsService.getAccounts()
        ]);
        
        // Handle API response structure - ensure we get arrays
        const journalEntriesArray = Array.isArray(entries) ? entries : [];
        const accountsArray = Array.isArray(accountsData) ? accountsData : [];
        
        setJournalEntries(journalEntriesArray);
        setAccounts(accountsArray);
        
        console.log('Fetched journal entries:', journalEntriesArray);
        console.log('Fetched accounts:', accountsArray);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
        // Set empty arrays on error to prevent filter errors
        setJournalEntries([]);
        setAccounts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAccountSelect = (index: number, accountCode: string) => {
    const account = accounts.find(acc => acc.code === accountCode);
    if (account) {
      const newEntries = [...formData.entries];
      newEntries[index] = {
        ...newEntries[index],
        accountCode: account.code,
        accountName: account.name
      };
      setFormData({ ...formData, entries: newEntries });
    }
  };

  const handleAmountChange = (index: number, type: 'debit' | 'credit', value: number) => {
    const newEntries = [...formData.entries];
    if (type === 'debit') {
      newEntries[index].debitAmount = value;
      newEntries[index].creditAmount = 0;
    } else {
      newEntries[index].creditAmount = value;
      newEntries[index].debitAmount = 0;
    }
    setFormData({ ...formData, entries: newEntries });
  };

  const addJournalLine = () => {
    setFormData({
      ...formData,
      entries: [
        ...formData.entries,
        { accountCode: '', accountName: '', description: '', debitAmount: 0, creditAmount: 0 }
      ]
    });
  };

  const removeJournalLine = (index: number) => {
    if (formData.entries.length > 2) {
      const newEntries = formData.entries.filter((_, i) => i !== index);
      setFormData({ ...formData, entries: newEntries });
    }
  };

  const calculateTotals = () => {
    const totalDebit = formData.entries.reduce((sum, entry) => sum + (entry.debitAmount || 0), 0);
    const totalCredit = formData.entries.reduce((sum, entry) => sum + (entry.creditAmount || 0), 0);
    return { totalDebit, totalCredit };
  };

  const validateForm = () => {
    if (!formData.companyName.trim()) {
      toast.error('Company/Individual name is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return false;
    }
    
    const { totalDebit, totalCredit } = calculateTotals();
    if (totalDebit === 0 || totalCredit === 0) {
      toast.error('At least one debit and one credit entry is required');
      return false;
    }
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      toast.error('Total debits must equal total credits');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const { totalDebit, totalCredit } = calculateTotals();
      
      // Prepare the data for the API
      const journalEntryData: CreateJournalEntryRequest = {
        date: new Date(formData.date).toISOString(), // Ensure proper ISO format for Prisma
        journalNumber: `JE${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
        companyName: formData.companyName,
        description: formData.description,
        entries: formData.entries.map((entry) => {
          // Find the actual account by code to get the real ID
          const account = accounts.find(acc => acc.code === entry.accountCode);
          if (!account) {
            throw new Error(`Account with code ${entry.accountCode} not found`);
          }
          
          return {
            accountId: account.id, // Use the actual account ID from the database
            description: entry.description,
            debitAmount: entry.debitAmount,
            creditAmount: entry.creditAmount
          };
        }),
        totalDebit,
        totalCredit,
        status: 'DRAFT' as const,
        createdById: 'cmf13bjjw0000xz0gnotkjt4c' // TODO: Get from auth context - using admin user ID for now
      };
      
      const newEntry = await journalEntryService.createJournalEntry(journalEntryData);
      
      if (newEntry) {
        setJournalEntries([newEntry, ...journalEntries]);
        setIsCreateModalOpen(false);
        resetForm();
        toast.success('Journal entry created successfully');
      }
    } catch (error) {
      console.error('Error creating journal entry:', error);
      toast.error('Failed to create journal entry');
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      companyName: '',
      description: '',
      entries: [
        { accountCode: '', accountName: '', description: '', debitAmount: 0, creditAmount: 0 },
        { accountCode: '', accountName: '', description: '', debitAmount: 0, creditAmount: 0 }
      ]
    });
  };

  const handleViewEntry = (entry: JournalEntryType) => {
    setSelectedEntry(entry);
    setIsViewModalOpen(true);
  };

  const handlePostEntry = (entryId: string) => {
    setJournalEntries(journalEntries.map(entry => 
      entry.id === entryId 
        ? { ...entry, status: 'POSTED' as const }
        : entry
    ));
    toast.success('Journal entry posted successfully');
  };

  const filteredEntries = (Array.isArray(journalEntries) ? journalEntries : []).filter(entry => {
    const matchesSearch = 
      entry.journalNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.entries.some(e => e.account?.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || entry.status.toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const { totalDebit, totalCredit } = calculateTotals();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading journal entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journal Entries</h1>
          <p className="text-gray-600">Record double-entry accounting transactions</p>
          <div className="text-sm text-gray-500 mt-1">
            Current Fiscal Year: {formatFiscalYear(new Date())} • {getNepaliMonthName(new Date())} {new Date().getFullYear()}
          </div>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={accounts.length === 0}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Journal Entry
          {accounts.length === 0 && <span className="ml-2 text-xs">(Loading accounts...)</span>}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search journal entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="POSTED">Posted</option>
          </select>
        </div>
      </div>

      {/* Journal Entries List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No journal entries found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first journal entry'
              }
            </p>
            {!searchTerm && statusFilter === 'ALL' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create First Entry
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Journal #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company/Individual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{entry.journalNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{formatDate(entry.date)}</div>
                      <div className="text-xs text-gray-500">{formatDateNepali(entry.date)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {entry.companyName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {entry.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(entry.totalDebit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            entry.status === 'POSTED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {entry.status === 'POSTED' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      )}
                      {entry.status === 'POSTED' ? 'Posted' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewEntry(entry)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {entry.status === 'DRAFT' && (
                        <button
                          onClick={() => handlePostEntry(entry.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Create Journal Entry Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Create Journal Entry</h2>
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Entry Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(new Date(formData.date))} • {formatFiscalYear(new Date(formData.date))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company/Individual Name *
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter company or individual name..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Journal Number
                    </label>
                    <input
                      type="text"
                      value={`JE${new Date().getFullYear()}${String(Date.now()).slice(-6)}`}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter journal entry description..."
                  />
                </div>

                {/* Journal Lines */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Journal Lines</h3>
                    <button
                      onClick={addJournalLine}
                      className="inline-flex items-center px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Line
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.entries.map((entry, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account *
                          </label>
                          <select
                            value={entry.accountCode}
                            onChange={(e) => handleAccountSelect(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Select Account</option>
                            {accounts.map((account) => (
                              <option key={account.code} value={account.code}>
                                {account.code} - {account.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <input
                            type="text"
                            value={entry.description}
                            onChange={(e) => {
                              const newEntries = [...formData.entries];
                              newEntries[index].description = e.target.value;
                              setFormData({ ...formData, entries: newEntries });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Line description..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Debit
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={entry.debitAmount || ''}
                            onChange={(e) => handleAmountChange(index, 'debit', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Credit
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={entry.creditAmount || ''}
                            onChange={(e) => handleAmountChange(index, 'credit', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="0.00"
                          />
                        </div>
                        {formData.entries.length > 2 && (
                          <div className="flex items-end">
                            <button
                              onClick={() => removeJournalLine(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Total Debit:</span>
                        <span className="ml-2 text-lg font-semibold text-gray-900">
                          {formatCurrency(totalDebit)}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Total Credit:</span>
                        <span className="ml-2 text-lg font-semibold text-gray-900">
                          {formatCurrency(totalCredit)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-sm font-medium text-gray-700">Balance:</span>
                      <span className={`ml-2 text-sm font-medium ${
                        Math.abs(totalDebit - totalCredit) < 0.01 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {Math.abs(totalDebit - totalCredit) < 0.01 
                          ? 'Balanced ✓' 
                          : `Unbalanced: ${formatCurrency(Math.abs(totalDebit - totalCredit))}`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={Math.abs(totalDebit - totalCredit) > 0.01}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-2 inline" />
                  Create Entry
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Journal Entry Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Journal Entry Details</h2>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                <div className="mt-2 flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{selectedEntry.journalNumber}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        selectedEntry.status === 'POSTED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                                          {selectedEntry.status === 'POSTED' ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 mr-1" />
                    )}
                    {selectedEntry.status.charAt(0).toUpperCase() + selectedEntry.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Entry Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedEntry.date)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedEntry.totalDebit)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Company/Individual</label>
                  <p className="text-sm text-gray-900">{selectedEntry.companyName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-900">{selectedEntry.description}</p>
                </div>

                {/* Journal Lines */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Journal Lines</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Account
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Description
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Debit
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Credit
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedEntry.entries.map((line) => (
                          <tr key={line.id}>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {line.account?.code || 'N/A'} - {line.account?.name || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {line.description}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {line.debitAmount > 0 ? formatCurrency(line.debitAmount) : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {line.creditAmount > 0 ? formatCurrency(line.creditAmount) : '-'}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-medium">
                          <td colSpan={2} className="px-4 py-3 text-sm text-gray-900">
                            Totals
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {formatCurrency(selectedEntry.totalDebit)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {formatCurrency(selectedEntry.totalCredit)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
