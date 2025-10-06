'use client';

import React, { useState } from 'react';
import { useAccountingDashboard } from '@/hooks/useAccounting';
import { 
  DollarSign, 
  BarChart3,
  Calculator,
  TrendingUp,
  Receipt,
  Building,
  Calendar,
  Target,
  Activity,
  AlertCircle,
  Users,
  BookOpen,
  FileText,
  ShoppingCart,
  Package,
  CreditCard,
  PieChart,
  ArrowRight,
  XCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { mockVATBills, mockTrialBalance, mockBalanceSheet, mockMISReport } from '@/lib/mockData';
import AccountingDemo from './AccountingDemo';
import SalesEntry from './SalesEntry';
import PurchaseEntry from './PurchaseEntry';

interface AccountingModuleProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
  stats?: string;
}

function AccountingModule({ title, description, icon: Icon, color, onClick, stats }: AccountingModuleProps) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} mb-4`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      {stats && (
        <div className="flex items-center text-sm">
          <Activity className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-green-600 font-medium">{stats}</span>
        </div>
      )}
    </div>
  );
}

interface QuickStatsProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  trend?: string;
  trendDirection?: 'up' | 'down';
}

function QuickStats({ title, value, icon: Icon, color, trend, trendDirection }: QuickStatsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AccountingDashboard() {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const { kpis, trialBalance, agingAnalysis, loading, error, refetch } = useAccountingDashboard();

  // Calculate some quick stats - use real data when available, fallback to mock data
  const pendingVATBills = mockVATBills.filter(bill => bill.status === 'draft').length;
  const totalVATAmount = mockVATBills.reduce((sum, bill) => sum + bill.vatAmount, 0);
  const isTrialBalanced = trialBalance?.totals.isBalanced ?? mockTrialBalance.totals.isBalanced;
  const totalAssets = mockBalanceSheet.assets.totalAssets;
  const netProfit = kpis?.netProfit ?? mockMISReport.financialMetrics.netProfit;
  const profitMargin = kpis ? ((kpis.netProfit / kpis.totalRevenue) * 100) : mockMISReport.financialMetrics.netProfitMargin;

  const accountingModules = [
    {
      title: 'Journal Entry',
      description: 'Record double-entry accounting transactions with proper debits and credits',
      icon: BookOpen,
      color: 'bg-blue-500',
      stats: `${mockTrialBalance.accounts.length} accounts active`,
      onClick: () => setActiveModule('journal')
    },
    {
      title: 'Ledger Management',
      description: 'View and manage account ledgers with transaction history',
      icon: FileText,
      color: 'bg-green-500',
      stats: 'Real-time balances',
      onClick: () => setActiveModule('ledger')
    },
    {
      title: 'Party Ledger',
      description: 'Track customer and supplier account balances and transactions',
      icon: Users,
      color: 'bg-purple-500',
      stats: 'Customer & Supplier tracking',
      onClick: () => setActiveModule('party')
    },
    {
      title: 'Sales Entry',
      description: 'Create sales invoices with auto-fetched customer data',
      icon: ShoppingCart,
      color: 'bg-blue-500',
      stats: 'Auto customer fetch',
      onClick: () => setActiveModule('sales')
    },
    {
      title: 'Purchase Entry',
      description: 'Record purchase transactions with auto-fetched supplier data',
      icon: Package,
      color: 'bg-orange-500',
      stats: 'Auto supplier fetch',
      onClick: () => setActiveModule('purchase')
    },
    {
      title: 'Debtors & Creditors',
      description: 'Aging analysis and outstanding amount tracking',
      icon: CreditCard,
      color: 'bg-red-500',
      stats: 'Outstanding analysis',
      onClick: () => setActiveModule('debtors')
    },
    {
      title: 'Purchase & Sales Reports',
      description: 'Comprehensive purchase and sales reporting with VAT breakdown',
      icon: BarChart3,
      color: 'bg-indigo-500',
      stats: 'Detailed analytics',
      onClick: () => setActiveModule('reports')
    },
    {
      title: 'VAT Report (Nepal)',
      description: 'Nepal-specific VAT reporting for tax compliance (13% standard rate)',
      icon: Receipt,
      color: 'bg-yellow-500',
      stats: `${pendingVATBills} pending bills`,
      onClick: () => setActiveModule('vat')
    },
    {
      title: 'Balance Sheet',
      description: 'Assets, Liabilities, and Equity statement with year-over-year comparison',
      icon: Building,
      color: 'bg-teal-500',
      stats: `${formatCurrency(totalAssets)} total assets`,
      onClick: () => setActiveModule('balance')
    },
    {
      title: 'Trial Balance',
      description: 'Verify accounting equation with debits and credits summary',
      icon: Calculator,
      color: 'bg-pink-500',
      stats: isTrialBalanced ? 'Balanced' : 'Needs adjustment',
      onClick: () => setActiveModule('trial')
    },
    {
      title: 'MIS Report',
      description: 'Management Information System with financial KPIs and ratios',
      icon: PieChart,
      color: 'bg-cyan-500',
      stats: `${profitMargin.toFixed(1)}% profit margin`,
      onClick: () => setActiveModule('mis')
    },
    {
      title: 'Auto-Fetch Demo',
      description: 'See how customer and supplier data auto-fetches across all features',
      icon: Users,
      color: 'bg-indigo-500',
      stats: 'Interactive demo',
      onClick: () => setActiveModule('demo')
    }
  ];

  const quickStats = [
    {
      title: 'Pending VAT Bills',
      value: pendingVATBills.toString(),
      icon: Receipt,
      color: 'bg-yellow-500',
      trend: 'Needs attention',
      trendDirection: 'down' as const
    },
    {
      title: 'Total VAT Amount',
      value: formatCurrency(totalVATAmount),
      icon: DollarSign,
      color: 'bg-green-500',
      trend: 'This month',
      trendDirection: 'up' as const
    },
    {
      title: 'Net Profit',
      value: formatCurrency(netProfit),
      icon: TrendingUp,
      color: 'bg-blue-500',
      trend: `${profitMargin.toFixed(1)}% margin`,
      trendDirection: 'up' as const
    },
    {
      title: 'Trial Balance',
      value: isTrialBalanced ? 'Balanced' : 'Unbalanced',
      icon: Calculator,
      color: isTrialBalanced ? 'bg-green-500' : 'bg-red-500',
      trend: isTrialBalanced ? 'All good' : 'Needs review',
      trendDirection: isTrialBalanced ? 'up' as const : 'down' as const
    }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="text-red-600 mb-2">
              <AlertCircle className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accounting Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive financial management with Nepal-specific compliance
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              FY 2024-25 | {new Date().toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <QuickStats key={index} {...stat} />
        ))}
      </div>

      {/* Module Content */}
      {activeModule && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {accountingModules.find(m => m.title.toLowerCase().includes(activeModule))?.title || 'Module'}
              </h2>
              <button
                onClick={() => setActiveModule(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="p-6">
            {activeModule === 'journal' && <div>Journal Entry Component</div>}
            {activeModule === 'ledger' && <div>Ledger Management Component</div>}
            {activeModule === 'party' && <div>Party Ledger Component</div>}
            {activeModule === 'sales' && <SalesEntry />}
            {activeModule === 'purchase' && <PurchaseEntry />}
            {activeModule === 'debtors' && <div>Debtors & Creditors Component</div>}
            {activeModule === 'reports' && <div>Purchase & Sales Reports Component</div>}
            {activeModule === 'vat' && <div>VAT Report Component</div>}
            {activeModule === 'balance' && <div>Balance Sheet Component</div>}
            {activeModule === 'trial' && <div>Trial Balance Component</div>}
            {activeModule === 'mis' && <div>MIS Report Component</div>}
            {activeModule === 'demo' && <AccountingDemo />}
          </div>
        </div>
      )}

      {/* Accounting Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {accountingModules.map((module, index) => (
          <AccountingModule key={index} {...module} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Accounting Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Receipt className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">VAT Bill Created</p>
                  <p className="text-sm text-gray-500">Raw Material Suppliers Ltd. - {formatCurrency(56500)}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <BookOpen className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Journal Entry Posted</p>
                  <p className="text-sm text-gray-500">Purchase of raw materials - JE20240825001</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">5 hours ago</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Party Payment Received</p>
                  <p className="text-sm text-gray-500">ABC Distribution Pvt. Ltd. - {formatCurrency(36500)}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">1 day ago</span>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg mr-3">
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Monthly Report Generated</p>
                  <p className="text-sm text-gray-500">Purchase & Sales Report for Bhadra 2081</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">2 days ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Reminders */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start">
          <div className="p-2 bg-blue-100 rounded-lg mr-4">
            <Target className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">Nepal Tax Compliance Reminders</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center justify-between">
                <span>• VAT Return Filing (Quarterly)</span>
                <span className="text-blue-600 font-medium">Due: 25th Kartik</span>
              </div>
              <div className="flex items-center justify-between">
                <span>• Income Tax Return</span>
                <span className="text-blue-600 font-medium">Due: 15th Paush</span>
              </div>
              <div className="flex items-center justify-between">
                <span>• Social Security Fund</span>
                <span className="text-blue-600 font-medium">Monthly</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
