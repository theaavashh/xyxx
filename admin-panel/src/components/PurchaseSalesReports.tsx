'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Building,
  Users,
  FileText,
  Calculator
} from 'lucide-react';
import { PurchaseSalesReport, PurchaseSalesDetail } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { mockPurchaseSalesReport } from '@/lib/mockData';

interface ReportSummaryCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}

function ReportSummaryCard({ title, value, icon: Icon, color, subtitle }: ReportSummaryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color} mr-4`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

export default function PurchaseSalesReports() {
  const [reportType, setReportType] = useState<'purchase' | 'sales'>('purchase');
  const [dateRange, setDateRange] = useState({
    fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0]
  });
  const [reportData] = useState<PurchaseSalesReport>(mockPurchaseSalesReport);

  const downloadReport = (format: 'pdf' | 'excel') => {
    console.log(`Downloading ${reportType} report in ${format} format`);
  };

  const generateReport = () => {
    console.log(`Generating ${reportType} report from ${dateRange.fromDate} to ${dateRange.toDate}`);
    // In a real application, this would fetch data from the API
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Purchase & Sales Reports</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive reporting with Nepal VAT breakdown and analysis
            </p>
          </div>
          <div className="flex items-center space-x-3">
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

      {/* Report Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'purchase' | 'sales')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="purchase">Purchase Report</option>
              <option value="sales">Sales Report</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={dateRange.fromDate}
              onChange={(e) => setDateRange({ ...dateRange, fromDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={dateRange.toDate}
              onChange={(e) => setDateRange({ ...dateRange, toDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={generateReport}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ReportSummaryCard
          title="Total Amount"
          value={formatCurrency(reportData.summary.totalAmount)}
          icon={DollarSign}
          color="bg-blue-500"
          subtitle={`${reportData.summary.totalTransactions} transactions`}
        />
        <ReportSummaryCard
          title="Total VAT"
          value={formatCurrency(reportData.summary.totalVAT)}
          icon={Receipt}
          color="bg-green-500"
          subtitle={`${reportData.vatSummary.vatRate}% rate applied`}
        />
        <ReportSummaryCard
          title="Average Transaction"
          value={formatCurrency(reportData.summary.averageTransactionValue)}
          icon={Calculator}
          color="bg-purple-500"
          subtitle="Per transaction"
        />
        <ReportSummaryCard
          title="VAT Efficiency"
          value={`${((reportData.summary.totalVAT / reportData.summary.totalAmount) * 100).toFixed(1)}%`}
          icon={TrendingUp}
          color="bg-orange-500"
          subtitle="VAT to total ratio"
        />
      </div>

      {/* VAT Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Receipt className="h-5 w-5 text-green-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">VAT Analysis</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">VATable Amount</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(reportData.vatSummary.vatableAmount)}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Exempt Amount</p>
                <p className="text-2xl font-bold text-gray-600">{formatCurrency(reportData.vatSummary.exemptAmount)}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">VAT Rate</p>
                <p className="text-2xl font-bold text-blue-600">{reportData.vatSummary.vatRate}%</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Total VAT</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(reportData.vatSummary.totalVAT)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                {reportType === 'purchase' ? 'Purchase' : 'Sales'} Transactions
              </h2>
            </div>
            <div className="text-sm text-gray-600">
              {formatDate(reportData.fromDate)} to {formatDate(reportData.toDate)}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Party Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PAN Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taxable Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VAT Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.details.map((detail) => (
                <tr key={detail.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(detail.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{detail.billNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      {detail.billType === 'purchase' ? (
                        <Building className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <Users className="h-4 w-4 text-blue-500 mr-2" />
                      )}
                      {detail.partyName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {detail.panNumber || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {detail.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                    {formatCurrency(detail.taxableAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right font-mono">
                    {formatCurrency(detail.vatAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono font-medium">
                    {formatCurrency(detail.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      detail.billType === 'purchase' ? 'bg-green-100 text-green-800' :
                      detail.billType === 'sales' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {detail.billType.charAt(0).toUpperCase() + detail.billType.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={5} className="px-6 py-4 text-sm font-medium text-gray-900">
                  TOTAL ({reportData.details.length} transactions)
                </td>
                <td className="px-6 py-4 text-sm text-right font-mono font-bold text-gray-900">
                  {formatCurrency(reportData.details.reduce((sum, detail) => sum + detail.taxableAmount, 0))}
                </td>
                <td className="px-6 py-4 text-sm text-right font-mono font-bold text-green-600">
                  {formatCurrency(reportData.details.reduce((sum, detail) => sum + detail.vatAmount, 0))}
                </td>
                <td className="px-6 py-4 text-sm text-right font-mono font-bold text-gray-900">
                  {formatCurrency(reportData.details.reduce((sum, detail) => sum + detail.totalAmount, 0))}
                </td>
                <td className="px-6 py-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Monthly Trend Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Transactions</span>
              <span className="font-medium">{reportData.summary.totalTransactions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Transaction Value</span>
              <span className="font-medium">{formatCurrency(reportData.summary.averageTransactionValue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">VAT Collection Rate</span>
              <span className="font-medium">
                {((reportData.summary.totalVAT / reportData.summary.totalAmount) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Compliance Score</span>
              <span className="font-medium text-green-600">98.5%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Top Parties by Volume</h3>
          </div>
          <div className="space-y-3">
            {reportData.details
              .reduce((acc: { [key: string]: number }, detail) => {
                acc[detail.partyName] = (acc[detail.partyName] || 0) + detail.totalAmount;
                return acc;
              }, {})
              ? Object.entries(
                  reportData.details.reduce((acc: { [key: string]: number }, detail) => {
                    acc[detail.partyName] = (acc[detail.partyName] || 0) + detail.totalAmount;
                    return acc;
                  }, {})
                )
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([partyName, amount], index) => (
                  <div key={partyName} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-600 mr-2">#{index + 1}</span>
                      <span className="text-sm text-gray-900">{partyName}</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(amount as number)}</span>
                  </div>
                ))
              : []}
          </div>
        </div>
      </div>

      {/* Compliance Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start">
          <Receipt className="h-6 w-6 text-blue-600 mr-3 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Nepal Tax Compliance Notes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">Reporting Requirements:</h4>
                <ul className="space-y-1">
                  <li>• Monthly VAT returns for large taxpayers (&gt; NPR 20 crores)</li>
                  <li>• Quarterly VAT returns for regular taxpayers</li>
                  <li>• Annual income tax returns by 15th Paush</li>
                  <li>• Maintain proper books of accounts</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Documentation:</h4>
                <ul className="space-y-1">
                  <li>• All transactions must have proper VAT bills</li>
                  <li>• Supplier PAN numbers required for VAT credit</li>
                  <li>• Keep records for minimum 7 years</li>
                  <li>• Electronic billing recommended for efficiency</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}








