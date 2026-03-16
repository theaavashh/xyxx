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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap
} from 'recharts';
import {
  ArrowLeft,
  TrendingUp,
  Package,
  Beaker,
  Box,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Download,
  RefreshCw
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
    particular: string;
    quantity: number;
    unit: string;
  }[];
  packaging: {
    sno: number;
    particular: string;
    quantity: number;
    unit: string;
  }[];
  totalFinishedOutput: number;
  outputUnit: string;
  preparedBy: string;
  approvedBy: string;
  notes?: string;
  createdAt: string;
}

interface AnalyticsData {
  productChartNo: string;
  dailySeriesNo: string;
  date: string;
  productName: string;
  batchNo: string;
  ingredients: {
    sno: number;
    particular: string;
    quantity: number;
    unit: string;
  }[];
  packaging: {
    sno: number;
    particular: string;
    quantity: number;
    unit: string;
  }[];
  totalFinishedOutput: number;
  outputUnit: string;
  preparedBy: string;
  approvedBy: string;
  notes?: string;
  createdAt: string;
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1'
];

export default function ProductionAnalytics() {
  const [charts, setCharts] = useState<ProductionChartTableData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'materials' | 'trends'>('overview');

  useEffect(() => {
    loadData();
  }, []);

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
            { sno: 1, particular: 'Chicken Meat', quantity: 5000, unit: 'gm' },
            { sno: 2, particular: 'Mustard Oil', quantity: 2000, unit: 'ml' },
            { sno: 3, particular: 'Chili Powder', quantity: 500, unit: 'gm' },
            { sno: 4, particular: 'Turmeric', quantity: 100, unit: 'gm' },
            { sno: 5, particular: 'Salt', quantity: 300, unit: 'gm' },
          ],
          packaging: [
            { sno: 1, particular: 'Glass Jar (200gm)', quantity: 25, unit: 'pcs' },
            { sno: 2, particular: 'Label Sticker', quantity: 25, unit: 'pcs' },
            { sno: 3, particular: 'Sealing Cap', quantity: 25, unit: 'pcs' },
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
            { sno: 1, particular: 'Potatoes', quantity: 10000, unit: 'gm' },
            { sno: 2, particular: 'Vegetable Oil', quantity: 3000, unit: 'ml' },
            { sno: 3, particular: 'Salt', quantity: 200, unit: 'gm' },
            { sno: 4, particular: 'Spices Mix', quantity: 150, unit: 'gm' },
          ],
          packaging: [
            { sno: 1, particular: 'Plastic Packet (100gm)', quantity: 50, unit: 'pcs' },
            { sno: 2, particular: 'Sealing Label', quantity: 50, unit: 'pcs' },
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
            { sno: 1, particular: 'Raw Mangoes', quantity: 8000, unit: 'gm' },
            { sno: 2, particular: 'Mustard Oil', quantity: 2500, unit: 'ml' },
            { sno: 3, particular: 'Red Chili', quantity: 400, unit: 'gm' },
            { sno: 4, particular: 'Mustard Seeds', quantity: 200, unit: 'gm' },
            { sno: 5, particular: 'Salt', quantity: 400, unit: 'gm' },
            { sno: 6, particular: 'Fenugreek', quantity: 100, unit: 'gm' },
          ],
          packaging: [
            { sno: 1, particular: 'Glass Jar (500gm)', quantity: 20, unit: 'pcs' },
            { sno: 2, particular: 'Label Sticker', quantity: 20, unit: 'pcs' },
            { sno: 3, particular: 'Sealing Cap', quantity: 20, unit: 'pcs' },
          ],
          totalFinishedOutput: 20,
          outputUnit: 'bottle',
          preparedBy: 'Ram Bahadur',
          approvedBy: 'Supervisor Gurung',
          notes: 'Special batch',
          createdAt: new Date().toISOString()
        },
        {
          id: '4',
          productChartNo: 'PC-2024-004',
          dailySeriesNo: 'DS-004',
          date: '2024-02-15',
          productName: 'Chicken Pickle',
          batchNo: 'B-004',
          ingredients: [
            { sno: 1, particular: 'Chicken Meat', quantity: 6000, unit: 'gm' },
            { sno: 2, particular: 'Mustard Oil', quantity: 2500, unit: 'ml' },
            { sno: 3, particular: 'Chili Powder', quantity: 600, unit: 'gm' },
            { sno: 4, particular: 'Turmeric', quantity: 120, unit: 'gm' },
            { sno: 5, particular: 'Salt', quantity: 350, unit: 'gm' },
          ],
          packaging: [
            { sno: 1, particular: 'Glass Jar (200gm)', quantity: 30, unit: 'pcs' },
            { sno: 2, particular: 'Label Sticker', quantity: 30, unit: 'pcs' },
            { sno: 3, particular: 'Sealing Cap', quantity: 30, unit: 'pcs' },
          ],
          totalFinishedOutput: 30,
          outputUnit: 'bottle',
          preparedBy: 'Ram Bahadur',
          approvedBy: 'Manager Shrestha',
          notes: 'Increased batch size',
          createdAt: new Date().toISOString()
        },
        {
          id: '5',
          productChartNo: 'PC-2024-005',
          dailySeriesNo: 'DS-005',
          date: '2024-02-16',
          productName: 'Potato Chips',
          batchNo: 'B-005',
          ingredients: [
            { sno: 1, particular: 'Potatoes', quantity: 8000, unit: 'gm' },
            { sno: 2, particular: 'Vegetable Oil', quantity: 2500, unit: 'ml' },
            { sno: 3, particular: 'Salt', quantity: 150, unit: 'gm' },
            { sno: 4, particular: 'Spices Mix', quantity: 120, unit: 'gm' },
          ],
          packaging: [
            { sno: 1, particular: 'Plastic Packet (100gm)', quantity: 40, unit: 'pcs' },
            { sno: 2, particular: 'Sealing Label', quantity: 40, unit: 'pcs' },
          ],
          totalFinishedOutput: 40,
          outputUnit: 'packet',
          preparedBy: 'Hari Prasad',
          approvedBy: 'Manager Shrestha',
          notes: 'Reduced batch',
          createdAt: new Date().toISOString()
        },
        {
          id: '6',
          productChartNo: 'PC-2024-006',
          dailySeriesNo: 'DS-006',
          date: '2024-02-17',
          productName: 'Mixed Vegetable Pickle',
          batchNo: 'B-006',
          ingredients: [
            { sno: 1, particular: 'Mixed Vegetables', quantity: 7000, unit: 'gm' },
            { sno: 2, particular: 'Mustard Oil', quantity: 2200, unit: 'ml' },
            { sno: 3, particular: 'Chili Powder', quantity: 450, unit: 'gm' },
            { sno: 4, particular: 'Salt', quantity: 320, unit: 'gm' },
            { sno: 5, particular: 'Vinegar', quantity: 500, unit: 'ml' },
          ],
          packaging: [
            { sno: 1, particular: 'Glass Jar (300gm)', quantity: 25, unit: 'pcs' },
            { sno: 2, particular: 'Label Sticker', quantity: 25, unit: 'pcs' },
          ],
          totalFinishedOutput: 25,
          outputUnit: 'bottle',
          preparedBy: 'Ram Bahadur',
          approvedBy: 'Manager Shrestha',
          notes: 'New product',
          createdAt: new Date().toISOString()
        }
      ];
      
      setCharts(mockData);
    } catch (error) {
      console.error('Error loading production charts:', error);
      toast.error('Failed to load production charts');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate analytics data
  const getProductProductionData = () => {
    const productTotals = charts.reduce((acc, chart) => {
      if (!acc[chart.productName]) {
        acc[chart.productName] = {
          name: chart.productName,
          total: 0,
          batches: 0,
          unit: chart.outputUnit
        };
      }
      acc[chart.productName].total += chart.totalFinishedOutput;
      acc[chart.productName].batches += 1;
      return acc;
    }, {} as Record<string, { name: string; total: number; batches: number; unit: string }>);

    return Object.values(productTotals).sort((a, b) => b.total - a.total);
  };

  const getDailyProductionData = () => {
    return charts
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(chart => ({
        date: formatDate(chart.date),
        product: chart.productName,
        quantity: chart.totalFinishedOutput,
        unit: chart.outputUnit,
        ingredients: chart.ingredients.length,
        packaging: chart.packaging.length
      }));
  };

  const getIngredientUsageData = () => {
    const ingredientTotals: Record<string, { name: string; total: number; unit: string }> = {};
    
    charts.forEach(chart => {
      chart.ingredients.forEach(ing => {
        const key = `${ing.particular}_${ing.unit}`;
        if (!ingredientTotals[key]) {
          ingredientTotals[key] = {
            name: ing.particular,
            total: 0,
            unit: ing.unit
          };
        }
        ingredientTotals[key].total += ing.quantity;
      });
    });

    return Object.values(ingredientTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  };

  const getPackagingUsageData = () => {
    const packagingTotals: Record<string, { name: string; total: number; unit: string }> = {};
    
    charts.forEach(chart => {
      chart.packaging.forEach(pkg => {
        const key = `${pkg.particular}_${pkg.unit}`;
        if (!packagingTotals[key]) {
          packagingTotals[key] = {
            name: pkg.particular,
            total: 0,
            unit: pkg.unit
          };
        }
        packagingTotals[key].total += pkg.quantity;
      });
    });

    return Object.values(packagingTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  };

  const getProductDistributionData = () => {
    const productData = getProductProductionData();
    return productData.map(item => ({
      name: item.name,
      value: item.total
    }));
  };

  const getProductionTrendData = () => {
    const dailyData: Record<string, { date: string; total: number; products: string[] }> = {};
    
    charts.forEach(chart => {
      if (!dailyData[chart.date]) {
        dailyData[chart.date] = {
          date: formatDate(chart.date),
          total: 0,
          products: []
        };
      }
      dailyData[chart.date].total += chart.totalFinishedOutput;
      if (!dailyData[chart.date].products.includes(chart.productName)) {
        dailyData[chart.date].products.push(chart.productName);
      }
    });

    return Object.values(dailyData).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const getStaffPerformanceData = () => {
    const staffTotals: Record<string, { name: string; charts: number; products: number }> = {};
    
    charts.forEach(chart => {
      if (!staffTotals[chart.preparedBy]) {
        staffTotals[chart.preparedBy] = {
          name: chart.preparedBy,
          charts: 0,
          products: 0
        };
      }
      staffTotals[chart.preparedBy].charts += 1;
      staffTotals[chart.preparedBy].products += chart.totalFinishedOutput;
    });

    return Object.values(staffTotals);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  const productData = getProductProductionData();
  const dailyData = getDailyProductionData();
  const ingredientData = getIngredientUsageData();
  const packagingData = getPackagingUsageData();
  const pieData = getProductDistributionData();
  const trendData = getProductionTrendData();
  const staffData = getStaffPerformanceData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Production Analytics</h1>
            <p className="text-gray-600 mt-1">Detailed charts and insights</p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={loadData}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Box className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Total Charts</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{charts.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Beaker className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Total Ingredients</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {charts.reduce((sum, c) => sum + c.ingredients.length, 0)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Total Packaging</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {charts.reduce((sum, c) => sum + c.packaging.length, 0)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Total Products</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {charts.reduce((sum, c) => sum + c.totalFinishedOutput, 0)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1">
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'products', label: 'Products', icon: Box },
            { id: 'materials', label: 'Materials', icon: Beaker },
            { id: 'trends', label: 'Trends', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'products' | 'materials' | 'trends')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Production by Product - Bar Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-gray-600" />
                Production by Product
              </h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                    formatter={(value: number, _name: string, props: { payload: { unit: string } }) => [
                      `${value} ${props.payload.unit}`,
                      'Total Production'
                    ]}
                  />
                  <Bar dataKey="total" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Distribution - Pie Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <PieChartIcon className="h-5 w-5 mr-2 text-gray-600" />
                Product Distribution
              </h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Production Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-gray-600" />
                Daily Production Trend
              </h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Product Production Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Product Production Details</h3>
            <div className="space-y-6">
              {productData.map((product, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">{product.name}</h4>
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                      {product.batches} batches
                    </span>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={charts
                          .filter(c => c.productName === product.name)
                          .map(c => ({
                            date: formatDate(c.date),
                            quantity: c.totalFinishedOutput
                          }))
                        }
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="quantity" fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Staff Performance */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Staff Performance</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={staffData} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#6B7280', fontSize: 12 }} width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="charts" fill="#3B82F6" name="Charts Created" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="products" fill="#10B981" name="Products Made" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          {/* Top Ingredients */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Top 10 Ingredients by Usage</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ingredientData} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#6B7280', fontSize: 11 }} width={120} />
                  <Tooltip 
                    formatter={(value: number, _name: string, props: { payload: { unit: string } }) => [
                      `${value} ${props.payload.unit}`,
                      'Total Used'
                    ]}
                  />
                  <Bar dataKey="total" fill="#F97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Packaging Materials */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Top 10 Packaging Materials by Usage</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={packagingData} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#6B7280', fontSize: 11 }} width={120} />
                  <Tooltip 
                    formatter={(value: number, _name: string, props: { payload: { unit: string } }) => [
                      `${value} ${props.payload.unit}`,
                      'Total Used'
                    ]}
                  />
                  <Bar dataKey="total" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Materials Usage Comparison */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Daily Materials Usage</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ingredients" fill="#F97316" name="Ingredients Count" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="packaging" fill="#8B5CF6" name="Packaging Count" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="quantity" stroke="#10B981" name="Products Made" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Production Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Production Timeline by Product</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    type="category" 
                    allowDuplicatedCategory={false}
                    tick={{ fill: '#6B7280', fontSize: 11 }}
                  />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  {productData.map((product, idx) => (
                    <Line
                      key={product.name}
                      type="monotone"
                      data={charts
                        .filter(c => c.productName === product.name)
                        .map(c => ({
                          date: formatDate(c.date),
                          quantity: c.totalFinishedOutput
                        }))
                      }
                      dataKey="quantity"
                      name={product.name}
                      stroke={COLORS[idx % COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Production Volume by Date */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Total Production Volume by Date</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Variety per Day */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Product Variety per Day</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number, _name: string, props: { payload: { unit: string } }) => [
                      `${value} products`,
                      'Product Types'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={(data: { products: unknown[] }) => data.products.length}
                    stroke="#EC4899" 
                    fill="#EC4899" 
                    fillOpacity={0.2}
                    name="Product Types"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
