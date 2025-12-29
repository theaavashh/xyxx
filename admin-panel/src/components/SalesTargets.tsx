'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Target, 
  MapPin, 
  Calendar, 
  TrendingUp,
  Edit3,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductTarget {
  productId: string;
  productName: string;
  targetUnits: number;
  fulfilledUnits: number;
}

interface SalesTarget {
  id?: string;
  month: string;
  year: number;
  province: string;
  products: ProductTarget[];
  createdAt?: string;
  updatedAt?: string;
}

interface Province {
  id: string;
  name: string;
  nameNepali: string;
}

const NEPAL_PROVINCES: Province[] = [
  { id: 'province-1', name: 'Province 1', nameNepali: 'प्रदेश १' },
  { id: 'madhesh', name: 'Madhesh Province', nameNepali: 'मधेश प्रदेश' },
  { id: 'bagmati', name: 'Bagmati Province', nameNepali: 'बागमती प्रदेश' },
  { id: 'gandaki', name: 'Gandaki Province', nameNepali: 'गण्डकी प्रदेश' },
  { id: 'lumbini', name: 'Lumbini Province', nameNepali: 'लुम्बिनी प्रदेश' },
  { id: 'karnali', name: 'Karnali Province', nameNepali: 'कर्णाली प्रदेश' },
  { id: 'sudurpashchim', name: 'Sudurpashchim Province', nameNepali: 'सुदूरपश्चिम प्रदेश' }
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function SalesTargets() {
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<SalesTarget | null>(null);
  const [showAllData, setShowAllData] = useState(false);
  const [formData, setFormData] = useState({
    month: '',
    year: new Date().getFullYear(),
    province: '',
    products: [] as ProductTarget[]
  });
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productTargetUnits, setProductTargetUnits] = useState(0);

  useEffect(() => {
    fetchTargets();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4444/api'}/products`);
      if (response.ok) {
        const data = await response.json();
        setAvailableProducts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchTargets = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/sales-targets');
      // const data = await response.json();
      
      // Mock data for now
      const mockTargets: SalesTarget[] = [
        {
          id: '1',
          month: 'January',
          year: 2025,
          province: 'bagmati',
          products: [
            { productId: '1', productName: 'Buff Achar', targetUnits: 1000, fulfilledUnits: 750 },
            { productId: '2', productName: 'Pork Achar', targetUnits: 500, fulfilledUnits: 300 }
          ],
          createdAt: '2025-01-01T00:00:00Z'
        },
        {
          id: '2',
          month: 'February',
          year: 2025,
          province: 'bagmati',
          products: [
            { productId: '1', productName: 'Buff Achar', targetUnits: 1200, fulfilledUnits: 0 },
            { productId: '3', productName: 'Chicken Achar', targetUnits: 800, fulfilledUnits: 0 }
          ],
          createdAt: '2025-02-01T00:00:00Z'
        }
      ];
      
      setTargets(mockTargets);
    } catch (error) {
      console.error('Error fetching targets:', error);
      toast.error('Failed to fetch sales targets');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    if (!selectedProduct || productTargetUnits <= 0) {
      toast.error('Please select a product and enter valid target units');
      return;
    }

    const product = availableProducts.find(p => p.id === selectedProduct);
    if (!product) return;

    // Check if product already added
    if (formData.products.some(p => p.productId === selectedProduct)) {
      toast.error('Product already added to this target');
      return;
    }

    const newProduct: ProductTarget = {
      productId: product.id,
      productName: product.name,
      targetUnits: productTargetUnits,
      fulfilledUnits: 0
    };

    setFormData({
      ...formData,
      products: [...formData.products, newProduct]
    });

    setSelectedProduct('');
    setProductTargetUnits(0);
  };

  const handleRemoveProduct = (productId: string) => {
    setFormData({
      ...formData,
      products: formData.products.filter(p => p.productId !== productId)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.month || !formData.province || formData.products.length === 0) {
      toast.error('Please fill in all fields and add at least one product');
      return;
    }

    try {
      // Check if target already exists for this month/province
      const existingTarget = targets.find(
        target => target.month === formData.month && 
        target.year === formData.year && 
        target.province === formData.province
      );

      if (existingTarget && !editingTarget) {
        toast.error('Target already exists for this month and province');
        return;
      }

      if (editingTarget) {
        // Update existing target
        const updatedTargets = targets.map(target =>
          target.id === editingTarget.id
            ? { ...formData, id: editingTarget.id, updatedAt: new Date().toISOString() }
            : target
        );
        setTargets(updatedTargets);
        toast.success('Sales target updated successfully!');
      } else {
        // Add new target
        const newTarget: SalesTarget = {
          ...formData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        setTargets([...targets, newTarget]);
        toast.success('Sales target added successfully!');
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error saving target:', error);
      toast.error('Failed to save sales target');
    }
  };

  const handleEdit = (target: SalesTarget) => {
    setEditingTarget(target);
    setFormData({
      month: target.month,
      year: target.year,
      province: target.province,
      products: [...target.products]
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (targetId: string) => {
    if (!confirm('Are you sure you want to delete this sales target?')) {
      return;
    }

    try {
      setTargets(targets.filter(target => target.id !== targetId));
      toast.success('Sales target deleted successfully!');
    } catch (error) {
      console.error('Error deleting target:', error);
      toast.error('Failed to delete sales target');
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingTarget(null);
    setFormData({
      month: '',
      year: new Date().getFullYear(),
      province: '',
      products: []
    });
    setSelectedProduct('');
    setProductTargetUnits(0);
  };

  const getProvinceName = (provinceId: string) => {
    const province = NEPAL_PROVINCES.find(p => p.id === provinceId);
    return province ? province.name : provinceId;
  };

  const getCurrentMonthName = () => {
    const currentMonth = new Date().getMonth();
    return MONTHS[currentMonth];
  };

  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  const getFilteredTargets = () => {
    if (showAllData) {
      return targets;
    }
    
    // Show only current month targets
    const currentMonth = getCurrentMonthName();
    const currentYear = getCurrentYear();
    
    return targets.filter(
      target => target.month === currentMonth && target.year === currentYear
    );
  };

  const displayedTargets = getFilteredTargets();

  const getTotalTargetUnits = () => {
    const targetsToCount = showAllData ? targets : displayedTargets;
    return targetsToCount.reduce((sum, target) => 
      sum + target.products.reduce((pSum, p) => pSum + p.targetUnits, 0), 0
    );
  };

  const getTotalFulfilledUnits = () => {
    const targetsToCount = showAllData ? targets : displayedTargets;
    return targetsToCount.reduce((sum, target) => 
      sum + target.products.reduce((pSum, p) => pSum + p.fulfilledUnits, 0), 0
    );
  };

  const getFulfillmentPercentage = () => {
    const total = getTotalTargetUnits();
    const fulfilled = getTotalFulfilledUnits();
    return total > 0 ? Math.round((fulfilled / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading sales targets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Targets</h1>
          <p className="text-gray-600">
            {showAllData 
              ? 'Viewing all sales targets' 
              : `Viewing ${getCurrentMonthName()} ${getCurrentYear()} targets`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAllData(!showAllData)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="h-5 w-5" />
            <span>{showAllData ? 'Current Month Only' : 'View All'}</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Target</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Targets</p>
              <p className="text-2xl font-bold text-gray-900">{displayedTargets.length}</p>
              {!showAllData && targets.length > displayedTargets.length && (
                <p className="text-xs text-gray-500 mt-1">({targets.length} total)</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Target Units</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalTargetUnits().toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Fulfilled Units</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalFulfilledUnits().toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{getFulfillmentPercentage()}% of target</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <MapPin className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Provinces</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(displayedTargets.map(t => t.province)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Targets Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Sales Targets</h2>
        </div>
        
        {displayedTargets.length === 0 ? (
          <div className="p-12 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showAllData ? 'No sales targets set' : `No targets for ${getCurrentMonthName()} ${getCurrentYear()}`}
            </h3>
            <p className="text-gray-500 mb-4">
              {showAllData 
                ? 'Get started by adding your first sales target' 
                : 'Set targets for this month or view all targets'}
            </p>
            <div className="flex items-center justify-center space-x-3">
              {!showAllData && (
                <button
                  onClick={() => setShowAllData(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="h-5 w-5" />
                  <span>View All</span>
                </button>
              )}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Add Target</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month/Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Province
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target Units
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fulfilled
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedTargets.map((target) => (
                  <tr key={target.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {target.month} {target.year}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{getProvinceName(target.province)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {target.products.map((product, idx) => (
                          <div key={idx} className="text-sm text-gray-900">
                            • {product.productName}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {target.products.map((product, idx) => (
                          <div key={idx} className="text-sm font-medium text-gray-900">
                            {product.targetUnits.toLocaleString()} units
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {target.products.map((product, idx) => {
                          const percentage = product.targetUnits > 0 
                            ? Math.round((product.fulfilledUnits / product.targetUnits) * 100) 
                            : 0;
                          return (
                            <div key={idx} className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {product.fulfilledUnits.toLocaleString()}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                percentage >= 100 ? 'bg-green-100 text-green-700' :
                                percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {percentage}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(target)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(target.id!)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
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
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingTarget ? 'Edit Sales Target' : 'Add Sales Target'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select Month</option>
                    {MONTHS.map((month) => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    min="2020"
                    max="2030"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province
                  </label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select Province</option>
                    {NEPAL_PROVINCES.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Selection Section */}
                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Add Products & Target Units
                  </label>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select Product</option>
                        {availableProducts.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                      
                      <input
                        type="number"
                        value={productTargetUnits}
                        onChange={(e) => setProductTargetUnits(parseInt(e.target.value) || 0)}
                        min="0"
                        placeholder="Target units"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Product to Target</span>
                    </button>
                  </div>

                  {/* Selected Products List */}
                  {formData.products.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase">Selected Products:</p>
                      {formData.products.map((product, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{product.productName}</p>
                            <p className="text-xs text-gray-500">Target: {product.targetUnits} units</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(product.productId)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingTarget ? 'Update' : 'Save'} Target</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

