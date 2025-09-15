'use client';

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  onNavigate?: (href: string) => void;
}

export default function Breadcrumb({ items, className = '', onNavigate }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center space-x-1 text-sm text-gray-600 ${className}`} aria-label="Breadcrumb">
      <button 
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
        onClick={() => {
          if (onNavigate) {
            onNavigate('/dashboard');
          }
        }}
      >
        <Home className="h-4 w-4 text-gray-400" />
        <span className="ml-1">Home</span>
      </button>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
          {item.active ? (
            <span className="font-medium text-gray-900" aria-current="page">
              {item.label}
            </span>
          ) : item.href ? (
            <button 
              className="text-gray-500 hover:text-gray-700 transition-colors"
              onClick={() => {
                if (onNavigate && item.href) {
                  onNavigate(item.href);
                }
              }}
            >
              {item.label}
            </button>
          ) : (
            <span className="text-gray-500">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

// Helper function to get breadcrumb items based on active tab
export function getBreadcrumbItems(activeTab: string): BreadcrumbItem[] {
  const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
    dashboard: [
      { label: 'Dashboard', active: true }
    ],
    employees: [
      { label: 'Management', href: '/dashboard' },
      { label: 'Employee Management', active: true }
    ],
    'create-employee': [
      { label: 'Management', href: '/dashboard' },
      { label: 'Employee Management', href: '/employees' },
      { label: 'Create Employee', active: true }
    ],
    orders: [
      { label: 'Sales', href: '/dashboard' },
      { label: 'Order Management', active: true }
    ],
    customers: [
      { label: 'Sales', href: '/dashboard' },
      { label: 'Distributors', active: true }
    ],
    'create-distributor': [
      { label: 'Sales', href: '/dashboard' },
      { label: 'Distributors', href: '/customers' },
      { label: 'Create Distributor', active: true }
    ],
    'vat-bills': [
      { label: 'Accounting', href: '/dashboard' },
      { label: 'VAT Bills', active: true }
    ],
    ledger: [
      { label: 'Accounting', href: '/dashboard' },
      { label: 'General Ledger', active: true }
    ],
    journal: [
      { label: 'Accounting', href: '/dashboard' },
      { label: 'Journal Entries', active: true }
    ],
    accounts: [
      { label: 'Accounting', href: '/dashboard' },
      { label: 'Chart of Accounts', active: true }
    ],
    'production-orders': [
      { label: 'Production', href: '/dashboard' },
      { label: 'Production Orders', active: true }
    ],
    'production-planning': [
      { label: 'Production', href: '/dashboard' },
      { label: 'Production Planning', active: true }
    ],
    reports: [
      { label: 'Analytics', href: '/dashboard' },
      { label: 'Reports & Analytics', active: true }
    ]
  };

  return breadcrumbMap[activeTab] || [{ label: 'Dashboard', active: true }];
}
