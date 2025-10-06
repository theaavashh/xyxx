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
  FileSpreadsheet
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Distributor {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface MonthData {
  year: number;
  month: number;
  monthName: string;
  label: string;
}

interface SalesData {
  id: string;
  distributorId: string;
  year: number;
  month: number;
  day: number;
  row: number;
  cellId: string;
  value: string;
  type: string;
  formula?: string;
}

interface DistributorSalesData {
  distributor: Distributor;
  year: number;
  month: number;
  monthName: string;
  salesData: SalesData[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function DistributorSalesViewer() {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [selectedDistributor, setSelectedDistributor] = useState<string>('');
  const [availableMonths, setAvailableMonths] = useState<MonthData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [salesData, setSalesData] = useState<DistributorSalesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load distributors on component mount
  useEffect(() => {
    loadDistributors();
  }, []);

  // Load available months when distributor changes
  useEffect(() => {
    if (selectedDistributor) {
      loadAvailableMonths(selectedDistributor);
    }
  }, [selectedDistributor]);

  // Load sales data when month changes
  useEffect(() => {
    if (selectedDistributor && selectedMonth) {
      const [year, month] = selectedMonth.split('-');
      loadSalesData(selectedDistributor, parseInt(year), parseInt(month));
    }
  }, [selectedDistributor, selectedMonth]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !selectedDistributor || !selectedMonth) return;

    const interval = setInterval(() => {
      const [year, month] = selectedMonth.split('-');
      loadSalesData(selectedDistributor, parseInt(year), parseInt(month));
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, selectedDistributor, selectedMonth]);

  const loadDistributors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/sales/distributors`);
      const data = await response.json();
      
      if (data.success) {
        setDistributors(data.data);
      } else {
        toast.error('Failed to load distributors');
      }
    } catch (error) {
      console.error('Error loading distributors:', error);
      toast.error('Failed to load distributors');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableMonths = async (distributorId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/sales/distributors/${distributorId}/months`);
      const data = await response.json();
      
      if (data.success) {
        setAvailableMonths(data.data);
        setSelectedMonth(''); // Reset selected month
      } else {
        toast.error('Failed to load available months');
      }
    } catch (error) {
      console.error('Error loading months:', error);
      toast.error('Failed to load available months');
    } finally {
      setLoading(false);
    }
  };

  const loadSalesData = async (distributorId: string, year: number, month: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/sales/distributors/${distributorId}/sales/${year}/${month}`);
      const data = await response.json();
      
      if (data.success) {
        setSalesData(data.data);
      } else {
        toast.error('Failed to load sales data');
        setSalesData(null);
      }
    } catch (error) {
      console.error('Error loading sales data:', error);
      toast.error('Failed to load sales data');
      setSalesData(null);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthDates = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = new Date(year, month - 1, day);
      return {
        id: `day_${day}`,
        label: day.toString(),
        fullDate: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
      };
    });
  };

  const getCellValue = (day: number, row: number) => {
    if (!salesData) return '';
    
    const cellId = `day_${day}_${row}`;
    const cellData = salesData.salesData.find(data => data.cellId === cellId);
    return cellData?.value || '';
  };

  const filteredDistributors = distributors.filter(distributor =>
    distributor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    distributor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const monthDates = salesData ? generateMonthDates(salesData.year, salesData.month) : [];
  const rows = Array.from({ length: 50 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Distributor Sales Viewer</h1>
          <p className="text-gray-600">View and analyze distributor monthly sales data</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              autoRefresh 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-300 animate-pulse' : 'bg-gray-300'}`}></div>
            <span>{autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}</span>
          </button>
          <button 
            onClick={loadDistributors}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Distributor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Distributor
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search distributors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            {searchTerm && (
              <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredDistributors.map((distributor) => (
                  <button
                    key={distributor.id}
                    onClick={() => {
                      setSelectedDistributor(distributor.id);
                      setSearchTerm(distributor.name);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{distributor.name}</div>
                    <div className="text-sm text-gray-500">{distributor.email}</div>
                  </button>
                ))}
              </div>
            )}
            {selectedDistributor && (
              <div className="mt-2 p-3 bg-indigo-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-900">
                    {distributors.find(d => d.id === selectedDistributor)?.name}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Month Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              disabled={!selectedDistributor || availableMonths.length === 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Select a month...</option>
              {availableMonths.map((month) => (
                <option key={`${month.year}-${month.month}`} value={`${month.year}-${month.month}`}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span className="text-sm text-gray-600">
                {loading ? 'Loading...' : salesData ? 'Data loaded' : 'No data selected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Data Display */}
      {salesData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Month Header */}
          <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {salesData.distributor.name} - {salesData.monthName} {salesData.year}
                </h2>
                <p className="text-sm text-gray-600">
                  {salesData.distributor.email} • {salesData.salesData.length} data points
                </p>
              </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="text-right">
                <div>Total Days: {monthDates.length}</div>
                <div>Data Points: {salesData.salesData.length}</div>
                <div className="text-xs text-gray-500">
                  {autoRefresh ? 'Auto-refreshing every 5s' : 'Manual refresh only'}
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
            </div>
            </div>
          </div>

          {/* Spreadsheet Grid */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Column Headers */}
              <div className="flex">
                <div className="w-12 h-8 bg-gray-100 border border-gray-300 flex items-center justify-center text-xs font-medium text-gray-600"></div>
                {monthDates.map((col) => (
                  <div key={col.id} className="w-24 h-8 bg-gray-100 border border-gray-300 flex flex-col items-center justify-center text-xs font-medium text-gray-600">
                    <div className="text-xs font-bold">{col.label}</div>
                    <div className="text-xs text-gray-500">{col.dayName}</div>
                  </div>
                ))}
              </div>

              {/* Rows */}
              {rows.map((row) => (
                <div key={row} className="flex">
                  {/* Row Header */}
                  <div className="w-12 h-8 bg-gray-100 border border-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
                    {row}
                  </div>
                  
                  {/* Cells */}
                  {monthDates.map((col) => {
                    const day = parseInt(col.label);
                    const cellValue = getCellValue(day, row);
                    
                    return (
                      <div
                        key={`${col.id}_${row}`}
                        className="w-24 h-8 border border-gray-300 text-xs flex items-center px-2 text-black bg-white"
                      >
                        <span className="text-xs truncate">
                          {cellValue}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!salesData && selectedDistributor && selectedMonth && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Sales Data Found</h3>
          <p className="text-gray-500">
            No sales data available for the selected distributor and month.
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <RefreshCw className="h-8 w-8 text-indigo-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading sales data...</p>
        </div>
      )}
    </div>
  );
}
