'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';

import LedgerManagement from '@/components/LedgerManagement';

export default function LedgerManagementPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <LedgerManagement />
      </div>
    </DashboardLayout>
  );
}
