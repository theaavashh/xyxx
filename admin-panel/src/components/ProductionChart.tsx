'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Package, 
  Beaker, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  ArrowDownRight,
  ArrowUpRight,
  ClipboardList,
  Table,
  Grid3X3,
  PieChart,
  Minus,
  GitBranch
} from 'lucide-react';
import { 
  ProductionChart, 
  ProductionChartForm, 
  ProductionIngredient, 
  ProductionOutput 
} from '@/types';
import { formatDate } from '@/lib/utils';
import { productionService } from '@/services/production.service';
import toast from 'react-hot-toast';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const INGREDIENT_UNITS = ['gm', 'kg', 'liter', 'ml', 'piece', 'bottle', 'packet', 'box'] as const;
const OUTPUT_UNITS = ['bottle', 'packet', 'box', 'piece', 'kg', 'gm'] as const;

const CATEGORIES = ['Spices', 'Meat', 'Vegetables', 'Oil', 'Salt', 'Sugar', 'Preservatives', 'Others'];

interface SubChartPortion {
  productName: string;
  quantity: number;
  unit: string;
  batchNumber?: string;
  percentage?: number; // percentage of ingredient used
}

interface EnhancedSubChart {
  ingredientId: string;
  ingredientName: string;
  ingredientQuantity: number;
  ingredientUnit: string;
  portions: SubChartPortion[];
  notes: string;
  totalUsed: number;
  remaining: number;
}

