'use client';

import React, { useState, useEffect } from 'react';
import { 
  Factory, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Package,
  BarChart3,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Download
} from 'lucide-react';
import { 
  ProductionRecord, 
  ProductionOrder, 
  ProductionRecordForm,
  QualityMetric,
  ProductionMaterialUsage,
  ProductionMachineUsage,
  RawMaterial
} from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { productionService } from '@/services/production.service';
import toast from 'react-hot-toast';

export default function ProductionRecords() {
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ProductionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<ProductionRecordForm>({
    productionOrderId: '',
    batchNumber: '',
    quantityProduced: 0,
    quantityRejected: 0,
    startTime: '',
    endTime: '',
    workCenter: '',
    shift: 'morning',
    operatorId: '',
    supervisorId: '',
    materialsUsed: [],
    qualityMetrics: [],
    notes: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [recordsData, ordersData, materialsData] = await Promise.all([
        productionService.getProductionRecords(),
        productionService.getProductionOrders(),
        productionService.getRawMaterials()
      ]);
      
      setRecords(recordsData);
      setOrders(ordersData);
      setRawMaterials(materialsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter records
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.operatorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'completed' && record.qualityCheck.passed) ||
      (selectedStatus === 'rejected' && !record.qualityCheck.passed) ||
      (selectedStatus === 'in_progress' && record.endTime > new Date());
    
    const matchesShift = selectedShift === 'all' || record.shift === selectedShift;
    
    return matchesSearch && matchesStatus && matchesShift;
  });

  // Calculate statistics
  const stats = {
    totalRecords: records.length,
    completedRecords: records.filter(r => r.qualityCheck.passed).length,
    rejectedRecords: records.filter(r => !r.qualityCheck.passed).length,
    totalUnitsProduced: records.reduce((sum, r) => sum + r.quantityProduced, 0),
    totalUnitsRejected: records.reduce((sum, r) => sum + r.quantityRejected, 0),
    averageEfficiency: records.length > 0 ? 
      records.reduce((sum, r) => sum + (r.quantityProduced / r.quantityPlanned * 100), 0) / records.length : 0,
    totalCost: records.reduce((sum, r) => 
      sum + r.materialsUsed.reduce((matSum, mat) => matSum + mat.totalCost, 0), 0
    )
  };

  const handleAddRecord = () => {
    setFormData({
      productionOrderId: '',
      batchNumber: '',
      quantityProduced: 0,
      quantityRejected: 0,
      startTime: '',
      endTime: '',
      workCenter: '',
      shift: 'morning',
      operatorId: '',
      supervisorId: '',
      materialsUsed: [],
      qualityMetrics: [],
      notes: ''
    });
    setShowAddModal(true);
  };

  const handleViewDetails = (record: ProductionRecord) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const handleSaveRecord = async () => {
    try {
      const newRecord = await productionService.createProductionRecord(formData);
      setRecords(prev => [...prev, newRecord]);
      toast.success('Production record added successfully');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving record:', error);
      toast.error('Failed to save production record');
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 95) return 'text-green-600 bg-green-100';
    if (efficiency >= 85) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getQualityStatus = (record: ProductionRecord) => {
    const passedMetrics = record.qualityMetrics.filter(m => m.passed).length;
    const totalMetrics = record.qualityMetrics.length;
    const qualityScore = totalMetrics > 0 ? (passedMetrics / totalMetrics) * 100 : 100;
    
    if (qualityScore >= 95) return { status: 'Excellent', color: 'text-green-600 bg-green-100' };
    if (qualityScore >= 85) return { status: 'Good', color: 'text-yellow-600 bg-yellow-100' };
    return { status: 'Poor', color: 'text-red-600 bg-red-100' };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading production records...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Production Records</h1>
          <p className="text-gray-600 mt-1">Track and manage production activities and quality metrics</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={handleAddRecord}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Factory className="h-6 w-6 text-blue-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{stats.totalRecords}</p>
              <p className="text-xs text-gray-600">Total Records</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{stats.completedRecords}</p>
              <p className="text-xs text-gray-600">Completed</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <XCircle className="h-6 w-6 text-red-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{stats.rejectedRecords}</p>
              <p className="text-xs text-gray-600">Rejected</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-purple-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{stats.totalUnitsProduced}</p>
              <p className="text-xs text-gray-600">Units Produced</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-indigo-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{stats.averageEfficiency.toFixed(1)}%</p>
              <p className="text-xs text-gray-600">Avg Efficiency</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 text-orange-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalCost)}</p>
              <p className="text-xs text-gray-600">Total Cost</p>
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
                placeholder="Search by order number, product, batch, or operator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
              />
            </div>
          </div>
          
          <div className="lg:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="in_progress">In Progress</option>
              </select>
            </div>
          </div>
          
          <div className="lg:w-48">
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
            >
              <option value="all">All Shifts</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="night">Night</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Production Records ({filteredRecords.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Production Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality Metrics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Efficiency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => {
                const efficiency = (record.quantityProduced / record.quantityPlanned) * 100;
                const qualityStatus = getQualityStatus(record);
                
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.orderNumber}</div>
                        <div className="text-sm text-gray-500">{record.productName}</div>
                        <div className="text-xs text-gray-400">Batch: {record.batchNumber}</div>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(record.startTime)}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {record.quantityProduced} / {record.quantityPlanned} units
                        </div>
                        <div className="text-sm text-gray-500">
                          Rejected: {record.quantityRejected}
                        </div>
                        <div className="text-xs text-gray-400">
                          Duration: {record.duration}h
                        </div>
                        <div className="text-xs text-gray-400">
                          {record.workCenter}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${qualityStatus.color}`}>
                          {qualityStatus.status}
                        </span>
                        <div className="text-xs text-gray-500">
                          {record.qualityMetrics.filter(m => m.passed).length} / {record.qualityMetrics.length} metrics passed
                        </div>
                        <div className="text-xs text-gray-500">
                          {record.qualityCheck.passed ? (
                            <span className="text-green-600">✓ Quality Passed</span>
                          ) : (
                            <span className="text-red-600">✗ Quality Failed</span>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {efficiency.toFixed(1)}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${efficiency >= 95 ? 'bg-green-500' : efficiency >= 85 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(efficiency, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{record.operatorName}</div>
                        <div className="text-xs text-gray-500">Operator</div>
                        <div className="text-sm text-gray-900 mt-1">{record.supervisorName}</div>
                        <div className="text-xs text-gray-500">Supervisor</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {record.shift.charAt(0).toUpperCase() + record.shift.slice(1)} Shift
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(record)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit Record"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <Factory className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No production records found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No records match your current filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add Production Record</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleSaveRecord(); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Production Order *
                    </label>
                    <select
                      value={formData.productionOrderId}
                      onChange={(e) => setFormData(prev => ({ ...prev, productionOrderId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select Order</option>
                      {orders.map(order => (
                        <option key={order.id} value={order.id}>
                          {order.orderNumber} - {order.productName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Batch Number *
                    </label>
                    <input
                      type="text"
                      value={formData.batchNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity Produced *
                    </label>
                    <input
                      type="number"
                      value={formData.quantityProduced}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantityProduced: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity Rejected
                    </label>
                    <input
                      type="number"
                      value={formData.quantityRejected}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantityRejected: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Work Center *
                    </label>
                    <input
                      type="text"
                      value={formData.workCenter}
                      onChange={(e) => setFormData(prev => ({ ...prev, workCenter: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shift *
                    </label>
                    <select
                      value={formData.shift}
                      onChange={(e) => setFormData(prev => ({ ...prev, shift: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="night">Night</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Operator ID *
                    </label>
                    <input
                      type="text"
                      value={formData.operatorId}
                      onChange={(e) => setFormData(prev => ({ ...prev, operatorId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supervisor ID *
                    </label>
                    <input
                      type="text"
                      value={formData.supervisorId}
                      onChange={(e) => setFormData(prev => ({ ...prev, supervisorId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
                
                {/* Raw Materials Used Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Raw Materials Used
                  </label>
                  <div className="space-y-3">
                    {formData.materialsUsed.map((material, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex-1">
                          <select
                            value={material.materialId}
                            onChange={(e) => {
                              const newMaterials = [...formData.materialsUsed];
                              newMaterials[index].materialId = e.target.value;
                              setFormData(prev => ({ ...prev, materialsUsed: newMaterials }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Select Material</option>
                            {rawMaterials.map(rm => (
                              <option key={rm.id} value={rm.id}>
                                {rm.materialName} ({rm.materialCode}) - Stock: {rm.currentStock} {rm.unit}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            placeholder="Quantity"
                            value={material.quantityUsed || ''}
                            onChange={(e) => {
                              const newMaterials = [...formData.materialsUsed];
                              newMaterials[index].quantityUsed = Number(e.target.value) || 0;
                              setFormData(prev => ({ ...prev, materialsUsed: newMaterials }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            placeholder="Wastage"
                            value={material.wastage || ''}
                            onChange={(e) => {
                              const newMaterials = [...formData.materialsUsed];
                              newMaterials[index].wastage = Number(e.target.value) || 0;
                              setFormData(prev => ({ ...prev, materialsUsed: newMaterials }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newMaterials = formData.materialsUsed.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, materialsUsed: newMaterials }));
                          }}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          materialsUsed: [...prev.materialsUsed, { materialId: '', quantityUsed: 0, wastage: 0 }]
                        }));
                      }}
                      className="flex items-center space-x-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Material</span>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Production Record Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Production Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Number:</span>
                        <span className="font-medium">{selectedRecord.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Product:</span>
                        <span className="font-medium">{selectedRecord.productName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Batch Number:</span>
                        <span className="font-medium">{selectedRecord.batchNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity Produced:</span>
                        <span className="font-medium">{selectedRecord.quantityProduced} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity Rejected:</span>
                        <span className="font-medium text-red-600">{selectedRecord.quantityRejected} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Work Center:</span>
                        <span className="font-medium">{selectedRecord.workCenter}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shift:</span>
                        <span className="font-medium capitalize">{selectedRecord.shift}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{selectedRecord.duration} hours</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Team Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Team Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Operator:</span>
                        <span className="font-medium">{selectedRecord.operatorName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Supervisor:</span>
                        <span className="font-medium">{selectedRecord.supervisorName}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Quality Metrics */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Quality Metrics</h3>
                    <div className="space-y-3">
                      {selectedRecord.qualityMetrics.map((metric) => (
                        <div key={metric.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{metric.metricName}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              metric.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {metric.passed ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Target: {metric.targetValue} {metric.unit}</span>
                            <span>Actual: {metric.actualValue} {metric.unit}</span>
                          </div>
                          {metric.notes && (
                            <div className="text-xs text-gray-500 mt-1">{metric.notes}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Materials Used */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Materials Used</h3>
                    <div className="space-y-2">
                      {selectedRecord.materialsUsed.map((material) => (
                        <div key={material.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{material.materialName}</span>
                            <span className="text-sm text-gray-600">{material.quantityUsed} {material.unit}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Cost: {formatCurrency(material.totalCost)} | 
                            Wastage: {material.wastage} ({material.wastagePercentage.toFixed(1)}%)
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedRecord.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
