'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Check, 
  Clock, 
  DollarSign,
  FileText,
  Building,
  Calendar
} from 'lucide-react';
import { mockVATBills } from '@/lib/mockData';
import { VATBill, VATBillForm } from '@/types';
import { formatCurrency, formatDate, getStatusColor, calculateVATAmount, generateBillNumber } from '@/lib/utils';
import toast from 'react-hot-toast';

const vatBillSchema = yup.object({
  billNumber: yup.string().required('Bill number is required'),
  vendorName: yup.string().required('Vendor name is required'),
  vendorPAN: yup.string().required('Vendor PAN is required'),
  billDate: yup.string().required('Bill date is required'),
  description: yup.string().required('Description is required'),
  taxableAmount: yup.number().positive('Amount must be positive').required('Taxable amount is required'),
  vatRate: yup.number().min(0).max(100).required('VAT rate is required'),
  billType: yup.string().required('Bill type is required')
});

export default function VATBills() {
  const [bills, setBills] = useState<VATBill[]>(mockVATBills);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBillType, setSelectedBillType] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedBill, setSelectedBill] = useState<VATBill | null>(null);
  const [showBillDetails, setShowBillDetails] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<VATBillForm>({
    resolver: yupResolver(vatBillSchema),
    defaultValues: {
      billNumber: generateBillNumber(),
      vatRate: 13 // Default VAT rate in Nepal
    }
  });

  const taxableAmount = watch('taxableAmount');
  const vatRate = watch('vatRate');
  const vatAmount = taxableAmount && vatRate ? calculateVATAmount(taxableAmount, vatRate) : 0;
  const totalAmount = (taxableAmount || 0) + vatAmount;

  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.vendorPAN.includes(searchTerm);
    
    const matchesStatus = selectedStatus === 'all' || bill.status === selectedStatus;
    const matchesBillType = selectedBillType === 'all' || bill.billType === selectedBillType;
    
    return matchesSearch && matchesStatus && matchesBillType;
  });

  const onSubmit = async (data: VATBillForm) => {
    try {
      const newBill: VATBill = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        billDate: new Date(data.billDate),
        vatAmount: calculateVATAmount(data.taxableAmount, data.vatRate),
        totalAmount: data.taxableAmount + calculateVATAmount(data.taxableAmount, data.vatRate),
        status: 'draft',
        enteredBy: 'current-user', // In real app, this would be the logged-in user
        enteredAt: new Date()
      };

      setBills(prev => [newBill, ...prev]);
      toast.success('VAT bill created successfully!');
      reset();
      setShowCreateForm(false);
    } catch (error) {
      toast.error('Failed to create VAT bill');
    }
  };

  const handleApproveBill = (billId: string) => {
    setBills(prev => prev.map(bill => 
      bill.id === billId 
        ? { ...bill, status: 'approved', approvedBy: 'current-user', approvedAt: new Date() }
        : bill
    ));
    toast.success('VAT bill approved successfully!');
  };

  const handleViewBill = (bill: VATBill) => {
    setSelectedBill(bill);
    setShowBillDetails(true);
  };

  const billStats = {
    total: bills.length,
    draft: bills.filter(b => b.status === 'draft').length,
    approved: bills.filter(b => b.status === 'approved').length,
    paid: bills.filter(b => b.status === 'paid').length,
    totalAmount: bills.reduce((sum, bill) => sum + bill.totalAmount, 0),
    totalVAT: bills.reduce((sum, bill) => sum + bill.vatAmount, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">VAT Bills Management</h1>
          <p className="text-gray-600 mt-1">Manage VAT bills and tax compliance</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create VAT Bill
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Receipt className="h-6 w-6 text-blue-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{billStats.total}</p>
              <p className="text-xs text-gray-600">Total Bills</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-yellow-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{billStats.draft}</p>
              <p className="text-xs text-gray-600">Draft</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Check className="h-6 w-6 text-green-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{billStats.approved}</p>
              <p className="text-xs text-gray-600">Approved</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 text-blue-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{billStats.paid}</p>
              <p className="text-xs text-gray-600">Paid</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-bold text-gray-900">{formatCurrency(billStats.totalAmount).replace('NPR ', '')}</p>
              <p className="text-xs text-gray-600">Total Amount</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Receipt className="h-6 w-6 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-bold text-gray-900">{formatCurrency(billStats.totalVAT).replace('NPR ', '')}</p>
              <p className="text-xs text-gray-600">Total VAT</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search bills, vendors, or PAN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
              />
            </div>
          </div>
          
          <div className="lg:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
          
          <div className="lg:w-48">
            <select
              value={selectedBillType}
              onChange={(e) => setSelectedBillType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
            >
              <option value="all">All Types</option>
              <option value="purchase">Purchase</option>
              <option value="sales">Sales</option>
              <option value="service">Service</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            VAT Bills ({filteredBills.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{bill.billNumber}</div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(bill.billDate)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{bill.description}</div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{bill.vendorName}</div>
                      <div className="text-sm text-gray-500">PAN: {bill.vendorPAN}</div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">Taxable: {formatCurrency(bill.taxableAmount)}</div>
                      <div className="text-sm text-gray-500">VAT ({bill.vatRate}%): {formatCurrency(bill.vatAmount)}</div>
                      <div className="text-sm font-medium text-gray-900">Total: {formatCurrency(bill.totalAmount)}</div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      {bill.billType}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </span>
                      
                      {bill.status === 'draft' && (
                        <button
                          onClick={() => handleApproveBill(bill.id)}
                          className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewBill(bill)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredBills.length === 0 && (
            <div className="text-center py-12">
              <Receipt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No VAT bills found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or create a new VAT bill.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create VAT Bill Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New VAT Bill</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number</label>
                    <input
                      {...register('billNumber')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                      placeholder="Auto-generated"
                    />
                    {errors.billNumber && <p className="text-sm text-red-600 mt-1">{errors.billNumber.message}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bill Date</label>
                    <input
                      {...register('billDate')}
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                    />
                    {errors.billDate && <p className="text-sm text-red-600 mt-1">{errors.billDate.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                    <input
                      {...register('vendorName')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                      placeholder="Enter vendor name"
                    />
                    {errors.vendorName && <p className="text-sm text-red-600 mt-1">{errors.vendorName.message}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor PAN</label>
                    <input
                      {...register('vendorPAN')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                      placeholder="123456789"
                    />
                    {errors.vendorPAN && <p className="text-sm text-red-600 mt-1">{errors.vendorPAN.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                    placeholder="Describe the goods/services"
                  />
                  {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taxable Amount (NPR)</label>
                    <input
                      {...register('taxableAmount')}
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                      placeholder="0.00"
                    />
                    {errors.taxableAmount && <p className="text-sm text-red-600 mt-1">{errors.taxableAmount.message}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">VAT Rate (%)</label>
                    <input
                      {...register('vatRate')}
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                    />
                    {errors.vatRate && <p className="text-sm text-red-600 mt-1">{errors.vatRate.message}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bill Type</label>
                    <select
                      {...register('billType')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                    >
                      <option value="">Select Type</option>
                      <option value="purchase">Purchase</option>
                      <option value="sales">Sales</option>
                      <option value="service">Service</option>
                    </select>
                    {errors.billType && <p className="text-sm text-red-600 mt-1">{errors.billType.message}</p>}
                  </div>
                </div>

                {/* Amount Summary */}
                {taxableAmount && vatRate && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Amount Summary</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Taxable Amount:</span>
                        <span>{formatCurrency(taxableAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT ({vatRate}%):</span>
                        <span>{formatCurrency(vatAmount)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Total Amount:</span>
                        <span>{formatCurrency(totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Create VAT Bill
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
























