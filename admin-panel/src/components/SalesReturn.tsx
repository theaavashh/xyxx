'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, 
  Plus, 
  Trash2, 
  Save, 
  FileText,
  Calculator,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  Building,
  Download,
  Printer,
  User
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface SalesReturnItem {
  id?: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxableAmount: number;
  vatAmount: number;
  totalAmount: number;
  reason: string;
}

interface SalesReturn {
  id: string;
  returnNumber: string;
  date: Date;
  originalInvoiceNumber: string;
  customerName: string;
  customerPAN: string;
  customerVATNumber: string;
  customerAddress: string;
  items: SalesReturnItem[];
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  status: 'draft' | 'approved' | 'processed';
  notes?: string;
  enteredBy: string;
  enteredAt: Date;
}

export default function SalesReturn() {
  const [returns, setReturns] = useState<SalesReturn[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<SalesReturn | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    originalInvoiceNumber: '',
    customerName: '',
    customerPAN: '',
    customerVATNumber: '',
    customerAddress: '',
    items: [
      { productName: '', description: '', quantity: 1, unitPrice: 0, taxableAmount: 0, vatAmount: 0, totalAmount: 0, reason: '' }
    ],
    notes: ''
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockReturns: SalesReturn[] = [
      {
        id: '1',
        returnNumber: 'SR20240825001',
        date: new Date('2024-08-25'),
        originalInvoiceNumber: 'INV20240820001',
        customerName: 'ABC Distribution Pvt. Ltd.',
        customerPAN: '987654321',
        customerVATNumber: 'VAT987654',
        customerAddress: 'Kathmandu, Nepal',
        items: [
          {
            id: '1',
            productName: 'Defective Products',
            description: 'Products returned due to quality issues',
            quantity: 5,
            unitPrice: 1000,
            taxableAmount: 5000,
            vatAmount: 650,
            totalAmount: 5650,
            reason: 'Quality defect'
          }
        ],
        subtotal: 5000,
        vatAmount: 650,
        totalAmount: 5650,
        status: 'approved',
        notes: 'Customer reported quality issues with delivered products',
        enteredBy: 'admin',
        enteredAt: new Date('2024-08-25')
      }
    ];
    setReturns(mockReturns);
  }, []);

  const handleItemChange = (index: number, field: keyof SalesReturnItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate amounts
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? value : newItems[index].unitPrice;
      const taxableAmount = quantity * unitPrice;
      const vatAmount = taxableAmount * 0.13; // Nepal VAT rate 13%
      const totalAmount = taxableAmount + vatAmount;
      
      newItems[index] = {
        ...newItems[index],
        taxableAmount,
        vatAmount,
        totalAmount
      };
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { productName: '', description: '', quantity: 1, unitPrice: 0, taxableAmount: 0, vatAmount: 0, totalAmount: 0, reason: '' }
      ]
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.taxableAmount, 0);
    const vatAmount = formData.items.reduce((sum, item) => sum + item.vatAmount, 0);
    const totalAmount = subtotal + vatAmount;
    return { subtotal, vatAmount, totalAmount };
  };

  const { subtotal, vatAmount, totalAmount } = calculateTotals();

  const handleSubmit = (status: 'draft' | 'approved') => {
    if (!formData.customerName.trim()) {
      alert('Customer name is required');
      return;
    }

    if (formData.items.some(item => !item.productName.trim() || item.quantity <= 0 || item.unitPrice <= 0)) {
      alert('All items must have product name, quantity, and unit price');
      return;
    }

    const newReturn: SalesReturn = {
      id: `sr${Date.now()}`,
      returnNumber: `SR${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
      date: new Date(formData.date),
      originalInvoiceNumber: formData.originalInvoiceNumber,
      customerName: formData.customerName,
      customerPAN: formData.customerPAN,
      customerVATNumber: formData.customerVATNumber,
      customerAddress: formData.customerAddress,
      items: formData.items,
      subtotal,
      vatAmount,
      totalAmount,
      status,
      notes: formData.notes,
      enteredBy: 'admin',
      enteredAt: new Date()
    };

    setReturns([newReturn, ...returns]);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      originalInvoiceNumber: '',
      customerName: '',
      customerPAN: '',
      customerVATNumber: '',
      customerAddress: '',
      items: [
        { productName: '', description: '', quantity: 1, unitPrice: 0, taxableAmount: 0, vatAmount: 0, totalAmount: 0, reason: '' }
      ],
      notes: ''
    });
  };

  const filteredReturns = returns.filter(returnItem => {
    const matchesSearch = 
      returnItem.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.originalInvoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || returnItem.status.toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const printReturn = (returnItem: SalesReturn) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Sales Return - ${returnItem.returnNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .company-info { margin-bottom: 20px; }
              .return-details { margin-bottom: 20px; }
              .customer-info { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .totals { text-align: right; margin-top: 20px; }
              .footer { margin-top: 30px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>SALES RETURN</h1>
              <h2>${returnItem.returnNumber}</h2>
            </div>
            
            <div class="return-details">
              <p><strong>Date:</strong> ${formatDate(returnItem.date)}</p>
              <p><strong>Original Invoice:</strong> ${returnItem.originalInvoiceNumber}</p>
            </div>
            
            <div class="customer-info">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> ${returnItem.customerName}</p>
              <p><strong>Address:</strong> ${returnItem.customerAddress}</p>
              <p><strong>PAN:</strong> ${returnItem.customerPAN}</p>
              <p><strong>VAT Number:</strong> ${returnItem.customerVATNumber}</p>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Taxable Amount</th>
                  <th>VAT (13%)</th>
                  <th>Total</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                ${returnItem.items.map(item => `
                  <tr>
                    <td>${item.productName}</td>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.unitPrice)}</td>
                    <td>${formatCurrency(item.taxableAmount)}</td>
                    <td>${formatCurrency(item.vatAmount)}</td>
                    <td>${formatCurrency(item.totalAmount)}</td>
                    <td>${item.reason}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="totals">
              <p><strong>Subtotal: ${formatCurrency(returnItem.subtotal)}</strong></p>
              <p><strong>VAT (13%): ${formatCurrency(returnItem.vatAmount)}</strong></p>
              <p><strong>Total Amount: ${formatCurrency(returnItem.totalAmount)}</strong></p>
            </div>
            
            ${returnItem.notes ? `<div class="notes"><p><strong>Notes:</strong> ${returnItem.notes}</p></div>` : ''}
            
            <div class="footer">
              <p>Generated on: ${new Date().toLocaleString()}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Returns</h1>
          <p className="text-gray-600">Manage sales returns and refunds with Nepal VAT (13%) calculations</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          New Sales Return
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search sales returns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="APPROVED">Approved</option>
            <option value="PROCESSED">Processed</option>
          </select>
        </div>
      </div>

      {/* Sales Returns List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Original Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
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
              {filteredReturns.map((returnItem) => (
                <tr key={returnItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <RotateCcw className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{returnItem.returnNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(returnItem.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {returnItem.originalInvoiceNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {returnItem.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(returnItem.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      returnItem.status === 'processed' 
                        ? 'bg-green-100 text-green-800' 
                        : returnItem.status === 'approved'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {returnItem.status === 'processed' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : returnItem.status === 'approved' ? (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedReturn(returnItem);
                          setIsViewModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => printReturn(returnItem)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Print Return"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Sales Return Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
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
                <h2 className="text-xl font-semibold text-gray-900">Create Sales Return</h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Return Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return Number
                    </label>
                    <input
                      type="text"
                      value={`SR${new Date().getFullYear()}${String(Date.now()).slice(-6)}`}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Original Invoice Number *
                    </label>
                    <input
                      type="text"
                      value={formData.originalInvoiceNumber}
                      onChange={(e) => setFormData({ ...formData, originalInvoiceNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter original invoice number"
                    />
                  </div>
                </div>

                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Address
                    </label>
                    <input
                      type="text"
                      value={formData.customerAddress}
                      onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter customer address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer PAN
                    </label>
                    <input
                      type="text"
                      value={formData.customerPAN}
                      onChange={(e) => setFormData({ ...formData, customerPAN: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter PAN number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      VAT Number
                    </label>
                    <input
                      type="text"
                      value={formData.customerVATNumber}
                      onChange={(e) => setFormData({ ...formData, customerVATNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter VAT number"
                    />
                  </div>
                </div>

                {/* Return Items */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Return Items</h3>
                    <button
                      onClick={addItem}
                      className="inline-flex items-center px-3 py-1 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-8 gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product Name *
                          </label>
                          <input
                            type="text"
                            value={item.productName}
                            onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Product name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Description"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="0"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Price *
                          </label>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason *
                          </label>
                          <input
                            type="text"
                            value={item.reason}
                            onChange={(e) => handleItemChange(index, 'reason', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Return reason"
                          />
                        </div>
                        <div className="flex items-end">
                          {formData.items.length > 1 && (
                            <button
                              onClick={() => removeItem(index)}
                              className="p-2 text-red-600 hover:text-red-900"
                              title="Remove Item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Subtotal</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(subtotal)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">VAT (13%)</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(vatAmount)}</p>
                  </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Total Amount</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
                  </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">VAT Rate</p>
                      <p className="text-lg font-bold text-orange-600">13%</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter any additional notes..."
                  />
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
                  onClick={() => handleSubmit('draft')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSubmit('approved')}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Approve Return
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Sales Return Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedReturn && (
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
                  <h2 className="text-xl font-semibold text-gray-900">
                    Sales Return: {selectedReturn.returnNumber}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => printReturn(selectedReturn)}
                      className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Printer className="h-4 w-4 mr-1" />
                      Print
                    </button>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedReturn.status === 'processed' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedReturn.status === 'approved'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedReturn.status === 'processed' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : selectedReturn.status === 'approved' ? (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {selectedReturn.status.charAt(0).toUpperCase() + selectedReturn.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Return Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedReturn.date)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Original Invoice</label>
                    <p className="text-sm text-gray-900">{selectedReturn.originalInvoiceNumber}</p>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="text-sm text-gray-900">{selectedReturn.customerName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <p className="text-sm text-gray-900">{selectedReturn.customerAddress}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">PAN</label>
                      <p className="text-sm text-gray-900">{selectedReturn.customerPAN}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">VAT Number</label>
                      <p className="text-sm text-gray-900">{selectedReturn.customerVATNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Return Items */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Return Items</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Product
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Description
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Qty
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Unit Price
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Taxable Amount
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            VAT (13%)
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Total
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Reason
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedReturn.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.productName}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.description}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {formatCurrency(item.taxableAmount)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {formatCurrency(item.vatAmount)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {formatCurrency(item.totalAmount)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.reason}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-medium">
                          <td colSpan={4} className="px-4 py-3 text-sm text-gray-900">
                            Totals
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {formatCurrency(selectedReturn.subtotal)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {formatCurrency(selectedReturn.vatAmount)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {formatCurrency(selectedReturn.totalAmount)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            -
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {selectedReturn.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="text-sm text-gray-900">{selectedReturn.notes}</p>
                  </div>
                )}
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


