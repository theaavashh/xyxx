'use client';

import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Tag,
  X
} from 'lucide-react';
import { config } from '@/lib/config';

interface Category {
  id: string;
  title: string;
  description?: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
  _count?: {
    products: number;
  };
}

interface CreateCategoryData {
  title: string;
  isActive?: boolean;
  sortOrder?: number;
  subcategories?: SubcategoryItem[];
}

interface SubcategoryItem {
  name: string;
  sortOrder: number;
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CreateCategoryData>({
    title: '',
    isActive: true,
    sortOrder: 0,
    subcategories: []
  });
  const [currentSubcategory, setCurrentSubcategory] = useState('');
  const [categorySubcategories, setCategorySubcategories] = useState<{[key: string]: SubcategoryItem[]}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState<{isOpen: boolean, title: string, message: string}>({
    isOpen: false,
    title: '',
    message: ''
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`${config.apiUrl}/categories`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.data || []);
          // For now, we'll mock subcategories or store them as part of category description
          await fetchAllCategorySubcategories(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCategorySubcategories = async (categories: Category[]) => {
    try {
      const subcategoriesData: {[key: string]: SubcategoryItem[]} = {};
      
      // For now, parse subcategories from description as temporary storage
      // Later this will be a proper subcategories field in the database
      categories.forEach(category => {
        if (category.description && category.description.includes(',')) {
          subcategoriesData[category.id] = category.description
            .split(',')
            .map((sub, index) => ({
              name: sub.trim(),
              sortOrder: index + 1
            }))
            .filter(sub => sub.name.length > 0);
        } else {
          subcategoriesData[category.id] = [];
        }
      });
      
      setCategorySubcategories(subcategoriesData);
    } catch (error) {
      console.error('Error parsing category subcategories:', error);
    }
  };

  const addSubcategory = () => {
    if (currentSubcategory.trim()) {
      const newSubcategory: SubcategoryItem = {
        name: currentSubcategory.trim(),
        sortOrder: (formData.subcategories?.length || 0) + 1
      };
      setFormData(prev => ({
        ...prev,
        subcategories: [...(prev.subcategories || []), newSubcategory]
      }));
      setCurrentSubcategory('');
    }
  };

  const removeSubcategory = (index: number) => {
    setFormData(prev => {
      const newSubcategories = prev.subcategories?.filter((_, i) => i !== index) || [];
      // Reorder sort orders after removal
      return {
        ...prev,
        subcategories: newSubcategories.map((sub, idx) => ({
          ...sub,
          sortOrder: idx + 1
        }))
      };
    });
  };

  const moveSubcategoryUp = (index: number) => {
    if (index === 0) return; // Can't move first item up
    
    setFormData(prev => {
      const subcategories = [...(prev.subcategories || [])];
      [subcategories[index - 1], subcategories[index]] = [subcategories[index], subcategories[index - 1]];
      
      // Update sort orders
      return {
        ...prev,
        subcategories: subcategories.map((sub, idx) => ({
          ...sub,
          sortOrder: idx + 1
        }))
      };
    });
  };

  const moveSubcategoryDown = (index: number) => {
    if (!formData.subcategories || index === formData.subcategories.length - 1) return; // Can't move last item down
    
    setFormData(prev => {
      const subcategories = [...(prev.subcategories || [])];
      [subcategories[index], subcategories[index + 1]] = [subcategories[index + 1], subcategories[index]];
      
      // Update sort orders
      return {
        ...prev,
        subcategories: subcategories.map((sub, idx) => ({
          ...sub,
          sortOrder: idx + 1
        }))
      };
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubcategory();
    }
  };

  const showError = (title: string, message: string) => {
    setErrorModal({
      isOpen: true,
      title,
      message
    });
  };

  const closeErrorModal = () => {
    setErrorModal({
      isOpen: false,
      title: '',
      message: ''
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle create/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { subcategories, ...categoryData } = formData;
      const token = localStorage.getItem('admin_token');
      console.log('Token from localStorage:', token); // Debug log
      
      // Store subcategories in description field for now (sorted by sortOrder)
      const finalCategoryData = {
        ...categoryData,
        description: subcategories && subcategories.length > 0 
          ? subcategories
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map(sub => sub.name)
              .join(', ')
          : ''
      };
      
      console.log('Sending to API:', finalCategoryData); // Debug log
      
      const url = editingCategory 
        ? `${config.apiUrl}/categories/${editingCategory.id}`
        : `${config.apiUrl}/categories`;
      
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalCategoryData)
      });

      if (response.ok) {
        await fetchCategories();
        handleCloseModal();
      } else {
        const errorData = await response.json();
        showError(
          'Failed to Save Category',
          errorData.message || 'Unable to save the category. Please check your input and try again.'
        );
      }
    } catch (error) {
      console.error('Error saving category:', error);
      showError(
        'Network Error',
        'Unable to connect to the server. Please check your internet connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.title}"?`)) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${config.apiUrl}/categories/${category.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchCategories();
      } else {
        const errorData = await response.json();
        showError(
          'Failed to Delete Category',
          errorData.message || 'Unable to delete the category. It may be in use or you may not have permission.'
        );
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showError(
        'Network Error',
        'Unable to connect to the server. Please check your internet connection and try again.'
      );
    }
  };

  // Modal handlers
  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingCategory(null);
    setFormData({
      title: '',
      isActive: true,
      sortOrder: 0,
      subcategories: []
    });
    setCurrentSubcategory('');
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      title: category.title,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      subcategories: categorySubcategories[category.id] || []
    });
    setIsCreateModalOpen(true);
  };

  const handleMoveUp = async (category: Category) => {
    const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const currentIndex = sortedCategories.findIndex(c => c.id === category.id);
    
    if (currentIndex > 0) {
      const prevCategory = sortedCategories[currentIndex - 1];
      await updateSortOrder(category.id, prevCategory.sortOrder);
      await updateSortOrder(prevCategory.id, category.sortOrder);
      fetchCategories();
    }
  };

  const handleMoveDown = async (category: Category) => {
    const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const currentIndex = sortedCategories.findIndex(c => c.id === category.id);
    
    if (currentIndex < sortedCategories.length - 1) {
      const nextCategory = sortedCategories[currentIndex + 1];
      await updateSortOrder(category.id, nextCategory.sortOrder);
      await updateSortOrder(nextCategory.id, category.sortOrder);
      fetchCategories();
    }
  };

  const updateSortOrder = async (categoryId: string, newSortOrder: number) => {
    const token = localStorage.getItem('admin_token');
    await fetch(`${config.apiUrl}/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sortOrder: newSortOrder })
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Category Management</h1>
              <p className="mt-2 text-lg text-gray-600">Organize your business by creating categories with subcategories</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Category
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-200"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Categories</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{categories.length}</p>
              </div>
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <FolderOpen className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Categories</p>
                <p className="text-4xl font-bold text-green-600 mt-2">
                  {categories.filter(c => c.isActive).length}
                </p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                <FolderOpen className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Products</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">
                  {categories.reduce((sum, c) => sum + (c._count?.products || 0), 0)}
                </p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-xl font-semibold text-gray-900">Categories</h3>
            <p className="text-sm text-gray-600 mt-1">Manage your product categories and subcategories</p>
          </div>
          <div className="p-8">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FolderOpen className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new category to organize your products.'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Category
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredCategories
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((category, index) => {
                  const colors = [
                    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 
                    'bg-teal-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500'
                  ];
                  const colorClass = colors[index % colors.length];
                  
                  return (
                    <div key={category.id} className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                      {/* Card Header */}
                      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-14 h-14 ${colorClass} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                              <FolderOpen className="h-7 w-7 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xl font-bold text-gray-900 truncate">
                                {category.title}
                              </h4>
                              <p className="text-sm text-gray-500 font-medium">
                                Order #{category.sortOrder}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleMoveUp(category)}
                              className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                              title="Move up"
                            >
                              <ChevronUp className="h-4 w-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleMoveDown(category)}
                              className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                              title="Move down"
                            >
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6">
                        {/* Status and Products */}
                        <div className="flex items-center justify-between mb-6">
                          <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${
                            category.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Package className="h-4 w-4 mr-2" />
                            <span className="font-semibold">{category._count?.products || 0}</span>
                            <span className="ml-1">products</span>
                          </div>
                        </div>

                        {/* Subcategories */}
                        <div className="mb-6">
                          <h5 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Subcategories</h5>
                          {categorySubcategories[category.id]?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {categorySubcategories[category.id]
                                .sort((a, b) => a.sortOrder - b.sortOrder)
                                .map((subcategory, subIndex) => (
                                <span 
                                  key={subIndex}
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full border border-indigo-200"
                                >
                                  <Tag className="h-3 w-3 mr-1.5" />
                                  {subcategory.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-400 bg-gray-50 px-4 py-3 rounded-xl">
                              <Package className="h-4 w-4 mr-2" />
                              <span className="text-sm font-medium">No subcategories</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => setViewingCategory(category)}
                              className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-105"
                              title="View details"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(category)}
                              className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-105"
                              title="Edit category"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(category)}
                              className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete category"
                              disabled={!!(category._count?.products && category._count.products > 0)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            Created {new Date(category.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <p className="text-gray-600 mt-1">
                {editingCategory ? 'Update category details and subcategories' : 'Add a new category to organize your products'}
              </p>
            </div>
            <div className="p-8">
            
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-200"
                    placeholder="Enter category title"
                    required
                  />
                </div>



                {/* Subcategories Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subcategories (Optional)
                  </label>
                  <p className="text-sm text-gray-600 mb-4">
                    Add subcategories for this category. Press Enter to add each subcategory.
                  </p>
                  
                  {/* Subcategory Input */}
                  <div className="flex gap-3 mb-4">
                    <input
                      type="text"
                      value={currentSubcategory}
                      onChange={(e) => setCurrentSubcategory(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-200"
                      placeholder="e.g., ZipZip Mutton Achar"
                    />
                    <button
                      type="button"
                      onClick={addSubcategory}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Subcategories Cards with Sorting */}
                  {formData.subcategories && formData.subcategories.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-xs text-gray-500">
                        Use arrows to reorder subcategories for distributors
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {formData.subcategories?.map((subcategory, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-xs text-white font-mono">
                                  {subcategory.sortOrder}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-indigo-600" />
                                <span className="text-indigo-800 font-medium">
                                  {subcategory.name}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveSubcategoryUp(index)}
                                disabled={index === 0}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="Move up"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveSubcategoryDown(index)}
                                disabled={index === (formData.subcategories?.length || 0) - 1}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="Move down"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeSubcategory(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-200"
                    min="0"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-3 block text-sm font-semibold text-gray-900">
                    Active
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 text-sm font-semibold text-white bg-indigo-600 border border-transparent rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isSubmitting ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-2xl font-bold text-gray-900">Category Details</h3>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <p className="text-lg text-gray-900 font-medium">{viewingCategory.title}</p>
              </div>
              
              {viewingCategory.description && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <p className="text-gray-900">{viewingCategory.description}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${
                  viewingCategory.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {viewingCategory.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Products</label>
                <p className="text-lg text-gray-900 font-medium">{viewingCategory._count?.products || 0}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Created</label>
                <p className="text-gray-900">
                  {new Date(viewingCategory.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end px-8 py-6 border-t border-gray-200">
              <button
                onClick={() => setViewingCategory(null)}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  {errorModal.title}
                </h3>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-700">
                {errorModal.message}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={closeErrorModal}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
