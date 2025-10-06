'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PurchaseReturn from '@/components/PurchaseReturn';

export default function PurchaseReturnPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <PurchaseReturn />
      </div>
    </DashboardLayout>
  );
}

