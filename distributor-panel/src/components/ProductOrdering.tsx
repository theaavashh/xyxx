'use client';

import React, { useState, useEffect } from 'react';
import { useDataStore, useUIStore } from '@/stores';
import { Product, Order, OrderItem } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  Plus,
  Minus,
  ShoppingCart,
  Check,
  X,
  Search,
  Filter,
} from 'lucide-react';

interface ProductOrderingProps {
  onOrderCreated?: (order: Order) => void;
}

export const ProductOrdering: React.FC<ProductOrderingProps> = ({
  onOrderCreated,
}) => {
  const {
    products,
    productsLoading,
    categories,
    createOrder,
  } = useDataStore();

  const { addNotification, setLoading } = useUIStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter products based on category and search
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && product.isActive;
  });

  const handleAddToCart = (product: Product, quantity: number) => {
    const existingItem = cart.find((item) => item.productId === product.id);

    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity <= product.maxOrder && newQuantity >= product.minOrder) {
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.productId === product.id
              ? {
                ...item,
                quantity: newQuantity,
                totalPrice: newQuantity * product.pricePerUnit,
              }
              : item
          )
        );
      }
    } else {
      // Add new item
      if (quantity >= product.minOrder && quantity <= product.maxOrder) {
        const newItem: OrderItem = {
          id: Date.now().toString(),
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice: product.pricePerUnit,
          totalPrice: quantity * product.pricePerUnit,
        };
        setCart((prevCart) => [...prevCart, newItem]);
      }
    }
  };

  const handleUpdateCartQuantity = (productId: string, newQuantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (newQuantity === 0) {
      // Remove item from cart
      setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
    } else if (newQuantity >= product.minOrder && newQuantity <= product.maxOrder) {
      // Update item quantity
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.productId === productId
            ? {
              ...item,
              quantity: newQuantity,
              totalPrice: newQuantity * product.pricePerUnit,
            }
            : item
        )
      );
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  };

  const calculateCartTotal = () => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  };

  const calculateCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      addNotification({
        distributorId: '',
        type: 'system',
        title: 'Cart Empty',
        message: 'Please add products to your cart before placing an order.',
        priority: 'medium',
      });
      return;
    }

    setIsSubmitting(true);
    setLoading('order', true);

    try {
      const orderData = {
        items: cart,
        notes: orderNotes,
      };

      const newOrder = await createOrder(orderData);

      if (newOrder) {
        addNotification({
          distributorId: '',
          type: 'order',
          title: 'Order Placed',
          message: `Your order #${newOrder.orderNumber} has been placed successfully.`,
          priority: 'medium',
          actionUrl: `/orders/${newOrder.id}`,
        });

        // Clear cart
        setCart([]);
        setOrderNotes('');
        setShowCart(false);

        onOrderCreated?.(newOrder);
      }
    } catch (error) {
      addNotification({
        distributorId: '',
        type: 'system',
        title: 'Order Failed',
        message: 'Failed to place your order. Please try again.',
        priority: 'high',
      });
    } finally {
      setIsSubmitting(false);
      setLoading('order', false);
    }
  };

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const [quantity, setQuantity] = useState(product.minOrder);

    const handleAddToCart = () => {
      handleAddToCart(product, quantity);
      setQuantity(product.minOrder); // Reset to min order
    };

    const stockStatus = product.availableQuantity > 0 ? 'In Stock' : 'Out of Stock';
    const stockColor = product.availableQuantity > 0 ? 'text-green-600' : 'text-red-600';

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {product.imageUrl && (
          <div className="h-48 bg-gray-200">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
            <span className={`text-sm font-medium ${stockColor}`}>
              {stockStatus}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3">
            {product.description}
          </p>

          <div className="flex justify-between items-center mb-3">
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(product.pricePerUnit)}
            </span>
            <span className="text-sm text-gray-500">
              {product.availableQuantity} {product.unit} available
            </span>
          </div>

          <div className="text-sm text-gray-500 mb-3">
            Min order: {product.minOrder} {product.unit} |
            Max order: {product.maxOrder} {product.unit}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity(Math.max(product.minOrder, quantity - 1))}
              disabled={quantity <= product.minOrder}
              className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="h-4 w-4" />
            </button>

            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(product.minOrder, parseInt(e.target.value) || 0))}
              min={product.minOrder}
              max={product.maxOrder}
              className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={() => setQuantity(Math.min(product.maxOrder, quantity + 1))}
              disabled={quantity >= product.maxOrder}
              className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
            </button>

            <button
              onClick={handleAddToCart}
              disabled={product.availableQuantity === 0 || quantity < product.minOrder}
              className="flex-1 ml-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Ordering</h2>
          <p className="text-gray-600 mt-1">
            Browse products and place your orders
          </p>
        </div>

        <button
          onClick={() => setShowCart(!showCart)}
          className="relative flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <ShoppingCart className="h-5 w-5" />
          Cart
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {productsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* No Products Found */}
      {!productsLoading && filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCart(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Cart Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Shopping Cart</h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.productName}</h4>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(item.unitPrice)} × {item.quantity}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateCartQuantity(item.productId, item.quantity - 1)}
                            className="p-1 rounded-md border border-gray-300 hover:bg-gray-50"
                          >
                            <Minus className="h-3 w-3" />
                          </button>

                          <span className="w-8 text-center">{item.quantity}</span>

                          <button
                            onClick={() => handleUpdateCartQuantity(item.productId, item.quantity + 1)}
                            className="p-1 rounded-md border border-gray-300 hover:bg-gray-50"
                          >
                            <Plus className="h-3 w-3" />
                          </button>

                          <button
                            onClick={() => handleRemoveFromCart(item.productId)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-md"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="border-t border-gray-200 p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(calculateCartTotal())}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order Notes (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="Add any special instructions..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting || cart.length === 0}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {isSubmitting ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};