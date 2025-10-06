'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Invoice from '@/components/Invoice';

export default function InvoicePage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <Invoice />
      </div>
    </DashboardLayout>
  );
}

