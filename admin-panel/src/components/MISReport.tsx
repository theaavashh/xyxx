'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, 
  Download, 
  Calendar, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Target,
  Activity,
  Briefcase,
  CreditCard,
  Building,
  Users,
  Zap,
  AlertCircle
} from 'lucide-react';
import { MISReport as MISReportType, MISPeriodData } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { mockMISReport } from '@/lib/mockData';

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
}

function KPICard({ title, value, icon: Icon, color, trend, subtitle }: KPICardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
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

interface ComparisonCardProps {
  title: string;
  current: MISPeriodData;
  previous: MISPeriodData;
  label: string;
}

function ComparisonCard({ title, current, previous, label }: ComparisonCardProps) {
  const variance = current.variance || 0;
  const variancePercentage = current.variancePercentage || 0;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Revenue</span>
          <div className="text-right">
            <div className="font-medium">{formatCurrency(current.revenue)}</div>
            <div className="text-xs text-gray-500">{label}: {formatCurrency(previous.revenue)}</div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Expenses</span>
          <div className="text-right">
            <div className="font-medium">{formatCurrency(current.expenses)}</div>
            <div className="text-xs text-gray-500">{label}: {formatCurrency(previous.expenses)}</div>
          </div>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700">Profit</span>
          <div className="text-right">
            <div className="font-bold text-gray-900">{formatCurrency(current.profit)}</div>
            <div className="text-xs text-gray-500">{label}: {formatCurrency(previous.profit)}</div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Profit Margin</span>
          <div className="text-right">
            <div className="font-medium">{current.profitMargin.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">{label}: {previous.profitMargin.toFixed(1)}%</div>
          </div>
        </div>
        {variance !== 0 && (
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-600">Variance</span>
            <div className="text-right">
              <div className={`font-medium ${variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(variance))}
              </div>
              <div className={`text-xs ${variancePercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {variancePercentage > 0 ? '+' : ''}{variancePercentage.toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MISReport() {
  const [reportData] = useState<MISReportType>(mockMISReport);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const downloadReport = (format: 'pdf' | 'excel') => {
    console.log(`Downloading MIS report in ${format} format`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">MIS Report</h1>
            <p className="text-gray-600 mt-1">
              Management Information System with comprehensive financial KPIs and performance metrics
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
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

      {/* Financial Metrics KPIs */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Gross Revenue"
            value={formatCurrency(reportData.financialMetrics.grossRevenue)}
            icon={DollarSign}
            color="bg-blue-500"
            trend={{
              value: "↑ 15.2% vs last period",
              isPositive: true
            }}
          />
          <KPICard
            title="Net Revenue"
            value={formatCurrency(reportData.financialMetrics.netRevenue)}
            icon={TrendingUp}
            color="bg-green-500"
            trend={{
              value: "↑ 12.8% vs last period",
              isPositive: true
            }}
          />
          <KPICard
            title="Gross Profit"
            value={formatCurrency(reportData.financialMetrics.grossProfit)}
            icon={Target}
            color="bg-purple-500"
            subtitle={`${reportData.financialMetrics.grossProfitMargin.toFixed(1)}% margin`}
          />
          <KPICard
            title="Net Profit"
            value={formatCurrency(reportData.financialMetrics.netProfit)}
            icon={Briefcase}
            color="bg-orange-500"
            subtitle={`${reportData.financialMetrics.netProfitMargin.toFixed(1)}% margin`}
            trend={{
              value: "↓ 65.3% vs last period",
              isPositive: false
            }}
          />
        </div>
      </div>

      {/* Key Financial Ratios */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Financial Ratios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Current Ratio"
            value={reportData.keyRatios.currentRatio.toFixed(2)}
            icon={Activity}
            color="bg-cyan-500"
            subtitle="Liquidity measure"
            trend={{
              value: reportData.keyRatios.currentRatio > 2 ? "Strong" : reportData.keyRatios.currentRatio > 1 ? "Good" : "Weak",
              isPositive: reportData.keyRatios.currentRatio > 1
            }}
          />
          <KPICard
            title="Quick Ratio"
            value={reportData.keyRatios.quickRatio.toFixed(2)}
            icon={Zap}
            color="bg-indigo-500"
            subtitle="Immediate liquidity"
            trend={{
              value: reportData.keyRatios.quickRatio > 1 ? "Good" : "Monitor",
              isPositive: reportData.keyRatios.quickRatio > 1
            }}
          />
          <KPICard
            title="Debt-to-Equity"
            value={reportData.keyRatios.debtToEquityRatio.toFixed(2)}
            icon={CreditCard}
            color="bg-red-500"
            subtitle="Financial leverage"
            trend={{
              value: reportData.keyRatios.debtToEquityRatio < 1 ? "Conservative" : "Leveraged",
              isPositive: reportData.keyRatios.debtToEquityRatio < 1
            }}
          />
          <KPICard
            title="ROA"
            value={`${reportData.keyRatios.returnOnAssets.toFixed(1)}%`}
            icon={Building}
            color="bg-teal-500"
            subtitle="Return on Assets"
            trend={{
              value: reportData.keyRatios.returnOnAssets > 5 ? "Excellent" : "Average",
              isPositive: reportData.keyRatios.returnOnAssets > 5
            }}
          />
        </div>
      </div>

      {/* Cash Flow Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-green-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Cash Flow Analysis</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Operating Cash Flow</p>
                <p className={`text-2xl font-bold ${reportData.cashFlow.operatingCashFlow > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(reportData.cashFlow.operatingCashFlow)}
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Investing Cash Flow</p>
                <p className={`text-2xl font-bold ${reportData.cashFlow.investingCashFlow > 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  {formatCurrency(reportData.cashFlow.investingCashFlow)}
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Financing Cash Flow</p>
                <p className={`text-2xl font-bold ${reportData.cashFlow.financingCashFlow > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                  {formatCurrency(reportData.cashFlow.financingCashFlow)}
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Net Cash Flow</p>
                <p className={`text-2xl font-bold ${reportData.cashFlow.netCashFlow > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(reportData.cashFlow.netCashFlow)}
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Cash Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(reportData.cashFlow.cashBalance)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Comparisons */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Comparisons</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ComparisonCard
            title="vs Previous Period"
            current={{
              revenue: reportData.financialMetrics.netRevenue,
              expenses: reportData.financialMetrics.operatingExpenses,
              profit: reportData.financialMetrics.netProfit,
              profitMargin: reportData.financialMetrics.netProfitMargin,
              variance: reportData.comparison.previousPeriod.variance,
              variancePercentage: reportData.comparison.previousPeriod.variancePercentage
            }}
            previous={reportData.comparison.previousPeriod}
            label="Previous"
          />
          <ComparisonCard
            title="vs Year to Date"
            current={{
              revenue: reportData.financialMetrics.netRevenue,
              expenses: reportData.financialMetrics.operatingExpenses,
              profit: reportData.financialMetrics.netProfit,
              profitMargin: reportData.financialMetrics.netProfitMargin,
              variance: reportData.comparison.yearToDate.variance,
              variancePercentage: reportData.comparison.yearToDate.variancePercentage
            }}
            previous={reportData.comparison.yearToDate}
            label="YTD Avg"
          />
          <ComparisonCard
            title="vs Budget"
            current={{
              revenue: reportData.financialMetrics.netRevenue,
              expenses: reportData.financialMetrics.operatingExpenses,
              profit: reportData.financialMetrics.netProfit,
              profitMargin: reportData.financialMetrics.netProfitMargin,
              variance: reportData.comparison.budget.variance,
              variancePercentage: reportData.comparison.budget.variancePercentage
            }}
            previous={reportData.comparison.budget}
            label="Budget"
          />
        </div>
      </div>

      {/* Efficiency Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Operational Efficiency</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="ROE"
            value={`${reportData.keyRatios.returnOnEquity.toFixed(1)}%`}
            icon={Users}
            color="bg-pink-500"
            subtitle="Return on Equity"
            trend={{
              value: reportData.keyRatios.returnOnEquity > 15 ? "Excellent" : "Good",
              isPositive: reportData.keyRatios.returnOnEquity > 10
            }}
          />
          <KPICard
            title="Inventory Turnover"
            value={reportData.keyRatios.inventoryTurnover.toFixed(1)}
            icon={BarChart3}
            color="bg-yellow-500"
            subtitle="Times per year"
            trend={{
              value: reportData.keyRatios.inventoryTurnover > 6 ? "Efficient" : "Needs improvement",
              isPositive: reportData.keyRatios.inventoryTurnover > 6
            }}
          />
          <KPICard
            title="Receivables Turnover"
            value={reportData.keyRatios.receivablesTurnover.toFixed(1)}
            icon={CreditCard}
            color="bg-emerald-500"
            subtitle="Times per year"
            trend={{
              value: reportData.keyRatios.receivablesTurnover > 12 ? "Good collection" : "Monitor closely",
              isPositive: reportData.keyRatios.receivablesTurnover > 12
            }}
          />
          <KPICard
            title="Operating Margin"
            value={`${reportData.financialMetrics.operatingProfitMargin.toFixed(1)}%`}
            icon={Target}
            color="bg-violet-500"
            subtitle="Operating efficiency"
            trend={{
              value: reportData.financialMetrics.operatingProfitMargin > 10 ? "Strong" : "Needs improvement",
              isPositive: reportData.financialMetrics.operatingProfitMargin > 5
            }}
          />
        </div>
      </div>

      {/* Key Insights and Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start">
          <AlertCircle className="h-6 w-6 text-blue-600 mr-3 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Key Insights & Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">Performance Highlights:</h4>
                <ul className="space-y-1">
                  <li>• Strong liquidity position with current ratio of {reportData.keyRatios.currentRatio.toFixed(2)}</li>
                  <li>• Healthy ROE of {reportData.keyRatios.returnOnEquity.toFixed(1)}% indicates good shareholder returns</li>
                  <li>• Efficient inventory management with {reportData.keyRatios.inventoryTurnover.toFixed(1)}x turnover</li>
                  <li>• Good receivables collection with {reportData.keyRatios.receivablesTurnover.toFixed(1)}x turnover</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Areas for Improvement:</h4>
                <ul className="space-y-1">
                  <li>• Net profit margin of {reportData.financialMetrics.netProfitMargin.toFixed(1)}% could be improved</li>
                  <li>• Operating expenses represent {((reportData.financialMetrics.operatingExpenses / reportData.financialMetrics.grossRevenue) * 100).toFixed(1)}% of revenue</li>
                  <li>• Consider cost optimization strategies to improve margins</li>
                  <li>• Monitor cash flow trends for better financial planning</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-sm text-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="font-medium">Report Period:</span><br />
              {new Date(reportData.reportPeriod.fromDate).toLocaleDateString()} to {new Date(reportData.reportPeriod.toDate).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Generated:</span><br />
              {new Date(reportData.reportDate).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Period Type:</span><br />
              {reportData.reportPeriod.periodType.charAt(0).toUpperCase() + reportData.reportPeriod.periodType.slice(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}








