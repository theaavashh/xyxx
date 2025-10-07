'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  RefreshCw,
  Building2,
  Package,
  Cpu,
  AlertCircle
} from 'lucide-react';
import { 
  RawMaterialCategory, 
  WorkCenter, 
  Machine 
} from '@/types';
import { productionService } from '@/services/production.service';
import toast from 'react-hot-toast';

export default function ConfigurationManagement() {
  const [activeTab, setActiveTab] = useState<'categories' | 'workcenters' | 'machines'>('categories');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [bulkCategories, setBulkCategories] = useState<Array<{name: string, isActive: boolean}>>([{name: '', isActive: true}]);

  // Data states
  const [categories, setCategories] = useState<RawMaterialCategory[]>([]);
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [categoriesData, workCentersData, machinesData] = await Promise.all([
        productionService.getRawMaterialCategories(),
        productionService.getWorkCenters(),
        productionService.getMachines?.() || Promise.resolve([])
      ]);
      
      setCategories(categoriesData);
      setWorkCenters(workCentersData);
      setMachines(machinesData);
    } catch (error) {
      console.error('Error loading configuration data:', error);
      toast.error('Failed to load configuration data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({});
    setSelectedItem(null);
    setBulkCategories([{name: '', isActive: true}]);
    setShowAddModal(true);
  };

  const addCategoryField = () => {
    setBulkCategories([...bulkCategories, {name: '', isActive: true}]);
  };

  const removeCategoryField = (index: number) => {
    if (bulkCategories.length > 1) {
      setBulkCategories(bulkCategories.filter((_, i) => i !== index));
    }
  };

  const updateBulkCategory = (index: number, field: 'name' | 'isActive', value: string | boolean) => {
    const updated = [...bulkCategories];
    updated[index] = { ...updated[index], [field]: value };
    setBulkCategories(updated);
  };

  const handleBulkSave = async () => {
    try {
      // Filter out empty categories
      const validCategories = bulkCategories.filter(cat => cat.name.trim() !== '');
      
      if (validCategories.length === 0) {
        toast.error('Please enter at least one category name');
        return;
      }

      // Create categories one by one to handle individual errors
      const results = [];
      const errors = [];
      
      for (const category of validCategories) {
        try {
          const newCategory = await productionService.createRawMaterialCategory?.(category);
          results.push(newCategory);
        } catch (error) {
          console.error(`Error creating category "${category.name}":`, error);
          errors.push(category.name);
        }
      }
      
      if (results.length > 0) {
        setCategories(prev => [...prev, ...results]);
        toast.success(`${results.length} categories added successfully`);
      }
      
      if (errors.length > 0) {
        toast.error(`Failed to create: ${errors.join(', ')} (may already exist)`);
      }
      
      if (results.length === validCategories.length) {
        setShowAddModal(false);
        setBulkCategories([{name: '', isActive: true}]);
      }
    } catch (error) {
      console.error('Error creating categories:', error);
      toast.error('Failed to create categories');
    }
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setFormData(item);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string, type: string) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        switch (type) {
          case 'category':
            await productionService.deleteRawMaterialCategory?.(id);
            setCategories(prev => prev.filter(c => c.id !== id));
            break;
          case 'workcenter':
            await productionService.deleteWorkCenter?.(id);
            setWorkCenters(prev => prev.filter(wc => wc.id !== id));
            break;
          case 'machine':
            await productionService.deleteMachine?.(id);
            setMachines(prev => prev.filter(m => m.id !== id));
            break;
        }
        toast.success(`${type} deleted successfully`);
      } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        toast.error(`Failed to delete ${type}`);
      }
    }
  };

  const handleSave = async () => {
    try {
      if (selectedItem) {
        // Update existing item
        switch (activeTab) {
          case 'categories':
            const updatedCategory = await productionService.updateRawMaterialCategory?.(selectedItem.id, formData);
            setCategories(prev => prev.map(c => c.id === selectedItem.id ? updatedCategory : c));
            break;
          case 'workcenters':
            const updatedWorkCenter = await productionService.updateWorkCenter?.(selectedItem.id, formData);
            setWorkCenters(prev => prev.map(wc => wc.id === selectedItem.id ? updatedWorkCenter : wc));
            break;
          case 'machines':
            const updatedMachine = await productionService.updateMachine?.(selectedItem.id, formData);
            setMachines(prev => prev.map(m => m.id === selectedItem.id ? updatedMachine : m));
            break;
        }
        toast.success(`${activeTab} updated successfully`);
      } else {
        // Add new item
        switch (activeTab) {
          case 'categories':
            const newCategory = await productionService.createRawMaterialCategory?.(formData);
            setCategories(prev => [...prev, newCategory]);
            break;
          case 'workcenters':
            const newWorkCenter = await productionService.createWorkCenter?.(formData);
            setWorkCenters(prev => [...prev, newWorkCenter]);
            break;
          case 'machines':
            const newMachine = await productionService.createMachine?.(formData);
            setMachines(prev => [...prev, newMachine]);
            break;
        }
        toast.success(`${activeTab} added successfully`);
      }
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error(`Error saving ${activeTab}:`, error);
      toast.error(`Failed to save ${activeTab}`);
    }
  };

  const renderCategories = () => (
    <div className="space-y-4">
      {categories.map((category) => (
        <div key={category.id} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{category.description}</p>
              <div className="flex items-center mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  category.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEdit(category)}
                className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(category.id, 'category')}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderWorkCenters = () => (
    <div className="space-y-4">
      {workCenters.map((workCenter) => (
        <div key={workCenter.id} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium text-gray-900">{workCenter.name}</h3>
                <span className="text-sm text-gray-500">({workCenter.code})</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{workCenter.description}</p>
              <div className="flex items-center mt-2 space-x-4">
                <span className="text-sm text-gray-600">
                  Capacity: {workCenter.capacity} units
                </span>
                <span className="text-sm text-gray-600">
                  Efficiency: {workCenter.efficiency}%
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  workCenter.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {workCenter.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEdit(workCenter)}
                className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(workCenter.id, 'workcenter')}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMachines = () => (
    <div className="space-y-4">
      {machines.map((machine) => (
        <div key={machine.id} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium text-gray-900">{machine.name}</h3>
                <span className="text-sm text-gray-500">({machine.code})</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {machine.type} - {machine.model}
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <span className="text-sm text-gray-600">
                  Capacity: {machine.capacity} units
                </span>
                <span className="text-sm text-gray-600">
                  Efficiency: {machine.efficiency}%
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  machine.status === 'operational' 
                    ? 'bg-green-100 text-green-800' 
                    : machine.status === 'maintenance'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {machine.status}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEdit(machine)}
                className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(machine.id, 'machine')}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderForm = () => {
    const isEdit = !!selectedItem;
    const title = isEdit ? `Edit ${activeTab}` : 
                  activeTab === 'categories' ? 'Add New Categories' : 
                  `Add New ${activeTab}`;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className={`bg-white rounded-lg shadow-xl w-full mx-4 max-h-[90vh] overflow-y-auto ${
          activeTab === 'categories' && !isEdit ? 'max-w-2xl' : 'max-w-md'
        }`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setSelectedItem(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'categories' && (
              <div className="space-y-4">
                {bulkCategories.map((category, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category Name *
                        </label>
                        <div className="flex gap-2 group">
                          <input
                            type="text"
                            value={category.name}
                            onChange={(e) => updateBulkCategory(index, 'name', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 group-hover:border-gray-400 transition-colors duration-200"
                            placeholder="Enter category name"
                          />
                          <button
                            type="button"
                            onClick={addCategoryField}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:shadow-md"
                            title="Add another category"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          {bulkCategories.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeCategoryField(index)}
                              className="inline-flex items-center px-2 py-2 border border-red-200 shadow-sm text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 hover:border-red-300 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 hover:shadow-md"
                              title="Remove this category"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`isActive-${index}`}
                          checked={category.isActive}
                          onChange={(e) => updateBulkCategory(index, 'isActive', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`isActive-${index}`} className="ml-2 block text-sm text-gray-900">
                          Active
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                
                {bulkCategories.length > 1 && (
                  <div className="text-center text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                    {bulkCategories.filter(cat => cat.name.trim() !== '').length} categories ready to be added
                  </div>
                )}
              </div>
            )}

            {activeTab === 'workcenters' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Center Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter work center name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter work center code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Enter work center description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      value={formData.capacity || 10}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Efficiency (%)
                    </label>
                    <input
                      type="number"
                      value={formData.efficiency || 0}
                      onChange={(e) => setFormData({ ...formData, efficiency: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'machines' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Machine Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter machine name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter machine code"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <input
                      type="text"
                      value={formData.type || ''}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Welding Machine"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model
                    </label>
                    <input
                      type="text"
                      value={formData.model || ''}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Model XYZ"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Center *
                  </label>
                  <select
                    value={formData.workCenterId || ''}
                    onChange={(e) => setFormData({ ...formData, workCenterId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Work Center</option>
                    {workCenters.map((wc) => (
                      <option key={wc.id} value={wc.id}>
                        {wc.name} ({wc.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      value={formData.capacity || 1}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Efficiency (%)
                    </label>
                    <input
                      type="number"
                      value={formData.efficiency || 0}
                      onChange={(e) => setFormData({ ...formData, efficiency: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status || 'operational'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="operational">Operational</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="breakdown">Breakdown</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedItem(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={activeTab === 'categories' && !isEdit ? handleBulkSave : handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
              >
                {isEdit ? 'Update' : activeTab === 'categories' ? 'Add Categories' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading configuration...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Configuration Management</h1>
          <p className="text-gray-600 mt-1">Manage system configuration and master data</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={loadData}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'categories', name: 'Raw Material Categories', icon: Package },
            { id: 'workcenters', name: 'Work Centers', icon: Building2 },
            { id: 'machines', name: 'Machines', icon: Cpu }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'categories' && renderCategories()}
        {activeTab === 'workcenters' && renderWorkCenters()}
        {activeTab === 'machines' && renderMachines()}
      </div>

      {/* Modals */}
      {showAddModal && renderForm()}
      {showEditModal && renderForm()}
    </div>
  );
}
