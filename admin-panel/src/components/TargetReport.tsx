'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Filter, Download, Plus, Save, Edit2, Trash2, Target, ChevronRight } from 'lucide-react';

// Mock data for demonstration
const mockProvinceData = [
  { name: 'Province 1', targetSales: 500000, actualSales: 450000, achievement: 90 },
  { name: 'Province 2', targetSales: 750000, actualSales: 680000, achievement: 90.7 },
  { name: 'Province 3', targetSales: 600000, actualSales: 520000, achievement: 86.7 },
  { name: 'Province 4', targetSales: 400000, actualSales: 380000, achievement: 95 },
  { name: 'Province 5', targetSales: 550000, actualSales: 495000, achievement: 90 },
  { name: 'Province 6', targetSales: 350000, actualSales: 315000, achievement: 90 },
  { name: 'Province 7', targetSales: 450000, actualSales: 405000, achievement: 90 },
];

const mockCategoryData = [
  { name: 'Achar', targetSales: 300000, actualSales: 270000 },
  { name: 'Dry Meat', targetSales: 250000, actualSales: 225000 },
  { name: 'Spices', targetSales: 400000, actualSales: 360000 },
  { name: 'Masala', targetSales: 200000, actualSales: 180000 },
 
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

interface ProvinceTarget {
  id: string;
  province: string;
  targetAmount: number;
  category: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  units: string;
  category: string;
}

interface Distributor {
  id: string;
  name: string;
  email: string;
  province: string;
}

interface DistributorTarget {
  distributorId: string;
  distributorName: string;
  targets: {
    [productId: string]: {
      target: number;
      achieve: number;
    };
  };
}

export default function TargetReport() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showTargetForm, setShowTargetForm] = useState(false);
  const [editingTarget, setEditingTarget] = useState<ProvinceTarget | null>(null);
  
  // Nepali Years (Bikram Sambat) - Current year and next 2 years
  // Current Nepali year (approximate conversion: BS = AD + 57)
  const currentNepaliYear = new Date().getFullYear() + 57;
  const nepaliYears = [currentNepaliYear, currentNepaliYear + 1, currentNepaliYear + 2];

  // New state for distributor target assignment
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentNepaliYear);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [distributorTargets, setDistributorTargets] = useState<DistributorTarget[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDistributorForm, setShowAddDistributorForm] = useState(false);
  const [newDistributor, setNewDistributor] = useState({
    name: '',
    email: '',
    province: ''
  });
  const [provinceTargets, setProvinceTargets] = useState<ProvinceTarget[]>([
    {
      id: '1',
      province: 'Province 1',
      targetAmount: 500000,
      category: 'Electronics',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      province: 'Province 2',
      targetAmount: 750000,
      category: 'Clothing',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      createdAt: '2024-01-01'
    }
  ]);

  const [newTarget, setNewTarget] = useState({
    province: '',
    targetAmount: 0,
    category: '',
    startDate: '',
    endDate: ''
  });

  const provinces = ['Province 1', 'Province 2', 'Province 3', 'Province 4', 'Province 5', 'Province 6', 'Province 7'];
  const categories = ['Electronics', 'Clothing', 'Food & Beverages', 'Home & Garden', 'Sports'];
  
  // Product categories for target assignment
  const productCategories = [
    { id: 'achar', name: 'Achar', products: ['Buff Achar', 'Pork Achar', 'Chicken Achar', 'Mixed Achar'] },
    { id: 'dry_meat', name: 'Dry Meat', products: ['Buff Sukuti', 'Pork Sukuti', 'Chicken Sukuti'] },
    { id: 'spices', name: 'Spices', products: ['Turmeric Powder', 'Cumin Powder', 'Coriander Powder', 'Chili Powder'] }
  ];
  
  // Nepali Months (Bikram Sambat)
  const nepaliMonths = [
    { value: 1, name: 'बैशाख (Baishakh)' },
    { value: 2, name: 'जेठ (Jestha)' },
    { value: 3, name: 'असार (Ashar)' },
    { value: 4, name: 'श्रावण (Shrawan)' },
    { value: 5, name: 'भाद्र (Bhadra)' },
    { value: 6, name: 'आश्विन (Ashwin)' },
    { value: 7, name: 'कार्तिक (Kartik)' },
    { value: 8, name: 'मंसिर (Mangsir)' },
    { value: 9, name: 'पौष (Poush)' },
    { value: 10, name: 'माघ (Magh)' },
    { value: 11, name: 'फाल्गुन (Falgun)' },
    { value: 12, name: 'चैत्र (Chaitra)' }
  ];

  const handleAddTarget = () => {
    if (newTarget.province && newTarget.targetAmount > 0 && newTarget.category) {
      const target: ProvinceTarget = {
        id: Date.now().toString(),
        ...newTarget,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setProvinceTargets([...provinceTargets, target]);
      setNewTarget({ province: '', targetAmount: 0, category: '', startDate: '', endDate: '' });
      setShowTargetForm(false);
    }
  };

  const handleEditTarget = (target: ProvinceTarget) => {
    setEditingTarget(target);
    setNewTarget({
      province: target.province,
      targetAmount: target.targetAmount,
      category: target.category,
      startDate: target.startDate,
      endDate: target.endDate
    });
    setShowTargetForm(true);
  };

  const handleUpdateTarget = () => {
    if (editingTarget && newTarget.province && newTarget.targetAmount > 0 && newTarget.category) {
      const updatedTargets = provinceTargets.map(target => 
        target.id === editingTarget.id 
          ? { ...target, ...newTarget }
          : target
      );
      setProvinceTargets(updatedTargets);
      setEditingTarget(null);
      setNewTarget({ province: '', targetAmount: 0, category: '', startDate: '', endDate: '' });
      setShowTargetForm(false);
    }
  };

  const handleDeleteTarget = (id: string) => {
    setProvinceTargets(provinceTargets.filter(target => target.id !== id));
  };

  const getProvinceChartData = () => {
    return mockProvinceData.map(province => {
      const target = provinceTargets.find(t => t.province === province.name);
      return {
        ...province,
        targetSales: target ? target.targetAmount : province.targetSales
      };
    });
  };

  const getSummaryStats = () => {
    const totalTarget = provinceTargets.reduce((sum, target) => sum + target.targetAmount, 0);
    const totalActual = mockProvinceData.reduce((sum, province) => sum + province.actualSales, 0);
    const overallAchievement = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;
    
    return {
      totalTarget,
      totalActual,
      overallAchievement,
      activeTargets: provinceTargets.length
    };
  };

  const summaryStats = getSummaryStats();

  // Fetch distributors and products when category is selected
  useEffect(() => {
    if (selectedProductCategory) {
      fetchDistributorsAndProducts();
    }
  }, [selectedProductCategory]);

  const fetchDistributorsAndProducts = async () => {
    setLoading(true);
    try {
      // Fetch distributors from API
      const distributorsResponse = await fetch('http://localhost:4444/api/sales-targets/distributors');
      const distributorsData = await distributorsResponse.json();
      
      if (!distributorsData.success) {
        throw new Error(distributorsData.message);
      }

      const distributors: Distributor[] = distributorsData.data.distributors;

      // Get products for selected category
      const selectedCategory = productCategories.find(cat => cat.id === selectedProductCategory);
      const productsResponse = await fetch(`http://localhost:4444/api/sales-targets/products/${selectedProductCategory}`);
      const productsData = await productsResponse.json();
      
      if (!productsData.success) {
        throw new Error(productsData.message);
      }

      const categoryProducts: Product[] = productsData.data.products.map((product: any) => ({
        id: product.id,
        name: product.name,
        units: product.units,
        category: selectedCategory?.name || ''
      }));

      setDistributors(distributors);
      setProducts(categoryProducts);

      // Fetch existing targets for current month
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const targetsResponse = await fetch(
        `http://localhost:4444/api/sales-targets/distributor-targets?categoryId=${selectedProductCategory}&month=${currentMonth}&year=${currentYear}`
      );
      const targetsData = await targetsResponse.json();
      
      let initialTargets: DistributorTarget[] = [];
      
      if (targetsData.success && targetsData.data.targets.length > 0) {
        // Use existing targets
        initialTargets = targetsData.data.targets.map((target: any) => ({
          distributorId: target.distributorId,
          distributorName: target.distributorName,
          targets: target.items.reduce((acc: any, item: any) => {
            acc[item.productId] = { target: item.targetValue, achieve: item.achievedValue };
            return acc;
          }, {} as { [productId: string]: { target: number; achieve: number } })
        }));
      } else {
        // Initialize empty targets for distributors
        initialTargets = distributors.map(distributor => ({
          distributorId: distributor.id,
          distributorName: distributor.name,
          targets: categoryProducts.reduce((acc, product) => {
            acc[product.id] = { target: 0, achieve: 0 };
            return acc;
          }, {} as { [productId: string]: { target: number; achieve: number } })
        }));
      }

      setDistributorTargets(initialTargets);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to mock data if API fails
      const mockDistributors: Distributor[] = [
        { id: 'dist_1', name: 'Kathmandu Distributors', email: 'kathmandu@dist.com', province: 'Province 3' },
        { id: 'dist_2', name: 'Pokhara Traders', email: 'pokhara@dist.com', province: 'Province 4' },
        { id: 'dist_3', name: 'Biratnagar Suppliers', email: 'biratnagar@dist.com', province: 'Province 1' }
      ];

      const selectedCategory = productCategories.find(cat => cat.id === selectedProductCategory);
      const categoryProducts: Product[] = selectedCategory?.products.map((productName, index) => ({
        id: `prod_${selectedProductCategory}_${index}`,
        name: productName,
        units: '500 gm',
        category: selectedCategory.name
      })) || [];

      setDistributors(mockDistributors);
      setProducts(categoryProducts);

      const initialTargets: DistributorTarget[] = mockDistributors.map(distributor => ({
        distributorId: distributor.id,
        distributorName: distributor.name,
        targets: categoryProducts.reduce((acc, product) => {
          acc[product.id] = { target: 0, achieve: 0 };
          return acc;
        }, {} as { [productId: string]: { target: number; achieve: number } })
      }));

      setDistributorTargets(initialTargets);
    } finally {
      setLoading(false);
    }
  };

  const handleTargetChange = (distributorId: string, productId: string, field: 'target' | 'achieve', value: string) => {
    // Convert to number and validate
    const numValue = parseInt(value) || 0;
    
    // Don't allow negative numbers
    if (numValue < 0) return;
    
    setDistributorTargets(prev => prev.map(target => {
      if (target.distributorId === distributorId) {
        const updatedTargets = {
          ...target.targets,
          [productId]: {
            ...target.targets[productId],
            [field]: numValue
          }
        };
        
        // If updating achieved value, ensure it doesn't exceed target
        if (field === 'achieve' && numValue > target.targets[productId]?.target) {
          updatedTargets[productId] = {
            ...updatedTargets[productId],
            achieve: target.targets[productId]?.target || 0
          };
        }
        
        return {
          ...target,
          targets: updatedTargets
        };
      }
      return target;
    }));
  };

  const handleAddDistributor = async () => {
    if (newDistributor.name && newDistributor.email && newDistributor.province) {
      try {
        // Call API to add distributor
        const response = await fetch('http://localhost:4444/api/sales-targets/distributors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newDistributor.name,
            email: newDistributor.email,
            province: newDistributor.province
          })
        });

        const data = await response.json();

        if (data.success) {
          const distributor: Distributor = data.data;
          
          setDistributors(prev => [...prev, distributor]);
          
          // Initialize targets for the new distributor
          const initialTarget: DistributorTarget = {
            distributorId: distributor.id,
            distributorName: distributor.name,
            targets: products.reduce((acc, product) => {
              acc[product.id] = { target: 0, achieve: 0 };
              return acc;
            }, {} as { [productId: string]: { target: number; achieve: number } })
          };
          
          setDistributorTargets(prev => [...prev, initialTarget]);
          
          // Reset form
          setNewDistributor({ name: '', email: '', province: '' });
          setShowAddDistributorForm(false);
          
          alert('Distributor added successfully!');
        } else {
          alert(`Error adding distributor: ${data.message}`);
        }
      } catch (error) {
        console.error('Error adding distributor:', error);
        alert('Error adding distributor. Please try again.');
      }
    } else {
      alert('Please fill in all required fields');
    }
  };

  const validateTargets = () => {
    const errors: string[] = [];
    
    // Check if any targets are negative
    distributorTargets.forEach((target, index) => {
      Object.entries(target.targets).forEach(([productId, values]) => {
        if (values.target < 0) {
          errors.push(`${target.distributorName} - ${products.find(p => p.id === productId)?.name}: Target cannot be negative`);
        }
        if (values.achieve < 0) {
          errors.push(`${target.distributorName} - ${products.find(p => p.id === productId)?.name}: Achieved cannot be negative`);
        }
        if (values.achieve > values.target && values.target > 0) {
          errors.push(`${target.distributorName} - ${products.find(p => p.id === productId)?.name}: Achieved cannot be greater than target`);
        }
      });
    });
    
    return errors;
  };

  const saveTargets = async () => {
    try {
      // Validate targets before saving
      const validationErrors = validateTargets();
      if (validationErrors.length > 0) {
        alert('Validation Errors:\n' + validationErrors.join('\n'));
        return;
      }

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Check if at least one target is set
      const hasAnyTargets = distributorTargets.some(target => 
        Object.values(target.targets).some(values => values.target > 0)
      );

      if (!hasAnyTargets) {
        alert('Please set at least one target before saving.');
        return;
      }

      // Prepare targets for API
      const targetsPayload = distributorTargets.map(target => ({
        distributorId: target.distributorId,
        distributorName: target.distributorName,
        items: Object.entries(target.targets).map(([productId, values]) => ({
          productId,
          productName: products.find(p => p.id === productId)?.name || '',
          targetValue: values.target,
          achievedValue: values.achieve
        }))
      }));

      const response = await fetch('http://localhost:4444/api/sales-targets/distributor-targets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId: selectedProductCategory,
          month: currentMonth,
          year: currentYear,
          targets: targetsPayload
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Targets saved successfully!');
      } else {
        alert(`Error saving targets: ${data.message}`);
      }
    } catch (error) {
      console.error('Error saving targets:', error);
      alert('Error saving targets. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Target Report</h1>
          <p className="text-gray-600 mt-1">Monitor and manage sales targets across provinces and categories</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTargetForm(!showTargetForm)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Target
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Target Form Modal */}
      {showTargetForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingTarget ? 'Edit Target' : 'Add New Target'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                <select
                  value={newTarget.province}
                  onChange={(e) => setNewTarget({...newTarget, province: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Province</option>
                  {provinces.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newTarget.category}
                  onChange={(e) => setNewTarget({...newTarget, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (NPR)</label>
                <input
                  type="number"
                  value={newTarget.targetAmount || ''}
                  onChange={(e) => setNewTarget({...newTarget, targetAmount: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter target amount"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newTarget.startDate}
                    onChange={(e) => setNewTarget({...newTarget, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newTarget.endDate}
                    onChange={(e) => setNewTarget({...newTarget, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={editingTarget ? handleUpdateTarget : handleAddTarget}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                {editingTarget ? 'Update Target' : 'Add Target'}
              </button>
              <button
                onClick={() => {
                  setShowTargetForm(false);
                  setEditingTarget(null);
                  setNewTarget({ province: '', targetAmount: 0, category: '', startDate: '', endDate: '' });
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Target</p>
              <p className="text-2xl font-semibold text-gray-900">NPR {summaryStats.totalTarget.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Actual Sales</p>
              <p className="text-2xl font-semibold text-gray-900">NPR {summaryStats.totalActual.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <PieChart className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Achievement</p>
              <p className="text-2xl font-semibold text-gray-900">{summaryStats.overallAchievement.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Plus className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Targets</p>
              <p className="text-2xl font-semibold text-gray-900">{summaryStats.activeTargets}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart },
            { id: 'targets', name: 'Target Management', icon: Target },
            { id: 'distributor-targets', name: 'Distributor Targets', icon: Target },
            { id: 'analytics', name: 'Analytics', icon: PieChart }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Province-wise Sales Performance</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getProvinceChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number | undefined) => value ? [`NPR ${value.toLocaleString()}`, ''] : ['', '']}/>
                      <Legend />
                      <Bar dataKey="targetSales" fill="#3b82f6" name="Target Sales" />
                      <Bar dataKey="actualSales" fill="#10b981" name="Actual Sales" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category-wise Target Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => percent ? `${name}: ${(percent * 100).toFixed(0)}%` : `${name}: 0%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="targetSales"
                      >
                        {mockCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number | undefined) => value ? [`NPR ${value.toLocaleString()}`, 'Target Sales'] : ['', 'Target Sales']}/>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Line Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Target vs Actual Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockProvinceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number | undefined) => value ? [`NPR ${value.toLocaleString()}`, ''] : ['', '']}/>
                    <Legend />
                    <Line type="monotone" dataKey="targetSales" stroke="#3b82f6" name="Target Sales" strokeWidth={2} />
                    <Line type="monotone" dataKey="actualSales" stroke="#10b981" name="Actual Sales" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'targets' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Target Management</h3>
              <p className="text-gray-600 mt-1">Manage and track sales targets for each province</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Province</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {provinceTargets.map((target) => (
                    <tr key={target.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{target.province}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{target.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">NPR {target.targetAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {target.startDate} to {target.endDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditTarget(target)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTarget(target.id)}
                            className="text-red-600 hover:text-red-900"
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
            
            {provinceTargets.length === 0 && (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No targets set</h3>
                <p className="text-gray-500 mb-4">Get started by adding your first sales target</p>
                <button
                  onClick={() => setShowTargetForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Target
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'distributor-targets' && (
          <div className="space-y-6">
            {/* Category Selection */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Product Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {productCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedProductCategory(category.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedProductCategory === category.id
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <h4 className="font-semibold">{category.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{category.products.length} products</p>
                      </div>
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters Section */}
            {selectedProductCategory && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">लक्ष्य फिल्टर सेट गर्नुहोस् (Set Target Filters)</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">उत्पादन श्रेणी (Product Category)</label>
                    <select
                      value={selectedProductCategory}
                      onChange={(e) => setSelectedProductCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    >
                      {productCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">नेपाली महिना (Nepali Month)</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    >
                      {nepaliMonths.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">नेपाली वर्ष (Nepali Year)</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    >
                      {nepaliYears.map((year) => (
                        <option key={year} value={year}>
                          {year} बि.सं. (B.S.)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">प्रदेश (Province)</label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    >
                      <option value="">सबै प्रदेशहरू (All Provinces)</option>
                      {provinces.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Distributor Target Table */}
            {selectedProductCategory && products.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {productCategories.find(cat => cat.id === selectedProductCategory)?.name} Targets
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {nepaliMonths.find(m => m.value === selectedMonth)?.name} {selectedYear} बि.सं.
                        {selectedProvince && ` - ${selectedProvince}`}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowAddDistributorForm(!showAddDistributorForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Add Distributor
                      </button>
                      <button
                        onClick={saveTargets}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Save className="h-4 w-4" />
                        Save All Targets
                      </button>
                    </div>
                  </div>
                </div>

                {/* Add Distributor Form */}
                {showAddDistributorForm && (
                  <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Add New Distributor</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Distributor Name</label>
                        <input
                          type="text"
                          value={newDistributor.name}
                          onChange={(e) => setNewDistributor({...newDistributor, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                          placeholder="Enter distributor name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={newDistributor.email}
                          onChange={(e) => setNewDistributor({...newDistributor, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                        <select
                          value={newDistributor.province}
                          onChange={(e) => setNewDistributor({...newDistributor, province: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                        >
                          <option value="">Select Province</option>
                          {provinces.map((province) => (
                            <option key={province} value={province}>
                              {province}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end gap-2">
                        <button
                          onClick={handleAddDistributor}
                          className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                          Add Distributor
                        </button>
                        <button
                          onClick={() => {
                            setShowAddDistributorForm(false);
                            setNewDistributor({ name: '', email: '', province: '' });
                          }}
                          className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading distributors...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            S.No
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Distributor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Target
                          </th>
                          {products.map((product) => (
                            <th key={product.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-gray-400">[{product.units}]</div>
                              </div>
                            </th>
                          ))}
                        </tr>
                        <tr>
                          <th></th>
                          <th></th>
                          <th></th>
                          {products.map((product) => (
                            <th key={`${product.id}-sub`} className="px-6 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                              <div className="flex gap-4">
                                <span>Target</span>
                                <span>Achieve</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {distributorTargets.map((distributorTarget, index) => (
                          <tr key={distributorTarget.distributorId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {distributorTarget.distributorName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {Object.values(distributorTarget.targets).reduce((sum, target) => sum + target.target, 0)}
                            </td>
                            {products.map((product) => (
                              <td key={product.id} className="px-6 py-4 whitespace-nowrap">
                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    value={distributorTarget.targets[product.id]?.target || 0}
                                    onChange={(e) => handleTargetChange(
                                      distributorTarget.distributorId,
                                      product.id,
                                      'target',
                                      e.target.value
                                    )}
                                    className="w-20 px-2 py-1 text-black text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="0"
                                  />
                                  <input
                                    type="number"
                                    min="0"
                                    max={distributorTarget.targets[product.id]?.target || 0}
                                    value={distributorTarget.targets[product.id]?.achieve || 0}
                                    onChange={(e) => handleTargetChange(
                                      distributorTarget.distributorId,
                                      product.id,
                                      'achieve',
                                      e.target.value
                                    )}
                                    className="w-20 px-2 py-1 text-black text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                    placeholder="0"
                                    title="Achieved cannot exceed target"
                                  />
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {!selectedProductCategory && (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Category</h3>
                <p className="text-gray-500">Choose a product category to set distributor targets</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Provinces</h3>
                <div className="space-y-3">
                  {[...mockProvinceData]
                    .sort((a, b) => b.achievement - a.achievement)
                    .slice(0, 3)
                    .map((province, index) => (
                      <div key={province.name} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">{index + 1}.</span>
                          <span className="ml-2 text-sm text-gray-600">{province.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-green-600">{province.achievement}%</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
                <div className="space-y-3">
                  {mockCategoryData.map((category) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{category.name}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {((category.actualSales / category.targetSales) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span>90%+ achievement in 5 provinces</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span>Target adjustment needed for 2 provinces</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span>Electronics showing highest growth</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}