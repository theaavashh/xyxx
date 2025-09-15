'use client';

import React from 'react';
import { Package, Plus, Search, ShoppingCart } from 'lucide-react';

export default function ProductManagement() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory and catalog</p>
        </div>
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          disabled
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <Package className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
            <Package className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Stock</p>
              <p className="text-3xl font-bold text-blue-600">0</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-3xl font-bold text-red-600">0</p>
            </div>
            <Package className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Product Management Coming Soon</h3>
        <p className="text-gray-500 mb-4">
          Full product management functionality will be available soon. This will include:
        </p>
        <div className="text-left max-w-md mx-auto">
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
              Create and manage products with detailed information
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
              Organize products by categories
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
              Track inventory and stock levels
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
              Upload product images and documents
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
              Set pricing and manage product variations
            </li>
          </ul>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          For now, you can set up categories to organize your future products.
        </p>
      </div>
    </div>
  );
}
