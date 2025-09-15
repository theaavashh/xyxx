'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';

import { Receipt } from 'lucide-react';

export default function VATReportsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">VAT Reports</h1>
                <p className="text-gray-600">Generate VAT reports for Nepal tax compliance</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Receipt className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">VAT Reports Module</h3>
                  <p className="text-gray-600 mb-4">Generate comprehensive VAT reports for Nepal tax compliance</p>
                  <div className="text-sm text-gray-500">
                    Features coming soon:
                  </div>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• Monthly VAT summaries</li>
                    <li>• Input vs Output VAT analysis</li>
                    <li>• Nepal tax authority compliance</li>
                    <li>• Export to Excel/PDF</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
    </DashboardLayout>
  );
}
