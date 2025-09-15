'use client';

import React, { useState } from 'react';
import { 
  Factory, 
  Search, 
  Filter, 
  Eye, 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  Users, 
  Package,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { mockOrders, mockProductionPlans } from '@/lib/mockData';
import { Order, ProductionPlan } from '@/types';
import { formatDate, getStatusColor, getPriorityColor } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProductionOrders() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [productionPlans, setProductionPlans] = useState<ProductionPlan[]>(mockProductionPlans);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Filter orders that are relevant for production (confirmed, in_production, ready)
  const productionOrders = orders.filter(order => 
    ['confirmed', 'in_production', 'ready'].includes(order.status)
  );

  const filteredOrders = productionOrders.filter(order => {
    const matchesSearch = 
      order.distributorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleStartProduction = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'in_production', updatedAt: new Date() }
        : order
    ));
    toast.success('Production started for order #' + orderId);
  };

  const handleCompleteProduction = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'ready', updatedAt: new Date() }
        : order
    ));
    toast.success('Production completed for order #' + orderId);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const productionStats = {
    total: productionOrders.length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    inProduction: orders.filter(o => o.status === 'in_production').length,
    ready: orders.filter(o => o.status === 'ready').length,
    totalPlans: productionPlans.length,
    activePlans: productionPlans.filter(p => p.status === 'in_progress').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Orders</h1>
          <p className="text-gray-600 mt-1">Manage production schedules and track manufacturing progress</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Factory className="h-6 w-6 text-indigo-600" />
          <span className="text-sm text-gray-500">Active Orders: {productionStats.inProduction}</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-blue-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{productionStats.total}</p>
              <p className="text-xs text-gray-600">Total Orders</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-yellow-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{productionStats.confirmed}</p>
              <p className="text-xs text-gray-600">Confirmed</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Factory className="h-6 w-6 text-purple-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{productionStats.inProduction}</p>
              <p className="text-xs text-gray-600">In Production</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{productionStats.ready}</p>
              <p className="text-xs text-gray-600">Ready</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-indigo-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{productionStats.totalPlans}</p>
              <p className="text-xs text-gray-600">Total Plans</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{productionStats.activePlans}</p>
              <p className="text-xs text-gray-600">Active Plans</p>
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
                placeholder="Search orders, distributors, or products..."
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
                <option value="confirmed">Confirmed</option>
                <option value="in_production">In Production</option>
                <option value="ready">Ready</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Production Orders List */}
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
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Date
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
                      <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(order.orderDate)}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.distributorName}</div>
                      <div className="text-sm text-gray-500">{order.distributorEmail}</div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div>
                      {order.items.map((item, index) => (
                        <div key={item.id} className="text-sm">
                          <span className="font-medium text-gray-900">{item.productName}</span>
                          <span className="text-gray-500 ml-2">({item.quantity} units)</span>
                          {index < order.items.length - 1 && <br />}
                        </div>
                      ))}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                      {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ').split(' ').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                      
                      {/* Production Action Buttons */}
                      <div className="flex space-x-1">
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => handleStartProduction(order.id)}
                            className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded hover:bg-purple-200 flex items-center"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </button>
                        )}
                        
                        {order.status === 'in_production' && (
                          <button
                            onClick={() => handleCompleteProduction(order.id)}
                            className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 flex items-center"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </button>
                        )}
                        
                        {order.status === 'ready' && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Ready for Shipping
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDate(order.expectedDeliveryDate)}
                    </div>
                    {new Date(order.expectedDeliveryDate) < new Date() && (
                      <div className="text-xs text-red-600 mt-1">Overdue</div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Factory className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No production orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No orders are currently in the production pipeline.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Active Production Plans */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Active Production Plans</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productionPlans.filter(plan => plan.status === 'in_progress' || plan.status === 'scheduled').map((plan) => (
              <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-gray-900">{plan.productName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                    {plan.status.replace('_', ' ').split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span className="font-medium">#{plan.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span className="font-medium">{plan.quantityToProduce} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Start Date:</span>
                    <span className="font-medium">{formatDate(plan.scheduledStartDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>End Date:</span>
                    <span className="font-medium">{formatDate(plan.scheduledEndDate)}</span>
                  </div>
                  {plan.assignedWorkers && plan.assignedWorkers.length > 0 && (
                    <div className="flex justify-between">
                      <span>Workers:</span>
                      <span className="font-medium">{plan.assignedWorkers.length} assigned</span>
                    </div>
                  )}
                </div>
                
                {plan.notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    {plan.notes}
                  </div>
                )}
              </div>
            ))}
            
            {productionPlans.filter(plan => plan.status === 'in_progress' || plan.status === 'scheduled').length === 0 && (
              <div className="col-span-full text-center py-8">
                <Factory className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No active production plans</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Production Order Details</h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
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
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-medium">#{selectedOrder.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Date:</span>
                        <span className="font-medium">{formatDate(selectedOrder.orderDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expected Delivery:</span>
                        <span className="font-medium">{formatDate(selectedOrder.expectedDeliveryDate)}</span>
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
                  
                  {/* Customer Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Company:</span>
                        <span className="font-medium">{selectedOrder.distributorName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedOrder.distributorEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{selectedOrder.distributorPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Production Items */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Items to Produce</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{item.productName}</h4>
                            {item.specifications && (
                              <p className="text-sm text-gray-600 mt-1">{item.specifications}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">{item.quantity}</div>
                            <div className="text-sm text-gray-600">units</div>
                          </div>
                        </div>
                        
                        {/* Production Status for this item could go here */}
                        <div className="mt-3 p-2 bg-blue-50 rounded">
                          <div className="text-xs text-blue-800">
                            Production Status: Ready to Start
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {selectedOrder.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Production Notes</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedOrder.status === 'confirmed' && (
                  <button 
                    onClick={() => {
                      handleStartProduction(selectedOrder.id);
                      setShowOrderDetails(false);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Start Production
                  </button>
                )}
                {selectedOrder.status === 'in_production' && (
                  <button 
                    onClick={() => {
                      handleCompleteProduction(selectedOrder.id);
                      setShowOrderDetails(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Mark as Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






















