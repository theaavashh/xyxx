'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';

import PartyLedger from '@/components/PartyLedger';

export default function PartyLedgerPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <PartyLedger />
      </div>
    </DashboardLayout>
  );
}
