'use client';

import { useState } from 'react';
import { Eye, Filter, Calendar } from 'lucide-react';
import { mockOrders } from '@/lib/mockData';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Order } from '@/types';

export default function Orders() {
  const [orders] = useState<Order[]>(mockOrders);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statuses = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  const filteredOrders = orders.filter(order => 
    statusFilter === 'all' || order.status === statusFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">My Orders</h1>
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <li key={order.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div>
                            <p className="text-sm font-medium text-blue-600">
                              Order #{order.id}
                            </p>
                            <div className="flex items-center mt-1">
                              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                              <p className="text-sm text-gray-500">
                                {formatDate(order.orderDate)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {formatCurrency(order.totalAmount)}
                            </p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          {order.expectedDeliveryDate && (
                            <span className="ml-2">
                              • Expected: {formatDate(order.expectedDeliveryDate)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-4">
              {selectedOrder ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Order Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Order ID</p>
                      <p className="text-sm text-gray-900">{selectedOrder.id}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Order Date</p>
                      <p className="text-sm text-gray-900">{formatDate(selectedOrder.orderDate)}</p>
                    </div>
                    
                    {selectedOrder.expectedDeliveryDate && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Expected Delivery</p>
                        <p className="text-sm text-gray-900">{formatDate(selectedOrder.expectedDeliveryDate)}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Items</p>
                      <div className="space-y-2">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-md">
                            <div className="flex justify-between">
                              <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                              <p className="text-sm text-gray-900">{formatCurrency(item.totalPrice)}</p>
                            </div>
                            <p className="text-xs text-gray-600">
                              {item.quantity} × {formatCurrency(item.pricePerUnit)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-700">Total Amount</p>
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(selectedOrder.totalAmount)}</p>
                      </div>
                    </div>
                    
                    {selectedOrder.notes && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Notes</p>
                        <p className="text-sm text-gray-900">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select an order to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

