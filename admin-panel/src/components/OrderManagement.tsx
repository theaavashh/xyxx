'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Package, 
  Phone, 
  Mail, 
  Calendar,
  DollarSign,
  User,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  RefreshCw
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor, getPriorityColor } from '@/lib/utils';
import toast from 'react-hot-toast';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
  productName: string;
  categoryName: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  totalQuantity: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  distributor: {
    id: string;
    fullName: string;
    email: string;
    contactNumber?: string;
  };
  items: OrderItem[];
}

interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data: OrdersResponse = await response.json();
        if (data.success) {
          setOrders(data.data.orders);
        } else {
          toast.error('Failed to fetch orders');
        }
      } else {
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.distributor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.distributor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setOrders(prev => prev.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
              : order
          ));
          toast.success('Order status updated successfully');
        } else {
          toast.error(result.message || 'Failed to update order status');
        }
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
    processing: orders.filter(o => o.status === 'PROCESSING').length,
    shipped: orders.filter(o => o.status === 'SHIPPED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    totalValue: orders.reduce((sum, order) => sum + order.totalAmount, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">Track and manage distributor orders</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <button
            onClick={fetchOrders}
            disabled={refreshing}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6 text-indigo-600" />
            <span className="text-sm text-gray-500">Total Orders: {orders.length}</span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-blue-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{orderStats.total}</p>
              <p className="text-xs text-gray-600">Total Orders</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-yellow-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{orderStats.pending}</p>
              <p className="text-xs text-gray-600">Pending</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-blue-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{orderStats.confirmed}</p>
              <p className="text-xs text-gray-600">Confirmed</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-purple-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{orderStats.processing}</p>
              <p className="text-xs text-gray-600">Processing</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Truck className="h-6 w-6 text-indigo-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{orderStats.shipped}</p>
              <p className="text-xs text-gray-600">Shipped</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{orderStats.delivered}</p>
              <p className="text-xs text-gray-600">Delivered</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 text-green-600" />
            <div className="ml-3">
              <p className="text-lg font-bold text-gray-900">{formatCurrency(orderStats.totalValue).replace('NPR ', '')}</p>
              <p className="text-xs text-gray-600">Total Value</p>
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
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
          
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Orders ({filteredOrders.length})
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
                  Distributor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items & Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date
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
                      <div className="text-sm font-medium text-gray-900">#{order.orderNumber}</div>
                      <div className="text-xs text-gray-500">ID: {order.id.slice(0, 8)}...</div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.distributor.fullName}</div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Mail className="h-4 w-4 mr-1" />
                        {order.distributor.email}
                      </div>
                      {order.distributor.contactNumber && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-4 w-4 mr-1" />
                          {order.distributor.contactNumber}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.totalQuantity} item{order.totalQuantity !== 1 ? 's' : ''}
                      </div>
                      <div className="text-sm text-gray-500">
                        ₹{order.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {order.items.map(item => item.productName).join(', ')}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ').split(' ').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                      
                      {/* Quick Status Update Buttons */}
                      <div className="flex space-x-1">
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'CONFIRMED')}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                          >
                            Confirm
                          </button>
                        )}
                        {order.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'PROCESSING')}
                            className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded hover:bg-purple-200"
                          >
                            Process
                          </button>
                        )}
                        {order.status === 'PROCESSING' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'SHIPPED')}
                            className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded hover:bg-indigo-200"
                          >
                            Ship
                          </button>
                        )}
                        {order.status === 'SHIPPED' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                            className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                          >
                            Deliver
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDate(order.createdAt)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or check back later for new orders.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Eye className="h-6 w-6" />
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
                        <span className="font-medium">#{selectedOrder.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-medium">{selectedOrder.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Date:</span>
                        <span className="font-medium">{formatDate(selectedOrder.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Items:</span>
                        <span className="font-medium">{selectedOrder.totalQuantity}</span>
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
                  
                  {/* Distributor Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Distributor Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{selectedOrder.distributor.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedOrder.distributor.email}</span>
                      </div>
                      {selectedOrder.distributor.contactNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{selectedOrder.distributor.contactNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{item.productName}</h4>
                            <p className="text-sm text-gray-600 mt-1">Category: {item.categoryName}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Qty: {item.quantity} ({item.unit})</div>
                            <div className="text-sm text-gray-600">Unit Price: ₹{item.unitPrice}</div>
                            <div className="font-medium text-gray-900">₹{item.totalPrice}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                        <span className="text-lg font-bold text-indigo-600">₹{selectedOrder.totalAmount.toFixed(2)}</span>
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
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Update Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}










