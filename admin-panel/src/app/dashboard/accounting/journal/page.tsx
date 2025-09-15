'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

import JournalEntry from '@/components/JournalEntry';

export default function JournalEntryPage() {
  const [activeTab, setActiveTab] = useState('journal');
  
  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="p-6">
        <JournalEntry />
      </div>
    </DashboardLayout>
  );
}
