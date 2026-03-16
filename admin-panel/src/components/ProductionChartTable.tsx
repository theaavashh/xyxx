'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Package,
  Beaker,
  Search,
  Download,
  RefreshCw,
  Grid3X3,
  Table,
  FileText,
  Printer,
  User,
  CheckCircle,
  X,
  Eye,
  Box,
  TrendingUp,
  BarChart3,
  PieChart,
  BarChart2
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ProductionChartTableData {
  id: string;
  productChartNo: string;
  dailySeriesNo: string;
  date: string;
  productName: string;
  batchNo: string;
  ingredients: {
    sno: number;
    sku: string;
    particular: string;
    quantity: number;
    unit: string;
  }[];
  packaging: {
    sno: number;
    sku: string;
    particular: string;
    quantity: number;
    unit: string;
  }[];
  totalFinishedOutput: number;
  outputUnit: string;
  outputSku?: string;
  wastage?: {
    sno: number;
    sku: string;
    particular: string;
    quantity: number;
    unit: string;
  }[];
  preparedBy: string;
  approvedBy: string;
  notes?: string;
  createdAt: string;
}

interface ChartFormData {
  productChartNo: string;
  dailySeriesNo: string;
  date: string;
  productName: string;
  batchNo: string;
  ingredients: { sno: number; sku: string; particular: string; quantity: number; unit: string }[];
  packaging: { sno: number; sku: string; particular: string; quantity: number; unit: string }[];
  totalFinishedOutput: number;
  outputUnit: string;
  outputSku: string;
  wastage: { sno: number; sku: string; particular: string; quantity: number; unit: string }[];
  preparedBy: string;
  approvedBy: string;
  notes: string;
}

const UNITS = ['gm', 'kg', 'liter', 'ml', 'piece', 'bottle', 'packet', 'box', 'pcs', 'unit'] as const;

