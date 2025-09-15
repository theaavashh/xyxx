'use client';

import ApplicationsManagement from '@/components/ApplicationsManagement';
import NavigationTabs from '@/components/NavigationTabs';

export default function ApplicationsPage() {
  return (
    <>
      {/* Navigation Header */}
      <NavigationTabs />
      
      {/* Main Content */}
      <div className="min-h-screen bg-gray-50">
        <ApplicationsManagement />
      </div>
    </>
  );
}