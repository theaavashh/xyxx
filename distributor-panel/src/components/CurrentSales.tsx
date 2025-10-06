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

  // Load existing data from API
  const loadExistingData = async () => {
    if (!user?.id) return;

    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/sales/distributors/${user.id}/sales/${year}/${month}`);
      const result = await response.json();
      
      if (result.success && result.data.salesData) {
        const loadedData: SheetData = {};
        result.data.salesData.forEach((item: any) => {
          loadedData[item.cellId] = {
            value: item.value,
            type: item.type,
            formula: item.formula
          };
        });
        setData(loadedData);
      } else {
        // If no data exists, initialize with sample data
        initializeSampleData();
      }
    } catch (error) {
      console.error('Error loading existing data:', error);
      // Initialize with sample data if API fails
      initializeSampleData();
    }
  };

  const initializeSampleData = () => {
    const sampleData: SheetData = {};
    
    // Add some sample sales data for the first few days
    const sampleSales = [
      { day: 1, sales: 'S001', customer: 'ABC Corp', product: 'Product A', qty: '10', price: '150', status: 'Completed', payment: 'Bank' },
      { day: 2, sales: 'S002', customer: 'XYZ Ltd', product: 'Product B', qty: '5', price: '200', status: 'Pending', payment: 'Cash' },
      { day: 3, sales: 'S003', customer: 'DEF Inc', product: 'Product C', qty: '8', price: '175', status: 'Completed', payment: 'Card' },
      { day: 5, sales: 'S004', customer: 'GHI Co', product: 'Product A', qty: '15', price: '150', status: 'Completed', payment: 'Bank' },
      { day: 7, sales: 'S005', customer: 'JKL Corp', product: 'Product D', qty: '3', price: '300', status: 'Pending', payment: 'Card' }
    ];
    
    sampleSales.forEach(sale => {
      const cellId = `day_${sale.day}_1`;
      sampleData[cellId] = { value: sale.sales, type: 'text' };
    });
    
    setData(sampleData);
  };

  // Initialize with existing data or sample data
  useEffect(() => {
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
  const columns = monthDates;
  const rows = Array.from({ length: 50 }, (_, i) => i + 1);

  const getCellId = (col: any, row: number) => `${col.id}_${row}`;

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
    const isFuture = isFutureDate(col);
    const canEdit = canEditCell(col, row);
    
    return `
      w-24 h-8 border border-gray-300 text-xs flex items-center px-2 text-black
      ${isFuture ? 'cursor-not-allowed bg-gray-100' : 
        canEdit ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed bg-yellow-50'}
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
          {rows.map((row) => (
            <div key={row} className="flex">
              {/* Row Header */}
              <div className="w-12 h-8 bg-gray-100 border border-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
                {row}
              </div>
              
              {/* Cells */}
              {columns.map((col) => {
                const cellId = getCellId(col, row);
                const isActive = activeCell === cellId;
                const isFuture = isFutureDate(col);
                
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
          ))}
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