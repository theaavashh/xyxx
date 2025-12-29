'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Minus, Send, Trash2, X } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

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

interface PlaceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: () => void;
}

export default function PlaceOrderModal({ isOpen, onClose, onOrderPlaced }: PlaceOrderModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const { user } = useAuth();

  const fetchDistributorCategories = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        toast.error('User not authenticated');
        setLoading(false);
        return;
      }

      const credentialsResponse = await apiClient.get<{ success: boolean; data: any }>(`/distributors/${user.id}/credentials`);
      
      if (credentialsResponse.success && credentialsResponse.data) {
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
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchDistributorCategories();
    }
  }, [isOpen, user]);

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
      'Mutton Achar': 'kg',
      'Pork Achar': 'kg',
      'Chicken Achar': 'kg',
      'Product A': 'pcs',
      'Product B': 'pcs',
      'Product C': 'pcs',
    };
    
    return {
      price: basePrices[subcategory] || 300,
      unit: units[subcategory] || 'pcs'
    };
  };

  const generateSubcategories = (categoryTitle: string) => {
    const subcategoryMap: { [key: string]: string[] } = {
      'Achar': ['Mutton Achar', 'Pork Achar', 'Chicken Achar'],
      'Category A': ['Product A', 'Product B'],
      'Category B': ['Product C'],
    };
    
    return subcategoryMap[categoryTitle] || ['Product A', 'Product B'];
  };

  const addToOrder = (categoryId: string, categoryTitle: string, subcategory: string) => {
    const pricing = getSamplePricing(categoryTitle, subcategory);
    const orderItem: OrderItem = {
      id: `${categoryId}-${subcategory}-${Date.now()}`,
      categoryId,
      categoryTitle,
      subcategory,
      quantity: 1,
      unit: pricing.unit,
      unitPrice: pricing.price,
      totalPrice: pricing.price
    };

    const existingItemIndex = orderItems.findIndex(
      item => item.categoryId === categoryId && item.subcategory === subcategory
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].totalPrice = 
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice;
      setOrderItems(updatedItems);
    } else {
      setOrderItems([...orderItems, orderItem]);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedItems = orderItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: newQuantity * item.unitPrice
        };
      }
      return item;
    });
    
    setOrderItems(updatedItems);
  };

  const removeFromOrder = (itemId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  const handleSubmitOrder = async () => {
    if (orderItems.length === 0) {
      toast.error('Please add at least one item to your order');
      return;
    }

    try {
      setSubmittingOrder(true);
      
      const orderData = {
        items: orderItems.map(item => ({
          categoryId: item.categoryId,
          subcategory: item.subcategory,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        totalAmount: orderItems.reduce((sum, item) => sum + item.totalPrice, 0),
        notes: `Order placed via modal - ${orderItems.length} items`
      };

      const response = await apiClient.post('/orders', orderData);
      
      if ((response as any).success) {
        toast.success('Order placed successfully!');
        setOrderItems([]);
        onClose();
        onOrderPlaced();
      } else {
        toast.error((response as any).message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const orderSummary = {
    totalItems: orderItems.length,
    totalQuantity: orderItems.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: orderItems.reduce((sum, item) => sum + item.totalPrice, 0)
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        ></div>
        
        {/* Modal Content */}
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Place New Order</h3>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Body */}
          <div className="max-h-[70vh] overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No categories assigned to you yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Categories and Products */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Available Products</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map((category) => {
                      const subcategories = generateSubcategories(category.title);
                      return (
                        <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-2">{category.title}</h5>
                          {category.description && (
                            <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                          )}
                          <div className="space-y-2">
                            {subcategories.map((subcategory) => {
                              const pricing = getSamplePricing(category.title, subcategory);
                              return (
                                <div key={subcategory} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{subcategory}</p>
                                    <p className="text-xs text-gray-600">
                                      ₹{pricing.price}/{pricing.unit}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => addToOrder(category.id, category.title, subcategory)}
                                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm flex items-center"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Items */}
                {orderItems.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Order Items</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orderItems.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{item.subcategory}</p>
                                  <p className="text-xs text-gray-500">{item.categoryTitle}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center space-x-1">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="p-1 rounded-md hover:bg-gray-100"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="p-1 rounded-md hover:bg-gray-100"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right text-sm text-gray-900">
                                ₹{item.unitPrice}/{item.unit}
                              </td>
                              <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                ₹{item.totalPrice}
                              </td>
                              <td className="px-4 py-3 text-center">
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

                {/* Order Summary */}
                {orderItems.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600">{orderSummary.totalItems}</div>
                          <div className="text-sm text-gray-600">Items</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600">{orderSummary.totalQuantity}</div>
                          <div className="text-sm text-gray-600">Total Qty</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600">₹{orderSummary.totalAmount}</div>
                          <div className="text-sm text-gray-600">Total Amount</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {orderItems.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Total: <span className="font-bold text-lg text-gray-900">₹{orderSummary.totalAmount}</span>
                </div>
                <button
                  onClick={handleSubmitOrder}
                  disabled={submittingOrder}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center font-medium"
                >
                  {submittingOrder ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Place Order
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}