'use client';

import { useState } from 'react';
import { Plus, Minus, ShoppingCart, Search } from 'lucide-react';
import { mockProducts } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';
import { Product, OrderItem } from '@/types';
import toast from 'react-hot-toast';

export default function Products() {
  const [products] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const updateQuantity = (productId: string, change: number) => {
    setQuantities(prev => {
      const current = prev[productId] || 0;
      const newQuantity = Math.max(0, current + change);
      return { ...prev, [productId]: newQuantity };
    });
  };

  const addToCart = (product: Product) => {
    const quantity = quantities[product.id] || 0;
    if (quantity === 0) {
      toast.error('Please select a quantity');
      return;
    }

    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      setCart(prev => prev.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + quantity, totalPrice: (item.quantity + quantity) * item.pricePerUnit }
          : item
      ));
    } else {
      const newItem: OrderItem = {
        productId: product.id,
        productName: product.name,
        quantity,
        pricePerUnit: product.pricePerUnit,
        totalPrice: quantity * product.pricePerUnit,
      };
      setCart(prev => [...prev, newItem]);
    }

    setQuantities(prev => ({ ...prev, [product.id]: 0 }));
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
    toast.success('Item removed from cart');
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  };

  const placeOrder = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    // Here you would normally send the order to your API
    toast.success('Order placed successfully!');
    setCart([]);
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          {cart.length > 0 && (
            <div className="bg-blue-100 px-4 py-2 rounded-lg">
              <span className="text-blue-800 font-medium">
                Cart: {cart.length} items - {formatCurrency(getTotalAmount())}
              </span>
            </div>
          )}
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                  <div className="p-4">
                    <div className="mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                        {product.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(product.pricePerUnit)}/{product.unit}
                      </span>
                      <span className="text-sm text-gray-500">
                        Stock: {product.availableQuantity}
                      </span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="p-1 rounded-full hover:bg-gray-100"
                          disabled={!quantities[product.id]}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {quantities[product.id] || 0}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="p-1 rounded-full hover:bg-gray-100"
                          disabled={quantities[product.id] >= product.availableQuantity}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Cart</h3>
              
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex justify-between items-start text-sm">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-gray-600">
                            {item.quantity} × {formatCurrency(item.pricePerUnit)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-lg">{formatCurrency(getTotalAmount())}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={placeOrder}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-medium"
                  >
                    Place Order
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

