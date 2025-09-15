'use client';

import React from 'react';
import { DistributorApplication } from '@/lib/api';

interface ApplicationDetailsModalProps {
  application: DistributorApplication | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplicationDetailsModal({
  application,
  isOpen,
  onClose,
}: ApplicationDetailsModalProps) {
  if (!isOpen || !application) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    UNDER_REVIEW: 'bg-blue-100 text-blue-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    REQUIRES_CHANGES: 'bg-orange-100 text-orange-800',
  };

  const statusLabels = {
    PENDING: 'Pending',
    UNDER_REVIEW: 'Under Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    REQUIRES_CHANGES: 'Requires Changes',
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {application.fullName || 'N/A'}
              </h3>
              <p className="text-gray-600">{application.companyName || 'N/A'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusColors[application.status]}`}>
                {statusLabels[application.status]}
              </span>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Full Name:</span>
                  <p className="text-sm text-gray-900">{application.fullName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Age:</span>
                  <p className="text-sm text-gray-900">{application.age || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Gender:</span>
                  <p className="text-sm text-gray-900">{application.gender || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Citizenship Number:</span>
                  <p className="text-sm text-gray-900">{application.citizenshipNumber || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Issued District:</span>
                  <p className="text-sm text-gray-900">{application.issuedDistrict || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Mobile Number:</span>
                  <p className="text-sm text-gray-900">{application.mobileNumber || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Email:</span>
                  <p className="text-sm text-gray-900">{application.email || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Permanent Address:</span>
                  <p className="text-sm text-gray-900">{application.permanentAddress || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Temporary Address:</span>
                  <p className="text-sm text-gray-900">{application.temporaryAddress || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Company Name:</span>
                  <p className="text-sm text-gray-900">{application.companyName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Registration Number:</span>
                  <p className="text-sm text-gray-900">{application.registrationNumber || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">PAN/VAT Number:</span>
                  <p className="text-sm text-gray-900">{application.panVatNumber || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Office Address:</span>
                  <p className="text-sm text-gray-900">{application.officeAddress || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Operating Area:</span>
                  <p className="text-sm text-gray-900">{application.operatingArea || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Desired Distributor Area:</span>
                  <p className="text-sm text-gray-900">{application.desiredDistributorArea || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Current Business:</span>
                  <p className="text-sm text-gray-900">{application.currentBusiness || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Business Type:</span>
                  <p className="text-sm text-gray-900">{application.businessType || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Transactions */}
          {application.currentTransactions && application.currentTransactions.length > 0 && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Current Transactions</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Turnover</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {application.currentTransactions.map((transaction, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{transaction.company}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{transaction.products}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">NPR {transaction.turnover?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Products to Distribute */}
          {application.productsToDistribute && application.productsToDistribute.length > 0 && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Products to Distribute</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monthly Sales Capacity</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {application.productsToDistribute.map((product, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{product.productName}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{product.monthlySalesCapacity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Area Coverage Details */}
          {application.areaCoverageDetails && application.areaCoverageDetails.length > 0 && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Area Coverage Details</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Distribution Area</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Population Estimate</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Competitor Brand</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {application.areaCoverageDetails.map((area, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{area.distributionArea}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{area.populationEstimate?.toLocaleString()}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{area.competitorBrand}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Application History */}
          {application.applicationHistory && application.applicationHistory.length > 0 && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Application History</h4>
              <div className="space-y-3">
                {application.applicationHistory.map((history, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 bg-blue-400 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{history.status}</span>
                        <span className="text-xs text-gray-500">{formatDate(history.changedAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{history.notes}</p>
                      <p className="text-xs text-gray-500">Changed by: {history.changedBy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


