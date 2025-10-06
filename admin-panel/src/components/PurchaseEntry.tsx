'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  FileText,
  Calculator,
  User,
  Building2,
  Calendar,
  DollarSign
} from 'lucide-react';
import PartyAutoComplete from './PartyAutoComplete';
import { Party } from '@/hooks/useParties';
import { formatCurrency } from '@/lib/utils';

interface PurchaseItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  vatRate: number;
  vatAmount: number;
  total: number;
}

interface PurchaseEntryFormData {
  purchaseNumber: string;
  date: string;
  supplier: Party | null;
  items: PurchaseItem[];
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  notes: string;
  status: 'draft' | 'approved' | 'paid';
}

export default function PurchaseEntry() {
  const [formData, setFormData] = useState<PurchaseEntryFormData>({
    purchaseNumber: '',
    date: new Date().toISOString().split('T')[0],
    supplier: null,
    items: [],
    subtotal: 0,
    vatAmount: 0,
    totalAmount: 0,
    notes: '',
    status: 'draft'
  });

  const [showForm, setShowForm] = useState(false);

  // Generate purchase number
  const generatePurchaseNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PI${year}${month}${day}${random}`;
  };

  const handleCreateEntry = () => {
    setFormData({
      purchaseNumber: generatePurchaseNumber(),
      date: new Date().toISOString().split('T')[0],
      supplier: null,
      items: [],
      subtotal: 0,
      vatAmount: 0,
      totalAmount: 0,
      notes: '',
      status: 'draft'
    });
    setShowForm(true);
  };

  const handleSupplierChange = (supplier: Party | null) => {
    setFormData(prev => ({ ...prev, supplier }));
  };

  const handleAddItem = () => {
    const newItem: PurchaseItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
      vatRate: 13, // Default VAT rate for Nepal
      vatAmount: 0,
      total: 0
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const handleItemChange = (itemId: string, field: keyof PurchaseItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate amounts
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
            updatedItem.vatAmount = updatedItem.amount * (updatedItem.vatRate / 100);
            updatedItem.total = updatedItem.amount + updatedItem.vatAmount;
          } else if (field === 'vatRate') {
            updatedItem.vatAmount = updatedItem.amount * (updatedItem.vatRate / 100);
            updatedItem.total = updatedItem.amount + updatedItem.vatAmount;
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
    
    // Recalculate totals
    calculateTotals();
  };

  const calculateTotals = () => {
    setFormData(prev => {
      const subtotal = prev.items.reduce((sum, item) => sum + item.amount, 0);
      const vatAmount = prev.items.reduce((sum, item) => sum + item.vatAmount, 0);
      const totalAmount = subtotal + vatAmount;
      
      return {
        ...prev,
        subtotal,
        vatAmount,
        totalAmount
      };
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
    calculateTotals();
  };

  const handleSave = async () => {
    try {
      // Here you would call the API to save the purchase entry
      console.log('Saving purchase entry:', formData);
      
      // Reset form
      setShowForm(false);
    setFormData({
        purchaseNumber: '',
      date: new Date().toISOString().split('T')[0],
        supplier: null,
        items: [],
        subtotal: 0,
        vatAmount: 0,
        totalAmount: 0,
        notes: '',
        status: 'draft'
      });
    } catch (error) {
      console.error('Error saving purchase entry:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Entry</h1>
          <p className="text-gray-600">Create and manage purchase invoices</p>
        </div>
        <button
          onClick={handleCreateEntry}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Purchase Entry
        </button>
      </div>

      {/* Purchase Entry Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">New Purchase Entry</h2>
                    <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
              </div>
              
          <div className="space-y-6">
            {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Number
                    </label>
                    <input
                  type="text"
                  value={formData.purchaseNumber}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                    </label>
                    <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'approved' | 'paid' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="draft">Draft</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>

            {/* Supplier Selection */}
                  <div>
              <PartyAutoComplete
                label="Supplier"
                value={formData.supplier}
                onChange={handleSupplierChange}
                type="supplier"
                placeholder="Search for supplier..."
                required
              />
                </div>

            {/* Items Table */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Items</h3>
                    <button
                  onClick={handleAddItem}
                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </button>
                  </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        VAT Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        VAT Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Item description"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={item.vatRate}
                            onChange={(e) => handleItemChange(item.id, 'vatRate', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            min="0"
                            max="100"
                            step="0.01"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatCurrency(item.vatAmount)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatCurrency(item.total)}
                        </td>
                        <td className="px-6 py-4 text-center">
                            <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Subtotal</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(formData.subtotal)}
                  </p>
                    </div>
                    <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">VAT Amount</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(formData.vatAmount)}
                  </p>
                  </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Total Amount</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(formData.totalAmount)}
                  </p>
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
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Additional notes or comments..."
                  />
              </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Purchase Entry
                </button>
              </div>
          </div>
          </motion.div>
        )}

      {/* Empty State */}
      {!showForm && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No purchase entries</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new purchase entry.
          </p>
          <div className="mt-6">
            <button
              onClick={handleCreateEntry}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Purchase Entry
            </button>
                  </div>
                </div>
      )}
    </div>
  );
}