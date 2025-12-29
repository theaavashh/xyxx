'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Download, 
  RefreshCw, 
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Building2,
  TrendingUp,
  BarChart3,
  Eye,
  FileSpreadsheet,
  Package,
  ShoppingCart,
  TrendingDown
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Distributor {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  createdAt: string;
  assignedProvinces?: string[];
  assignedAreas?: string[];
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  brand: string;
  size: string;
  category: string;
}

interface DailyStockData {
  date: string;
  productId: string;
  product: Product;
  openingStock: number;
  closingStock: number;
  soldQuantity: number;
  purchasedQuantity: number;
  totalSales: number;
}

interface DistributorSalesData {
  distributor: Distributor;
  year: number;
  month: number;
  monthName: string;
  dailyStockData: DailyStockData[];
  products: Product[];
  summary: {
    totalSales: number;
    totalTransactions: number;
    totalProducts: number;
    averageDailySales: number;
  };
}

// Hardcoded mock data
const MOCK_DISTRIBUTORS: Distributor[] = [
  {
    id: 'dist-001',
    fullName: 'Aavash Ganesh',
    name: 'Aavash Co',
    email: 'aavash@distributor.com',
    createdAt: '2025-01-01',
    assignedProvinces: ['bagmati', 'gandaki'],
    assignedAreas: ['Kathmandu Valley', 'Pokhara City']
  },
  {
    id: 'dist-002',
    fullName: 'Ram Sharma',
    name: 'Sharma Enterprises',
    email: 'ram@distributor.com',
    createdAt: '2025-01-15',
    assignedProvinces: ['madhesh', 'lumbini'],
    assignedAreas: ['Janakpur', 'Butwal']
  },
  {
    id: 'dist-003',
    fullName: 'Sita Devi',
    name: 'Devi Trading',
    email: 'sita@distributor.com',
    createdAt: '2025-02-01',
    assignedProvinces: ['karnali', 'sudurpashchim'],
    assignedAreas: ['Surkhet', 'Dhangadhi']
  }
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'ZipZip Pork Achar',
    sku: 'ZZP-001',
    price: 250.00,
    brand: 'ZipZip',
    size: '500g',
    category: 'Achar'
  },
  {
    id: 'prod-002',
    name: 'ZipZip Mutton Achar',
    sku: 'ZZM-002',
    price: 280.00,
    brand: 'ZipZip',
    size: '500g',
    category: 'Achar'
  },
  {
    id: 'prod-003',
    name: 'ZipZip Buff Achar',
    sku: 'ZZB-003',
    price: 230.00,
    brand: 'ZipZip',
    size: '500g',
    category: 'Achar'
  },
  {
    id: 'prod-004',
    name: 'ZipZip Chicken Achar',
    sku: 'ZZC-004',
    price: 270.00,
    brand: 'ZipZip',
    size: '500g',
    category: 'Achar'
  },
  {
    id: 'prod-005',
    name: 'ZipZip Mixed Achar',
    sku: 'ZZX-005',
    price: 300.00,
    brand: 'ZipZip',
    size: '1kg',
    category: 'Achar'
  }
];

const generateMockStockData = (distributorId: string, year: number, month: number): DailyStockData[] => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const stockData: DailyStockData[] = [];
  const productStockMap = new Map<string, number>();
  
  // Initialize opening stock for each product
  MOCK_PRODUCTS.forEach(product => {
    productStockMap.set(product.id, Math.floor(Math.random() * 100) + 50);
  });
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    MOCK_PRODUCTS.forEach(product => {
      const openingStock = productStockMap.get(product.id) || 0;
      const soldQuantity = Math.floor(Math.random() * 15) + 1;
      const purchasedQuantity = day % 5 === 0 ? Math.floor(Math.random() * 50) + 20 : 0;
      const totalSales = soldQuantity * product.price;
      
      const closingStock = openingStock + purchasedQuantity - soldQuantity;
      
      stockData.push({
        date,
        productId: product.id,
        product,
        openingStock,
        closingStock,
        soldQuantity,
        purchasedQuantity,
        totalSales
      });
      
      productStockMap.set(product.id, closingStock);
    });
  }
  
  return stockData;
};

const generateMockSalesData = (distributorId: string, year: number, month: number): DistributorSalesData => {
  const distributor = MOCK_DISTRIBUTORS.find(d => d.id === distributorId) || MOCK_DISTRIBUTORS[0];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dailyStockData = generateMockStockData(distributorId, year, month);
  
  const totalSales = dailyStockData.reduce((sum, s) => sum + s.totalSales, 0);
  const totalTransactions = dailyStockData.length;
  const daysInMonth = new Date(year, month, 0).getDate();
  const averageDailySales = totalSales / daysInMonth;
  
  return {
    distributor,
    year,
    month,
    monthName: monthNames[month - 1],
    dailyStockData,
    products: MOCK_PRODUCTS,
    summary: {
      totalSales,
      totalTransactions,
      totalProducts: MOCK_PRODUCTS.length,
      averageDailySales
    }
  };
};

