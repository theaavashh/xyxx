'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { 
  Plus,
  MoreHorizontal,
  Download,
  Upload,
  Save,
  Undo,
  Redo,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Settings,
  Share,
  Eye,
  Edit,
  Trash2,
  Copy,
  Scissors,
  Clipboard,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CellData {
  value: string;
  type: 'text' | 'number' | 'date' | 'formula';
  formula?: string;
  format?: string;
}

interface SheetData {
  [key: string]: CellData;
}

export default function CurrentSales() {
  const { user } = useAuth();
  const [activeCell, setActiveCell] = useState('A1');
  const [selectedRange, setSelectedRange] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [data, setData] = useState<SheetData>({});
  const [activeSheet, setActiveSheet] = useState('Sales Data');
  const [showFormulaBar, setShowFormulaBar] = useState(false);
  const [formulaValue, setFormulaValue] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  const gridRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update current date every minute to detect month changes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentDate(now);
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Always initialize with new sample data (for development)
  const loadExistingData = async () => {
    // Clear any existing data and initialize with new sample data
    initializeSampleData();
  };

  const initializeSampleData = () => {
    const sampleData: SheetData = {};
    
    // Sample sales data for each product across different days
    // Product A (Opening Stock: 100)
    const productASales = {
      1: 5, 2: 3, 3: 7, 4: 2, 5: 8, 6: 4, 7: 6, 8: 9, 9: 3, 10: 5,
      11: 7, 12: 4, 13: 8, 14: 2, 15: 6, 16: 5, 17: 9, 18: 3, 19: 7, 20: 4
    };
    
    // Product B (Opening Stock: 150)
    const productBSales = {
      1: 8, 2: 6, 3: 9, 4: 4, 5: 7, 6: 5, 7: 8, 8: 12, 9: 6, 10: 9,
      11: 10, 12: 7, 13: 11, 14: 5, 15: 8, 16: 9, 17: 12, 18: 6, 19: 10, 20: 8
    };
    
    // Product C (Opening Stock: 200)
    const productCSales = {
      1: 12, 2: 8, 3: 15, 4: 6, 5: 10, 6: 7, 7: 14, 8: 18, 9: 9, 10: 12,
      11: 16, 12: 10, 13: 19, 14: 8, 15: 13, 16: 14, 17: 20, 18: 11, 19: 17, 20: 15
    };
    
    // Product D (Opening Stock: 75) - This will be over-sold
    const productDSales = {
      1: 10, 2: 8, 3: 12, 4: 5, 5: 9, 6: 7, 7: 11, 8: 15, 9: 8, 10: 12,
      11: 14, 12: 9, 13: 16, 14: 6, 15: 13, 16: 15, 17: 18, 18: 10, 19: 17, 20: 20
    };
    
    // Product E (Opening Stock: 120)
    const productESales = {
      1: 6, 2: 4, 3: 8, 4: 3, 5: 7, 6: 5, 7: 9, 8: 11, 9: 5, 10: 8,
      11: 10, 12: 6, 13: 12, 14: 4, 15: 9, 16: 10, 17: 13, 18: 7, 19: 11, 20: 9
    };
    
    // Fill the data for each product row
    const allProductsSales = [
      productASales, productBSales, productCSales, productDSales, productESales
    ];
    
    allProductsSales.forEach((productSales, rowIndex) => {
      Object.entries(productSales).forEach(([day, sales]) => {
        const cellId = `day_${day}_${rowIndex + 1}`;
        sampleData[cellId] = {
          value: sales.toString(),
          type: 'number'
        };
      });
    });
    
    // Add some zero sales days for variety
    const zeroSalesDays = [
      { day: 21, row: 1 }, { day: 22, row: 2 }, { day: 23, row: 3 },
      { day: 24, row: 4 }, { day: 25, row: 5 }
    ];
    
    zeroSalesDays.forEach(({ day, row }) => {
      const cellId = `day_${day}_${row}`;
      sampleData[cellId] = {
        value: '0',
        type: 'number'
      };
    });
    
    setData(sampleData);
  };

  // Initialize with existing data or sample data
  useEffect(() => {
    // Clear any existing data first
    setData({});
    
    if (user?.id) {
      loadExistingData();
    }
  }, [currentDate, user?.id]);

  // Generate dates for current month
  const generateMonthDates = () => {
    const now = currentDate;
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = new Date(year, month, day);
      return {
        id: `day_${day}`,
        label: day.toString(),
        fullDate: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
      };
    });
  };

  const monthDates = generateMonthDates();
  
  // Fixed columns before dates (only Product and Opening Stock)
  const fixedColumns = [
    { id: 'product', label: 'Product', type: 'fixed' },
    { id: 'opening_stock', label: 'Opening Stock', type: 'fixed' }
  ];
  
  // Closing stock column after dates
  const closingStockColumn = [
    { id: 'closing_stock', label: 'Closing Stock', type: 'fixed' }
  ];
  
  // All columns: Fixed columns + date columns + closing stock at the end
  const columns = [...fixedColumns, ...monthDates, ...closingStockColumn];
  const rows = Array.from({ length: 50 }, (_, i) => i + 1);

  const getCellId = (col: any, row: number) => {
  if (col.type === 'fixed') {
    return `${col.id}_${row}`;
  }
  return `${col.id}_${row}`;
};

