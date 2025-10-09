'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Building,
  Package,
  Plus,
  Minus,
  Send,
  AlertCircle
} from 'lucide-react';
import { config } from '@/lib/config';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  units: string;
  packaging: string;
  distributorPrice: number;
  wholesalePrice: number;
  rate: number;
  mrp: number;
}

interface DistributorInfo {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  companyName: string;
  officeAddress: string;
  desiredDistributorArea: string;
}

interface DistributorApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (distributorId: string, products: Product[], additionalData: any) => Promise<void>;
  distributor: DistributorInfo | null;
}

export default function DistributorApprovalModal({
  isOpen,
  onClose,
  onApprove,
  distributor
}: DistributorApprovalModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [responseDays, setResponseDays] = useState(7);

  // Fetch products when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const toggleProductSelection = (product: Product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.some(p => p.id === product.id);
      if (isSelected) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleApprove = async () => {
    if (!distributor) return;

    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    try {
      setSending(true);
      
      const additionalData = {
        responseDays: responseDays,
        approvalDate: new Date().toISOString(),
        approvedBy: 'Admin' // You can get this from user context
      };

      await onApprove(distributor.id, selectedProducts, additionalData);
      
      toast.success('Distributor approved and offer letter sent successfully!');
      onClose();
    } catch (error) {
      console.error('Error approving distributor:', error);
      toast.error('Failed to approve distributor');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen || !distributor) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Approve Distributor</h2>
                <p className="text-sm text-gray-500">Send offer letter with product details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Distributor Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distributor Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">{distributor.fullName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{distributor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="font-medium text-gray-900">{distributor.mobileNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Distribution Area</p>
                      <p className="font-medium text-gray-900">{distributor.desiredDistributorArea}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Select Products</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Package className="h-4 w-4" />
                  <span>{selectedProducts.length} products selected</span>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading products...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => {
                    const isSelected = selectedProducts.some(p => p.id === product.id);
                    return (
                      <div
                        key={product.id}
                        onClick={() => toggleProductSelection(product)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Units: {product.units}</p>
                          <p>Packaging: {product.packaging}</p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <p className="text-xs text-gray-500">Dist. Price</p>
                              <p className="font-medium">रु. {product.distributorPrice}/-</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">MRP</p>
                              <p className="font-medium">रु. {product.mrp}/-</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Additional Settings */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Offer Letter Settings</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">
                    Response Deadline (Days):
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setResponseDays(Math.max(1, responseDays - 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={responseDays}
                      onChange={(e) => setResponseDays(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      min="1"
                      max="30"
                    />
                    <button
                      onClick={() => setResponseDays(Math.min(30, responseDays + 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            {selectedProducts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Products Preview</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-blue-200">
                          <th className="text-left py-2">Product</th>
                          <th className="text-left py-2">Units</th>
                          <th className="text-right py-2">Dist. Price</th>
                          <th className="text-right py-2">MRP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProducts.map((product) => (
                          <tr key={product.id} className="border-b border-blue-100">
                            <td className="py-2 font-medium">{product.name}</td>
                            <td className="py-2">{product.units}</td>
                            <td className="py-2 text-right">रु. {product.distributorPrice}/-</td>
                            <td className="py-2 text-right">रु. {product.mrp}/-</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <AlertCircle className="h-4 w-4" />
              <span>An email with the offer letter will be sent to {distributor.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={sending || selectedProducts.length === 0}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Offer Letter & Approve</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}









