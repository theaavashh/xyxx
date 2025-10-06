'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
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
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvoiceItem {
  id?: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxableAmount: number;
  vatAmount: number;
  totalAmount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  customerName: string;
  customerAddress: string;
  customerPAN: string;
  customerVATNumber: string;
  customerPhone: string;
  customerEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
  terms?: string;
  enteredBy: string;
  enteredAt: Date;
}

export default function Invoice() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    customerName: '',
    customerAddress: '',
    customerPAN: '',
    customerVATNumber: '',
    customerPhone: '',
    customerEmail: '',
    items: [
      { productName: '', description: '', quantity: 1, unitPrice: 0, taxableAmount: 0, vatAmount: 0, totalAmount: 0 }
    ],
    notes: '',
    terms: 'Payment due within 30 days of invoice date.'
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockInvoices: Invoice[] = [
      {
        id: '1',
        invoiceNumber: 'INV20240825001',
        date: new Date('2024-08-25'),
        dueDate: new Date('2024-09-24'),
        customerName: 'ABC Distribution Pvt. Ltd.',
        customerAddress: 'Kathmandu, Nepal',
        customerPAN: '987654321',
        customerVATNumber: 'VAT987654',
        customerPhone: '01-4444444',
        customerEmail: 'info@abcdistribution.com',
        items: [
          {
            id: '1',
            productName: 'Product A',
            description: 'High quality product A',
            quantity: 10,
            unitPrice: 1000,
            taxableAmount: 10000,
            vatAmount: 1300,
            totalAmount: 11300
          },
          {
            id: '2',
            productName: 'Product B',
            description: 'Premium product B',
            quantity: 5,
            unitPrice: 2000,
            taxableAmount: 10000,
            vatAmount: 1300,
            totalAmount: 11300
          }
        ],
        subtotal: 20000,
        vatAmount: 2600,
        totalAmount: 22600,
        status: 'sent',
        notes: 'Thank you for your business!',
        terms: 'Payment due within 30 days of invoice date.',
        enteredBy: 'admin',
        enteredAt: new Date('2024-08-25')
      }
    ];
    setInvoices(mockInvoices);
  }, []);

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
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
        { productName: '', description: '', quantity: 1, unitPrice: 0, taxableAmount: 0, vatAmount: 0, totalAmount: 0 }
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

  const handleSubmit = (status: 'draft' | 'sent') => {
    if (!formData.customerName.trim()) {
      alert('Customer name is required');
      return;
    }

    if (formData.items.some(item => !item.productName.trim() || item.quantity <= 0 || item.unitPrice <= 0)) {
      alert('All items must have product name, quantity, and unit price');
      return;
    }

    const newInvoice: Invoice = {
      id: `inv${Date.now()}`,
      invoiceNumber: `INV${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
      date: new Date(formData.date),
      dueDate: new Date(formData.dueDate),
      customerName: formData.customerName,
      customerAddress: formData.customerAddress,
      customerPAN: formData.customerPAN,
      customerVATNumber: formData.customerVATNumber,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      items: formData.items,
      subtotal,
      vatAmount,
      totalAmount,
      status,
      notes: formData.notes,
      terms: formData.terms,
      enteredBy: 'admin',
      enteredAt: new Date()
    };

    setInvoices([newInvoice, ...invoices]);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customerName: '',
      customerAddress: '',
      customerPAN: '',
      customerVATNumber: '',
      customerPhone: '',
      customerEmail: '',
      items: [
        { productName: '', description: '', quantity: 1, unitPrice: 0, taxableAmount: 0, vatAmount: 0, totalAmount: 0 }
      ],
      notes: '',
      terms: 'Payment due within 30 days of invoice date.'
    });
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || invoice.status.toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const printInvoice = (invoice: Invoice) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - ${invoice.invoiceNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
              .company-info { margin-bottom: 30px; }
              .invoice-details { margin-bottom: 30px; }
              .customer-info { margin-bottom: 30px; }
              .billing-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .totals { text-align: right; margin-top: 20px; }
              .footer { margin-top: 30px; text-align: center; }
              .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
              .status.draft { background-color: #fef3c7; color: #92400e; }
              .status.sent { background-color: #dbeafe; color: #1e40af; }
              .status.paid { background-color: #d1fae5; color: #065f46; }
              .status.overdue { background-color: #fee2e2; color: #991b1b; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>INVOICE</h1>
              <h2>${invoice.invoiceNumber}</h2>
              <div class="status ${invoice.status}">${invoice.status.toUpperCase()}</div>
            </div>
            
            <div class="billing-info">
              <div class="company-info">
                <h3>From:</h3>
                <p><strong>Your Company Name</strong></p>
                <p>Your Company Address</p>
                <p>Kathmandu, Nepal</p>
                <p>Phone: +977-1-1234567</p>
                <p>Email: info@yourcompany.com</p>
                <p>PAN: 123456789</p>
                <p>VAT: VAT123456</p>
              </div>
              
              <div class="customer-info">
                <h3>Bill To:</h3>
                <p><strong>${invoice.customerName}</strong></p>
                <p>${invoice.customerAddress}</p>
                <p>Phone: ${invoice.customerPhone}</p>
                <p>Email: ${invoice.customerEmail}</p>
                <p>PAN: ${invoice.customerPAN}</p>
                <p>VAT: ${invoice.customerVATNumber}</p>
              </div>
            </div>
            
            <div class="invoice-details">
              <p><strong>Invoice Date:</strong> ${formatDate(invoice.date)}</p>
              <p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
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
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr>
                    <td>${item.productName}</td>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.unitPrice)}</td>
                    <td>${formatCurrency(item.taxableAmount)}</td>
                    <td>${formatCurrency(item.vatAmount)}</td>
                    <td>${formatCurrency(item.totalAmount)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="totals">
              <p><strong>Subtotal: ${formatCurrency(invoice.subtotal)}</strong></p>
              <p><strong>VAT (13%): ${formatCurrency(invoice.vatAmount)}</strong></p>
              <p><strong>Total Amount: ${formatCurrency(invoice.totalAmount)}</strong></p>
            </div>
            
            ${invoice.notes ? `<div class="notes"><p><strong>Notes:</strong> ${invoice.notes}</p></div>` : ''}
            
            <div class="terms">
              <p><strong>Terms:</strong> ${invoice.terms}</p>
            </div>
            
            <div class="footer">
              <p>Generated on: ${new Date().toLocaleString()}</p>
              <p>Thank you for your business!</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">Create and manage invoices with Nepal VAT (13%) calculations</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Invoice
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
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
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(invoice.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {invoice.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(invoice.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      invoice.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : invoice.status === 'sent'
                        ? 'bg-blue-100 text-blue-800'
                        : invoice.status === 'overdue'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status === 'paid' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : invoice.status === 'sent' ? (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      ) : invoice.status === 'overdue' ? (
                        <XCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setIsViewModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => printInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Print Invoice"
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

      {/* Create Invoice Modal */}
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
              className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Create Invoice</h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Invoice Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      value={`INV${new Date().getFullYear()}${String(Date.now()).slice(-6)}`}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter customer address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Email
                    </label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter email address"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter VAT number"
                    />
                  </div>
                </div>

                {/* Invoice Items */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
                    <button
                      onClick={addItem}
                      className="inline-flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product Name *
                          </label>
                          <input
                            type="text"
                            value={item.productName}
                            onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
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
                      <p className="text-lg font-bold text-green-600">13%</p>
                    </div>
                  </div>
                </div>

                {/* Notes and Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter any additional notes..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Terms
                    </label>
                    <textarea
                      value={formData.terms}
                      onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter payment terms..."
                    />
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
                  onClick={() => handleSubmit('draft')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSubmit('sent')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Send Invoice
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Invoice Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedInvoice && (
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
              className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Invoice: {selectedInvoice.invoiceNumber}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => printInvoice(selectedInvoice)}
                      className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Printer className="h-4 w-4 mr-1" />
                      Print
                    </button>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedInvoice.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedInvoice.status === 'sent'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedInvoice.status === 'overdue'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedInvoice.status === 'paid' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : selectedInvoice.status === 'sent' ? (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      ) : selectedInvoice.status === 'overdue' ? (
                        <XCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Invoice Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Invoice Date</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedInvoice.date)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedInvoice.dueDate)}</p>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.customerName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.customerAddress}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.customerPhone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.customerEmail}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">PAN</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.customerPAN}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">VAT Number</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.customerVATNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Invoice Items */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Items</h3>
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
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedInvoice.items.map((item) => (
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
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-medium">
                          <td colSpan={4} className="px-4 py-3 text-sm text-gray-900">
                            Totals
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {formatCurrency(selectedInvoice.subtotal)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {formatCurrency(selectedInvoice.vatAmount)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {formatCurrency(selectedInvoice.totalAmount)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="text-sm text-gray-900">{selectedInvoice.notes}</p>
                  </div>
                )}

                {selectedInvoice.terms && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Terms</label>
                    <p className="text-sm text-gray-900">{selectedInvoice.terms}</p>
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


