'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

import BalanceSheet from '@/components/BalanceSheet';

export default function BalanceSheetPage() {
  const [activeTab, setActiveTab] = useState('balance-sheet');
  
  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="p-6">
        <BalanceSheet />
      </div>
    </DashboardLayout>
  );
}
