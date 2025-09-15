'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Building2, Phone, Mail } from 'lucide-react';
import { mockProducts } from '@/lib/mockData';
import { formatCurrency, generateId } from '@/lib/utils';
import { DailySalesSheet, DailySalesEntry } from '@/types';
import toast from 'react-hot-toast';

interface DailySalesSheetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sheet: DailySalesSheet) => void;
  distributorId: string;
}

export default function DailySalesSheetForm({ isOpen, onClose, onSubmit, distributorId }: DailySalesSheetFormProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [productEntries, setProductEntries] = useState<DailySalesEntry[]>([]);
  const [remarks, setRemarks] = useState('');

  // Initialize product entries when component opens
  useEffect(() => {
    if (isOpen) {
      const initialEntries: DailySalesEntry[] = mockProducts.map(product => ({
        productId: product.id,
        productName: product.name,
        openingStock: 0,
        closingStock: 0,
        salesQuantity: 0,
        unitPrice: product.pricePerUnit,
        totalSales: 0,
        remarks: ''
      }));
      setProductEntries(initialEntries);
    }
  }, [isOpen]);

  const handleEntryChange = (index: number, field: keyof DailySalesEntry, value: string | number) => {
    const newEntries = [...productEntries];
    newEntries[index] = {
      ...newEntries[index],
      [field]: value
    };

    // Calculate total sales if quantity or unit price changes
    if (field === 'salesQuantity' || field === 'unitPrice') {
      const quantity = field === 'salesQuantity' ? Number(value) : newEntries[index].salesQuantity;
      const price = field === 'unitPrice' ? Number(value) : newEntries[index].unitPrice;
      newEntries[index].totalSales = quantity * price;
    }

    setProductEntries(newEntries);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that all required fields are filled
    const hasEmptyFields = productEntries.some(entry => 
      entry.openingStock === 0 && entry.closingStock === 0 && entry.salesQuantity === 0
    );

    if (hasEmptyFields) {
      toast.error('Please fill in at least one field for each product or remove empty entries');
      return;
    }

    const totalSalesAmount = productEntries.reduce((sum, entry) => sum + entry.totalSales, 0);

    const dailySalesSheet: DailySalesSheet = {
      id: generateId(),
      distributorId,
      date: new Date(selectedDate),
      productEntries: productEntries.filter(entry => 
        entry.openingStock > 0 || entry.closingStock > 0 || entry.salesQuantity > 0
      ),
      totalSalesAmount,
      remarks,
      submittedAt: new Date()
    };

    onSubmit(dailySalesSheet);
    toast.success('Daily sales sheet submitted successfully');
    onClose();
  };

  const removeEntry = (index: number) => {
    setProductEntries(productEntries.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Daily Sales Sheet</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Selection */}
            <div className="flex items-center space-x-4">
              <Calendar className="w-5 h-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">
                Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Product Entries */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Product Sales Entries</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Opening Stock
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Closing Stock
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sales Qty
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Sales
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remarks
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productEntries.map((entry, index) => (
                      <tr key={entry.productId}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {entry.productName}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            value={entry.openingStock}
                            onChange={(e) => handleEntryChange(index, 'openingStock', Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            value={entry.closingStock}
                            onChange={(e) => handleEntryChange(index, 'closingStock', Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            value={entry.salesQuantity}
                            onChange={(e) => handleEntryChange(index, 'salesQuantity', Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={entry.unitPrice}
                            onChange={(e) => handleEntryChange(index, 'unitPrice', Number(e.target.value))}
                            className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(entry.totalSales)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={entry.remarks}
                            onChange={(e) => handleEntryChange(index, 'remarks', e.target.value)}
                            placeholder="Remarks"
                            className="w-32 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => removeEntry(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Sales Amount */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Sales Amount:</span>
                <span className="text-xl font-bold text-indigo-600">
                  {formatCurrency(productEntries.reduce((sum, entry) => sum + entry.totalSales, 0))}
                </span>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                General Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter any general remarks about the day's sales..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Submit Daily Sales Sheet
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