export default function DistributorSalesViewer() {
  const [distributors, setDistributors] = useState<Distributor[]>(MOCK_DISTRIBUTORS);
  const [selectedDistributor, setSelectedDistributor] = useState<string>(MOCK_DISTRIBUTORS[0].id);
  const [availableMonths, setAvailableMonths] = useState([
    { year: 2025, month: 1, monthName: 'January', label: '2025-01' },
    { year: 2025, month: 2, monthName: 'February', label: '2025-02' },
    { year: 2025, month: 3, monthName: 'March', label: '2025-03' },
    { year: 2025, month: 4, monthName: 'April', label: '2025-04' },
    { year: 2025, month: 5, monthName: 'May', label: '2025-05' },
    { year: 2025, month: 6, monthName: 'June', label: '2025-06' },
    { year: 2025, month: 7, monthName: 'July', label: '2025-07' },
    { year: 2025, month: 8, monthName: 'August', label: '2025-08' },
    { year: 2025, month: 9, monthName: 'September', label: '2025-09' },
    { year: 2025, month: 10, monthName: 'October', label: '2025-10' },
    { year: 2025, month: 11, monthName: 'November', label: '2025-11' },
    { year: 2025, month: 12, monthName: 'December', label: '2025-12' }
  ]);
  const [selectedMonth, setSelectedMonth] = useState<string>('2025-10');
  const [salesData, setSalesData] = useState<DistributorSalesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedDistributor && selectedMonth) {
      const [year, month] = selectedMonth.split('-');
      loadSalesData(selectedDistributor, parseInt(year), parseInt(month));
    }
  }, [selectedDistributor, selectedMonth]);

  const loadSalesData = (distributorId: string, year: number, month: number) => {
    setLoading(true);
    setTimeout(() => {
      const mockData = generateMockSalesData(distributorId, year, month);
      setSalesData(mockData);
      setLoading(false);
    }, 500);
  };

  const handleRefresh = () => {
    if (selectedDistributor && selectedMonth) {
      const [year, month] = selectedMonth.split('-');
      loadSalesData(selectedDistributor, parseInt(year), parseInt(month));
    }
  };

  const handleExport = () => {
    if (!salesData) return;
    
    const csvContent = generateCSV(salesData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-data-${salesData.distributor.name}-${salesData.year}-${salesData.month}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  const generateCSV = (data: DistributorSalesData): string => {
    let csv = 'Date';
    
    // Add product headers
    data.products.forEach(product => {
      csv += `,${product.name} - Opening,${product.name} - Sold,${product.name} - Purchase,${product.name} - Closing,${product.name} - Sales (NPR)`;
    });
    csv += ',Total Sales (NPR)\n';
    
    // Group data by date
    const dateMap = new Map<string, DailyStockData[]>();
    data.dailyStockData.forEach(stock => {
      if (!dateMap.has(stock.date)) {
        dateMap.set(stock.date, []);
      }
      dateMap.get(stock.date)!.push(stock);
    });
    
    dateMap.forEach((stocks, date) => {
      csv += `"${new Date(date).toLocaleDateString()}"`;
      let dayTotal = 0;
      
      data.products.forEach(product => {
        const stock = stocks.find(s => s.productId === product.id);
        if (stock) {
          csv += `,${stock.openingStock},${stock.soldQuantity},${stock.purchasedQuantity},${stock.closingStock},${stock.totalSales.toFixed(2)}`;
          dayTotal += stock.totalSales;
        } else {
          csv += `,0,0,0,0,0.00`;
        }
      });
      
      csv += `,${dayTotal.toFixed(2)}\n`;
    });
    
    return csv;
  };

  const filteredDistributors = distributors.filter(distributor =>
    (distributor.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (distributor.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    distributor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group stock data by date for Excel-style view
  const getExcelData = () => {
    if (!salesData) return [];
    
    const dateMap = new Map<string, DailyStockData[]>();
    salesData.dailyStockData.forEach(stock => {
      if (!dateMap.has(stock.date)) {
        dateMap.set(stock.date, []);
      }
      dateMap.get(stock.date)!.push(stock);
    });
    
    return Array.from(dateMap.entries()).map(([date, stocks]) => ({
      date,
      stocks: stocks.sort((a, b) => a.product.sku.localeCompare(b.product.sku)),
      totalSales: stocks.reduce((sum, s) => sum + s.totalSales, 0)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const excelData = getExcelData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Distributor Sales Sheet</h1>
          <p className="text-gray-600 mt-1">Excel-style daily transaction and stock tracking</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExport}
            disabled={!salesData}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Distributor
            </label>
            <select
              value={selectedDistributor}
              onChange={(e) => setSelectedDistributor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {filteredDistributors.map((distributor) => (
                <option key={distributor.id} value={distributor.id}>
                  {distributor.fullName} ({distributor.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {availableMonths.map((month) => (
                <option key={month.label} value={month.label}>
                  {month.monthName} {month.year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {salesData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-3xl font-bold text-green-600">NPR {salesData.summary.totalSales.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Average</p>
                <p className="text-3xl font-bold text-purple-600">NPR {salesData.summary.averageDailySales.toFixed(2)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-3xl font-bold text-indigo-600">{salesData.summary.totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Distributor</p>
                <p className="text-xl font-bold text-blue-600">{salesData.distributor.fullName}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
      )}

      {/* Excel-Style Table */}
      {salesData && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">
              {salesData.distributor.fullName} - {salesData.monthName} {salesData.year}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Daily Stock & Sales Report
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: '1400px' }}>
              <thead className="bg-indigo-600 text-white sticky top-0">
                <tr>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-sm whitespace-nowrap" rowSpan={2}>
                    Date
                  </th>
                  {salesData.products.map((product) => (
                    <th 
                      key={product.id} 
                      className="border border-gray-300 px-4 py-2 text-center font-semibold text-xs"
                      colSpan={5}
                    >
                      <div>{product.name}</div>
                      <div className="text-xs font-normal opacity-90">{product.sku} - NPR {product.price}</div>
                    </th>
                  ))}
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-sm whitespace-nowrap" rowSpan={2}>
                    Total Sales (NPR)
                  </th>
                </tr>
                <tr>
                  {salesData.products.map((product) => (
                    <React.Fragment key={`${product.id}-headers`}>
                      <th className="border border-gray-300 px-2 py-2 text-center font-medium text-xs bg-indigo-500">
                        Opening
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center font-medium text-xs bg-red-500">
                        Sold
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center font-medium text-xs bg-green-500">
                        Purchase
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center font-medium text-xs bg-blue-500">
                        Closing
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center font-medium text-xs bg-yellow-500">
                        Sales (NPR)
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelData.map((row, rowIndex) => (
                  <tr 
                    key={row.date} 
                    className={rowIndex % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                  >
                    <td className="border border-gray-300 px-4 py-3 text-center font-medium text-sm whitespace-nowrap">
                      {new Date(row.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </td>
                    {salesData.products.map((product) => {
                      const stock = row.stocks.find(s => s.productId === product.id);
                      return (
                        <React.Fragment key={`${row.date}-${product.id}`}>
                          <td className="border border-gray-300 px-3 py-3 text-center text-sm bg-blue-50">
                            {stock?.openingStock || 0}
                          </td>
                          <td className="border border-gray-300 px-3 py-3 text-center text-sm font-medium text-red-700 bg-red-50">
                            {stock?.soldQuantity || 0}
                          </td>
                          <td className="border border-gray-300 px-3 py-3 text-center text-sm font-medium text-green-700 bg-green-50">
                            {stock?.purchasedQuantity > 0 ? `+${stock.purchasedQuantity}` : 0}
                          </td>
                          <td className="border border-gray-300 px-3 py-3 text-center text-sm font-semibold bg-blue-100">
                            {stock?.closingStock || 0}
                          </td>
                          <td className="border border-gray-300 px-3 py-3 text-center text-sm font-medium text-yellow-800 bg-yellow-50">
                            NPR {stock?.totalSales.toFixed(2) || '0.00'}
                          </td>
                        </React.Fragment>
                      );
                    })}
                    <td className="border border-gray-300 px-4 py-3 text-center text-sm font-bold text-green-700 bg-green-100">
                      NPR {row.totalSales.toFixed(2)}
                    </td>
                  </tr>
                ))}
                
                {/* Totals Row */}
                <tr className="bg-indigo-100 font-bold">
                  <td className="border border-gray-300 px-4 py-3 text-center text-sm">
                    TOTAL
                  </td>
                  {salesData.products.map((product) => {
                    const productData = salesData.dailyStockData.filter(s => s.productId === product.id);
                    const totalSold = productData.reduce((sum, s) => sum + s.soldQuantity, 0);
                    const totalPurchased = productData.reduce((sum, s) => sum + s.purchasedQuantity, 0);
                    const totalSales = productData.reduce((sum, s) => sum + s.totalSales, 0);
                    const lastStock = productData[productData.length - 1];
                    
                    return (
                      <React.Fragment key={`total-${product.id}`}>
                        <td className="border border-gray-300 px-3 py-3 text-center text-sm bg-blue-100">
                          {productData[0]?.openingStock || 0}
                        </td>
                        <td className="border border-gray-300 px-3 py-3 text-center text-sm text-red-700 bg-red-100">
                          {totalSold}
                        </td>
                        <td className="border border-gray-300 px-3 py-3 text-center text-sm text-green-700 bg-green-100">
                          +{totalPurchased}
                        </td>
                        <td className="border border-gray-300 px-3 py-3 text-center text-sm bg-blue-200">
                          {lastStock?.closingStock || 0}
                        </td>
                        <td className="border border-gray-300 px-3 py-3 text-center text-sm text-yellow-800 bg-yellow-100">
                          NPR {totalSales.toFixed(2)}
                        </td>
                      </React.Fragment>
                    );
                  })}
                  <td className="border border-gray-300 px-4 py-3 text-center text-sm text-green-800 bg-green-200">
                    NPR {salesData.summary.totalSales.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}