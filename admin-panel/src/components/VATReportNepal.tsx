'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Calendar, 
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Building,
  AlertCircle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { VATReport, VATMonthlyBreakdown } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { mockVATReport } from '@/lib/mockData';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function VATReportNepal() {
  const [selectedPeriod, setSelectedPeriod] = useState('Q1');
  const [selectedYear, setSelectedYear] = useState('2024-25');
  const [reportData] = useState<VATReport>(mockVATReport);

  const downloadReport = (format: 'pdf' | 'excel') => {
    // Implementation for downloading report
    console.log(`Downloading VAT report in ${format} format`);
  };

  const formatNepalDate = (date: Date) => {
    // Convert to Nepali date format
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getQuarterNepaliMonths = (quarter: number) => {
    const quarters = {
      1: ['Shrawan', 'Bhadra', 'Ashwin'],
      2: ['Kartik', 'Mangsir', 'Paush'],
      3: ['Magh', 'Falgun', 'Chaitra'],
      4: ['Baisakh', 'Jestha', 'Ashadh']
    };
    return quarters[quarter as keyof typeof quarters] || [];
  };

  const calculateVATLiability = () => {
    const { outputVAT, inputVAT } = reportData.vatSummary;
    return outputVAT - inputVAT;
  };

  const isVATRefundable = () => {
    return reportData.vatSummary.inputVAT > reportData.vatSummary.outputVAT;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">VAT Report - Nepal</h1>
            <p className="text-gray-600 mt-1">
              Value Added Tax report compliant with Nepal's tax regulations (13% standard rate)
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="2024-25">FY 2024-25</option>
                <option value="2023-24">FY 2023-24</option>
                <option value="2022-23">FY 2022-23</option>
              </select>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Q1">Q1 (Shrawan-Ashwin)</option>
                <option value="Q2">Q2 (Kartik-Paush)</option>
                <option value="Q3">Q3 (Magh-Chaitra)</option>
                <option value="Q4">Q4 (Baisakh-Ashadh)</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => downloadReport('pdf')}
                className="inline-flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Download className="h-4 w-4 mr-1" />
                PDF
              </button>
              <button
                onClick={() => downloadReport('excel')}
                className="inline-flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-1" />
                Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VAT Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Output VAT (Sales)"
          value={formatCurrency(reportData.vatSummary.outputVAT)}
          icon={TrendingUp}
          color="bg-green-500"
          trend={{ value: "+15.2% from last quarter", isPositive: true }}
        />
        <StatCard
          title="Input VAT (Purchases)"
          value={formatCurrency(reportData.vatSummary.inputVAT)}
          icon={TrendingDown}
          color="bg-blue-500"
          trend={{ value: "+8.7% from last quarter", isPositive: true }}
        />
        <StatCard
          title={isVATRefundable() ? "VAT Refundable" : "VAT Payable"}
          value={formatCurrency(Math.abs(calculateVATLiability()))}
          icon={isVATRefundable() ? Receipt : DollarSign}
          color={isVATRefundable() ? "bg-orange-500" : "bg-red-500"}
        />
        <StatCard
          title="Effective VAT Rate"
          value={`${((reportData.vatSummary.outputVAT / reportData.sales.taxableSales) * 100).toFixed(2)}%`}
          icon={Calculator}
          color="bg-purple-500"
        />
      </div>

      {/* VAT Status Alert */}
      <div className={`rounded-lg border p-4 ${
        isVATRefundable() 
          ? 'bg-orange-50 border-orange-200' 
          : calculateVATLiability() > 50000 
            ? 'bg-red-50 border-red-200' 
            : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {isVATRefundable() ? (
              <AlertCircle className="h-5 w-5 text-orange-500" />
            ) : calculateVATLiability() > 50000 ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${
              isVATRefundable() 
                ? 'text-orange-800' 
                : calculateVATLiability() > 50000 
                  ? 'text-red-800' 
                  : 'text-green-800'
            }`}>
              {isVATRefundable() 
                ? 'VAT Refund Eligible' 
                : calculateVATLiability() > 50000 
                  ? 'High VAT Liability' 
                  : 'VAT Compliance Good'
              }
            </h3>
            <p className={`text-sm mt-1 ${
              isVATRefundable() 
                ? 'text-orange-700' 
                : calculateVATLiability() > 50000 
                  ? 'text-red-700' 
                  : 'text-green-700'
            }`}>
              {isVATRefundable() 
                ? `You can claim a refund of ${formatCurrency(Math.abs(calculateVATLiability()))} from the tax office.`
                : calculateVATLiability() > 50000 
                  ? `VAT liability is ${formatCurrency(calculateVATLiability())}. Ensure timely payment to avoid penalties.`
                  : `Your VAT liability is manageable at ${formatCurrency(calculateVATLiability())}.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Purchase and Sales Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Purchases */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Building className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Purchase Summary</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Taxable Purchases</span>
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(reportData.purchases.taxablePurchases)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Exempt Purchases</span>
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(reportData.purchases.exemptPurchases)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Input VAT (Claimable)</span>
              <span className="text-sm font-bold text-blue-600">
                {formatCurrency(reportData.purchases.inputVAT)}
              </span>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900">Total Purchases</span>
                <span className="text-base font-bold text-gray-900">
                  {formatCurrency(reportData.purchases.totalPurchases)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sales */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-green-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Sales Summary</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Taxable Sales</span>
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(reportData.sales.taxableSales)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Exempt Sales</span>
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(reportData.sales.exemptSales)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Output VAT (Payable)</span>
              <span className="text-sm font-bold text-green-600">
                {formatCurrency(reportData.sales.outputVAT)}
              </span>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900">Total Sales</span>
                <span className="text-base font-bold text-gray-900">
                  {formatCurrency(reportData.sales.totalSales)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Monthly VAT Breakdown</h2>
          <p className="text-sm text-gray-600 mt-1">
            Quarter {reportData.quarter} ({getQuarterNepaliMonths(reportData.quarter).join(', ')}) FY {reportData.fiscalYear}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month (Nepali)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taxable Purchases
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Input VAT
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taxable Sales
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Output VAT
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net VAT
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.monthlyBreakdown.map((month) => (
                <tr key={month.month} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {month.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(month.taxablePurchases)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-right">
                    {formatCurrency(month.inputVAT)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(month.taxableSales)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">
                    {formatCurrency(month.outputVAT)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`font-medium ${
                      month.netVAT > 0 ? 'text-red-600' : month.netVAT < 0 ? 'text-orange-600' : 'text-gray-900'
                    }`}>
                      {formatCurrency(Math.abs(month.netVAT))}
                      {month.netVAT < 0 && ' (Refund)'}
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-medium">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Total
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(reportData.purchases.taxablePurchases)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-right">
                  {formatCurrency(reportData.purchases.inputVAT)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(reportData.sales.taxableSales)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">
                  {formatCurrency(reportData.sales.outputVAT)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <span className={`font-bold ${
                    calculateVATLiability() > 0 ? 'text-red-600' : 'text-orange-600'
                  }`}>
                    {formatCurrency(Math.abs(calculateVATLiability()))}
                    {calculateVATLiability() < 0 && ' (Refund)'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start">
          <FileText className="h-6 w-6 text-blue-600 mr-3 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Nepal VAT Compliance Notes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">Filing Requirements:</h4>
                <ul className="space-y-1">
                  <li>• Quarterly VAT return filing by 25th of following month</li>
                  <li>• Annual VAT return filing by 15th Paush</li>
                  <li>• Monthly VAT for businesses with annual turnover &gt; 20 Crores</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Payment Schedule:</h4>
                <ul className="space-y-1">
                  <li>• VAT payment due with return filing</li>
                  <li>• Advance tax payment for registered businesses</li>
                  <li>• Penalty: 2% per month for late payment</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Standard Rates:</h4>
                <ul className="space-y-1">
                  <li>• Standard VAT rate: 13%</li>
                  <li>• Export VAT rate: 0%</li>
                  <li>• Some essential goods: VAT exempt</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Next Actions:</h4>
                <ul className="space-y-1">
                  <li>• Verify all purchase bills have proper VAT invoices</li>
                  <li>• Ensure sales invoices comply with format requirements</li>
                  <li>• File quarterly return by due date</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
