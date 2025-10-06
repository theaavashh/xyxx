'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import SalesReturn from '@/components/SalesReturn';

export default function SalesReturnPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <SalesReturn />
      </div>
    </DashboardLayout>
  );
}

