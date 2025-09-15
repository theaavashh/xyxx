'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';

import PurchaseEntry from '@/components/PurchaseEntry';

export default function PurchaseEntryPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <PurchaseEntry />
      </div>
    </DashboardLayout>
  );
}