// Function to check row stock conditions
const getRowStockStatus = (row: number) => {
  const openingStocks = [100, 150, 200, 75, 120];
  const openingStock = openingStocks[row - 1] || 0;
  
  // Sum up all daily sales for this product
  let totalSold = 0;
  for (let day = 1; day <= currentDate.getDate(); day++) {
    const dayCellId = `day_${day}_${row}`;
    const dayValue = parseFloat(data[dayCellId]?.value || '0');
    totalSold += dayValue;
  }
  
  const closingStock = openingStock - totalSold;
  
  return {
    openingStock,
    totalSold,
    closingStock,
    isOverSold: totalSold > openingStock,
    hasPositiveClosing: closingStock > 0
  };
};

  const getCellValue = (cellId: string) => {
    const cell = data[cellId];
    if (!cell) return '';
    
    if (cell.type === 'formula' && cell.formula) {
      // Simple formula evaluation (in a real app, you'd use a proper formula parser)
      if (cell.formula.startsWith('=')) {
        const formula = cell.formula.substring(1);
        if (formula.includes('*')) {
          const [cell1, cell2] = formula.split('*');
          const val1 = parseFloat(data[cell1]?.value || '0');
          const val2 = parseFloat(data[cell2]?.value || '0');
          return (val1 * val2).toString();
        }
      }
    }
    
    return cell.value;
  };

  const canEditCell = (col: any, row: number) => {
    if (col.type === 'fixed') {
      // Only product column can be edited
      return col.id === 'product';
    }
    
    if (isFutureDate(col)) return false;
    
    // Check if all previous columns in the same row are filled
    const currentDay = parseInt(col.label);
    for (let day = 1; day < currentDay; day++) {
      const prevCellId = `day_${day}_${row}`;
      const prevCellValue = data[prevCellId]?.value;
      if (!prevCellValue || prevCellValue.trim() === '') {
        return false;
      }
    }
    return true;
  };

  const handleCellClick = (cellId: string, col: any, row: number) => {
    if (col.type === 'fixed') {
      if (col.id === 'product') {
        // Allow editing product names
        setActiveCell(cellId);
        setIsEditing(true);
        setEditValue(getCellValue(cellId));
      } else {
        // Show info for other fixed columns
        if (col.id === 'opening_stock') {
          toast('Opening stock is calculated from previous month closing stock');
        } else if (col.id === 'closing_stock') {
          toast('Closing stock is calculated automatically: Opening Stock - Total Sales');
        }
      }
      return;
    }
    
    if (isFutureDate(col)) return;
    
    if (!canEditCell(col, row)) {
      // Show message about filling previous cells first
      const currentDay = parseInt(col.label);
      const firstEmptyDay = findFirstEmptyDay(row);
      toast.error(`Please fill data for day ${firstEmptyDay} first before entering data for day ${currentDay}`);
      return;
    }
    
    setActiveCell(cellId);
    setIsEditing(false);
    setEditValue('');
  };

  const handleCellDoubleClick = (cellId: string, col: any, row: number) => {
    if (isFutureDate(col)) return;
    
    if (!canEditCell(col, row)) {
      const currentDay = parseInt(col.label);
      const firstEmptyDay = findFirstEmptyDay(row);
      toast.error(`Please fill data for day ${firstEmptyDay} first before entering data for day ${currentDay}`);
      return;
    }
    
    setActiveCell(cellId);
    setIsEditing(true);
    setEditValue(data[cellId]?.value || '');
    setShowFormulaBar(true);
    setFormulaValue(data[cellId]?.formula || data[cellId]?.value || '');
  };

  const findFirstEmptyDay = (row: number) => {
    for (let day = 1; day <= monthDates.length; day++) {
      const cellId = `day_${day}_${row}`;
      const cellValue = data[cellId]?.value;
      if (!cellValue || cellValue.trim() === '') {
        return day;
      }
    }
    return 1;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isEditing) {
        handleSaveCell();
      } else {
        setIsEditing(true);
        setEditValue(data[activeCell]?.value || '');
        setShowFormulaBar(true);
        setFormulaValue(data[activeCell]?.formula || data[activeCell]?.value || '');
      }
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue('');
      setShowFormulaBar(false);
    } else if (e.key === 'F2') {
      e.preventDefault();
      setIsEditing(true);
      setEditValue(data[activeCell]?.value || '');
      setShowFormulaBar(true);
      setFormulaValue(data[activeCell]?.formula || data[activeCell]?.value || '');
    }
  };

  const saveDataToAPI = async (salesData: any) => {
    try {
      if (!user?.id) {
        toast.error('User not authenticated');
        return;
      }

      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const userId = user.id;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/sales/distributors/${userId}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          distributorId: userId,
          year,
          month,
          salesData: Object.entries(salesData).map(([cellId, cellData]: [string, any]) => {
            // Parse cellId to extract day and row
            const match = cellId.match(/day_(\d+)_(\d+)/);
            if (match) {
              const [, day, row] = match;
              return {
                day: parseInt(day),
                row: parseInt(row),
                cellId,
                value: cellData.value,
                type: cellData.type,
                formula: cellData.formula
              };
            }
            return null;
          }).filter(Boolean)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }
      
      toast.success('Data saved successfully');
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Failed to save data');
    }
  };

  const handleSaveCell = () => {
    const newData = { ...data };
    const cellId = activeCell;
    
    if (editValue.startsWith('=')) {
      newData[cellId] = {
        value: editValue,
        type: 'formula',
        formula: editValue
      };
    } else if (!isNaN(Number(editValue)) && editValue !== '') {
      newData[cellId] = {
        value: editValue,
        type: 'number'
      };
    } else {
      newData[cellId] = {
        value: editValue,
        type: 'text'
      };
    }
    
    setData(newData);
    setIsEditing(false);
    setEditValue('');
    setShowFormulaBar(false);
    
    // Save to API
    saveDataToAPI(newData);
  };

  const handleFormulaChange = (value: string) => {
    setFormulaValue(value);
    setEditValue(value);
  };

  const handleRefresh = () => {
    setCurrentDate(new Date());
  };

  const isFutureDate = (col: any) => {
    const today = new Date();
    const cellDate = new Date(col.fullDate);
    return cellDate > today;
  };

  const getCellStyle = (cellId: string, col: any, row: number) => {
    const isActive = activeCell === cellId;
    const isSelected = selectedRange.includes(cellId);
    const isFixed = col.type === 'fixed';
    const isFuture = !isFixed && isFutureDate(col);
    const canEdit = canEditCell(col, row);
    
    if (isFixed) {
      // Fixed columns have different styling
      let baseStyle = 'w-32 h-8 border border-gray-300 text-xs flex items-center px-2';
      
      // Get row stock status for coloring
      const stockStatus = getRowStockStatus(row);
      const rowBgClass = stockStatus.isOverSold 
        ? 'bg-red-100' 
        : stockStatus.hasPositiveClosing 
          ? 'bg-green-100' 
          : 'bg-yellow-100';

      if (col.id === 'product') {
        baseStyle += ` text-blue-700 font-medium ${rowBgClass}`;
        if (isActive && canEdit) {
          baseStyle += ' bg-blue-100 border-blue-500';
        }
        if (canEdit) {
          baseStyle += ' cursor-pointer hover:opacity-80';
        } else {
          baseStyle += ' cursor-not-allowed';
        }
      } else if (col.id === 'opening_stock') {
        baseStyle += ` text-green-700 font-medium ${rowBgClass} cursor-not-allowed`;
      } else if (col.id === 'closing_stock') {
        const closingValue = parseFloat(getCellValue(cellId) || '0');
        if (closingValue > 0) {
          baseStyle += ' text-green-700 font-bold bg-green-100 border-l-4 border-l-green-500 cursor-not-allowed';
        } else if (closingValue < 0) {
          baseStyle += ' text-red-700 font-bold bg-red-100 border-l-4 border-l-red-500 cursor-not-allowed';
        } else {
          baseStyle += ' text-orange-700 font-medium bg-orange-50 border-l-4 border-l-orange-400 cursor-not-allowed';
        }
      } else {
        baseStyle += ' text-gray-700 bg-gray-50 cursor-not-allowed';
      }
      
      return baseStyle;
    }
    
    // Get row stock status for coloring
    const stockStatus = getRowStockStatus(row);
    const rowBgClass = stockStatus.isOverSold 
      ? 'bg-red-50' 
      : stockStatus.hasPositiveClosing 
        ? 'bg-green-50' 
        : 'bg-yellow-50';

    return `
      w-24 h-8 border border-gray-300 text-xs flex items-center px-2 text-black ${rowBgClass}
      ${isFuture ? 'cursor-not-allowed opacity-60' : 
        canEdit ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-60'}
      ${isActive && !isFuture && canEdit ? 'bg-blue-100 border-blue-500' : ''}
      ${isSelected && !isFuture && canEdit ? 'bg-blue-50' : ''}
      ${isActive && isEditing && !isFuture && canEdit ? 'bg-white' : ''}
    `;
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-300 bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button className="p-1 hover:bg-gray-200 rounded">
              <Undo className="h-4 w-4" />
            </button>
            <button className="p-1 hover:bg-gray-200 rounded">
              <Redo className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-1 hover:bg-gray-200 rounded">
              <Scissors className="h-4 w-4" />
            </button>
            <button className="p-1 hover:bg-gray-200 rounded">
              <Copy className="h-4 w-4" />
            </button>
            <button className="p-1 hover:bg-gray-200 rounded">
              <Clipboard className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-1 hover:bg-gray-200 rounded">
              <Filter className="h-4 w-4" />
            </button>
            <button className="p-1 hover:bg-gray-200 rounded">
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
            <Save className="h-4 w-4" />
            <span className="text-sm">Save</span>
          </button>
          <button className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
            <Download className="h-4 w-4" />
            <span className="text-sm">Export</span>
          </button>
          <button className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">
            <Upload className="h-4 w-4" />
            <span className="text-sm">Import</span>
          </button>
        </div>
      </div>

      {/* Month Header */}
      <div className="px-4 py-2 bg-blue-50 border-b border-gray-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Sales Data
            </h2>
            <p className="text-sm text-gray-600">
              Auto-updates when month changes • Last updated: {currentDate.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="text-right">
              <div>Total Days: {monthDates.length}</div>
              <div>Current Date: {currentDate.getDate()}</div>
              <div className="text-xs text-gray-500">
                Future days disabled: {monthDates.filter(col => isFutureDate(col)).length}
              </div>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Live updates enabled"></div>
          </div>
        </div>
      </div>

      {/* Formula Bar */}
      <div className="flex items-center px-4 py-2 border-b border-gray-300 bg-gray-50">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">{activeCell}</span>
          <button className="p-1 hover:bg-gray-200 rounded">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 mx-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">fx</span>
            <input
              ref={inputRef}
              type="text"
              value={showFormulaBar ? formulaValue : getCellValue(activeCell)}
              onChange={(e) => handleFormulaChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type @Dropdown to insert a dropdown menu"
            />
          </div>
        </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleRefresh}
              className="p-1 hover:bg-gray-200 rounded"
              title="Refresh to current month"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button className="p-1 hover:bg-gray-200 rounded">
              <Search className="h-4 w-4" />
            </button>
            <button className="p-1 hover:bg-gray-200 rounded">
              <Settings className="h-4 w-4" />
            </button>
          </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="flex-1 overflow-auto">
        <div className="inline-block">
          {/* Column Headers */}
          <div className="flex">
            <div className="w-12 h-8 bg-gray-100 border border-gray-300 flex items-center justify-center text-xs font-medium text-gray-600"></div>
            {columns.map((col) => {
              if (col.type === 'fixed') {
                if (col.id === 'closing_stock') {
                  // Special styling for closing stock (last column)
                  return (
                    <div 
                      key={col.id} 
                      className="w-32 h-8 bg-orange-50 border border-gray-300 flex items-center justify-center text-xs font-medium text-orange-700 font-semibold border-l-4 border-l-orange-400"
                    >
                      {col.label}
                    </div>
                  );
                } else {
                  // Product and Opening Stock columns
                  return (
                    <div 
                      key={col.id} 
                      className="w-32 h-8 bg-blue-50 border border-gray-300 flex items-center justify-center text-xs font-medium text-blue-700 font-semibold"
                    >
                      {col.label}
                    </div>
                  );
                }
              }
              
              const isFuture = isFutureDate(col);
              return (
                <div 
                  key={col.id} 
                  className={`w-24 h-8 border border-gray-300 flex flex-col items-center justify-center text-xs font-medium ${
                    isFuture ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <div className={`text-xs font-bold ${isFuture ? 'text-gray-400' : ''}`}>
                    {col.label}
                  </div>
                  <div className={`text-xs ${isFuture ? 'text-gray-400' : 'text-gray-500'}`}>
                    {col.dayName}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rows */}
          {rows.map((row) => {
            const stockStatus = getRowStockStatus(row);
            const rowColorClass = stockStatus.isOverSold 
              ? 'bg-red-50' 
              : stockStatus.hasPositiveClosing 
                ? 'bg-green-50' 
                : 'bg-yellow-50';
            
            return (
            <div key={row} className={`flex ${rowColorClass}`}>
              {/* Row Header */}
              <div className={`w-12 h-8 border border-gray-300 flex items-center justify-center text-xs font-medium ${
                stockStatus.isOverSold 
                  ? 'text-red-700 bg-red-100' 
                  : stockStatus.hasPositiveClosing 
                    ? 'text-green-700 bg-green-100' 
                    : 'text-yellow-700 bg-yellow-100'
              }`}>
                {row}
              </div>
              
              {/* Cells */}
              {columns.map((col) => {
                const cellId = getCellId(col, row);
                const isActive = activeCell === cellId;
                const isFuture = col.type !== 'fixed' ? isFutureDate(col) : false;
                const isFixedColumn = col.type === 'fixed';
                
                if (isFixedColumn) {
                  // Special handling for fixed columns
                  let cellContent = '';
                  let cellClass = 'w-32 h-8 border border-gray-300 flex items-center px-2';
                  
                  if (col.id === 'product') {
                    // Show product names for first few rows as examples
                    const products = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];
                    cellContent = products[row - 1] || '';
                    const stockStatus = getRowStockStatus(row);
                    cellClass += ` text-blue-700 font-medium text-xs ${
                      stockStatus.isOverSold 
                        ? 'bg-red-100' 
                        : stockStatus.hasPositiveClosing 
                          ? 'bg-green-100' 
                          : 'bg-yellow-100'
                    }`;
                  } else if (col.id === 'opening_stock') {
                    // Show opening stock values
                    const openingStocks = [100, 150, 200, 75, 120];
                    cellContent = openingStocks[row - 1] ? openingStocks[row - 1].toString() : '';
                    const stockStatus = getRowStockStatus(row);
                    cellClass += ` text-green-700 font-medium text-xs ${
                      stockStatus.isOverSold 
                        ? 'bg-red-100' 
                        : stockStatus.hasPositiveClosing 
                          ? 'bg-green-100' 
                          : 'bg-yellow-100'
                    }`;
                  } else if (col.id === 'closing_stock') {
                    // Calculate closing stock based on daily sales
                    let closingStock = '';
                    const openingStocks = [100, 150, 200, 75, 120];
                    const openingStock = openingStocks[row - 1] || 0;
                    
                    // Sum up all daily sales for this product
                    let totalSold = 0;
                    for (let day = 1; day <= currentDate.getDate(); day++) {
                      const dayCellId = `day_${day}_${row}`;
                      const dayValue = parseFloat(data[dayCellId]?.value || '0');
                      totalSold += dayValue;
                    }
                    
                    closingStock = (openingStock - totalSold).toString();
                    const closingValue = parseFloat(closingStock);
                    
                    // Green styling when closing stock is positive
                    if (closingValue > 0) {
                      cellClass += ' text-green-700 font-bold text-xs bg-green-100 border-l-4 border-l-green-500';
                    } else if (closingValue < 0) {
                      cellClass += ' text-red-700 font-bold text-xs bg-red-100 border-l-4 border-l-red-500';
                    } else {
                      cellClass += ' text-orange-700 font-medium text-xs bg-orange-50 border-l-4 border-l-orange-400';
                    }
                  }
                  
                  return (
                    <div
                      key={cellId}
                      className={cellClass}
                      onClick={() => isFixedColumn && handleCellClick(cellId, col, row)}
                      title={`${col.label} - Row ${row}`}
                    >
                      {cellContent}
                    </div>
                  );
                }
                
                return (
                  <div
                    key={cellId}
                    className={getCellStyle(cellId, col, row)}
                    onClick={() => handleCellClick(cellId, col, row)}
                    onDoubleClick={() => handleCellDoubleClick(cellId, col, row)}
                    onKeyDown={!isFuture ? handleKeyDown : undefined}
                    tabIndex={isFuture ? -1 : 0}
                    title={isFuture ? `${col.fullDate} - Future Date` : `${col.fullDate} - Row ${row}`}
                  >
                    {isActive && isEditing && !isFuture ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSaveCell}
                        onKeyDown={handleKeyDown}
                        className="w-full h-full border-none outline-none text-xs text-black"
                        autoFocus
                      />
                    ) : (
                      <span className="text-xs truncate text-black">
                        {getCellValue(cellId)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-300 bg-gray-50">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800">
            <Plus className="h-4 w-4" />
            <span>Add Sheet</span>
          </button>
          <div className="flex items-center space-x-1">
            <button className="p-1 hover:bg-gray-200 rounded">
              <MoreHorizontal className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600">{activeSheet}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Ready</span>
          <div className="flex items-center space-x-2">
            <button className="p-1 hover:bg-gray-200 rounded">
              <Eye className="h-4 w-4" />
            </button>
            <button className="p-1 hover:bg-gray-200 rounded">
              <Share className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}