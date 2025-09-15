'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavigationTabs() {
  const pathname = usePathname();

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gray-900">Distributor Portal</h1>
            <nav className="flex space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Submit Application
              </Link>
              <Link
                href="/applications"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/applications'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                View Applications
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}


