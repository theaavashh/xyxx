'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';

import TrialBalance from '@/components/TrialBalance';

export default function TrialBalancePage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <TrialBalance />
      </div>
    </DashboardLayout>
  );
}
