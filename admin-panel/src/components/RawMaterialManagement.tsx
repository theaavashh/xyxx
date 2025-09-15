'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  Hash,
  BarChart3,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { 
  RawMaterial, 
  RawMaterialCategory, 
  RawMaterialTransaction, 
  RawMaterialForm 
} from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { productionService } from '@/services/production.service';
import toast from 'react-hot-toast';

export default function RawMaterialManagement() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [categories, setCategories] = useState<RawMaterialCategory[]>([]);
  const [transactions, setTransactions] = useState<RawMaterialTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<RawMaterialForm>({
    materialCode: '',
    materialName: '',
    category: '',
    description: '',
    unit: 'kg',
    currentStock: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    reorderPoint: 0,
    unitCost: 0,
    supplierId: '',
    location: '',
    shelfLife: 0
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [materialsData, categoriesData, transactionsData] = await Promise.all([
        productionService.getRawMaterials(),
        productionService.getRawMaterialCategories(),
        productionService.getRawMaterialTransactions()
      ]);
      
      setMaterials(materialsData);
      setCategories(categoriesData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter materials
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = 
      material.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || material.category.name === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' && material.isActive) ||
      (selectedStatus === 'inactive' && !material.isActive) ||
      (selectedStatus === 'low_stock' && material.currentStock <= material.reorderPoint) ||
      (selectedStatus === 'expiring' && material.expiryDate && new Date(material.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    totalMaterials: materials.length,
    activeMaterials: materials.filter(m => m.isActive).length,
    lowStockMaterials: materials.filter(m => m.currentStock <= m.reorderPoint).length,
    expiringMaterials: materials.filter(m => m.expiryDate && new Date(m.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length,
    totalValue: materials.reduce((sum, m) => sum + (m.currentStock * m.unitCost), 0),
    totalTransactions: transactions.length
  };

  const handleAddMaterial = () => {
    setFormData({
      materialCode: '',
      materialName: '',
      category: '',
      description: '',
      unit: 'kg',
      currentStock: 0,
      minStockLevel: 0,
      maxStockLevel: 0,
      reorderPoint: 0,
      unitCost: 0,
      supplierId: '',
      location: '',
      shelfLife: 0
    });
    setShowAddModal(true);
  };

  const handleEditMaterial = (material: RawMaterial) => {
    setFormData({
      materialCode: material.materialCode,
      materialName: material.materialName,
      category: material.category.name,
      description: material.description || '',
      unit: material.unit,
      currentStock: material.currentStock,
      minStockLevel: material.minStockLevel,
      maxStockLevel: material.maxStockLevel,
      reorderPoint: material.reorderPoint,
      unitCost: material.unitCost,
      supplierId: material.supplierId || '',
      location: material.location,
      shelfLife: material.shelfLife || 0
    });
    setSelectedMaterial(material);
    setShowEditModal(true);
  };

  const handleSaveMaterial = async () => {
    try {
      if (selectedMaterial) {
        // Update existing material
        const updatedMaterial = await productionService.updateRawMaterial(selectedMaterial.id, formData);
        setMaterials(prev => prev.map(m => m.id === selectedMaterial.id ? updatedMaterial : m));
        toast.success('Raw material updated successfully');
      } else {
        // Add new material
        const newMaterial = await productionService.createRawMaterial(formData);
        setMaterials(prev => [...prev, newMaterial]);
        toast.success('Raw material added successfully');
      }
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedMaterial(null);
    } catch (error) {
      console.error('Error saving material:', error);
      toast.error('Failed to save material');
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (window.confirm('Are you sure you want to delete this raw material?')) {
      try {
        await productionService.deleteRawMaterial(materialId);
        setMaterials(prev => prev.filter(m => m.id !== materialId));
        toast.success('Raw material deleted successfully');
      } catch (error) {
        console.error('Error deleting material:', error);
        toast.error('Failed to delete material');
      }
    }
  };

  const handleToggleStatus = async (materialId: string) => {
    try {
      const material = materials.find(m => m.id === materialId);
      if (material) {
        const updatedMaterial = await productionService.updateRawMaterial(materialId, { 
          isActive: !material.isActive 
        } as any);
        setMaterials(prev => prev.map(m => m.id === materialId ? updatedMaterial : m));
        toast.success('Material status updated');
      }
    } catch (error) {
      console.error('Error updating material status:', error);
      toast.error('Failed to update material status');
    }
  };

  const handleViewTransactions = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setShowTransactionModal(true);
  };

  const getStockStatus = (material: RawMaterial) => {
    if (material.currentStock <= material.reorderPoint) {
      return { status: 'low', color: 'text-red-600', bgColor: 'bg-red-100' };
    } else if (material.currentStock <= material.minStockLevel) {
      return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    } else {
      return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-100' };
    }
  };

  const getExpiryStatus = (material: RawMaterial) => {
    if (!material.expiryDate) return null;
    const daysUntilExpiry = Math.ceil((new Date(material.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 0) {
      return { status: 'expired', color: 'text-red-600', bgColor: 'bg-red-100' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    } else {
      return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-100' };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading raw materials...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Raw Material Management</h1>
          <p className="text-gray-600 mt-1">Track and manage raw materials inventory</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={() => setShowTransactionModal(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View All Transactions
          </button>
          <button
            onClick={handleAddMaterial}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-blue-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{stats.totalMaterials}</p>
              <p className="text-xs text-gray-600">Total Materials</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{stats.activeMaterials}</p>
              <p className="text-xs text-gray-600">Active Materials</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{stats.lowStockMaterials}</p>
              <p className="text-xs text-gray-600">Low Stock</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-yellow-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{stats.expiringMaterials}</p>
              <p className="text-xs text-gray-600">Expiring Soon</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Hash className="h-6 w-6 text-purple-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{stats.totalTransactions}</p>
              <p className="text-xs text-gray-600">Transactions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
              <p className="text-xs text-gray-600">Total Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search materials by name, code, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
              />
            </div>
          </div>
          
          <div className="lg:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="lg:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="low_stock">Low Stock</option>
              <option value="expiring">Expiring Soon</option>
            </select>
          </div>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Raw Materials ({filteredMaterials.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Material Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost & Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMaterials.map((material) => {
                const stockStatus = getStockStatus(material);
                const expiryStatus = getExpiryStatus(material);
                
                return (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{material.materialName}</div>
                        <div className="text-sm text-gray-500">{material.materialCode}</div>
                        <div className="text-xs text-gray-400">{material.category.name}</div>
                        {material.description && (
                          <div className="text-xs text-gray-400 mt-1">{material.description}</div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {material.currentStock} {material.unit}
                          </div>
                          <div className="text-xs text-gray-500">
                            Min: {material.minStockLevel} | Max: {material.maxStockLevel}
                          </div>
                          <div className="text-xs text-gray-500">
                            Reorder: {material.reorderPoint}
                          </div>
                        </div>
                        <div className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color}`}>
                          {stockStatus.status === 'low' ? 'Low Stock' : 
                           stockStatus.status === 'warning' ? 'Warning' : 'Good'}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(material.unitCost)} / {material.unit}
                        </div>
                        <div className="text-sm text-gray-500">
                          Total: {formatCurrency(material.currentStock * material.unitCost)}
                        </div>
                        {material.supplierName && (
                          <div className="text-xs text-gray-400">
                            Supplier: {material.supplierName}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">{material.location}</div>
                          {material.batchNumber && (
                            <div className="text-xs text-gray-500">Batch: {material.batchNumber}</div>
                          )}
                          {material.expiryDate && (
                            <div className="text-xs text-gray-500">
                              Expires: {formatDate(material.expiryDate)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          material.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {material.isActive ? 'Active' : 'Inactive'}
                        </span>
                        
                        {expiryStatus && (
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${expiryStatus.bgColor} ${expiryStatus.color}`}>
                            {expiryStatus.status === 'expired' ? 'Expired' : 
                             expiryStatus.status === 'expiring' ? 'Expiring Soon' : 'Fresh'}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewTransactions(material)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Transactions"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditMaterial(material)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit Material"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(material.id)}
                          className={`${material.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          title={material.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {material.isActive ? <Trash2 className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredMaterials.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No raw materials found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No materials match your current filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Material Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedMaterial ? 'Edit Raw Material' : 'Add New Raw Material'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedMaterial(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleSaveMaterial(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Material Code *
                    </label>
                    <input
                      type="text"
                      value={formData.materialCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, materialCode: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Material Name *
                    </label>
                    <input
                      type="text"
                      value={formData.materialName}
                      onChange={(e) => setFormData(prev => ({ ...prev, materialName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Stock *
                    </label>
                    <input
                      type="number"
                      value={formData.currentStock || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Remove leading zeros and convert to number
                        const numericValue = value === '' ? 0 : parseInt(value, 10);
                        setFormData(prev => ({ ...prev, currentStock: numericValue }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.name}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit *
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="kg">Kilogram (kg)</option>
                      <option value="liter">Liter</option>
                      <option value="piece">Piece</option>
                      <option value="meter">Meter</option>
                      <option value="gram">Gram</option>
                      <option value="ton">Ton</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Stock Level *
                    </label>
                    <input
                      type="number"
                      value={formData.minStockLevel || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numericValue = value === '' ? 0 : parseInt(value, 10);
                        setFormData(prev => ({ ...prev, minStockLevel: numericValue }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Stock Level *
                    </label>
                    <input
                      type="number"
                      value={formData.maxStockLevel || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numericValue = value === '' ? 0 : parseInt(value, 10);
                        setFormData(prev => ({ ...prev, maxStockLevel: numericValue }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reorder Point *
                    </label>
                    <input
                      type="number"
                      value={formData.reorderPoint || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numericValue = value === '' ? 0 : parseInt(value, 10);
                        setFormData(prev => ({ ...prev, reorderPoint: numericValue }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Cost (NPR) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.unitCost || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numericValue = value === '' ? 0 : parseFloat(value);
                        setFormData(prev => ({ ...prev, unitCost: numericValue }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shelf Life (days)
                    </label>
                    <input
                      type="number"
                      value={formData.shelfLife || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numericValue = value === '' ? 0 : parseInt(value, 10);
                        setFormData(prev => ({ ...prev, shelfLife: numericValue }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setSelectedMaterial(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {selectedMaterial ? 'Update Material' : 'Add Material'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedMaterial ? `${selectedMaterial.materialName} - Transactions` : 'All Material Transactions'}
                </h2>
                <button
                  onClick={() => {
                    setShowTransactionModal(false);
                    setSelectedMaterial(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reference
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions
                      .filter(t => !selectedMaterial || t.materialId === selectedMaterial.id)
                      .map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(transaction.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transaction.transactionType === 'purchase' ? 'bg-green-100 text-green-800' :
                              transaction.transactionType === 'consumption' ? 'bg-red-100 text-red-800' :
                              transaction.transactionType === 'adjustment' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {transaction.transactionType.charAt(0).toUpperCase() + transaction.transactionType.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(transaction.unitCost)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(transaction.totalCost)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.referenceNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.location}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