export default function ProductionChartTable() {
  const [charts, setCharts] = useState<ProductionChartTableData[]>([]);
  const [filteredCharts, setFilteredCharts] = useState<ProductionChartTableData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedChart, setSelectedChart] = useState<ProductionChartTableData | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  
  // SKU suggestions state
  const [skuSuggestions, setSkuSuggestions] = useState<{sku: string; productName: string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionField, setActiveSuggestionField] = useState<{type: 'ingredient' | 'packaging' | 'output' | 'wastage'; index: number; field: 'sku' | 'particular' | 'productName'} | null>(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [allSkus, setAllSkus] = useState<{sku: string; productName: string}[]>([]);
  const [highlightedSuggestion, setHighlightedSuggestion] = useState<{sku: string; productName: string} | null>(null);

  const [formData, setFormData] = useState<ChartFormData>({
    productChartNo: '',
    dailySeriesNo: '',
    date: new Date().toISOString().split('T')[0],
    productName: '',
    batchNo: '',
    ingredients: [
      { sno: 1, sku: '', particular: '', quantity: 0, unit: 'gm' },
      { sno: 2, sku: '', particular: '', quantity: 0, unit: 'gm' },
      { sno: 3, sku: '', particular: '', quantity: 0, unit: 'gm' },
      { sno: 4, sku: '', particular: '', quantity: 0, unit: 'gm' },
      { sno: 5, sku: '', particular: '', quantity: 0, unit: 'gm' }
    ],
    packaging: [
      { sno: 1, sku: '', particular: '', quantity: 0, unit: 'pcs' },
      { sno: 2, sku: '', particular: '', quantity: 0, unit: 'pcs' },
      { sno: 3, sku: '', particular: '', quantity: 0, unit: 'pcs' },
      { sno: 4, sku: '', particular: '', quantity: 0, unit: 'pcs' },
      { sno: 5, sku: '', particular: '', quantity: 0, unit: 'pcs' }
    ],
    totalFinishedOutput: 0,
    outputUnit: 'bottle',
    outputSku: '',
    wastage: [
      { sno: 1, sku: '', particular: '', quantity: 0, unit: 'gm' },
      { sno: 2, sku: '', particular: '', quantity: 0, unit: 'gm' },
      { sno: 3, sku: '', particular: '', quantity: 0, unit: 'gm' }
    ],
    preparedBy: '',
    approvedBy: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
    fetchAllSkus();
  }, []);

  // Fetch all SKUs for auto-suggestions
  const fetchAllSkus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/product-skus`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const skus = data.data.map((sku: any) => ({
            sku: sku.sku,
            productName: sku.product?.name || sku.variantName
          }));
          setAllSkus(skus);
        }
      }
    } catch (error) {
      console.error('Error fetching SKUs:', error);
    }
  };

  // Filter suggestions based on input
  const getSuggestions = (input: string) => {
    if (!input) return [];
    
    const lowerInput = input.toLowerCase();
    const suggestions = allSkus.filter(item => 
      item.sku.toLowerCase().includes(lowerInput) ||
      item.productName.toLowerCase().includes(lowerInput)
    );
    
    // Sort: items starting with input come first
    suggestions.sort((a, b) => {
      const aStartsWith = a.sku.toLowerCase().startsWith(lowerInput) || a.productName.toLowerCase().startsWith(lowerInput);
      const bStartsWith = b.sku.toLowerCase().startsWith(lowerInput) || b.productName.toLowerCase().startsWith(lowerInput);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      return 0;
    });
    
    return suggestions.slice(0, 10); // Limit to 10 suggestions
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, type: 'ingredient' | 'packaging', index: number, field: 'sku' | 'particular') => {
    if (!showSuggestions || skuSuggestions.length === 0) return;
    
    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        if (highlightedSuggestion) {
          handleSuggestionSelect(highlightedSuggestion);
        } else if (skuSuggestions.length > 0) {
          handleSuggestionSelect(skuSuggestions[0]);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => {
          const newIndex = prev < skuSuggestions.length - 1 ? prev + 1 : 0;
          setHighlightedSuggestion(skuSuggestions[newIndex]);
          return newIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : skuSuggestions.length - 1;
          setHighlightedSuggestion(skuSuggestions[newIndex]);
          return newIndex;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedSuggestion) {
          handleSuggestionSelect(highlightedSuggestion);
        } else if (skuSuggestions.length > 0) {
          handleSuggestionSelect(skuSuggestions[0]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedSuggestion(null);
        break;
    }
  };

  // Handle keyboard navigation for output fields
  const handleOutputKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || skuSuggestions.length === 0) return;
    
    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        if (highlightedSuggestion) {
          handleOutputSuggestionSelect(highlightedSuggestion);
        } else if (skuSuggestions.length > 0) {
          handleOutputSuggestionSelect(skuSuggestions[0]);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => {
          const newIndex = prev < skuSuggestions.length - 1 ? prev + 1 : 0;
          setHighlightedSuggestion(skuSuggestions[newIndex]);
          return newIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : skuSuggestions.length - 1;
          setHighlightedSuggestion(skuSuggestions[newIndex]);
          return newIndex;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedSuggestion) {
          handleOutputSuggestionSelect(highlightedSuggestion);
        } else if (skuSuggestions.length > 0) {
          handleOutputSuggestionSelect(skuSuggestions[0]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedSuggestion(null);
        break;
    }
  };

  // Handle output suggestion selection
  const handleOutputSuggestionSelect = (suggestion: {sku: string; productName: string}) => {
    setFormData(prev => ({ 
      ...prev, 
      outputSku: suggestion.sku,
      productName: suggestion.productName 
    }));
    setShowSuggestions(false);
    setHighlightedSuggestion(null);
    setSelectedSuggestionIndex(0);
  };

  // Handle SKU/particular input change
  const handleSkuInputChange = (
    type: 'ingredient' | 'packaging' | 'wastage',
    index: number,
    field: 'sku' | 'particular',
    value: string
  ) => {
    // Update the field
    if (type === 'ingredient') {
      handleIngredientChange(index, field, value);
    } else if (type === 'packaging') {
      handlePackagingChange(index, field, value);
    } else {
      handleWastageChange(index, field, value);
    }

    // Show suggestions
    const suggestions = getSuggestions(value);
    setSkuSuggestions(suggestions);
    setShowSuggestions(true);
    setActiveSuggestionField({ type, index, field });
    setSelectedSuggestionIndex(0);
    setHighlightedSuggestion(suggestions.length > 0 ? suggestions[0] : null);

    // Auto-fill if exact match found
    const exactMatch = allSkus.find(item => 
      field === 'sku' ? item.sku === value : item.productName === value
    );
    
    if (exactMatch) {
      if (type === 'ingredient') {
        handleIngredientChange(index, 'sku', exactMatch.sku);
        handleIngredientChange(index, 'particular', exactMatch.productName);
      } else if (type === 'packaging') {
        handlePackagingChange(index, 'sku', exactMatch.sku);
        handlePackagingChange(index, 'particular', exactMatch.productName);
      } else {
        handleWastageChange(index, 'sku', exactMatch.sku);
        handleWastageChange(index, 'particular', exactMatch.productName);
      }
      setShowSuggestions(false);
      setHighlightedSuggestion(null);
      return;
    }

    // Auto-completion: if there's a strong match (starts with), auto-complete after a short delay
    if (value.length >= 2 && suggestions.length > 0) {
      const firstSuggestion = suggestions[0];
      const matchText = field === 'sku' ? firstSuggestion.sku : firstSuggestion.productName;
      
      // Check if current input is a prefix of the suggestion
      if (matchText.toLowerCase().startsWith(value.toLowerCase())) {
        // Auto-complete the field
        if (type === 'ingredient') {
          handleIngredientChange(index, field, matchText);
          // Also fill the other field
          handleIngredientChange(index, field === 'sku' ? 'particular' : 'sku', 
            field === 'sku' ? firstSuggestion.productName : firstSuggestion.sku);
        } else if (type === 'packaging') {
          handlePackagingChange(index, field, matchText);
          handlePackagingChange(index, field === 'sku' ? 'particular' : 'sku',
            field === 'sku' ? firstSuggestion.productName : firstSuggestion.sku);
        } else {
          handleWastageChange(index, field, matchText);
          handleWastageChange(index, field === 'sku' ? 'particular' : 'sku',
            field === 'sku' ? firstSuggestion.productName : firstSuggestion.sku);
        }
        setShowSuggestions(false);
        setHighlightedSuggestion(null);
      }
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: {sku: string; productName: string}, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    if (!activeSuggestionField) return;
    
    const { type, index } = activeSuggestionField;
    
    if (type === 'ingredient') {
      handleIngredientChange(index, 'sku', suggestion.sku);
      handleIngredientChange(index, 'particular', suggestion.productName);
    } else if (type === 'packaging') {
      handlePackagingChange(index, 'sku', suggestion.sku);
      handlePackagingChange(index, 'particular', suggestion.productName);
    }
    
    setShowSuggestions(false);
    setActiveSuggestionField(null);
    setSelectedSuggestionIndex(0);
    setHighlightedSuggestion(null);
  };

  useEffect(() => {
    let filtered = charts;

    if (searchTerm) {
      filtered = filtered.filter(chart =>
        chart.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chart.productChartNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chart.batchNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDate) {
      filtered = filtered.filter(chart => chart.date === selectedDate);
    }

    setFilteredCharts(filtered);
  }, [charts, searchTerm, selectedDate]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSuggestions) {
        setShowSuggestions(false);
        setActiveSuggestionField(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showSuggestions]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const mockData: ProductionChartTableData[] = [
        {
          id: '1',
          productChartNo: 'PC-2024-001',
          dailySeriesNo: 'DS-001',
          date: '2024-02-12',
          productName: 'Chicken Pickle',
          batchNo: 'B-001',
          ingredients: [
            { sno: 1, sku: '', particular: 'Chicken Meat', quantity: 5000, unit: 'gm' },
            { sno: 2, sku: '', particular: 'Mustard Oil', quantity: 2000, unit: 'ml' },
            { sno: 3, sku: '', particular: 'Chili Powder', quantity: 500, unit: 'gm' },
            { sno: 4, sku: '', particular: 'Turmeric', quantity: 100, unit: 'gm' },
            { sno: 5, sku: '', particular: 'Salt', quantity: 300, unit: 'gm' },
          ],
          packaging: [
            { sno: 1, sku: '', particular: 'Glass Jar (200gm)', quantity: 25, unit: 'pcs' },
            { sno: 2, sku: '', particular: 'Label Sticker', quantity: 25, unit: 'pcs' },
            { sno: 3, sku: '', particular: 'Sealing Cap', quantity: 25, unit: 'pcs' },
          ],
          totalFinishedOutput: 25,
          outputUnit: 'bottle',
          preparedBy: 'Ram Bahadur',
          approvedBy: 'Manager Shrestha',
          notes: 'First batch of the day',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          productChartNo: 'PC-2024-002',
          dailySeriesNo: 'DS-002',
          date: '2024-02-13',
          productName: 'Potato Chips',
          batchNo: 'B-002',
          ingredients: [
            { sno: 1, sku: '', particular: 'Potatoes', quantity: 10000, unit: 'gm' },
            { sno: 2, sku: '', particular: 'Vegetable Oil', quantity: 3000, unit: 'ml' },
            { sno: 3, sku: '', particular: 'Salt', quantity: 200, unit: 'gm' },
            { sno: 4, sku: '', particular: 'Spices Mix', quantity: 150, unit: 'gm' },
          ],
          packaging: [
            { sno: 1, sku: '', particular: 'Plastic Packet (100gm)', quantity: 50, unit: 'pcs' },
            { sno: 2, sku: '', particular: 'Sealing Label', quantity: 50, unit: 'pcs' },
          ],
          totalFinishedOutput: 50,
          outputUnit: 'packet',
          preparedBy: 'Hari Prasad',
          approvedBy: 'Manager Shrestha',
          notes: 'Regular production',
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          productChartNo: 'PC-2024-003',
          dailySeriesNo: 'DS-003',
          date: '2024-02-14',
          productName: 'Mango Pickle',
          batchNo: 'B-003',
          ingredients: [
            { sno: 1, sku: '', particular: 'Raw Mangoes', quantity: 8000, unit: 'gm' },
            { sno: 2, sku: '', particular: 'Mustard Oil', quantity: 2500, unit: 'ml' },
            { sno: 3, sku: '', particular: 'Red Chili', quantity: 400, unit: 'gm' },
            { sno: 4, sku: '', particular: 'Mustard Seeds', quantity: 200, unit: 'gm' },
            { sno: 5, sku: '', particular: 'Salt', quantity: 400, unit: 'gm' },
            { sno: 6, sku: '', particular: 'Fenugreek', quantity: 100, unit: 'gm' },
          ],
          packaging: [
            { sno: 1, sku: '', particular: 'Glass Jar (500gm)', quantity: 20, unit: 'pcs' },
            { sno: 2, sku: '', particular: 'Label Sticker', quantity: 20, unit: 'pcs' },
            { sno: 3, sku: '', particular: 'Sealing Cap', quantity: 20, unit: 'pcs' },
          ],
          totalFinishedOutput: 20,
          outputUnit: 'bottle',
          preparedBy: 'Ram Bahadur',
          approvedBy: 'Supervisor Gurung',
          notes: 'Special batch',
          createdAt: new Date().toISOString()
        }
      ];

      setCharts(mockData);
      setFilteredCharts(mockData);
    } catch (error) {
      console.error('Error loading production charts:', error);
      toast.error('Failed to load production charts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIngredient = () => {
    const newSno = formData.ingredients.length + 1;
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { sno: newSno, sku: '', particular: '', quantity: 0, unit: 'gm' }]
    }));
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index).map((ing, idx) => ({ ...ing, sno: idx + 1 }))
    }));
  };

  const handleIngredientChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const handleAddPackaging = () => {
    const newSno = formData.packaging.length + 1;
    setFormData(prev => ({
      ...prev,
      packaging: [...prev.packaging, { sno: newSno, sku: '', particular: '', quantity: 0, unit: 'pcs' }]
    }));
  };

  const handleRemovePackaging = (index: number) => {
    setFormData(prev => ({
      ...prev,
      packaging: prev.packaging.filter((_, i) => i !== index).map((pkg, idx) => ({ ...pkg, sno: idx + 1 }))
    }));
  };

  const handlePackagingChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      packaging: prev.packaging.map((pkg, i) =>
        i === index ? { ...pkg, [field]: value } : pkg
      )
    }));
  };

  const handleAddWastage = () => {
    const newSno = formData.wastage.length + 1;
    setFormData(prev => ({
      ...prev,
      wastage: [...prev.wastage, { sno: newSno, sku: '', particular: '', quantity: 0, unit: 'gm' }]
    }));
  };

  const handleRemoveWastage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      wastage: prev.wastage.filter((_, i) => i !== index).map((wst, idx) => ({ ...wst, sno: idx + 1 }))
    }));
  };

  const handleWastageChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      wastage: prev.wastage.map((wst, i) =>
        i === index ? { ...wst, [field]: value } : wst
      )
    }));
  };

  const handleSaveChart = async () => {
    if (!formData.productChartNo || !formData.productName || !formData.batchNo) {
      toast.error('Please fill in all required fields');
      return;
    }

    const validIngredients = formData.ingredients.filter(ing => ing.particular && ing.quantity > 0);
    const validPackaging = formData.packaging.filter(pkg => pkg.particular && pkg.quantity > 0);
    const validWastage = formData.wastage.filter(wst => wst.particular && wst.quantity > 0);

    if (validIngredients.length === 0) {
      toast.error('Please add at least one ingredient');
      return;
    }

    const newChart: ProductionChartTableData = {
      id: selectedChart ? selectedChart.id : Date.now().toString(),
      ...formData,
      ingredients: validIngredients,
      packaging: validPackaging,
      wastage: validWastage,
      createdAt: selectedChart ? selectedChart.createdAt : new Date().toISOString()
    };

    if (selectedChart) {
      setCharts(prev => prev.map(c => c.id === selectedChart.id ? newChart : c));
      toast.success('Production chart updated successfully');
    } else {
      setCharts(prev => [newChart, ...prev]);
      toast.success('Production chart created successfully');
    }

    setShowAddModal(false);
    setSelectedChart(null);
    resetForm();
  };

  const handleDeleteChart = (id: string) => {
    if (window.confirm('Are you sure you want to delete this production chart?')) {
      setCharts(prev => prev.filter(c => c.id !== id));
      toast.success('Production chart deleted successfully');
    }
  };

  const handleEditChart = (chart: ProductionChartTableData) => {
    setSelectedChart(chart);

    // Pad ingredients to 5 rows if needed
    const ingredients = [...chart.ingredients];
    while (ingredients.length < 5) {
      ingredients.push({ sno: ingredients.length + 1, sku: '', particular: '', quantity: 0, unit: 'gm' });
    }

    // Pad packaging to 5 rows if needed
    const packaging = [...chart.packaging];
    while (packaging.length < 5) {
      packaging.push({ sno: packaging.length + 1, sku: '', particular: '', quantity: 0, unit: 'pcs' });
    }

    // Pad wastage to 3 rows if needed
    const wastage = chart.wastage || [];
    while (wastage.length < 3) {
      wastage.push({ sno: wastage.length + 1, sku: '', particular: '', quantity: 0, unit: 'gm' });
    }

    setFormData({
      productChartNo: chart.productChartNo,
      dailySeriesNo: chart.dailySeriesNo,
      date: chart.date,
      productName: chart.productName,
      batchNo: chart.batchNo,
      ingredients: ingredients,
      packaging: packaging,
      totalFinishedOutput: chart.totalFinishedOutput,
      outputUnit: chart.outputUnit,
      outputSku: chart.outputSku || '',
      wastage: wastage,
      preparedBy: chart.preparedBy,
      approvedBy: chart.approvedBy,
      notes: chart.notes || ''
    });
    setShowAddModal(true);
  };

  const handlePreview = (chart: ProductionChartTableData) => {
    setSelectedChart(chart);
    setShowPreviewModal(true);
  };

  const resetForm = () => {
    setFormData({
      productChartNo: '',
      dailySeriesNo: '',
      date: new Date().toISOString().split('T')[0],
      productName: '',
      batchNo: '',
      ingredients: [
        { sno: 1, sku: '', particular: '', quantity: 0, unit: 'gm' },
        { sno: 2, sku: '', particular: '', quantity: 0, unit: 'gm' },
        { sno: 3, sku: '', particular: '', quantity: 0, unit: 'gm' },
        { sno: 4, sku: '', particular: '', quantity: 0, unit: 'gm' },
        { sno: 5, sku: '', particular: '', quantity: 0, unit: 'gm' }
      ],
      packaging: [
        { sno: 1, sku: '', particular: '', quantity: 0, unit: 'pcs' },
        { sno: 2, sku: '', particular: '', quantity: 0, unit: 'pcs' },
        { sno: 3, sku: '', particular: '', quantity: 0, unit: 'pcs' },
        { sno: 4, sku: '', particular: '', quantity: 0, unit: 'pcs' },
        { sno: 5, sku: '', particular: '', quantity: 0, unit: 'pcs' }
      ],
      totalFinishedOutput: 0,
      outputUnit: 'bottle',
      outputSku: '',
      wastage: [
        { sno: 1, sku: '', particular: '', quantity: 0, unit: 'gm' },
        { sno: 2, sku: '', particular: '', quantity: 0, unit: 'gm' },
        { sno: 3, sku: '', particular: '', quantity: 0, unit: 'gm' }
      ],
      preparedBy: '',
      approvedBy: '',
      notes: ''
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
          <p className="text-gray-600 mt-1">Manage production charts with ingredients and packaging details</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={() => window.location.href = '/dashboard?tab=production-analytics'}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center transition-colors"
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            Analytics
          </button>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-1.5 rounded text-sm font-medium flex items-center transition-colors ${viewMode === 'card'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              Card
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded text-sm font-medium flex items-center transition-colors ${viewMode === 'table'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Table className="h-4 w-4 mr-1" />
              Table
            </button>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Chart
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {filteredCharts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-bold text-gray-900">Production Analytics</h2>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{filteredCharts.length}</p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Total Charts</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-orange-700">
                {filteredCharts.reduce((sum, c) => sum + c.ingredients.length, 0)}
              </p>
              <p className="text-xs font-medium text-orange-600 uppercase tracking-wider mt-1">Total Ingredients</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-700">
                {filteredCharts.reduce((sum, c) => sum + c.packaging.length, 0)}
              </p>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mt-1">Total Packaging</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-700">
                {filteredCharts.reduce((sum, c) => sum + c.totalFinishedOutput, 0)}
              </p>
              <p className="text-xs font-medium text-green-600 uppercase tracking-wider mt-1">Total Products</p>
            </div>
          </div>

          {/* Production by Product Chart */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Production by Product
            </h3>
            <div className="space-y-4">
              {(() => {
                // Group by product and calculate totals
                const productTotals = filteredCharts.reduce((acc, chart) => {
                  const key = `${chart.productName} (${chart.outputUnit})`;
                  if (!acc[key]) {
                    acc[key] = {
                      product: chart.productName,
                      unit: chart.outputUnit,
                      total: 0,
                      count: 0,
                      dates: []
                    };
                  }
                  acc[key].total += chart.totalFinishedOutput;
                  acc[key].count += 1;
                  acc[key].dates.push(chart.date);
                  return acc;
                }, {} as Record<string, { product: string; unit: string; total: number; count: number; dates: string[] }>);

                const sortedProducts = Object.entries(productTotals).sort((a, b) => b[1].total - a[1].total);
                const maxTotal = Math.max(...sortedProducts.map(([, data]) => data.total));

                return sortedProducts.map(([key, data]) => (
                  <div key={key} className="flex items-center space-x-4">
                    <div className="w-48 flex-shrink-0">
                      <p className="text-sm font-medium text-gray-900">{data.product}</p>
                      <p className="text-xs text-gray-500">{data.count} batches • {data.dates.length} days</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${(data.total / maxTotal) * 100}%` }}
                          >
                            {data.total / maxTotal > 0.15 && (
                              <span className="text-xs font-bold text-white">{data.total}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 w-20">
                          {data.total} {data.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Daily Production Timeline */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Daily Production Timeline
            </h3>
            <div className="overflow-x-auto">
              <div className="flex space-x-4 min-w-max">
                {filteredCharts
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((chart, idx) => (
                    <div key={idx} className="flex-shrink-0 w-48 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">{formatDate(chart.date)}</p>
                      <p className="text-sm font-semibold text-gray-900 mb-2 truncate">{chart.productName}</p>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-bold text-indigo-600">{chart.totalFinishedOutput}</span>
                        <span className="text-xs text-gray-600">{chart.outputUnit}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by product name, chart no, or batch no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-black"
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-black"
              />
            </div>
          </div>

          <button
            onClick={loadData}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Card View - Minimalistic */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCharts.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg border border-gray-200 p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No production charts found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedDate ? 'No charts match your filters.' : 'Get started by creating your first production chart.'}
              </p>
            </div>
          ) : (
            filteredCharts.map((chart) => (
              <div key={chart.id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-400 transition-colors group">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Box className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{chart.productName}</h3>
                        <p className="text-xs text-gray-500">{chart.productChartNo}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditChart(chart)}
                        className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteChart(chart.id)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Daily Series</p>
                      <p className="font-medium text-gray-900">{chart.dailySeriesNo}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Batch No</p>
                      <p className="font-medium text-gray-900">{chart.batchNo}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                    <p className="font-medium text-gray-900">{formatDate(chart.date)}</p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => handlePreview(chart)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="font-medium">Preview</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Product Chart No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Daily Series</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Batch No</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCharts.map((chart) => (
                  <tr key={chart.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {chart.productChartNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {chart.dailySeriesNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(chart.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">{chart.productName}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {chart.batchNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handlePreview(chart)}
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditChart(chart)}
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteChart(chart.id)}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
          {filteredCharts.length === 0 && (
            <div className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No production charts found</h3>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal - Modern Clean Design */}
      {showPreviewModal && selectedChart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Production Chart</h2>
                  <p className="text-sm text-gray-500">{selectedChart.productChartNo}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Header Info Cards - Two Rows */}
              <div className="space-y-3">
                {/* Row 1: Product Name & Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className=" bg-gray-50 rounded-lg py-2 px-2 border border-gray-200">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Product Name</p>
                    <p className="text-base font-bold text-gray-900">{selectedChart.productName}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg py-2 px-3 border border-gray-200">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Date</p>
                    <p className="text-base font-bold text-gray-900">{formatDate(selectedChart.date)}</p>
                  </div>
                </div>

                {/* Row 2: Chart No, Daily Series, Batch No */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg py-2 px-3 border border-gray-200">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Chart No</p>
                    <p className="text-base font-bold text-gray-900">{selectedChart.productChartNo}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg py-2 px-3 border border-gray-200">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Daily Series</p>
                    <p className="text-base font-bold text-gray-900">{selectedChart.dailySeriesNo}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg py-2 px-3 border border-gray-200">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Batch No</p>
                    <p className="text-base font-bold text-gray-900">{selectedChart.batchNo}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8 border-t border-gray-200 pt-4">
                <div className=" p-4 text-center">
                  <p className="text-2xl font-bold text-orange-700">{selectedChart.ingredients.length}</p>
                  <p className="text-xs font-medium text-orange-600 uppercase tracking-wider mt-1">Ingredients</p>
                </div>
                <div className=" p-4 text-center">
                  <p className="text-2xl font-bold text-blue-700">{selectedChart.packaging.length}</p>
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mt-1">Packaging Materials</p>
                </div>
                <div className=" p-4 text-center">
                  <p className="text-2xl font-bold text-green-700">{selectedChart.totalFinishedOutput}</p>
                  <p className="text-xs font-medium text-green-600 uppercase tracking-wider mt-1">Total Products</p>
                </div>
              </div>

              {/* Ingredients Section */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Beaker className="h-4 w-4 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Ingredients</h3>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                    {selectedChart.ingredients.length} items
                  </span>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">S.No.</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Particular</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedChart.ingredients.map((ing, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3 text-sm font-medium text-gray-500">{ing.sno}</td>
                          <td className="px-6 py-3 text-sm font-medium text-gray-900">{ing.particular}</td>
                          <td className="px-6 py-3 text-sm font-bold text-gray-900 text-right">
                            {ing.quantity} <span className="font-normal text-gray-500">{ing.unit}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Packaging Section */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Packaging</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    {selectedChart.packaging.length} items
                  </span>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">S.No.</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Particular</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedChart.packaging.map((pkg, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3 text-sm font-medium text-gray-500">{pkg.sno}</td>
                          <td className="px-6 py-3 text-sm font-medium text-gray-900">{pkg.particular}</td>
                          <td className="px-6 py-3 text-sm font-bold text-gray-900 text-right">
                            {pkg.quantity} <span className="font-normal text-gray-500">{pkg.unit}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Output & Signatures - Modern Layout */}
              <div className="border-t border-gray-200 pt-6">
                {/* Total Output with Product Name */}
                <div className="mb-8 text-center p-8">
                  <p className="text-sm font-extrabold text-gray-800 uppercase tracking-wider mb-3">Total Finished Output</p>
                  <div className="flex flex-col items-center">
                    <div className="flex items-baseline space-x-3 mb-2">
                      <span className="text-5xl font-bold text-gray-900">{selectedChart.totalFinishedOutput}</span>
                      <span className="text-2xl text-gray-600">{selectedChart.outputUnit} of {selectedChart.productName}</span>
                    </div>

                  </div>
                </div>

                {/* Production Summary Stats */}


                {/* Prepared By & Approved By - Left Aligned */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider w-32">Prepared By</p>
                    <p className="text-base font-semibold text-gray-900">{selectedChart.preparedBy || '—'}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider w-32">Approved By</p>
                    <p className="text-base font-semibold text-gray-900">{selectedChart.approvedBy || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedChart.notes && (
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                  <p className="text-sm text-amber-900">
                    <span className="font-semibold">Notes:</span> {selectedChart.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <FileText className="h-6 w-6 mr-2 text-indigo-600" />
                  {selectedChart ? 'Edit Production Chart' : 'Create New Production Chart'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedChart(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Header Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Chart No *</label>
                    <input
                      type="text"
                      value={formData.productChartNo}
                      onChange={(e) => setFormData(prev => ({ ...prev, productChartNo: e.target.value }))}
                      placeholder="e.g., PC-2024-001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Daily Series No</label>
                    <input
                      type="text"
                      value={formData.dailySeriesNo}
                      onChange={(e) => setFormData(prev => ({ ...prev, dailySeriesNo: e.target.value }))}
                      placeholder="e.g., DS-001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      value={formData.productName}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => ({ ...prev, productName: value }));
                        
                        // Show suggestions
                        const suggestions = getSuggestions(value);
                        setSkuSuggestions(suggestions);
                        setShowSuggestions(true);
                        setActiveSuggestionField({ type: 'output', index: 0, field: 'productName' });
                        
                        // Auto-fill SKU if exact match
                        const exactMatch = allSkus.find(item => item.productName === value);
                        if (exactMatch && !formData.outputSku) {
                          setFormData(prev => ({ ...prev, outputSku: exactMatch.sku }));
                          return;
                        }

                        // Auto-completion: if there's a strong match (starts with), auto-complete
                        if (value.length >= 2 && suggestions.length > 0) {
                          const firstSuggestion = suggestions[0];
                          if (firstSuggestion.productName.toLowerCase().startsWith(value.toLowerCase())) {
                            setFormData(prev => ({ 
                              ...prev, 
                              productName: firstSuggestion.productName,
                              outputSku: firstSuggestion.sku 
                            }));
                            setShowSuggestions(false);
                          }
                        }
                      }}
                      onFocus={() => {
                        setActiveSuggestionField({ type: 'output', index: 0, field: 'productName' });
                        setSkuSuggestions(getSuggestions(formData.productName));
                        setShowSuggestions(true);
                      }}
                      placeholder="Enter product name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black"
                    />
                    {/* Auto-suggestions dropdown for product name */}
                    {showSuggestions && activeSuggestionField?.type === 'output' && activeSuggestionField?.field === 'productName' && skuSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {skuSuggestions.map((suggestion, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData(prev => ({ 
                                ...prev, 
                                productName: suggestion.productName,
                                outputSku: suggestion.sku 
                              }));
                              setShowSuggestions(false);
                              setActiveSuggestionField(null);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-indigo-50 border-b border-gray-100 last:border-0"
                          >
                            <div className="text-sm font-medium text-gray-900">{suggestion.productName}</div>
                            <div className="text-xs text-gray-500">SKU: {suggestion.sku}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch No *</label>
                    <input
                      type="text"
                      value={formData.batchNo}
                      onChange={(e) => setFormData(prev => ({ ...prev, batchNo: e.target.value }))}
                      placeholder="e.g., B-001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800 uppercase flex items-center">
                    <Beaker className="h-4 w-4 mr-2" />
                    Ingredients
                  </h3>
                  <button
                    onClick={handleAddIngredient}
                    className="px-3 py-1 bg-gray-800 text-white rounded-lg hover:bg-gray-700 text-sm flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Row
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-600 uppercase mb-2">
                    <div className="col-span-1">S.No.</div>
                    <div className="col-span-2">SKU</div>
                    <div className="col-span-3">Particular</div>
                    <div className="col-span-5">Quantity & Unit</div>
                    <div className="col-span-1">Action</div>
                  </div>
                  {formData.ingredients.map((ing, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 relative">
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={ing.sno}
                          readOnly
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg bg-white text-black text-center text-sm"
                        />
                      </div>
                      <div className="col-span-2 relative">
                        <input
                          type="text"
                          value={ing.sku}
                          onChange={(e) => handleSkuInputChange('ingredient', idx, 'sku', e.target.value)}
                          onFocus={() => {
                            setActiveSuggestionField({ type: 'ingredient', index: idx, field: 'sku' });
                            setSkuSuggestions(getSuggestions(ing.sku));
                            setShowSuggestions(true);
                          }}
                          placeholder="SKU"
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black text-sm"
                        />
                        {/* Auto-suggestions dropdown for ingredient SKU */}
                        {showSuggestions && activeSuggestionField?.type === 'ingredient' && activeSuggestionField?.index === idx && activeSuggestionField?.field === 'sku' && skuSuggestions.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {skuSuggestions.map((suggestion, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={(e) => handleSuggestionSelect(suggestion, e)}
                                className="w-full px-3 py-2 text-left hover:bg-indigo-50 border-b border-gray-100 last:border-0"
                              >
                                <div className="text-sm font-medium text-gray-900">{suggestion.productName}</div>
                                <div className="text-xs text-gray-500">SKU: {suggestion.sku}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="col-span-3 relative">
                        <input
                          type="text"
                          value={ing.particular}
                          onChange={(e) => handleSkuInputChange('ingredient', idx, 'particular', e.target.value)}
                          onFocus={() => {
                            setActiveSuggestionField({ type: 'ingredient', index: idx, field: 'particular' });
                            setSkuSuggestions(getSuggestions(ing.particular));
                            setShowSuggestions(true);
                          }}
                          placeholder="Ingredient name"
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black text-sm"
                        />
                        {/* Auto-suggestions dropdown for ingredient particular */}
                        {showSuggestions && activeSuggestionField?.type === 'ingredient' && activeSuggestionField?.index === idx && activeSuggestionField?.field === 'particular' && skuSuggestions.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {skuSuggestions.map((suggestion, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={(e) => handleSuggestionSelect(suggestion, e)}
                                className="w-full px-3 py-2 text-left hover:bg-indigo-50 border-b border-gray-100 last:border-0"
                              >
                                <div className="text-sm font-medium text-gray-900">{suggestion.productName}</div>
                                <div className="text-xs text-gray-500">SKU: {suggestion.sku}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="col-span-5 flex gap-2">
                        <input
                          type="number"
                          value={ing.quantity || ''}
                          onChange={(e) => handleIngredientChange(idx, 'quantity', Number(e.target.value))}
                          placeholder="Qty"
                          className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black text-sm"
                        />
                        <select
                          value={ing.unit}
                          onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                          className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black text-sm"
                        >
                          {UNITS.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1">
                        <button
                          onClick={() => handleRemoveIngredient(idx)}
                          className="w-full px-2 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg border border-red-200"
                          disabled={formData.ingredients.length === 1}
                          title="Delete row"
                        >
                          <Trash2 className="h-4 w-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800 uppercase flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Packaging
                  </h3>
                  <button
                    onClick={handleAddPackaging}
                    className="px-3 py-1 bg-gray-800 text-white rounded-lg hover:bg-gray-700 text-sm flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Row
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-600 uppercase mb-2">
                    <div className="col-span-1">S.No.</div>
                    <div className="col-span-2">SKU</div>
                    <div className="col-span-3">Particular</div>
                    <div className="col-span-5">Quantity & Unit</div>
                    <div className="col-span-1">Action</div>
                  </div>
                  {formData.packaging.map((pkg, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 relative">
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={pkg.sno}
                          readOnly
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg bg-white text-black text-center text-sm"
                        />
                      </div>
                      <div className="col-span-2 relative">
                        <input
                          type="text"
                          value={pkg.sku}
                          onChange={(e) => handleSkuInputChange('packaging', idx, 'sku', e.target.value)}
                          onFocus={() => {
                            setActiveSuggestionField({ type: 'packaging', index: idx, field: 'sku' });
                            setSkuSuggestions(getSuggestions(pkg.sku));
                            setShowSuggestions(true);
                          }}
                          placeholder="SKU"
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black text-sm"
                        />
                        {/* Auto-suggestions dropdown for packaging SKU */}
                        {showSuggestions && activeSuggestionField?.type === 'packaging' && activeSuggestionField?.index === idx && activeSuggestionField?.field === 'sku' && skuSuggestions.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {skuSuggestions.map((suggestion, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={(e) => handleSuggestionSelect(suggestion, e)}
                                className="w-full px-3 py-2 text-left hover:bg-indigo-50 border-b border-gray-100 last:border-0"
                              >
                                <div className="text-sm font-medium text-gray-900">{suggestion.productName}</div>
                                <div className="text-xs text-gray-500">SKU: {suggestion.sku}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="col-span-3 relative">
                        <input
                          type="text"
                          value={pkg.particular}
                          onChange={(e) => handleSkuInputChange('packaging', idx, 'particular', e.target.value)}
                          onFocus={() => {
                            setActiveSuggestionField({ type: 'packaging', index: idx, field: 'particular' });
                            setSkuSuggestions(getSuggestions(pkg.particular));
                            setShowSuggestions(true);
                          }}
                          placeholder="Packaging item"
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black text-sm"
                        />
                        {/* Auto-suggestions dropdown for packaging particular */}
                        {showSuggestions && activeSuggestionField?.type === 'packaging' && activeSuggestionField?.index === idx && activeSuggestionField?.field === 'particular' && skuSuggestions.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {skuSuggestions.map((suggestion, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={(e) => handleSuggestionSelect(suggestion, e)}
                                className="w-full px-3 py-2 text-left hover:bg-indigo-50 border-b border-gray-100 last:border-0"
                              >
                                <div className="text-sm font-medium text-gray-900">{suggestion.productName}</div>
                                <div className="text-xs text-gray-500">SKU: {suggestion.sku}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="col-span-5 flex gap-2">
                        <input
                          type="number"
                          value={pkg.quantity || ''}
                          onChange={(e) => handlePackagingChange(idx, 'quantity', Number(e.target.value))}
                          placeholder="Qty"
                          className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black text-sm"
                        />
                        <select
                          value={pkg.unit}
                          onChange={(e) => handlePackagingChange(idx, 'unit', e.target.value)}
                          className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black text-sm"
                        >
                          {UNITS.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1">
                        <button
                          onClick={() => handleRemovePackaging(idx)}
                          className="w-full px-2 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg border border-red-200"
                          disabled={formData.packaging.length === 1}
                          title="Delete row"
                        >
                          <Trash2 className="h-4 w-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-bold text-gray-800 uppercase mb-4 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Final Output
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Output SKU</label>
                    <input
                      type="text"
                      value={formData.outputSku}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => ({ ...prev, outputSku: value }));
                        
                        // Show suggestions
                        const suggestions = getSuggestions(value);
                        setSkuSuggestions(suggestions);
                        setShowSuggestions(true);
                        setActiveSuggestionField({ type: 'output', index: 0, field: 'sku' });
                        
                        // Auto-fill product name if exact match
                        const exactMatch = allSkus.find(item => item.sku === value);
                        if (exactMatch && !formData.productName) {
                          setFormData(prev => ({ ...prev, productName: exactMatch.productName }));
                          return;
                        }

                        // Auto-completion: if there's a strong match (starts with), auto-complete
                        if (value.length >= 2 && suggestions.length > 0) {
                          const firstSuggestion = suggestions[0];
                          if (firstSuggestion.sku.toLowerCase().startsWith(value.toLowerCase())) {
                            setFormData(prev => ({ 
                              ...prev, 
                              outputSku: firstSuggestion.sku,
                              productName: firstSuggestion.productName 
                            }));
                            setShowSuggestions(false);
                          }
                        }
                      }}
                      onFocus={() => {
                        setActiveSuggestionField({ type: 'output', index: 0, field: 'sku' });
                        setSkuSuggestions(getSuggestions(formData.outputSku));
                        setShowSuggestions(true);
                      }}
                      placeholder="Enter SKU"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black"
                    />
                    {/* Auto-suggestions dropdown for output SKU */}
                    {showSuggestions && activeSuggestionField?.type === 'output' && skuSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {skuSuggestions.map((suggestion, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData(prev => ({ 
                                ...prev, 
                                outputSku: suggestion.sku,
                                productName: suggestion.productName 
                              }));
                              setShowSuggestions(false);
                              setActiveSuggestionField(null);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-indigo-50 border-b border-gray-100 last:border-0"
                          >
                            <div className="text-sm font-medium text-gray-900">{suggestion.productName}</div>
                            <div className="text-xs text-gray-500">SKU: {suggestion.sku}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Finished Output *</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.totalFinishedOutput || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, totalFinishedOutput: Number(e.target.value) }))}
                        placeholder="Quantity"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black"
                      />
                      <select
                        value={formData.outputUnit}
                        onChange={(e) => setFormData(prev => ({ ...prev, outputUnit: e.target.value }))}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black"
                      >
                        {UNITS.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

              <div className="mb-6 p-4 bg-white rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-red-800 uppercase flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Wastage
                  </h3>
                  <button
                    onClick={handleAddWastage}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Row
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-red-700 uppercase mb-2">
                    <div className="col-span-1">S.No.</div>
                    <div className="col-span-2">SKU</div>
                    <div className="col-span-3">Particular</div>
                    <div className="col-span-5">Quantity & Unit</div>
                    <div className="col-span-1">Action</div>
                  </div>
                  {formData.wastage.map((wst, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 relative">
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={wst.sno}
                          readOnly
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg bg-white text-black text-center text-sm"
                        />
                      </div>
                      <div className="col-span-2 relative">
                        <input
                          type="text"
                          value={wst.sku}
                          onChange={(e) => handleSkuInputChange('wastage', idx, 'sku', e.target.value)}
                          onFocus={() => {
                            setActiveSuggestionField({ type: 'wastage', index: idx, field: 'sku' });
                            setSkuSuggestions(getSuggestions(wst.sku));
                            setShowSuggestions(true);
                          }}
                          placeholder="SKU"
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black text-sm"
                        />
                        {/* Auto-suggestions dropdown for wastage SKU */}
                        {showSuggestions && activeSuggestionField?.type === 'wastage' && activeSuggestionField?.index === idx && activeSuggestionField?.field === 'sku' && skuSuggestions.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {skuSuggestions.map((suggestion, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={(e) => handleSuggestionSelect(suggestion, e)}
                                className="w-full px-3 py-2 text-left hover:bg-red-50 border-b border-gray-100 last:border-0"
                              >
                                <div className="text-sm font-medium text-gray-900">{suggestion.productName}</div>
                                <div className="text-xs text-gray-500">SKU: {suggestion.sku}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="col-span-3 relative">
                        <input
                          type="text"
                          value={wst.particular}
                          onChange={(e) => handleSkuInputChange('wastage', idx, 'particular', e.target.value)}
                          onFocus={() => {
                            setActiveSuggestionField({ type: 'wastage', index: idx, field: 'particular' });
                            setSkuSuggestions(getSuggestions(wst.particular));
                            setShowSuggestions(true);
                          }}
                          placeholder="Wastage item"
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black text-sm"
                        />
                        {/* Auto-suggestions dropdown for wastage particular */}
                        {showSuggestions && activeSuggestionField?.type === 'wastage' && activeSuggestionField?.index === idx && activeSuggestionField?.field === 'particular' && skuSuggestions.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {skuSuggestions.map((suggestion, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={(e) => handleSuggestionSelect(suggestion, e)}
                                className="w-full px-3 py-2 text-left hover:bg-red-50 border-b border-gray-100 last:border-0"
                              >
                                <div className="text-sm font-medium text-gray-900">{suggestion.productName}</div>
                                <div className="text-xs text-gray-500">SKU: {suggestion.sku}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="col-span-5 flex gap-2">
                        <input
                          type="number"
                          value={wst.quantity || ''}
                          onChange={(e) => handleWastageChange(idx, 'quantity', Number(e.target.value))}
                          placeholder="Qty"
                          className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black text-sm"
                        />
                        <select
                          value={wst.unit}
                          onChange={(e) => handleWastageChange(idx, 'unit', e.target.value)}
                          className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black text-sm"
                        >
                          {UNITS.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1">
                        <button
                          onClick={() => handleRemoveWastage(idx)}
                          className="w-full px-2 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg border border-red-200"
                          disabled={formData.wastage.length === 1}
                          title="Delete row"
                        >
                          <Trash2 className="h-4 w-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prepared By</label>
                    <input
                      type="text"
                      value={formData.preparedBy}
                      onChange={(e) => setFormData(prev => ({ ...prev, preparedBy: e.target.value }))}
                      placeholder="Enter name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Approved By</label>
                    <input
                      type="text"
                      value={formData.approvedBy}
                      onChange={(e) => setFormData(prev => ({ ...prev, approvedBy: e.target.value }))}
                      placeholder="Enter name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black"
                  placeholder="Additional notes or comments..."
                />
              </div>

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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {selectedChart ? 'Update Chart' : 'Create Chart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
