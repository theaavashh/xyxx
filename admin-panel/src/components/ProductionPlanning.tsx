'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Play, 
  Pause, 
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Filter,
  Search,
  Download,
  Upload
} from 'lucide-react';
import { 
  ProductionOrder, 
  ProductionSchedule, 
  WorkCenter, 
  Machine, 
  ScheduledOrder,
  ProductionOrderForm
} from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { productionService } from '@/services/production.service';
import toast from 'react-hot-toast';

export default function ProductionPlanning() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [schedules, setSchedules] = useState<ProductionSchedule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedWorkCenter, setSelectedWorkCenter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'gantt'>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<ProductionOrderForm>({
    productId: '',
    quantity: 0,
    priority: 'medium',
    plannedStartDate: '',
    plannedEndDate: '',
    workCenter: '',
    assignedWorkers: [],
    assignedMachines: [],
    notes: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [ordersData, workCentersData, schedulesData] = await Promise.all([
        productionService.getProductionOrders(),
        productionService.getWorkCenters(),
        productionService.getProductionSchedules()
      ]);
      
      setOrders(ordersData);
      setWorkCenters(workCentersData);
      setSchedules(schedulesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || order.priority === selectedPriority;
    const matchesWorkCenter = selectedWorkCenter === 'all' || order.workCenter === selectedWorkCenter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesWorkCenter;
  });

  // Calculate statistics
  const stats = {
    totalOrders: orders.length,
    plannedOrders: orders.filter(o => o.status === 'planned').length,
    scheduledOrders: orders.filter(o => o.status === 'scheduled').length,
    inProgressOrders: orders.filter(o => o.status === 'in_progress').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalWorkCenters: workCenters.length,
    activeWorkCenters: workCenters.filter(wc => wc.isActive).length,
    totalMachines: workCenters.reduce((sum, wc) => sum + wc.machines.length, 0),
    operationalMachines: workCenters.reduce((sum, wc) => 
      sum + wc.machines.filter(m => m.status === 'operational').length, 0
    )
  };

  const handleAddOrder = () => {
    setFormData({
      productId: '',
      quantity: 0,
      priority: 'medium',
      plannedStartDate: '',
      plannedEndDate: '',
      workCenter: '',
      assignedWorkers: [],
      assignedMachines: [],
      notes: ''
    });
    setShowAddModal(true);
  };

  const handleEditOrder = (order: ProductionOrder) => {
    setFormData({
      productId: order.productId,
      quantity: order.quantity,
      priority: order.priority,
      plannedStartDate: order.plannedStartDate.toISOString().split('T')[0],
      plannedEndDate: order.plannedEndDate.toISOString().split('T')[0],
      workCenter: order.workCenter,
      assignedWorkers: order.assignedWorkers,
      assignedMachines: order.assignedMachines,
      notes: order.notes || ''
    });
    setSelectedOrder(order);
    setShowAddModal(true);
  };

  const handleViewDetails = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleScheduleOrder = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setShowScheduleModal(true);
  };

  const handleSaveOrder = async () => {
    try {
      if (selectedOrder) {
        // Update existing order
        const updatedOrder = await productionService.updateProductionOrder(selectedOrder.id, formData);
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updatedOrder : o));
        toast.success('Production order updated successfully');
      } else {
        // Add new order
        const newOrder = await productionService.createProductionOrder(formData);
        setOrders(prev => [...prev, newOrder]);
        toast.success('Production order added successfully');
      }
      setShowAddModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Failed to save production order');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this production order?')) {
      try {
        await productionService.deleteProductionOrder(orderId);
        setOrders(prev => prev.filter(o => o.id !== orderId));
        toast.success('Production order deleted successfully');
      } catch (error) {
        console.error('Error deleting order:', error);
        toast.error('Failed to delete production order');
      }
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: ProductionOrder['status']) => {
    try {
      const updatedOrder = await productionService.updateProductionOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      toast.success(`Order status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status: ProductionOrder['status']) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on_hold': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: ProductionOrder['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading production planning data...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Production Planning</h1>
          <p className="text-gray-600 mt-1">Plan and schedule production activities with advanced features</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                viewMode === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                viewMode === 'gantt' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Gantt
            </button>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={handleAddOrder}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Order
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-blue-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{stats.totalOrders}</p>
              <p className="text-xs text-gray-600">Total Orders</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Settings className="h-6 w-6 text-yellow-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{stats.plannedOrders}</p>
              <p className="text-xs text-gray-600">Planned</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-orange-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{stats.scheduledOrders}</p>
              <p className="text-xs text-gray-600">Scheduled</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Play className="h-6 w-6 text-purple-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{stats.inProgressOrders}</p>
              <p className="text-xs text-gray-600">In Progress</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{stats.completedOrders}</p>
              <p className="text-xs text-gray-600">Completed</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-indigo-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{stats.totalWorkCenters}</p>
              <p className="text-xs text-gray-600">Work Centers</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 text-teal-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{stats.totalMachines}</p>
              <p className="text-xs text-gray-600">Total Machines</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{stats.operationalMachines}</p>
              <p className="text-xs text-gray-600">Operational</p>
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
                placeholder="Search orders by number or product name..."
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
                <option value="planned">Planned</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div className="lg:w-48">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div className="lg:w-48">
            <select
              value={selectedWorkCenter}
              onChange={(e) => setSelectedWorkCenter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
            >
              <option value="all">All Work Centers</option>
              {workCenters.map(wc => (
                <option key={wc.id} value={wc.name}>{wc.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Production Orders ({filteredOrders.length})
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
                    Product & Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work Center
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-xs text-gray-500">Created: {formatDate(order.createdAt)}</div>
                        {order.notes && (
                          <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">{order.notes}</div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.productName}</div>
                        <div className="text-sm text-gray-500">{order.quantity} units</div>
                        <div className="text-xs text-gray-400">Est. Duration: {order.estimatedDuration}h</div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          Start: {formatDate(order.plannedStartDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          End: {formatDate(order.plannedEndDate)}
                        </div>
                        {order.actualStartDate && (
                          <div className="text-xs text-blue-600">
                            Actual Start: {formatDate(order.actualStartDate)}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                        {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ').split(' ').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </span>
                        
                        {/* Status Action Buttons */}
                        <div className="flex space-x-1">
                          {order.status === 'planned' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'scheduled')}
                              className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200 flex items-center"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Schedule
                            </button>
                          )}
                          
                          {order.status === 'scheduled' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'in_progress')}
                              className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded hover:bg-purple-200 flex items-center"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Start
                            </button>
                          )}
                          
                          {order.status === 'in_progress' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'completed')}
                              className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 flex items-center"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{order.workCenter}</div>
                        <div className="text-xs text-gray-500">
                          Workers: {order.assignedWorkers.length}
                        </div>
                        <div className="text-xs text-gray-500">
                          Machines: {order.assignedMachines.length}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit Order"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {order.status === 'planned' && (
                          <button
                            onClick={() => handleScheduleOrder(order)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Schedule Order"
                          >
                            <Calendar className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Order"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No production orders found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No orders match your current filters.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Calendar View</h3>
            <p className="mt-1 text-sm text-gray-500">
              Calendar view will be implemented with a proper calendar component.
            </p>
          </div>
        </div>
      )}

      {viewMode === 'gantt' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Gantt Chart View</h3>
            <p className="mt-1 text-sm text-gray-500">
              Gantt chart view will be implemented with a proper Gantt chart component.
            </p>
          </div>
        </div>
      )}

      {/* Add/Edit Order Modal */}
      {(showAddModal || showScheduleModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedOrder ? 'Edit Production Order' : 'Add New Production Order'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowScheduleModal(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleSaveOrder(); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product *
                    </label>
                    <select
                      value={formData.productId}
                      onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select Product</option>
                      <option value="PROD-001">Steel Beam 6m</option>
                      <option value="PROD-002">Concrete Block 20cm</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority *
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Work Center *
                    </label>
                    <select
                      value={formData.workCenter}
                      onChange={(e) => setFormData(prev => ({ ...prev, workCenter: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select Work Center</option>
                      {workCenters.map(wc => (
                        <option key={wc.id} value={wc.name}>{wc.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Planned Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.plannedStartDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, plannedStartDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Planned End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.plannedEndDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, plannedEndDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
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
                    onClick={() => {
                      setShowAddModal(false);
                      setShowScheduleModal(false);
                      setSelectedOrder(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {selectedOrder ? 'Update Order' : 'Add Order'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Production Order Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Number:</span>
                        <span className="font-medium">{selectedOrder.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Product:</span>
                        <span className="font-medium">{selectedOrder.productName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{selectedOrder.quantity} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Priority:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedOrder.priority)}`}>
                          {selectedOrder.priority.charAt(0).toUpperCase() + selectedOrder.priority.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status.replace('_', ' ').split(' ').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Schedule Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Schedule Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Planned Start:</span>
                        <span className="font-medium">{formatDate(selectedOrder.plannedStartDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Planned End:</span>
                        <span className="font-medium">{formatDate(selectedOrder.plannedEndDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estimated Duration:</span>
                        <span className="font-medium">{selectedOrder.estimatedDuration} hours</span>
                      </div>
                      {selectedOrder.actualStartDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Actual Start:</span>
                          <span className="font-medium text-blue-600">{formatDate(selectedOrder.actualStartDate)}</span>
                        </div>
                      )}
                      {selectedOrder.actualEndDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Actual End:</span>
                          <span className="font-medium text-green-600">{formatDate(selectedOrder.actualEndDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Resource Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Resource Allocation</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Work Center:</span>
                        <span className="font-medium">{selectedOrder.workCenter}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Assigned Workers:</span>
                        <span className="font-medium">{selectedOrder.assignedWorkers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Assigned Machines:</span>
                        <span className="font-medium">{selectedOrder.assignedMachines.length}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">{formatDate(selectedOrder.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">{formatDate(selectedOrder.updatedAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created By:</span>
                        <span className="font-medium">{selectedOrder.createdBy}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedOrder.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
