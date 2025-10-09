'use client';

import { useState, useEffect } from 'react';
import { Package, RefreshCw, Tag, ShoppingCart, Plus, Minus, Send, Trash2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Category {
  id: string;
  title: string;
  description?: string;
}

interface OrderItem {
  id: string;
  categoryId: string;
  categoryTitle: string;
  subcategory: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

interface OrderSummary {
  totalItems: number;
  totalQuantity: number;
  totalAmount: number;
}

export default function Products() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const { user } = useAuth();

  const fetchDistributorCategories = async () => {
    try {
      setRefreshing(true);
      
      if (!user) {
        toast.error('User not authenticated');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Get distributor credentials to see assigned categories
      const credentialsResponse = await apiClient.get<{ success: boolean; data: any }>(`/distributors/${user.id}/credentials`);
      
      if (credentialsResponse.success && credentialsResponse.data) {
        // Extract categories from the response - the structure is { categories: [...] }
        const categoryList = credentialsResponse.data.categories || [];
        
        setCategories(categoryList);
        
        if (categoryList.length === 0) {
          toast('No categories assigned to you yet', { icon: 'ℹ️' });
        }
      } else {
        setCategories([]);
        toast.error('Failed to fetch distributor categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDistributorCategories();
    }
  }, [user]);

  const handleRefresh = () => {
    fetchDistributorCategories();
  };

  // Generate sample pricing data (in real app, this would come from API)
  const getSamplePricing = (categoryTitle: string, subcategory: string) => {
    const basePrices: { [key: string]: number } = {
      'Mutton Achar': 500,
      'Pork Achar': 450,
      'Chicken Achar': 400,
      'Product A': 300,
      'Product B': 350,
      'Product C': 250,
    };
    
    const units: { [key: string]: string } = {
      'Mutton Achar': '500gm',
      'Pork Achar': '250gm',
      'Chicken Achar': '1kg',
      'Product A': '500gm',
      'Product B': '750gm',
      'Product C': '250gm',
    };

    return {
      unitPrice: basePrices[subcategory] || 300,
      unit: units[subcategory] || '500gm'
    };
  };

  const addToOrder = (category: Category, subcategory: string) => {
    const existingItem = orderItems.find(
      item => item.categoryId === category.id && item.subcategory === subcategory
    );

    if (existingItem) {
      // Update quantity of existing item
      setOrderItems(prev => prev.map(item => 
        item.id === existingItem.id 
          ? { 
              ...item, 
              quantity: item.quantity + 1,
              totalPrice: (item.quantity + 1) * item.unitPrice
            }
          : item
      ));
    } else {
      // Add new item
      const pricing = getSamplePricing(category.title, subcategory);
      const newItem: OrderItem = {
        id: `${category.id}-${subcategory}-${Date.now()}`,
        categoryId: category.id,
        categoryTitle: category.title,
        subcategory,
        quantity: 1,
        unit: pricing.unit,
        unitPrice: pricing.unitPrice,
        totalPrice: pricing.unitPrice
      };
      setOrderItems(prev => [...prev, newItem]);
    }
    toast.success(`${subcategory} added to order`);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromOrder(itemId);
      return;
    }
    
    setOrderItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            quantity: newQuantity,
            totalPrice: newQuantity * item.unitPrice
          }
        : item
    ));
  };

  const removeFromOrder = (itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
    toast.success('Item removed from order');
  };

  const calculateOrderSummary = (): OrderSummary => {
    return orderItems.reduce(
      (summary, item) => ({
        totalItems: summary.totalItems + 1,
        totalQuantity: summary.totalQuantity + item.quantity,
        totalAmount: summary.totalAmount + item.totalPrice
      }),
      { totalItems: 0, totalQuantity: 0, totalAmount: 0 }
    );
  };

  const handleSubmitOrder = async () => {
    if (orderItems.length === 0) {
      toast.error('Please add items to your order');
      return;
    }

    setSubmittingOrder(true);
    try {
      const orderData = {
        items: orderItems.map(item => ({
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unit: item.unit,
          subcategory: item.subcategory,
          categoryTitle: item.categoryTitle
        })),
        notes: `Order submitted by ${user?.name || 'Distributor'}`
      };

      const response = await fetch(`${API_URL}/orders/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('distributor_token')}`
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Order #${result.data.orderNumber} submitted successfully! Total: ₹${result.data.totalAmount}`);
        setOrderItems([]);
      } else {
        toast.error(result.message || 'Failed to submit order');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      toast.error('Failed to submit order. Please try again.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const clearOrder = () => {
    setOrderItems([]);
    toast.success('Order cleared');
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const orderSummary = calculateOrderSummary();

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Product Orders</h1>
              <p className="text-gray-600">Order products from your assigned categories</p>
            </div>
            <div className="flex gap-3">
              {orderItems.length > 0 && (
                <button
                  onClick={clearOrder}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Order
                </button>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Product Categories for Ordering */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Available Products ({categories.length} categories)
            </h2>
            <p className="text-sm text-gray-600 mt-1">Click on any product to add it to your order</p>
          </div>
          
          {categories.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 mb-4">
                <Package className="mx-auto h-12 w-12" />
              </div>
              <p className="text-gray-500 text-lg">No categories assigned to you yet</p>
              <p className="text-gray-400">Contact your administrator to get product categories assigned</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category, index) => (
                  <div key={category.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <Tag className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                        <p className="text-sm text-gray-500">Category #{index + 1}</p>
                      </div>
                    </div>
                    
                    {category.description && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Available Products:</p>
                        <div className="grid gap-2">
                          {category.description.split(',').map((subcat, idx) => {
                            const pricing = getSamplePricing(category.title, subcat.trim());
                            return (
                              <div
                                key={idx}
                                className="bg-white rounded-lg p-3 border border-blue-200 hover:border-blue-300 transition-colors cursor-pointer group"
                                onClick={() => addToOrder(category, subcat.trim())}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium text-gray-900 group-hover:text-blue-700">
                                      {subcat.trim()}
                                    </p>
                                    <p className="text-xs text-gray-500">{pricing.unit}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-blue-600">₹{pricing.unitPrice}</p>
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                      <Plus className="h-3 w-3 text-blue-600" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Table */}
        {orderItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Your Order</h2>
                <span className="text-sm text-gray-500">{orderSummary.totalItems} item{orderSummary.totalItems !== 1 ? 's' : ''}</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orderItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.subcategory}</div>
                          <div className="text-sm text-gray-500">{item.categoryTitle}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.unit}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.unitPrice}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                          >
                            <Minus className="h-3 w-3 text-gray-600" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                          >
                            <Plus className="h-3 w-3 text-gray-600" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{item.totalPrice}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => removeFromOrder(item.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Summary and Submit */}
        {orderItems.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{orderSummary.totalItems}</div>
                  <div className="text-sm text-gray-600">Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{orderSummary.totalQuantity}</div>
                  <div className="text-sm text-gray-600">Total Qty</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">₹{orderSummary.totalAmount}</div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                </div>
              </div>
              
              <button
                onClick={handleSubmitOrder}
                disabled={submittingOrder}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center font-medium"
              >
                {submittingOrder ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Order
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Empty Order State */}
        {categories.length > 0 && orderItems.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your order is empty</h3>
            <p className="text-gray-500 mb-4">Add products from the categories above to create your order</p>
            <p className="text-sm text-gray-400">Click on any product card to add it to your order</p>
          </div>
        )}
      </div>
    </div>
  );
}

