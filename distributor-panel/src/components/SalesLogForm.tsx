'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Save, Calculator } from 'lucide-react';
import { mockProducts } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';
import { SalesLogEntry } from '@/types';
import toast from 'react-hot-toast';

const salesLogSchema = yup.object({
  productId: yup.string().required('Product is required'),
  quantitySold: yup.number().min(1, 'Quantity must be at least 1').required('Quantity is required'),
  unitPrice: yup.number().min(0, 'Unit price must be positive').required('Unit price is required'),
  customerName: yup.string().optional(),
  customerContact: yup.string().optional(),
  paymentMethod: yup.string().oneOf(['cash', 'credit', 'bank_transfer', 'mobile_payment']).required('Payment method is required'),
  notes: yup.string().optional(),
});

type SalesLogFormData = yup.InferType<typeof salesLogSchema>;

interface SalesLogFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: SalesLogEntry) => void;
  distributorId: string;
}

export default function SalesLogForm({ isOpen, onClose, onSubmit, distributorId }: SalesLogFormProps) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<SalesLogFormData>({
    resolver: yupResolver(salesLogSchema),
    defaultValues: {
      paymentMethod: 'cash',
    },
  });

  const watchedProductId = watch('productId');
  const watchedQuantity = watch('quantitySold');
  const watchedUnitPrice = watch('unitPrice');

  // Update selected product when product changes
  React.useEffect(() => {
    if (watchedProductId) {
      const product = mockProducts.find(p => p.id === watchedProductId);
      setSelectedProduct(product);
      if (product) {
        setValue('unitPrice', product.pricePerUnit);
      }
    }
  }, [watchedProductId, setValue]);

  const totalAmount = (watchedQuantity || 0) * (watchedUnitPrice || 0);

  const handleFormSubmit = (data: SalesLogFormData) => {
    const product = mockProducts.find(p => p.id === data.productId);
    if (!product) {
      toast.error('Selected product not found');
      return;
    }

    const entry: SalesLogEntry = {
      id: `sales-${Date.now()}`,
      distributorId,
      productId: data.productId,
      productName: product.name,
      quantitySold: data.quantitySold,
      unitPrice: data.unitPrice,
      totalAmount: data.quantitySold * data.unitPrice,
      customerName: data.customerName,
      customerContact: data.customerContact,
      paymentMethod: data.paymentMethod as any,
      date: new Date(),
      notes: data.notes,
    };

    onSubmit(entry);
    reset();
    onClose();
    toast.success('Sales transaction added successfully!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add Daily Sales Transaction</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product *
            </label>
            <select
              {...register('productId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a product</option>
              {mockProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.category}
                </option>
              ))}
            </select>
            {errors.productId && (
              <p className="mt-1 text-sm text-red-600">{errors.productId.message}</p>
            )}
          </div>

          {/* Product Info Display */}
          {selectedProduct && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Description:</strong> {selectedProduct.description}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Available Stock:</strong> {selectedProduct.availableQuantity} {selectedProduct.unit}s
              </p>
              <p className="text-sm text-gray-600">
                <strong>Suggested Price:</strong> {formatCurrency(selectedProduct.pricePerUnit)}/{selectedProduct.unit}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity Sold *
              </label>
              <input
                type="text"
                {...register('quantitySold')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
                placeholder="Enter quantity"
              />
              {errors.quantitySold && (
                <p className="mt-1 text-sm text-red-600">{errors.quantitySold.message}</p>
              )}
            </div>

            {/* Unit Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Price (NPR) *
              </label>
              <input
                type="text"
                {...register('unitPrice')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
                placeholder="Enter unit price"
              />
              {errors.unitPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.unitPrice.message}</p>
              )}
            </div>
          </div>

          {/* Total Amount Display */}
          <div className="bg-blue-50 p-3 rounded-md flex items-center">
            <Calculator className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">
              Total Amount: {formatCurrency(totalAmount)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name (Optional)
              </label>
              <input
                type="text"
                {...register('customerName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
                placeholder="Enter customer name"
              />
            </div>

            {/* Customer Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Contact (Optional)
              </label>
              <input
                type="text"
                {...register('customerContact')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
                placeholder="Phone/Email"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method *
            </label>
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
                >
                  <option value="cash">Cash</option>
                  <option value="credit">Credit</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_payment">Mobile Payment (eSewa/Khalti)</option>
                </select>
              )}
            />
            {errors.paymentMethod && (
              <p className="mt-1 text-sm text-red-600">{errors.paymentMethod.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={3}
              {...register('notes')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional notes..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