export default function ProductionChartComponent() {
  const [charts, setCharts] = useState<ProductionChart[]>([]);
  const [filteredCharts, setFilteredCharts] = useState<ProductionChart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedChart, setSelectedChart] = useState<ProductionChart | null>(null);
  const [expandedSubCharts, setExpandedSubCharts] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [showSubChartModal, setShowSubChartModal] = useState(false);
  const [selectedIngredientForSubChart, setSelectedIngredientForSubChart] = useState<ProductionIngredient | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<ProductionChartForm>({
    date: new Date().toISOString().split('T')[0],
    dayOfWeek: DAYS_OF_WEEK[new Date().getDay()],
    ingredients: [],
    outputs: [],
    subCharts: [],
    notes: ''
  });

  const [currentIngredient, setCurrentIngredient] = useState({
    name: '',
    sku: '',
    quantity: 0,
    unit: 'gm' as const,
    category: '',
    wastage: 0
  });

  const [currentOutput, setCurrentOutput] = useState({
    productName: '',
    sku: '',
    quantity: 0,
    unit: 'bottle' as const,
    batchNumber: ''
  });

  // SKU suggestions state
  const [skuSuggestions, setSkuSuggestions] = useState<{sku: string, productName: string}[]>([]);
  const [showSkuSuggestions, setShowSkuSuggestions] = useState(false);
  const [activeSkuField, setActiveSkuField] = useState<'ingredient' | 'output' | null>(null);

  // Sub-chart state with portion tracking
  const [currentSubChart, setCurrentSubChart] = useState<EnhancedSubChart | null>(null);
  const [currentPortion, setCurrentPortion] = useState<SubChartPortion>({
    productName: '',
    quantity: 0,
    unit: 'bottle',
    batchNumber: '',
    percentage: 0
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Filter charts based on search and date
  useEffect(() => {
    let filtered = charts;
    
    if (searchTerm) {
      filtered = filtered.filter(chart => 
        chart.ingredients.some(ing => 
          ing.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        chart.outputs.some(out => 
          out.productName.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        chart.dayOfWeek.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedDate) {
      filtered = filtered.filter(chart => 
        new Date(chart.date).toISOString().split('T')[0] === selectedDate
      );
    }
    
    setFilteredCharts(filtered);
  }, [charts, searchTerm, selectedDate]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await productionService.getProductionCharts();
      setCharts(data);
      setFilteredCharts(data);
    } catch (error) {
      console.error('Error loading production charts:', error);
      toast.error('Failed to load production charts');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch SKU suggestions based on search term
  const fetchSkuSuggestions = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSkuSuggestions([]);
      return;
    }
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/product-skus?search=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const suggestions = data.data.map((sku: any) => ({
            sku: sku.sku,
            productName: sku.product?.name || sku.variantName
          }));
          setSkuSuggestions(suggestions);
          setShowSkuSuggestions(true);
        }
      }
    } catch (error) {
      console.error('Error fetching SKU suggestions:', error);
    }
  };

  // Handle SKU input change for ingredients
  const handleIngredientSkuChange = (value: string) => {
    setCurrentIngredient(prev => ({ ...prev, sku: value }));
    fetchSkuSuggestions(value);
    setActiveSkuField('ingredient');
  };

  // Handle product name input change for ingredients
  const handleIngredientNameChange = (value: string) => {
    setCurrentIngredient(prev => ({ ...prev, name: value }));
    fetchSkuSuggestions(value);
    setActiveSkuField('ingredient');
  };

  // Handle SKU selection for ingredients
  const handleIngredientSkuSelect = (suggestion: {sku: string, productName: string}) => {
    setCurrentIngredient(prev => ({ 
      ...prev, 
      sku: suggestion.sku,
      name: suggestion.productName 
    }));
    setShowSkuSuggestions(false);
  };

  // Handle SKU input change for outputs
  const handleOutputSkuChange = (value: string) => {
    setCurrentOutput(prev => ({ ...prev, sku: value }));
    fetchSkuSuggestions(value);
    setActiveSkuField('output');
  };

  // Handle product name input change for outputs
  const handleOutputNameChange = (value: string) => {
    setCurrentOutput(prev => ({ ...prev, productName: value }));
    fetchSkuSuggestions(value);
    setActiveSkuField('output');
  };

  // Handle SKU selection for outputs
  const handleOutputSkuSelect = (suggestion: {sku: string, productName: string}) => {
    setCurrentOutput(prev => ({ 
      ...prev, 
      sku: suggestion.sku,
      productName: suggestion.productName 
    }));
    setShowSkuSuggestions(false);
  };

  const handleAddIngredient = () => {
    if (!currentIngredient.name || currentIngredient.quantity <= 0) {
      toast.error('Please enter ingredient name and quantity');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...currentIngredient }]
    }));
    
    setCurrentIngredient({
      name: '',
      sku: '',
      quantity: 0,
      unit: 'gm',
      category: '',
      wastage: 0
    });
    setShowSkuSuggestions(false);
  };

  const handleRemoveIngredient = (index: number) => {
    const removedIng = formData.ingredients[index];
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
      subCharts: prev.subCharts?.filter(sc => sc.ingredientId !== removedIng.name) || []
    }));
  };

  const handleAddOutput = () => {
    if (!currentOutput.productName || currentOutput.quantity <= 0) {
      toast.error('Please enter product name and quantity');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      outputs: [...prev.outputs, { ...currentOutput }]
    }));
    
    setCurrentOutput({
      productName: '',
      sku: '',
      quantity: 0,
      unit: 'bottle',
      batchNumber: ''
    });
    setShowSkuSuggestions(false);
  };

  const handleRemoveOutput = (index: number) => {
    setFormData(prev => ({
      ...prev,
      outputs: prev.outputs.filter((_, i) => i !== index)
    }));
  };

  // Enhanced sub-chart functionality
  const handleStartSubChart = (ingredient: ProductionIngredient) => {
    setSelectedIngredientForSubChart(ingredient);
    setCurrentSubChart({
      ingredientId: ingredient.id || ingredient.name,
      ingredientName: ingredient.name,
      ingredientQuantity: ingredient.quantity,
      ingredientUnit: ingredient.unit,
      portions: [],
      notes: '',
      totalUsed: 0,
      remaining: ingredient.quantity
    });
    setShowSubChartModal(true);
  };

  const handleAddPortion = () => {
    if (!currentPortion.productName || currentPortion.quantity <= 0) {
      toast.error('Please enter product name and quantity');
      return;
    }

    if (!currentSubChart) return;

    const newTotal = currentSubChart.totalUsed + currentPortion.quantity;
    
    if (newTotal > currentSubChart.ingredientQuantity) {
      toast.error(`Total portions (${newTotal} ${currentSubChart.ingredientUnit}) exceed available ingredient (${currentSubChart.ingredientQuantity} ${currentSubChart.ingredientUnit})`);
      return;
    }

    const percentage = (currentPortion.quantity / currentSubChart.ingredientQuantity) * 100;

    setCurrentSubChart(prev => {
      if (!prev) return null;
      const updatedPortions = [...prev.portions, { ...currentPortion, percentage: Math.round(percentage * 100) / 100 }];
      const newTotalUsed = updatedPortions.reduce((sum, p) => sum + p.quantity, 0);
      return {
        ...prev,
        portions: updatedPortions,
        totalUsed: newTotalUsed,
        remaining: prev.ingredientQuantity - newTotalUsed
      };
    });

    setCurrentPortion({
      productName: '',
      quantity: 0,
      unit: 'bottle',
      batchNumber: '',
      percentage: 0
    });
  };

  const handleRemovePortion = (index: number) => {
    setCurrentSubChart(prev => {
      if (!prev) return null;
      const updatedPortions = prev.portions.filter((_, i) => i !== index);
      const newTotalUsed = updatedPortions.reduce((sum, p) => sum + p.quantity, 0);
      return {
        ...prev,
        portions: updatedPortions,
        totalUsed: newTotalUsed,
        remaining: prev.ingredientQuantity - newTotalUsed
      };
    });
  };

  const handleSaveSubChart = () => {
    if (!currentSubChart || currentSubChart.portions.length === 0) {
      toast.error('Please add at least one portion');
      return;
    }

    // Convert to backend format
    const subChartForBackend = {
      ingredientId: currentSubChart.ingredientId,
      ingredientName: currentSubChart.ingredientName,
      outputs: currentSubChart.portions.map(p => ({
        productName: p.productName,
        quantity: p.quantity,
        unit: p.unit,
        batchNumber: p.batchNumber
      })),
      notes: `Portions from ${currentSubChart.ingredientQuantity} ${currentSubChart.ingredientUnit}. Used: ${currentSubChart.totalUsed} ${currentSubChart.ingredientUnit}, Remaining: ${currentSubChart.remaining} ${currentSubChart.ingredientUnit}`
    };
    
    setFormData(prev => ({
      ...prev,
      subCharts: [...(prev.subCharts || []), subChartForBackend]
    }));
    
    setShowSubChartModal(false);
    setCurrentSubChart(null);
    setSelectedIngredientForSubChart(null);
    toast.success(`Sub-chart created: ${currentSubChart.totalUsed} ${currentSubChart.ingredientUnit} allocated to ${currentSubChart.portions.length} products`);
  };

  const handleRemoveSubChart = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subCharts: prev.subCharts?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSaveChart = async () => {
    if (formData.ingredients.length === 0) {
      toast.error('Please add at least one ingredient');
      return;
    }
    
    if (formData.outputs.length === 0) {
      toast.error('Please add at least one output product');
      return;
    }
    
    try {
      if (selectedChart) {
        const updated = await productionService.updateProductionChart(selectedChart.id, formData);
        setCharts(prev => prev.map(c => c.id === selectedChart.id ? updated : c));
        toast.success('Production chart updated successfully');
      } else {
        const created = await productionService.createProductionChart(formData);
        setCharts(prev => [created, ...prev]);
        toast.success('Production chart created successfully');
      }
      
      setShowAddModal(false);
      setSelectedChart(null);
      resetForm();
    } catch (error) {
      console.error('Error saving chart:', error);
      toast.error('Failed to save production chart');
    }
  };

  const handleDeleteChart = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this production chart?')) {
      try {
        await productionService.deleteProductionChart(id);
        setCharts(prev => prev.filter(c => c.id !== id));
        toast.success('Production chart deleted successfully');
      } catch (error) {
        console.error('Error deleting chart:', error);
        toast.error('Failed to delete production chart');
      }
    }
  };

  const handleEditChart = (chart: ProductionChart) => {
    setSelectedChart(chart);
    setFormData({
      date: new Date(chart.date).toISOString().split('T')[0],
      dayOfWeek: chart.dayOfWeek,
      ingredients: chart.ingredients.map(ing => ({
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        category: ing.category
      })),
      outputs: chart.outputs.map(out => ({
        productName: out.productName,
        quantity: out.quantity,
        unit: out.unit,
        batchNumber: out.batchNumber
      })),
      subCharts: chart.subCharts?.map(sc => ({
        ingredientId: sc.ingredientId,
        ingredientName: sc.ingredientName,
        outputs: sc.outputs.map(out => ({
          productName: out.productName,
          quantity: out.quantity,
          unit: out.unit,
          batchNumber: out.batchNumber
        })),
        notes: sc.notes
      })),
      notes: chart.notes
    });
    setShowAddModal(true);
  };

  const handleViewDetails = (chart: ProductionChart) => {
    setSelectedChart(chart);
    setShowDetailsModal(true);
  };

  const toggleSubChartExpansion = (chartId: string) => {
    setExpandedSubCharts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chartId)) {
        newSet.delete(chartId);
      } else {
        newSet.add(chartId);
      }
      return newSet;
    });
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      dayOfWeek: DAYS_OF_WEEK[new Date().getDay()],
      ingredients: [],
      outputs: [],
      subCharts: [],
      notes: ''
    });
    setCurrentIngredient({ name: '', quantity: 0, unit: 'gm', category: '' });
    setCurrentOutput({ productName: '', quantity: 0, unit: 'bottle', batchNumber: '' });
    setCurrentSubChart(null);
    setSelectedIngredientForSubChart(null);
  };

  const getTotalIngredients = () => {
    return charts.reduce((total, chart) => total + chart.ingredients.length, 0);
  };

  const getTotalOutputs = () => {
    return charts.reduce((total, chart) => total + chart.outputs.length, 0);
  };

  const getTodayCharts = () => {
    const today = new Date().toISOString().split('T')[0];
    return charts.filter(chart => 
      new Date(chart.date).toISOString().split('T')[0] === today
    ).length;
  };

  // Calculate ingredient usage stats for a chart
  const getIngredientUsageStats = (chart: ProductionChart) => {
    const stats: Record<string, { total: number; used: number; unit: string }> = {};
    
    chart.ingredients.forEach(ing => {
      stats[ing.name] = { total: ing.quantity, used: 0, unit: ing.unit };
    });
    
    chart.subCharts?.forEach(sub => {
      const ingName = sub.ingredientName;
      if (stats[ingName]) {
        stats[ingName].used += sub.outputs.reduce((sum, out) => sum + out.quantity, 0);
      }
    });
    
    return stats;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading production charts...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Production Chart</h1>
          <p className="text-gray-600 mt-1">Track daily production inputs and outputs with sub-chart allocation</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-1.5 rounded text-sm font-medium flex items-center ${
                viewMode === 'card' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              Card
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded text-sm font-medium flex items-center ${
                viewMode === 'table' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Table className="h-4 w-4 mr-1" />
              Table
            </button>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Chart
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <ClipboardList className="h-6 w-6 text-blue-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{charts.length}</p>
              <p className="text-xs text-gray-600">Total Charts</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Beaker className="h-6 w-6 text-green-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{getTotalIngredients()}</p>
              <p className="text-xs text-gray-600">Total Ingredients</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-purple-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{getTotalOutputs()}</p>
              <p className="text-xs text-gray-600">Total Outputs</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-orange-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{getTodayCharts()}</p>
              <p className="text-xs text-gray-600">Today Charts</p>
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
                placeholder="Search by ingredient, product, or day..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
              />
            </div>
          </div>
          
          <div className="lg:w-48">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
              />
            </div>
          </div>
          
          <button
            onClick={loadData}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="space-y-4">
          {filteredCharts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No production charts found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedDate ? 'No charts match your filters.' : 'Get started by creating your first production chart.'}
              </p>
            </div>
          ) : (
            filteredCharts.map((chart) => (
              <div key={chart.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Chart Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-indigo-100 p-3 rounded-lg">
                        <Calendar className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {chart.dayOfWeek}, {formatDate(chart.date)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {chart.ingredients.length} ingredients → {chart.outputs.length} outputs
                          {chart.subCharts && chart.subCharts.length > 0 && (
                            <span className="ml-2 text-indigo-600">
                              ({chart.subCharts.length} sub-charts)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(chart)}
                        className="text-gray-600 hover:text-gray-900"
                        title="View Details"
                      >
                        <BarChart3 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditChart(chart)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit Chart"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteChart(chart.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Chart"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chart Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Ingredients */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <Beaker className="h-4 w-4 mr-2" />
                        Ingredients Used
                      </h4>
                      <div className="space-y-2">
                        {chart.ingredients.map((ing, idx) => {
                          const usageStats = getIngredientUsageStats(chart);
                          const stats = usageStats[ing.name];
                          const hasSubChart = chart.subCharts?.some(sc => sc.ingredientName === ing.name);
                          
                          return (
                            <div 
                              key={idx} 
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900">{ing.name}</span>
                                {hasSubChart && stats && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    <span className="text-orange-600 font-medium">
                                      {stats.used} {stats.unit} used
                                    </span>
                                    <span className="mx-1">|</span>
                                    <span className="text-green-600">
                                      {stats.total - stats.used} {stats.unit} remaining
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="text-sm text-gray-600 font-medium">
                                  {ing.quantity} {ing.unit}
                                </span>
                                {hasSubChart && (
                                  <GitBranch className="h-3 w-3 text-orange-500 ml-2 inline" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Outputs */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        Final Output
                      </h4>
                      <div className="space-y-2">
                        {chart.outputs.map((out, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between p-2 bg-green-50 rounded-lg"
                          >
                            <span className="text-sm font-medium text-gray-900">{out.productName}</span>
                            <span className="text-sm text-green-600 font-semibold">
                              {out.quantity} {out.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sub Charts Table */}
                  {chart.subCharts && chart.subCharts.length > 0 && (
                    <div className="mt-6">
                      <button
                        onClick={() => toggleSubChartExpansion(chart.id)}
                        className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-3"
                      >
                        {expandedSubCharts.has(chart.id) ? (
                          <ChevronUp className="h-4 w-4 mr-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 mr-1" />
                        )}
                        Ingredient Allocation Table ({chart.subCharts.length} sub-charts)
                      </button>
                      
                      {expandedSubCharts.has(chart.id) && (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                            <thead className="bg-orange-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ingredient</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total Available</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Allocated</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Percentage</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Batch</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {chart.subCharts.map((subChart, subIdx) => {
                                const parentIngredient = chart.ingredients.find(ing => ing.name === subChart.ingredientName);
                                const totalQuantity = parentIngredient?.quantity || 0;
                                const totalAllocated = subChart.outputs.reduce((sum, out) => sum + out.quantity, 0);
                                
                                return subChart.outputs.map((out, outIdx) => {
                                  const percentage = totalQuantity > 0 ? (out.quantity / totalQuantity) * 100 : 0;
                                  
                                  return (
                                    <tr key={`${subIdx}-${outIdx}`} className="hover:bg-gray-50">
                                      {outIdx === 0 && (
                                        <>
                                          <td rowSpan={subChart.outputs.length} className="px-4 py-3 text-sm font-medium text-gray-900 border-r">
                                            <div className="flex items-center">
                                              <GitBranch className="h-4 w-4 text-orange-500 mr-2" />
                                              {subChart.ingredientName}
                                            </div>
                                          </td>
                                          <td rowSpan={subChart.outputs.length} className="px-4 py-3 text-sm text-gray-600 border-r">
                                            {totalQuantity} {parentIngredient?.unit}
                                          </td>
                                        </>
                                      )}
                                      <td className="px-4 py-3 text-sm text-gray-900">{out.productName}</td>
                                      <td className="px-4 py-3 text-sm text-orange-600 font-medium">{out.quantity} {out.unit}</td>
                                      <td className="px-4 py-3 text-sm text-gray-600">{percentage.toFixed(1)}%</td>
                                      <td className="px-4 py-3 text-sm text-gray-500">{out.batchNumber || '-'}</td>
                                    </tr>
                                  );
                                });
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {chart.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 italic">{chart.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ingredients</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Outputs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Sub-Charts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCharts.map((chart) => (
                  <tr key={chart.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(chart.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {chart.dayOfWeek}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-1">
                        {chart.ingredients.map((ing, idx) => (
                          <div key={idx} className="flex items-center">
                            {chart.subCharts?.some(sc => sc.ingredientName === ing.name) && (
                              <GitBranch className="h-3 w-3 text-orange-500 mr-1" />
                            )}
                            <span>{ing.name}: {ing.quantity} {ing.unit}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-1">
                        {chart.outputs.map((out, idx) => (
                          <div key={idx} className="text-green-600">
                            {out.productName}: {out.quantity} {out.unit}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {chart.subCharts && chart.subCharts.length > 0 ? (
                        <div className="space-y-1">
                          {chart.subCharts.map((sub, idx) => (
                            <div key={idx} className="text-orange-600">
                              {sub.ingredientName} → {sub.outputs.length} products
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {chart.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(chart)}
                          className="text-gray-600 hover:text-gray-900"
                          title="View Details"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditChart(chart)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit Chart"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteChart(chart.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Chart"
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
          {filteredCharts.length === 0 && (
            <div className="p-8 text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No production charts found</h3>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedChart ? 'Edit Production Chart' : 'Add New Production Chart'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedChart(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Date Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          date: e.target.value,
                          dayOfWeek: DAYS_OF_WEEK[date.getDay()]
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day of Week
                    </label>
                    <input
                      type="text"
                      value={formData.dayOfWeek}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Ingredients Section */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Beaker className="h-5 w-5 mr-2" />
                      Ingredients
                    </h3>
                    
                    {/* Add Ingredient Form */}
                    <div className="space-y-3 mb-4">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Ingredient name"
                          value={currentIngredient.name}
                          onChange={(e) => setCurrentIngredient(prev => ({ ...prev, name: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder:text-black"
                        />
                        <select
                          value={currentIngredient.category}
                          onChange={(e) => setCurrentIngredient(prev => ({ ...prev, category: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                        >
                          <option value="">Select Category</option>
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          placeholder="Quantity"
                          value={currentIngredient.quantity || ''}
                          onChange={(e) => setCurrentIngredient(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder:text-black"
                        />
                        <input
                          type="number"
                          placeholder="Wastage"
                          value={currentIngredient.wastage || ''}
                          onChange={(e) => setCurrentIngredient(prev => ({ ...prev, wastage: Number(e.target.value) }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder:text-black"
                          title="Wastage during production"
                        />
                        <select
                          value={currentIngredient.unit}
                          onChange={(e) => setCurrentIngredient(prev => ({ ...prev, unit: e.target.value as any }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                        >
                          {INGREDIENT_UNITS.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={handleAddIngredient}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Ingredient
                      </button>
                    </div>

                    {/* Ingredients List */}
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {formData.ingredients.map((ing, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">{ing.name}</span>
                            <span className="text-gray-600 ml-2">
                              {ing.quantity} {ing.unit}
                            </span>
                            {ing.category && (
                              <span className="text-xs text-gray-500 ml-2">({ing.category})</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleStartSubChart(ing as ProductionIngredient)}
                              className="text-indigo-600 hover:text-indigo-900 text-sm flex items-center px-2 py-1 bg-indigo-50 rounded"
                              title="Divide into Portions"
                            >
                              <GitBranch className="h-4 w-4 mr-1" />
                              Divide
                            </button>
                            <button
                              onClick={() => handleRemoveIngredient(idx)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Outputs Section */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Final Output
                    </h3>
                    
                    {/* Add Output Form */}
                    <div className="space-y-3 mb-4">
                      <input
                        type="text"
                        placeholder="Product name"
                        value={currentOutput.productName}
                        onChange={(e) => setCurrentOutput(prev => ({ ...prev, productName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Quantity"
                          value={currentOutput.quantity || ''}
                          onChange={(e) => setCurrentOutput(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <select
                          value={currentOutput.unit}
                          onChange={(e) => setCurrentOutput(prev => ({ ...prev, unit: e.target.value as any }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {OUTPUT_UNITS.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="text"
                        placeholder="Batch number (optional)"
                        value={currentOutput.batchNumber}
                        onChange={(e) => setCurrentOutput(prev => ({ ...prev, batchNumber: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <button
                        onClick={handleAddOutput}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Output
                      </button>
                    </div>

                    {/* Outputs List */}
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {formData.outputs.map((out, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-green-200">
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">{out.productName}</span>
                            <span className="text-green-600 font-semibold ml-2">
                              {out.quantity} {out.unit}
                            </span>
                            {out.batchNumber && (
                              <span className="text-xs text-gray-500 ml-2">
                                Batch: {out.batchNumber}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveOutput(idx)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sub-Charts Summary */}
                {formData.subCharts && formData.subCharts.length > 0 && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <GitBranch className="h-5 w-5 mr-2" />
                      Ingredient Portions ({formData.subCharts.length})
                    </h3>
                    <div className="space-y-3">
                      {formData.subCharts.map((subChart, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 border border-orange-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-800 flex items-center">
                              <GitBranch className="h-4 w-4 text-orange-500 mr-2" />
                              {subChart.ingredientName} → Multiple Products
                            </h4>
                            <button
                              onClick={() => handleRemoveSubChart(idx)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {subChart.outputs.map((out, outIdx) => (
                              <div key={outIdx} className="flex items-center justify-between p-2 bg-orange-50 rounded text-sm">
                                <span className="text-gray-700">{out.productName}</span>
                                <span className="text-orange-600 font-medium">
                                  {out.quantity} {out.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                          {subChart.notes && (
                            <p className="text-xs text-gray-500 mt-2 italic">{subChart.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Additional notes about this production..."
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedChart(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChart}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {selectedChart ? 'Update Chart' : 'Save Chart'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Chart Creation Modal */}
      {showSubChartModal && currentSubChart && selectedIngredientForSubChart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <GitBranch className="h-6 w-6 text-orange-500 mr-2" />
                  Divide Ingredient: {currentSubChart.ingredientName}
                </h2>
                <button
                  onClick={() => {
                    setShowSubChartModal(false);
                    setCurrentSubChart(null);
                    setSelectedIngredientForSubChart(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Total Available:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {currentSubChart.ingredientQuantity} {currentSubChart.ingredientUnit}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Allocated:</span>
                  <span className="text-lg font-bold text-orange-600">
                    {currentSubChart.totalUsed} {currentSubChart.ingredientUnit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Remaining:</span>
                  <span className={`text-lg font-bold ${currentSubChart.remaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {currentSubChart.remaining} {currentSubChart.ingredientUnit}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-orange-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((currentSubChart.totalUsed / currentSubChart.ingredientQuantity) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {((currentSubChart.totalUsed / currentSubChart.ingredientQuantity) * 100).toFixed(1)}% allocated
                  </p>
                </div>
              </div>

              {/* Add Portion Form */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Add Portion</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Product name (e.g., Pickle, Dry Meat)"
                    value={currentPortion.productName}
                    onChange={(e) => setCurrentPortion(prev => ({ ...prev, productName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder={`Quantity (${currentSubChart.ingredientUnit})`}
                      value={currentPortion.quantity || ''}
                      onChange={(e) => setCurrentPortion(prev => ({ 
                        ...prev, 
                        quantity: Number(e.target.value),
                        percentage: currentSubChart.ingredientQuantity > 0 
                          ? (Number(e.target.value) / currentSubChart.ingredientQuantity) * 100 
                          : 0
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <select
                      value={currentPortion.unit}
                      onChange={(e) => setCurrentPortion(prev => ({ ...prev, unit: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {OUTPUT_UNITS.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  {currentPortion.quantity > 0 && currentSubChart.ingredientQuantity > 0 && (
                    <div className="text-sm text-gray-600">
                      This is <span className="font-semibold text-indigo-600">
                        {((currentPortion.quantity / currentSubChart.ingredientQuantity) * 100).toFixed(1)}%
                      </span> of total {currentSubChart.ingredientName}
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Batch number (optional)"
                    value={currentPortion.batchNumber}
                    onChange={(e) => setCurrentPortion(prev => ({ ...prev, batchNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    onClick={handleAddPortion}
                    disabled={currentSubChart.remaining <= 0}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Portion
                  </button>
                </div>
              </div>

              {/* Portions Table */}
              {currentSubChart.portions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Portion Allocation</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                      <thead className="bg-orange-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Product</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Quantity</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Percentage</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Batch</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentSubChart.portions.map((portion, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm text-gray-900">{portion.productName}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {portion.quantity} {portion.unit}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                {portion.percentage?.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">{portion.batchNumber || '-'}</td>
                            <td className="px-4 py-2 text-center">
                              <button
                                onClick={() => handleRemovePortion(idx)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Summary</h4>
                <p className="text-sm text-gray-700">
                  Allocating <span className="font-bold text-green-600">{currentSubChart.totalUsed} {currentSubChart.ingredientUnit}</span> of{' '}
                  <span className="font-bold">{currentSubChart.ingredientName}</span> into{' '}
                  <span className="font-bold">{currentSubChart.portions.length}</span> different products.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowSubChartModal(false);
                    setCurrentSubChart(null);
                    setSelectedIngredientForSubChart(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSubChart}
                  disabled={currentSubChart.portions.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Save Portions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedChart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Production Chart Details
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-indigo-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedChart.dayOfWeek}, {formatDate(selectedChart.date)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Created on {formatDate(selectedChart.createdAt)} by {selectedChart.createdBy}
                    </p>
                  </div>
                </div>

                {/* Ingredients Table */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Beaker className="h-5 w-5 mr-2 text-green-600" />
                    Ingredients ({selectedChart.ingredients.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                      <thead className="bg-green-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Category</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Usage</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedChart.ingredients.map((ing, idx) => {
                          const hasSubChart = selectedChart.subCharts?.some(sc => sc.ingredientName === ing.name);
                          const usageStats = getIngredientUsageStats(selectedChart);
                          const stats = usageStats[ing.name];
                          
                          return (
                            <tr key={idx}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {hasSubChart && <GitBranch className="h-4 w-4 text-orange-500 mr-1 inline" />}
                                {ing.name}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{ing.category || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{ing.quantity} {ing.unit}</td>
                              <td className="px-4 py-3 text-sm">
                                {hasSubChart && stats ? (
                                  <div>
                                    <span className="text-orange-600">{stats.used} {stats.unit} used</span>
                                    <span className="mx-1">|</span>
                                    <span className="text-green-600">{stats.total - stats.used} {stats.unit} remaining</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">No sub-chart</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Outputs Table */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-purple-600" />
                    Outputs ({selectedChart.outputs.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                      <thead className="bg-purple-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Product</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Batch Number</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedChart.outputs.map((out, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{out.productName}</td>
                            <td className="px-4 py-3 text-sm text-purple-600 font-semibold">{out.quantity} {out.unit}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{out.batchNumber || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sub-Charts Table */}
                {selectedChart.subCharts && selectedChart.subCharts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <GitBranch className="h-5 w-5 mr-2 text-orange-600" />
                      Ingredient Allocation ({selectedChart.subCharts.length})
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                        <thead className="bg-orange-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ingredient</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Total</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Product</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Allocated</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">%</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedChart.subCharts.map((subChart, subIdx) => {
                            const parentIngredient = selectedChart.ingredients.find(ing => ing.name === subChart.ingredientName);
                            const totalQuantity = parentIngredient?.quantity || 0;
                            
                            return subChart.outputs.map((out, outIdx) => {
                              const percentage = totalQuantity > 0 ? (out.quantity / totalQuantity) * 100 : 0;
                              
                              return (
                                <tr key={`${subIdx}-${outIdx}`}>
                                  {outIdx === 0 && (
                                    <>
                                      <td rowSpan={subChart.outputs.length} className="px-4 py-3 text-sm font-medium text-gray-900 border-r">
                                        <div className="flex items-center">
                                          <GitBranch className="h-4 w-4 text-orange-500 mr-2" />
                                          {subChart.ingredientName}
                                        </div>
                                      </td>
                                      <td rowSpan={subChart.outputs.length} className="px-4 py-3 text-sm text-gray-600 border-r">
                                        {totalQuantity} {parentIngredient?.unit}
                                      </td>
                                    </>
                                  )}
                                  <td className="px-4 py-3 text-sm text-gray-900">{out.productName}</td>
                                  <td className="px-4 py-3 text-sm text-orange-600 font-medium">{out.quantity} {out.unit}</td>
                                  <td className="px-4 py-3 text-sm">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                      {percentage.toFixed(1)}%
                                    </span>
                                  </td>
                                </tr>
                              );
                            });
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {selectedChart.notes && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
                    <p className="text-gray-600">{selectedChart.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
