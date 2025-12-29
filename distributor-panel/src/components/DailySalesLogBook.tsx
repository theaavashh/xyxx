'use client';

import React, { useState, useEffect } from 'react';
import { useDataStore, useUIStore } from '@/stores';
import { DailySalesSheet, DailySalesSheetForm, SalesEntry, StockEntry } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Plus,
  Minus,
  Save,
  FileText,
  Calendar,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';

interface DailySalesLogBookProps {
  onSheetCreated?: (sheet: DailySalesSheet) => void;
}

export const DailySalesLogBook: React.FC<DailySalesLogBookProps> = ({
  onSheetCreated,
}) => {
  const {
    dailySalesSheets,
    dailySalesSheetsLoading,
    createDailySalesSheet,
    updateDailySalesSheet,
    submitDailySalesSheet,
    deleteDailySalesSheet,
    fetchDailySalesSheets,
  } = useDataStore();

  const { addNotification, setLoading } = useUIStore();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [currentSheet, setCurrentSheet] = useState<DailySalesSheet | null>(null);
  const [formData, setFormData] = useState<DailySalesSheetForm>({
    date: selectedDate,
    openingStock: [],
    sales: [],
    closingStock: [],
    notes: '',
  });

  useEffect(() => {
    fetchDailySalesSheets();
  }, [fetchDailySalesSheets]);

  useEffect(() => {
    // Find existing sheet for selected date
    const existingSheet = dailySalesSheets.find(
      (sheet) => sheet.date === selectedDate
    );
    setCurrentSheet(existingSheet || null);

    if (existingSheet) {
      setFormData({
        date: existingSheet.date,
        openingStock: existingSheet.openingStock,
        sales: existingSheet.sales,
        closingStock: existingSheet.closingStock,
        notes: existingSheet.notes || '',
      });
      setIsCreatingNew(false);
    } else {
      // Reset form for new sheet
      setFormData({
        date: selectedDate,
        openingStock: [],
        sales: [],
        closingStock: [],
        notes: '',
      });
      setIsCreatingNew(true);
    }
  }, [selectedDate, dailySalesSheets]);

  const handleAddSalesEntry = () => {
    const newEntry: SalesEntry = {
      id: Date.now().toString(),
      productId: '',
      productName: '',
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0,
      paymentMethod: 'cash',
    };

    setFormData((prev) => ({
      ...prev,
      sales: [...prev.sales, newEntry],
    }));
  };

  const handleUpdateSalesEntry = (index: number, field: keyof SalesEntry, value: any) => {
    const updatedSales = [...formData.sales];
    updatedSales[index] = { ...updatedSales[index], [field]: value };

    // Calculate total price if quantity or unit price changes
    if (field === 'quantity' || field === 'unitPrice') {
      updatedSales[index].totalPrice = updatedSales[index].quantity * updatedSales[index].unitPrice;
    }

    setFormData((prev) => ({
      ...prev,
      sales: updatedSales,
    }));
  };

  const handleRemoveSalesEntry = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sales: prev.sales.filter((_, i) => i !== index),
    }));
  };

  const handleAddOpeningStock = () => {
    const newStock: StockEntry = {
      productId: '',
      productName: '',
      openingQuantity: 0,
      closingQuantity: 0,
      unit: 'pcs',
    };

    setFormData((prev) => ({
      ...prev,
      openingStock: [...prev.openingStock, newStock],
    }));
  };

  const handleUpdateOpeningStock = (index: number, field: keyof StockEntry, value: any) => {
    const updatedStock = [...formData.openingStock];
    updatedStock[index] = { ...updatedStock[index], [field]: value };

    setFormData((prev) => ({
      ...prev,
      openingStock: updatedStock,
    }));
  };

  const handleRemoveOpeningStock = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      openingStock: prev.openingStock.filter((_, i) => i !== index),
    }));
  };

  const calculateTotals = () => {
    const totalSales = formData.sales.reduce((sum, entry) => sum + entry.totalPrice, 0);
    const totalQuantity = formData.sales.reduce((sum, entry) => sum + entry.quantity, 0);

    return {
      totalSales,
      totalQuantity,
      totalEntries: formData.sales.length,
    };
  };

  const handleSave = async () => {
    setLoading('dailySalesSheet', true);

    try {
      let savedSheet: DailySalesSheet | null = null;

      if (isCreatingNew) {
        savedSheet = await createDailySalesSheet(formData);
      } else {
        savedSheet = await updateDailySalesSheet(currentSheet!.id, formData);
      }

      if (savedSheet) {
        addNotification({
          distributorId: '', // Will be filled by store
          type: 'system',
          title: 'Sales Sheet Saved',
          message: `Daily sales sheet for ${formatDate(formData.date)} has been saved successfully.`,
          priority: 'medium',
        });

        onSheetCreated?.(savedSheet);
        await fetchDailySalesSheets();
      }
    } catch (error) {
      addNotification({
        distributorId: '',
        type: 'system',
        title: 'Save Failed',
        message: 'Failed to save daily sales sheet. Please try again.',
        priority: 'high',
      });
    } finally {
      setLoading('dailySalesSheet', false);
    }
  };

  const handleSubmit = async () => {
    if (!currentSheet) return;

    setLoading('dailySalesSheet', true);

    try {
      const success = await submitDailySalesSheet(currentSheet.id);

      if (success) {
        addNotification({
          distributorId: '',
          type: 'system',
          title: 'Sheet Submitted',
          message: `Daily sales sheet for ${formatDate(formData.date)} has been submitted for review.`,
          priority: 'medium',
        });

        await fetchDailySalesSheets();
      }
    } catch (error) {
      addNotification({
        distributorId: '',
        type: 'system',
        title: 'Submission Failed',
        message: 'Failed to submit daily sales sheet. Please try again.',
        priority: 'high',
      });
    } finally {
      setLoading('dailySalesSheet', false);
    }
  };

  const handleDelete = async () => {
    if (!currentSheet) return;

    if (!confirm('Are you sure you want to delete this daily sales sheet?')) {
      return;
    }

    setLoading('dailySalesSheet', true);

    try {
      const success = await deleteDailySalesSheet(currentSheet.id);

      if (success) {
        addNotification({
          distributorId: '',
          type: 'system',
          title: 'Sheet Deleted',
          message: `Daily sales sheet for ${formatDate(formData.date)} has been deleted.`,
          priority: 'medium',
        });

        await fetchDailySalesSheets();
        // Reset to create new sheet
        setIsCreatingNew(true);
        setCurrentSheet(null);
        setFormData({
          date: selectedDate,
          openingStock: [],
          sales: [],
          closingStock: [],
          notes: '',
        });
      }
    } catch (error) {
      addNotification({
        distributorId: '',
        type: 'system',
        title: 'Deletion Failed',
        message: 'Failed to delete daily sales sheet. Please try again.',
        priority: 'high',
      });
    } finally {
      setLoading('dailySalesSheet', false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daily Sales Log Book</h2>
          <p className="text-gray-600 mt-1">
            Record and track your daily sales and inventory
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {currentSheet && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${currentSheet.status === 'submitted'
                ? 'bg-yellow-100 text-yellow-800'
                : currentSheet.status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
              {currentSheet.status}
            </div>
          )}
        </div>
      </div>

      {/* Opening Stock Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Opening Stock</h3>
            <button
              onClick={handleAddOpeningStock}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>

        <div className="p-6">
          {formData.openingStock.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No opening stock recorded</p>
              <p className="text-sm mt-2">Add products to record your opening stock</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.openingStock.map((stock, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-center">
                  <input
                    type="text"
                    placeholder="Product name"
                    value={stock.productName}
                    onChange={(e) => handleUpdateOpeningStock(index, 'productName', e.target.value)}
                    className="col-span-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={stock.openingQuantity || ''}
                    onChange={(e) => handleUpdateOpeningStock(index, 'openingQuantity', parseInt(e.target.value) || 0)}
                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={stock.unit}
                    onChange={(e) => handleUpdateOpeningStock(index, 'unit', e.target.value)}
                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={stock.price || ''}
                    onChange={(e) => handleUpdateOpeningStock(index, 'price', parseFloat(e.target.value) || 0)}
                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleRemoveOpeningStock(index)}
                    className="col-span-2 p-2 text-red-600 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sales Entries Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Sales Entries</h3>
            <button
              onClick={handleAddSalesEntry}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <Plus className="h-4 w-4" />
              Add Sale
            </button>
          </div>
        </div>

        <div className="p-6">
          {formData.sales.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No sales recorded</p>
              <p className="text-sm mt-2">Add sales entries to record today's transactions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.sales.map((sale, index) => (
                <div key={sale.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <input
                      type="text"
                      placeholder="Product name"
                      value={sale.productName}
                      onChange={(e) => handleUpdateSalesEntry(index, 'productName', e.target.value)}
                      className="col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={sale.quantity || ''}
                      onChange={(e) => handleUpdateSalesEntry(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Unit price"
                      value={sale.unitPrice || ''}
                      onChange={(e) => handleUpdateSalesEntry(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="col-span-2 px-3 py-2 bg-gray-100 rounded-md text-gray-900 font-medium">
                      {formatCurrency(sale.totalPrice)}
                    </div>
                    <select
                      value={sale.paymentMethod}
                      onChange={(e) => handleUpdateSalesEntry(index, 'paymentMethod', e.target.value)}
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="mobile_payment">Mobile Payment</option>
                      <option value="credit">Credit</option>
                    </select>
                    <button
                      onClick={() => handleRemoveSalesEntry(index)}
                      className="col-span-1 p-2 text-red-600 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Customer name (optional)"
                      value={sale.customer || ''}
                      onChange={(e) => handleUpdateSalesEntry(index, 'customer', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Customer phone (optional)"
                      value={sale.customerPhone || ''}
                      onChange={(e) => handleUpdateSalesEntry(index, 'customerPhone', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">Total Sales</p>
            <p className="text-2xl font-bold text-gray-900">{totals.totalEntries}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Quantity</p>
            <p className="text-2xl font-bold text-gray-900">{totals.totalQuantity}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.totalSales)}</p>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Add any notes about today's sales..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          {currentSheet && currentSheet.status === 'draft' && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={dailySalesSheetsLoading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isCreatingNew ? 'Create' : 'Save'}
          </button>

          {currentSheet && currentSheet.status === 'draft' && (
            <button
              onClick={handleSubmit}
              disabled={dailySalesSheetsLoading}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};