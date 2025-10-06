'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  ShoppingCart, 
  Package, 
  ArrowLeftRight,
  FileText,
  Calculator,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import PartyAutoComplete from './PartyAutoComplete';
import { Party } from '@/hooks/useParties';

export default function AccountingDemo() {
  const [selectedCustomer, setSelectedCustomer] = useState<Party | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Party | null>(null);
  const [selectedDebtor, setSelectedDebtor] = useState<Party | null>(null);
  const [selectedCreditor, setSelectedCreditor] = useState<Party | null>(null);

  const demoFeatures = [
    {
      title: 'Sales Entry',
      description: 'Create sales invoices with auto-fetched customer data',
      icon: ShoppingCart,
      color: 'blue',
      example: selectedCustomer ? `Selected: ${selectedCustomer.name}` : 'No customer selected'
    },
    {
      title: 'Purchase Entry',
      description: 'Create purchase invoices with auto-fetched supplier data',
      icon: Package,
      color: 'green',
      example: selectedSupplier ? `Selected: ${selectedSupplier.name}` : 'No supplier selected'
    },
    {
      title: 'Sales Return',
      description: 'Process sales returns with customer auto-complete',
      icon: ArrowLeftRight,
      color: 'purple',
      example: selectedCustomer ? `Return for: ${selectedCustomer.name}` : 'No customer selected'
    },
    {
      title: 'Purchase Return',
      description: 'Process purchase returns with supplier auto-complete',
      icon: ArrowLeftRight,
      color: 'orange',
      example: selectedSupplier ? `Return for: ${selectedSupplier.name}` : 'No supplier selected'
    },
    {
      title: 'Debtors Management',
      description: 'Track customer outstanding balances',
      icon: TrendingUp,
      color: 'indigo',
      example: selectedDebtor ? `Balance: ${selectedDebtor.currentBalance}` : 'No debtor selected'
    },
    {
      title: 'Creditors Management',
      description: 'Track supplier outstanding balances',
      icon: TrendingDown,
      color: 'red',
      example: selectedCreditor ? `Balance: ${selectedCreditor.currentBalance}` : 'No creditor selected'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      red: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Accounting Auto-Fetch Demo
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          This demo shows how customer and supplier names are automatically fetched from the party ledger 
          across all accounting features. Select parties below to see how they integrate with different modules.
        </p>
      </div>

      {/* Party Selection Demo */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Party Selection Demo</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <PartyAutoComplete
              label="Select Customer"
              value={selectedCustomer}
              onChange={setSelectedCustomer}
              type="customer"
              placeholder="Search for customer..."
            />
            {selectedCustomer && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">{selectedCustomer.name}</p>
                <p className="text-xs text-blue-700">{selectedCustomer.email}</p>
                <p className="text-xs text-blue-700">Balance: {selectedCustomer.currentBalance}</p>
              </div>
            )}
          </div>

          <div>
            <PartyAutoComplete
              label="Select Supplier"
              value={selectedSupplier}
              onChange={setSelectedSupplier}
              type="supplier"
              placeholder="Search for supplier..."
            />
            {selectedSupplier && (
              <div className="mt-2 p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900">{selectedSupplier.name}</p>
                <p className="text-xs text-green-700">{selectedSupplier.email}</p>
                <p className="text-xs text-green-700">Balance: {selectedSupplier.currentBalance}</p>
              </div>
            )}
          </div>

          <div>
            <PartyAutoComplete
              label="Select Debtor"
              value={selectedDebtor}
              onChange={setSelectedDebtor}
              type="sundry_debtor"
              placeholder="Search for debtor..."
            />
            {selectedDebtor && (
              <div className="mt-2 p-3 bg-indigo-50 rounded-lg">
                <p className="text-sm font-medium text-indigo-900">{selectedDebtor.name}</p>
                <p className="text-xs text-indigo-700">{selectedDebtor.email}</p>
                <p className="text-xs text-indigo-700">Balance: {selectedDebtor.currentBalance}</p>
              </div>
            )}
          </div>

          <div>
            <PartyAutoComplete
              label="Select Creditor"
              value={selectedCreditor}
              onChange={setSelectedCreditor}
              type="sundry_creditor"
              placeholder="Search for creditor..."
            />
            {selectedCreditor && (
              <div className="mt-2 p-3 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-red-900">{selectedCreditor.name}</p>
                <p className="text-xs text-red-700">{selectedCreditor.email}</p>
                <p className="text-xs text-red-700">Balance: {selectedCreditor.currentBalance}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoFeatures.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className={`p-2 rounded-lg mr-3 ${getColorClasses(feature.color)}`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
            </div>
            
            <p className="text-gray-600 mb-4">{feature.description}</p>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Example:</span> {feature.example}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Integration Benefits */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Auto-Fetch Integration Benefits
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Consistent Data</h3>
            <p className="text-gray-600">
              All accounting entries use the same party data source, ensuring consistency across all modules.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Calculator className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Auto-Linking</h3>
            <p className="text-gray-600">
              Transactions are automatically linked to party ledgers, maintaining accurate balances.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Updates</h3>
            <p className="text-gray-600">
              Party information is fetched in real-time, ensuring you always have the latest data.
            </p>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Technical Implementation</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">useParties Hook</h3>
            <p className="text-gray-600 mb-2">
              A custom React hook that manages party data fetching, caching, and state management.
            </p>
            <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm">
              <code>const { parties, loading, createParty, updateParty } = useParties(filters);</code>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">PartyAutoComplete Component</h3>
            <p className="text-gray-600 mb-2">
              A reusable component that provides search, filtering, and selection functionality for parties.
            </p>
            <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm">
              <code>&lt;PartyAutoComplete type="customer" onChange={handleChange} /&gt;</code>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">API Integration</h3>
            <p className="text-gray-600 mb-2">
              Seamless integration with the backend API for real-time data synchronization.
            </p>
            <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm">
              <code>GET /api/accounting/party-ledger?type=customer&search=term</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
