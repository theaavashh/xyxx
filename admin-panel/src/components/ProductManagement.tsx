'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Search, 
  ShoppingCart, 
  Edit, 
  Trash2, 
  X, 
  Save, 
  AlertCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter,
  Grid3X3,
  List,
  Image as ImageIcon,
  Eye,
  MoreVertical,
  Download,
  Upload,
  Star,
  Copy,
  Check
} from 'lucide-react';
import { config } from '@/lib/config';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  category?: {
    id: string;
    title: string;
  };
  sku?: string;
  price?: number;
  costPrice?: number;
  stockQuantity?: number;
  minStockLevel?: number;
  weight?: number;
  dimensions?: string;
  brand?: string;
  model?: string;
  color?: string;
  size?: string;
  tags?: string;
  isActive: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  title: string;
  isActive: boolean;
}

interface ProductFormData {
  name: string;
  description: string;
  categoryId: string;
  sku: string;
  price: number | '';
  costPrice: number | '';
  stockQuantity: number | '';
  minStockLevel: number | '';
  weight: number | '';
  dimensions: string;
  brand: string;
  model: string;
  color: string;
  size: string;
  tags: string;
  isActive: boolean;
  slug: string;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; product: Product | null }>({
    isOpen: false,
    product: null
  });

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    categoryId: '',
    sku: '',
    price: '',
    costPrice: '',
    stockQuantity: '',
    minStockLevel: '',
    weight: '',
    dimensions: '',
    brand: '',
    model: '',
    color: '',
    size: '',
    tags: '',
    isActive: true,
    slug: ''
  });

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    status: 'all',
    priceRange: 'all',
    sortBy: 'name',
    sortOrder: 'asc' as 'asc' | 'desc'
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Prepare data for API
      const submitData = {
        ...formData,
        price: formData.price ? Number(formData.price) : undefined,
        costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
        stockQuantity: formData.stockQuantity ? Number(formData.stockQuantity) : 0,
        minStockLevel: formData.minStockLevel ? Number(formData.minStockLevel) : 0,
        weight: formData.weight ? Number(formData.weight) : undefined,
        slug: formData.slug || generateSlug(formData.name)
      };

      const url = editingProduct 
        ? `${config.apiUrl}/products/dev/${editingProduct.id}`
        : `${config.apiUrl}/products/dev`;
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        await fetchProducts();
        handleCloseModal();
        toast.success(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      categoryId: product.categoryId,
      sku: product.sku || '',
      price: product.price || '',
      costPrice: product.costPrice || '',
      stockQuantity: product.stockQuantity || '',
      minStockLevel: product.minStockLevel || '',
      weight: product.weight || '',
      dimensions: product.dimensions || '',
      brand: product.brand || '',
      model: product.model || '',
      color: product.color || '',
      size: product.size || '',
      tags: product.tags || '',
      isActive: product.isActive,
      slug: product.slug
    });
    setIsModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    setDeleteModal({ isOpen: true, product });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.product) return;

    try {
      const response = await fetch(`${config.apiUrl}/products/dev/${deleteModal.product.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchProducts();
        setDeleteModal({ isOpen: false, product: null });
        toast.success('Product deleted successfully!');
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      sku: '',
      price: '',
      costPrice: '',
      stockQuantity: '',
      minStockLevel: '',
      weight: '',
      dimensions: '',
      brand: '',
      model: '',
      color: '',
      size: '',
      tags: '',
      isActive: true,
      slug: ''
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filters.category || product.categoryId === filters.category;
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'active' && product.isActive) ||
      (filters.status === 'inactive' && !product.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    let comparison = 0;
    switch (filters.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'price':
        comparison = (a.price || 0) - (b.price || 0);
        break;
      case 'stock':
        comparison = (a.stockQuantity || 0) - (b.stockQuantity || 0);
        break;
      case 'created':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    return filters.sortOrder === 'desc' ? -comparison : comparison;
  });

  const getTotalProducts = () => products.length;
  const getActiveProducts = () => products.filter(p => p.isActive).length;
  const getInStockProducts = () => products.filter(p => (p.stockQuantity || 0) > 0).length;
  const getLowStockProducts = () => products.filter(p => (p.stockQuantity || 0) <= (p.minStockLevel || 0)).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center space-x-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
            <div>
              <p className="text-lg font-semibold text-gray-900">Loading Products...</p>
              <p className="text-sm text-gray-600">Please wait while we fetch your inventory</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

    return (
      <div>
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Package className="mr-3 h-8 w-8 text-indigo-600" />
                Product Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${
                      viewMode === 'grid' 
                        ? 'text-indigo-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'table' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 text-white px-6 py-2 flex items-center gap-2 hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 border border-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{getTotalProducts()}</p>
              </div>
                  <div className="p-3">
                <Package className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white p-6 border border-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-3xl font-bold text-green-600">{getActiveProducts()}</p>
              </div>
                  <div className="p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-6 border border-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Stock</p>
                <p className="text-3xl font-bold text-blue-600">{getInStockProducts()}</p>
              </div>
                  <div className="p-3">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white p-6 border border-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-3xl font-bold text-red-600">{getLowStockProducts()}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-xl">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products by name, SKU, brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="stock">Sort by Stock</option>
                <option value="created">Sort by Date</option>
              </select>
              
              <button
                onClick={() => setFilters({...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'})}
                className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 text-sm font-medium"
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Products Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white transition-all duration-300 border border-gray-100 overflow-hidden group"
              >
                {/* Product Info */}
                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                      {product.sku && (
                        <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                      )}
                    </div>
                    <div className="relative">
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {product.category && (
                    <div className="mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {product.category.title}
                      </span>
                    </div>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    {product.price && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Price:</span>
                        <span className="text-lg font-bold text-green-600">₹{product.price}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Stock:</span>
                      <span className={`font-medium ${
                        (product.stockQuantity || 0) <= (product.minStockLevel || 0) 
                          ? 'text-red-600' 
                          : 'text-blue-600'
                      }`}>
                        {product.stockQuantity || 0} units
                      </span>
                    </div>
                  </div>
                  
                  {product.brand && (
                    <div className="text-sm text-gray-500 mb-3">
                      Brand: {product.brand}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {product.category?.title || 'No Category'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {product.price ? `₹${product.price}` : 'N/A'}
                        </div>
                        {product.costPrice && (
                          <div className="text-sm text-gray-500">Cost: ₹{product.costPrice}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${
                            (product.stockQuantity || 0) <= (product.minStockLevel || 0) 
                              ? 'text-red-600' 
                              : 'text-blue-600'
                          }`}>
                            {product.stockQuantity || 0} units
                          </span>
                          {(product.stockQuantity || 0) <= (product.minStockLevel || 0) && (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
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
          </div>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <Package className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First Product
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
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
              initial={{ scale: 0.95, opacity: 0, rotate: -2 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.95, opacity: 0, rotate: 2 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="max-w-6xl w-full max-h-[95vh] overflow-y-auto border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-8 py-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="p-3">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                      </h2>
                      <p className="text-indigo-100 text-sm mt-1">
                        {editingProduct ? 'Update product information' : 'Create a new product for your inventory'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-white/80 hover:text-white p-2 transition-all"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-8 border-t">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Product Name */}
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        Product Name *
                        <Star className="h-4 w-4 text-red-500 ml-2" />
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (!formData.slug) {
                            setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                          }
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg transition-all"
                        placeholder="Enter product name..."
                      />
                    </div>

                    {/* SKU */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder="e.g., PRD-001"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="lg:col-span-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all"
                      placeholder="Describe the product features, benefits, and specifications..."
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg transition-all"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        Selling Price
                        <DollarSign className="h-4 w-4 text-green-600 ml-2" />
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-600 text-lg font-bold">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg transition-all"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Cost Price */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Cost Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600 text-lg font-bold">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                        value={formData.costPrice}
                        onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg transition-all"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Stock Quantity */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        Stock Quantity
                        <ShoppingCart className="h-4 w-4 text-blue-600 ml-2" />
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stockQuantity}
                        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg transition-all"
                        placeholder="0"
                      />
                    </div>

                    {/* Min Stock Level */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Min Stock Level
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.minStockLevel}
                        onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg transition-all"
                        placeholder="Alert when stock reaches this level"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Brand
                      </label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder="e.g., Apple, Samsung, Nike"
                      />
                    </div>

                    {/* Size */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Size
                      </label>
                      <input
                        type="text"
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder="e.g., Large, Medium, Small"
                      />
                    </div>

                    {/* Color */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Color
                      </label>
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder="e.g., Red, Blue, Black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Weight */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg transition-all"
                        placeholder="0.00"
                      />
                    </div>

                    {/* Dimensions */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Dimensions
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 10x5x3 cm"
                        value={formData.dimensions}
                        onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Slug */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                        placeholder="product-name"
                      />
                      <p className="text-xs text-gray-500 mt-2">URL-friendly identifier for the product</p>
                    </div>

                    {/* Active Status */}
                    <div>
                      <label className="flex items-center space-x-3 px-4 py-3 border-2 border-gray-300">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-semibold text-gray-700">Product is Active</span>
                        {formData.isActive && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            <Check className="h-3 w-3 mr-1" />
                            Live
                          </span>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-between items-center pt-8 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      {editingProduct ? (
                        <span>Last updated: {new Date(editingProduct.updatedAt).toLocaleDateString()}</span>
                      ) : (
                        <span>Creating new product</span>
                      )}
                    </div>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-8 py-3 text-gray-700 hover:bg-gray-100 transition-all font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                      >
                        <Save className="h-5 w-5" />
                        {isSubmitting ? 'Saving Product...' : (editingProduct ? 'Update Product' : 'Create Product')}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteModal({ isOpen: false, product: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.9, opacity: 0, rotate: 5 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="max-w-lg w-full p-8 border border-red-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Warning Icon */}
              <div className="flex justify-center mb-6">
                <div className="p-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              
              {/* Warning Text */}
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Delete Product?</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Are you sure you want to delete <span className="font-semibold text-red-600">"{deleteModal.product?.name}"</span>?
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  This action cannot be undone and all product data will be permanently removed.
                </p>
              </div>
              
              {/* Product Info */}
              {deleteModal.product && (
                <div className="p-4 mb-8">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">SKU:</span>
                      <span className="font-medium text-gray-900 ml-2">{deleteModal.product.sku || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium text-gray-900 ml-2">{deleteModal.product.category?.title || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Stock:</span>
                      <span className="font-medium text-gray-900 ml-2">{deleteModal.product.stockQuantity || 0} units</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium text-gray-900 ml-2">₹{deleteModal.product.price || '0'}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, product: null })}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-100 transition-all font-medium"
                >
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </div>
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-6 py-3 bg-red-600 text-white hover:bg-red-700 transition-all font-medium"
                >
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Product
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}