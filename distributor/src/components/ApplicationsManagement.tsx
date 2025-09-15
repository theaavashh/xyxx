'use client';

import React, { useState } from 'react';
import { useApplications } from '@/hooks/useApplications';
import { DistributorApplication, apiService } from '@/lib/api';
import ApplicationsTable from './ApplicationsTable';
import ApplicationDetailsModal from './ApplicationDetailsModal';
import ApiTest from './ApiTest';

export default function ApplicationsManagement() {
  const [selectedApplication, setSelectedApplication] = useState<DistributorApplication | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const {
    applications,
    loading,
    error,
    pagination,
    refetch,
    updateFilters,
    updateApplicationStatus,
    getApplicationById,
  } = useApplications({
    search: searchTerm,
    status: statusFilter as any,
    sortBy,
    sortOrder,
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    updateFilters({ search: value });
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    updateFilters({ status: value as any });
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    updateFilters({ sortBy: field, sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
  };

  const handleViewDetails = (application: DistributorApplication) => {
    setSelectedApplication(application);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (application: DistributorApplication) => {
    // TODO: Implement edit functionality
    console.log('Edit application:', application);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      // TODO: Implement delete functionality
      console.log('Delete application:', id);
    }
  };

  const handleStatusUpdate = async (id: string, status: string, notes?: string) => {
    try {
      await updateApplicationStatus(id, status, notes);
      // Show success message or toast
      console.log('Status updated successfully');
    } catch (error) {
      console.error('Failed to update status:', error);
      // Show error message or toast
    }
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Distributor Applications</h1>
            <p className="text-gray-600">Manage and review distributor applications</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={refetch}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Refresh
            </button>
            <button
              onClick={async () => {
                console.log('🧪 Testing API connection...');
                try {
                  const response = await fetch('http://localhost:5000/api/applications/dev');
                  const data = await response.json();
                  console.log('✅ API Test Response:', data);
                  alert(`API Test Success! Found ${data.data?.length || 0} applications`);
                } catch (error) {
                  console.error('❌ API Test Error:', error);
                  alert(`API Test Failed: ${error.message}`);
                }
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Test API
            </button>
            <button
              onClick={async () => {
                console.log('🧪 Testing useApplications hook...');
                try {
                  const response = await apiService.getApplications();
                  console.log('✅ Hook Test Response:', response);
                  alert(`Hook Test Success! Found ${response.data?.length || 0} applications`);
                } catch (error) {
                  console.error('❌ Hook Test Error:', error);
                  alert(`Hook Test Failed: ${error.message}`);
                }
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
            >
              Test Hook
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="REQUIRES_CHANGES">Requires Changes</option>
            </select>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
                updateFilters({ sortBy: field, sortOrder: order as 'asc' | 'desc' });
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="fullName-asc">Name A-Z</option>
              <option value="fullName-desc">Name Z-A</option>
              <option value="companyName-asc">Company A-Z</option>
              <option value="companyName-desc">Company Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Debug Info - Temporary for debugging */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium">Applications Data:</h4>
            <p>Count: {applications.length}</p>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            <p>Error: {error || 'None'}</p>
          </div>
          <div>
            <h4 className="font-medium">Pagination:</h4>
            <p>Page: {pagination?.page || 'N/A'}</p>
            <p>Total: {pagination?.total || 'N/A'}</p>
            <p>Total Pages: {pagination?.totalPages || 'N/A'}</p>
          </div>
        </div>
        {applications.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium">First Application:</h4>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(applications[0], null, 2)}
            </pre>
          </div>
        )}
        <ApiTest />
      </div>

      {/* Applications Table */}
      <div className="bg-white shadow rounded-lg">
        <ApplicationsTable
          applications={applications}
          loading={loading}
          error={error}
          onStatusUpdate={handleStatusUpdate}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {((pagination.page - 1) * pagination.limit) + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.total}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === pagination.page
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        application={selectedApplication}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedApplication(null);
        }}
      />
    </div>
  );
}
