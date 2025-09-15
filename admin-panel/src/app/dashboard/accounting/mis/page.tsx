'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';

import { BarChart3 } from 'lucide-react';

export default function MISReportsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MIS Reports</h1>
                <p className="text-gray-600">Management Information System reports for decision making</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                    <BarChart3 className="h-8 w-8 text-pink-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">MIS Reports Module</h3>
                  <p className="text-gray-600 mb-4">Generate comprehensive management reports for business intelligence</p>
                  <div className="text-sm text-gray-500">
                    Features coming soon:
                  </div>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• Financial performance dashboards</li>
                    <li>• Trend analysis and forecasting</li>
                    <li>• KPI monitoring and alerts</li>
                    <li>• Executive summary reports</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
    </DashboardLayout>
  );
}
