'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Save, 
  AlertCircle,
  Filter,
  Grid3X3,
  List,
  Barcode,
  Tag,
  DollarSign,
  Boxes,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  MoreVertical,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { config } from '@/lib/config';
import toast from 'react-hot-toast';
import { ProductSKU, ProductSKUForm, Product } from '@/types';

interface SKUManagementProps {
  productId?: string;
}

export default function SKUManagement({ productId }: SKUManagementProps = {}) {
  const [skus, setSkus] = useState<ProductSKU[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSKU, setEditingSKU] = useState<ProductSKU | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; sku: ProductSKU | null }>({
    isOpen: false,
    sku: null
  });
  const [expandedAttributes, setExpandedAttributes] = useState<string[]>([]);

  const [formData, setFormData] = useState<ProductSKUForm>({
    sku: '',
    productId: productId || '',
    productName: '',
    variantName: '',
    attributes: [],
    price: 0,
    costPrice: 0,
    stockQuantity: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    barcode: '',
    weight: undefined,
    dimensions: undefined,
    isActive: true,
    images: [],
    notes: ''
  });

  const [filters, setFilters] = useState({
    product: '',
    status: 'all',
    stockStatus: 'all',
    sortBy: 'sku',
    sortOrder: 'asc' as 'asc' | 'desc'
  });

  const [newAttribute, setNewAttribute] = useState({ name: '', value: '' });

  useEffect(() => {
    fetchSKUs();
    fetchProducts();
  }, [productId]);

  const fetchSKUs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem(config.tokenKey);
      const url = productId 
        ? `${config.apiUrl}/products/${productId}/skus`
        : `${config.apiUrl}/product-skus`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Parse JSON strings to objects and convert decimals to numbers
        const parsedSKUs = (data.data || []).map((sku: any) => {
          let parsedAttributes = [];
          let parsedDimensions = undefined;
          
          if (sku.attributes) {
            try {
              parsedAttributes = JSON.parse(sku.attributes);
            } catch (e) {
              parsedAttributes = [];
            }
          }
          
          if (sku.dimensions) {
            try {
              parsedDimensions = JSON.parse(sku.dimensions);
            } catch (e) {
              parsedDimensions = undefined;
            }
          }
          
          return {
            ...sku,
            price: parseFloat(sku.price) || 0,
            costPrice: parseFloat(sku.costPrice) || 0,
            attributes: parsedAttributes,
            dimensions: parsedDimensions
          };
        });
        setSkus(parsedSKUs);
      } else {
        throw new Error('Failed to fetch SKUs');
      }
    } catch (error) {
      console.error('Error fetching SKUs:', error);
      toast.error('Failed to fetch SKUs');
      // Set empty array on error
      setSkus([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const generateSKU = () => {
    const prefix = 'SKU';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  const handleOpenModal = (sku?: ProductSKU) => {
    if (sku) {
      setEditingSKU(sku);
      setFormData({
        sku: sku.sku,
        productId: sku.productId,
        productName: sku.product?.name || '',
        variantName: sku.variantName,
        attributes: sku.attributes || [],
        price: sku.price,
        costPrice: sku.costPrice,
        stockQuantity: sku.stockQuantity,
        minStockLevel: sku.minStockLevel,
        maxStockLevel: sku.maxStockLevel,
        barcode: sku.barcode || '',
        weight: sku.weight,
        dimensions: sku.dimensions,
        isActive: sku.isActive,
        images: sku.images || [],
        notes: sku.notes || ''
      });
    } else {
      setEditingSKU(null);
      setFormData({
        sku: generateSKU(),
        productId: productId || '',
        productName: '',
        variantName: '',
        attributes: [],
        price: 0,
        costPrice: 0,
        stockQuantity: 0,
        minStockLevel: 0,
        maxStockLevel: 0,
        barcode: '',
        weight: undefined,
        dimensions: undefined,
        isActive: true,
        images: [],
        notes: ''
      });
    }
    setIsModalOpen(true);
    setNewAttribute({ name: '', value: '' });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSKU(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.productName.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    if (!formData.sku.trim()) {
      toast.error('SKU is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem(config.tokenKey);
      const url = editingSKU
        ? `${config.apiUrl}/product-skus/${editingSKU.id}`
        : `${config.apiUrl}/product-skus`;
      const method = editingSKU ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchSKUs();
        handleCloseModal();
        toast.success(editingSKU ? 'SKU updated successfully!' : 'SKU created successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to save SKU');
      }
    } catch (error) {
      console.error('Error saving SKU:', error);
      toast.error('Network error while saving SKU');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.sku) return;

    try {
      const token = localStorage.getItem(config.tokenKey);
      const response = await fetch(`${config.apiUrl}/product-skus/${deleteModal.sku.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchSKUs();
        setDeleteModal({ isOpen: false, sku: null });
        toast.success('SKU deleted successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete SKU');
      }
    } catch (error) {
      console.error('Error deleting SKU:', error);
      toast.error('Network error while deleting SKU');
    }
  };

  const handleAddAttribute = () => {
    if (newAttribute.name.trim() && newAttribute.value.trim()) {
      setFormData(prev => ({
        ...prev,
        attributes: [...prev.attributes, { ...newAttribute }]
      }));
      setNewAttribute({ name: '', value: '' });
    }
  };

  const handleRemoveAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  const toggleAttributes = (skuId: string) => {
    setExpandedAttributes(prev =>
      prev.includes(skuId)
        ? prev.filter(id => id !== skuId)
        : [...prev, skuId]
    );
  };

  const copySKU = (sku: string) => {
    navigator.clipboard.writeText(sku);
    toast.success('SKU copied to clipboard!');
  };

  const filteredSKUs = skus
    .filter(sku => {
      const matchesSearch = !searchTerm ||
        sku.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sku.variantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sku.barcode && sku.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sku.product?.name && sku.product.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesProduct = !filters.product || sku.productId === filters.product;
      const matchesStatus = filters.status === 'all' ||
        (filters.status === 'active' && sku.isActive) ||
        (filters.status === 'inactive' && !sku.isActive);

      const matchesStock = filters.stockStatus === 'all' ||
        (filters.stockStatus === 'in_stock' && sku.stockQuantity > sku.minStockLevel) ||
        (filters.stockStatus === 'low_stock' && sku.stockQuantity <= sku.minStockLevel && sku.stockQuantity > 0) ||
        (filters.stockStatus === 'out_of_stock' && sku.stockQuantity === 0);

      return matchesSearch && matchesProduct && matchesStatus && matchesStock;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'sku':
          comparison = a.sku.localeCompare(b.sku);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock':
          comparison = a.stockQuantity - b.stockQuantity;
          break;
        case 'product':
          comparison = (a.product?.name || '').localeCompare(b.product?.name || '');
          break;
        default:
          comparison = a.sku.localeCompare(b.sku);
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

  const getStockStatus = (sku: ProductSKU) => {
    if (sku.stockQuantity === 0) return { label: 'Out of Stock', color: 'text-red-600 bg-red-50' };
    if (sku.stockQuantity <= sku.minStockLevel) return { label: 'Low Stock', color: 'text-yellow-600 bg-yellow-50' };
    return { label: 'In Stock', color: 'text-green-600 bg-green-50' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product SKU Management</h1>
          <p className="text-gray-600 mt-1">Manage product variants and SKUs for all items</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add SKU
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by SKU, variant, barcode, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder:text-black"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {!productId && (
              <select
                value={filters.product}
                onChange={(e) => setFilters(prev => ({ ...prev, product: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Products</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            )}

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={filters.stockStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, stockStatus: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Stock</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="sku">Sort by SKU</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
              <option value="product">Sort by Product</option>
            </select>

            <button
              onClick={() => setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </button>

            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total SKUs</p>
              <p className="text-2xl font-bold text-gray-900">{skus.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active SKUs</p>
              <p className="text-2xl font-bold text-green-600">{skus.filter(s => s.isActive).length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">
                {skus.filter(s => s.stockQuantity <= s.minStockLevel && s.stockQuantity > 0).length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{skus.filter(s => s.stockQuantity === 0).length}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Boxes className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : filteredSKUs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No SKUs found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filters.product || filters.status !== 'all' || filters.stockStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first SKU'}
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add SKU
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSKUs.map((sku, index) => (
            <motion.div
              key={sku.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatus(sku).color}`}>
                      {getStockStatus(sku).label}
                    </span>
                    {!sku.isActive && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full text-gray-600 bg-gray-100">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => copySKU(sku.sku)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Copy SKU"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenModal(sku)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit SKU"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, sku })}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete SKU"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="font-semibold text-gray-900 text-lg">{sku.variantName}</h3>
                  <p className="text-sm text-gray-500">{sku.product?.name}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <Barcode className="w-4 h-4 text-gray-400" />
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{sku.sku}</code>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="font-semibold text-gray-900">Rs. {sku.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stock:</span>
                  <span className={`font-semibold ${sku.stockQuantity <= sku.minStockLevel ? 'text-yellow-600' : 'text-gray-900'}`}>
                    {sku.stockQuantity} units
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Barcode:</span>
                  <span className="text-sm text-gray-900">{sku.barcode || '-'}</span>
                </div>

                {sku.attributes.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <button
                      onClick={() => toggleAttributes(sku.id)}
                      className="flex items-center text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      <Tag className="w-4 h-4 mr-1" />
                      {sku.attributes.length} Attributes
                      {expandedAttributes.includes(sku.id) ? (
                        <ChevronUp className="w-4 h-4 ml-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </button>
                    <AnimatePresence>
                      {expandedAttributes.includes(sku.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 flex flex-wrap gap-2">
                            {sku.attributes.map((attr, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 bg-gray-100 text-xs rounded-md">
                                <span className="font-medium text-gray-700">{attr.name}:</span>
                                <span className="ml-1 text-gray-900">{attr.value}</span>
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attributes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSKUs.map((sku) => (
                  <tr key={sku.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{sku.sku}</code>
                        <button
                          onClick={() => copySKU(sku.sku)}
                          className="text-gray-400 hover:text-indigo-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      {sku.barcode && (
                        <p className="text-xs text-gray-500 mt-1">{sku.barcode}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{sku.product?.name || 'Unknown'}</div>
                      {sku.product?.category && (
                        <div className="text-xs text-gray-500">{sku.product.category.title}</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">{sku.variantName}</div>
                    </td>
                    <td className="px-4 py-4">
                      {sku.attributes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {sku.attributes.map((attr, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-xs rounded">
                              {attr.name}: {attr.value}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Rs. {sku.price.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Cost: Rs. {sku.costPrice.toFixed(2)}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${sku.stockQuantity <= sku.minStockLevel ? 'text-yellow-600' : 'text-gray-900'}`}>
                        {sku.stockQuantity}
                      </div>
                      <div className="text-xs text-gray-500">Min: {sku.minStockLevel}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStockStatus(sku).color}`}>
                        {getStockStatus(sku).label}
                      </span>
                      {!sku.isActive && (
                        <span className="ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full text-gray-600 bg-gray-100">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenModal(sku)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, sku })}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingSKU ? 'Edit SKU' : 'Add New SKU'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="p-6 space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.productName}
                        onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder:text-black"
                        placeholder="Enter product name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU Code <span className="text-red-500">*</span>
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={formData.sku}
                          onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder:text-black"
                          required
                          placeholder="e.g., SKU-ABC123"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, sku: generateSKU() }))}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          title="Generate SKU"
                        >
                          <RefreshCw className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Variant Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.variantName}
                        onChange={(e) => setFormData(prev => ({ ...prev, variantName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder:text-black"
                        required
                        placeholder="e.g., Red - Large"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                      <input
                        type="text"
                        value={formData.barcode}
                        onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder:text-black"
                        placeholder="Scan or enter barcode"
                      />
                    </div>
                  </div>

                  {/* Stock Management */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Stock <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.stockQuantity}
                          onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Min Stock Level <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.minStockLevel}
                          onChange={(e) => setFormData(prev => ({ ...prev, minStockLevel: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Stock Level <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.maxStockLevel}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxStockLevel: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Attributes */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Variant Attributes</h3>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Attribute name (e.g., Color)"
                          value={newAttribute.name}
                          onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder:text-black"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g., Red)"
                          value={newAttribute.value}
                          onChange={(e) => setNewAttribute(prev => ({ ...prev, value: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder:text-black"
                        />
                        <button
                          type="button"
                          onClick={handleAddAttribute}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>

                      {formData.attributes.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.attributes.map((attr, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                              <span className="font-medium">{attr.name}:</span>
                              <span className="ml-1">{attr.value}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveAttribute(index)}
                                className="ml-2 text-indigo-400 hover:text-indigo-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Physical Attributes */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Physical Attributes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.weight || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value ? parseFloat(e.target.value) : undefined }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder:text-black"
                          placeholder="e.g., 0.5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions (L x W x H cm)</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={formData.dimensions?.length || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              dimensions: {
                                length: parseFloat(e.target.value) || 0,
                                width: prev.dimensions?.width || 0,
                                height: prev.dimensions?.height || 0
                              }
                            }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder:text-black"
                            placeholder="Length"
                          />
                          <span className="text-gray-400">×</span>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={formData.dimensions?.width || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              dimensions: {
                                length: prev.dimensions?.length || 0,
                                width: parseFloat(e.target.value) || 0,
                                height: prev.dimensions?.height || 0
                              }
                            }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder:text-black"
                            placeholder="Width"
                          />
                          <span className="text-gray-400">×</span>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={formData.dimensions?.height || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              dimensions: {
                                length: prev.dimensions?.length || 0,
                                width: prev.dimensions?.width || 0,
                                height: parseFloat(e.target.value) || 0
                              }
                            }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder:text-black"
                            placeholder="Height"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes & Status */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder:text-black"
                          placeholder="Additional notes about this SKU..."
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Active SKU</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        {editingSKU ? 'Update SKU' : 'Create SKU'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && deleteModal.sku && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteModal({ isOpen: false, sku: null })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 text-red-600 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Delete SKU</h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the SKU <strong>{deleteModal.sku.sku}</strong> for{' '}
                <strong>{deleteModal.sku.variantName}</strong>? This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, sku: null })}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Delete SKU
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}