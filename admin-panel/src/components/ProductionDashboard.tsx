'use client';

import React, { useState, useEffect } from 'react';
import { 
  Factory, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Users,
  Settings,
  Package,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Filter
} from 'lucide-react';
import { 
  ProductionKPIs, 
  ProductionReport, 
  WorkCenterEfficiency, 
  MachineEfficiency,
  WorkCenterPerformance,
  ProductPerformance,
  QualityReport,
  MaterialUsageReport
} from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { productionService } from '@/services/production.service';
import toast from 'react-hot-toast';

export default function ProductionDashboard() {
  const [kpis, setKpis] = useState<ProductionKPIs | null>(null);
  const [report, setReport] = useState<ProductionReport | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorkCenter, setSelectedWorkCenter] = useState<string>('all');

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [kpisData, reportData] = await Promise.all([
        productionService.getProductionKPIs(selectedPeriod),
        productionService.getProductionReport(selectedPeriod, 
          new Date().toISOString().split('T')[0], 
          new Date().toISOString().split('T')[0]
        )
      ]);
      
      setKpis(kpisData);
      setReport(reportData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadData();
    toast.success('Dashboard data refreshed');
  };

  const handleExport = async () => {
    try {
      const blob = await productionService.exportProductionReport(
        selectedPeriod, 
        new Date().toISOString().split('T')[0], 
        new Date().toISOString().split('T')[0]
      );
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `production-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Production report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export production report');
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyBgColor = (efficiency: number) => {
    if (efficiency >= 90) return 'bg-green-100';
    if (efficiency >= 80) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-100';
      case 'fail': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading production dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!kpis || !report) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Unable to load production dashboard data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time production analytics and performance metrics</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overall Efficiency</p>
              <p className={`text-2xl font-bold ${getEfficiencyColor(kpis.efficiency.overallEfficiency)}`}>
                {kpis.efficiency.overallEfficiency}%
              </p>
              <p className="text-xs text-gray-500">+2.3% from last period</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">First Pass Yield</p>
              <p className={`text-2xl font-bold ${getEfficiencyColor(kpis.quality.firstPassYield)}`}>
                {kpis.quality.firstPassYield}%
              </p>
              <p className="text-xs text-gray-500">Quality performance</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Units Produced</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.productivity.unitsProduced.toLocaleString()}</p>
              <p className="text-xs text-gray-500">This {selectedPeriod}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cost Per Unit</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.costs.costPerUnit)}</p>
              <p className="text-xs text-gray-500">Average production cost</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Center Efficiency */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Work Center Efficiency</h3>
            <Settings className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {kpis.efficiency.workCenterEfficiency.map((workCenter) => (
              <div key={workCenter.workCenterId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-900">{workCenter.workCenterName}</h4>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getEfficiencyBgColor(workCenter.efficiency)} ${getEfficiencyColor(workCenter.efficiency)}`}>
                    {workCenter.efficiency}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full ${workCenter.efficiency >= 90 ? 'bg-green-500' : workCenter.efficiency >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${workCenter.efficiency}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>Planned: {workCenter.plannedHours}h</div>
                  <div>Actual: {workCenter.actualHours}h</div>
                  <div>Utilization: {workCenter.utilization}%</div>
                  <div>Efficiency: {workCenter.efficiency}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quality Performance</h3>
            <Eye className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{kpis.quality.firstPassYield}%</div>
                <div className="text-sm text-gray-600">First Pass Yield</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{kpis.quality.defectRate}%</div>
                <div className="text-sm text-gray-600">Defect Rate</div>
              </div>
            </div>
            <div className="space-y-3">
              {report.qualityMetrics.map((metric, index) => (
                <div key={index} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{metric.metric}</div>
                    <div className="text-sm text-gray-600">Target: {metric.target}% | Actual: {metric.actual}%</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(metric.status)}`}>
                    {metric.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Production Summary and Material Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Summary</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{report.summary.totalOrders}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{report.summary.completedOrders}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Units Produced</span>
                <span className="font-medium">{report.summary.totalUnitsProduced.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Units Rejected</span>
                <span className="font-medium text-red-600">{report.summary.totalUnitsRejected}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Overall Efficiency</span>
                <span className="font-medium">{report.summary.overallEfficiency}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Costs</span>
                <span className="font-medium">{formatCurrency(report.summary.totalCosts)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Material Usage */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Material Usage</h3>
          <div className="space-y-4">
            {report.materialUsage.map((material) => (
              <div key={material.materialId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-900">{material.materialName}</h4>
                  <span className="text-sm text-gray-600">{formatCurrency(material.cost)}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                  <div>Planned: {material.plannedQuantity}</div>
                  <div>Actual: {material.actualQuantity}</div>
                  <div>Variance: {material.variance}</div>
                  <div>Wastage: {material.wastage}</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(material.actualQuantity / material.plannedQuantity) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Performance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Product Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units Produced
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yield
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Cycle Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cost
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {report.productPerformance.map((product) => (
                <tr key={product.productId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                    <div className="text-sm text-gray-500">{product.productId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.ordersCompleted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.unitsProduced.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{product.yield}%</div>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${product.yield >= 95 ? 'bg-green-500' : product.yield >= 90 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${product.yield}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.averageCycleTime}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(product.costs)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivery Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">On-Time Delivery</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.delivery.onTimeDelivery}%</p>
              <p className="text-xs text-gray-500">Delivery performance</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Lead Time</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.delivery.averageLeadTime} days</p>
              <p className="text-xs text-gray-500">From order to delivery</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Schedule Adherence</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.delivery.scheduleAdherence}%</p>
              <p className="text-xs text-gray-500">Production schedule compliance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
