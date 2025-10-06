'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  RefreshCw
} from 'lucide-react';
import { Distributor } from '@/types';
import { formatDate } from '@/lib/utils';
import CreateDistributorModal from './CreateDistributorModal';
import ViewDistributorModal from './ViewDistributorModal';
import DistributorApprovalModal from './DistributorApprovalModal';
import toast from 'react-hot-toast';
import { config } from '@/lib/config';
import { useDistributorApplications } from '@/hooks/useDistributorApplications';
import { DistributorApplication } from '@/lib/distributorApi';

export default function DistributorManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState<DistributorApplication | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Use the custom hook for managing applications
  const {
    applications,
    loading,
    error,
    pagination,
    refetch,
    updateFilters,
    approveApplication,
    rejectApplication,
    deleteApplication,
    getApplicationById,
  } = useDistributorApplications({
    search: searchTerm,
    status: statusFilter === 'ALL' ? undefined : statusFilter as any,
  });


  // Memoized modal event handlers to prevent infinite re-renders
  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setSelectedDistributor(null);
    setIsEditing(false);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    // Re-fetch applications after successful creation
    refetch();
    setIsCreateModalOpen(false);
    setSelectedDistributor(null);
    setIsEditing(false);
  }, [refetch]);

  const handleCloseViewModal = useCallback(() => {
    setIsViewModalOpen(false);
    setSelectedDistributor(null);
  }, []);

  const handleCloseApprovalModal = useCallback(() => {
    setIsApprovalModalOpen(false);
    setSelectedDistributor(null);
  }, []);

  // Update filters when search term or status changes
  useEffect(() => {
    updateFilters({
      search: searchTerm || undefined,
      status: statusFilter === 'ALL' ? undefined : statusFilter as any,
    });
  }, [searchTerm, statusFilter, updateFilters]);

  const handleCreateDistributor = () => {
    setSelectedDistributor(null);
    setIsEditing(false);
    setIsCreateModalOpen(true);
  };

  const handleEditDistributor = (distributor: DistributorApplication) => {
    // Create a deep copy to prevent shared state issues
    const distributorCopy = JSON.parse(JSON.stringify(distributor));
    setSelectedDistributor(distributorCopy);
    setIsEditing(true);
    setIsCreateModalOpen(true);
  };

  const handleViewDistributor = (distributor: DistributorApplication) => {
    // Create a deep copy to prevent shared state issues
    const distributorCopy = JSON.parse(JSON.stringify(distributor));
    setSelectedDistributor(distributorCopy);
    setIsViewModalOpen(true);
  };

  const handleDeleteDistributor = async (distributorId: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
      await deleteApplication(distributorId);
    } catch (error) {
      console.error('Failed to delete application:', error);
    }
  };

  const handleApproveDistributor = async (distributorId: string) => {
    const distributor = applications.find(app => app.id === distributorId);
    if (distributor) {
      // Create a deep copy to prevent shared state issues
      const distributorCopy = JSON.parse(JSON.stringify(distributor));
      setSelectedDistributor(distributorCopy);
      setIsApprovalModalOpen(true);
    }
  };

  const handleApprovalSubmit = async (distributorId: string, products: any[], additionalData: any) => {
    try {
      // First approve the application
      await approveApplication(distributorId, 'Approved with offer letter');
      
      // Then send the offer letter email
      await sendOfferLetter(distributorId, products, additionalData);
      
    } catch (error) {
      console.error('Failed to approve and send offer letter:', error);
      throw error;
    }
  };

  const sendOfferLetter = async (distributorId: string, products: any[], additionalData: any) => {
    const distributor = applications.find(app => app.id === distributorId);
    if (!distributor) return;

    try {
      const response = await fetch('http://localhost:5000/api/applications/send-offer-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          distributorId,
          products,
          additionalData,
          distributorInfo: {
            fullName: distributor.fullName,
            email: distributor.email,
            contactNumber: distributor.mobileNumber,
            address: distributor.permanentAddress,
            companyName: distributor.companyName,
            distributionArea: distributor.desiredDistributorArea
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send offer letter');
      }

      toast.success('Offer letter sent successfully!');
    } catch (error) {
      console.error('Error sending offer letter:', error);
      throw error;
    }
  };

  const handleRejectDistributor = async (distributorId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await rejectApplication(distributorId, reason);
    } catch (error) {
      console.error('Failed to reject application:', error);
    }
  };

  // Applications are already filtered by the API, so we can use them directly
  const filteredDistributors = applications || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'UNDER_REVIEW':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'REQUIRES_CHANGES':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800';
      case 'REQUIRES_CHANGES':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Distributor Management</h1>
          <p className="text-gray-600">Manage distributor applications and accounts</p>
          {error && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={refetch}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleCreateDistributor}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Distributor
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search distributors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="REQUIRES_CHANGES">Requires Changes</option>
          </select>
        </div>
      </div>

      {/* Distributors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredDistributors && filteredDistributors.length > 0 ? filteredDistributors.map((distributor) => (
            <motion.div
              key={distributor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(distributor.status)}`}>
                  {getStatusIcon(distributor.status)}
                  <span className="ml-1">{distributor.status}</span>
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleViewDistributor(distributor)}
                    className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditDistributor(distributor)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDistributor(distributor.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Person Info */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-900">
                    {distributor.fullName}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <Mail className="h-3 w-3 mr-2" />
                  {distributor.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-3 w-3 mr-2" />
                  {distributor.mobileNumber}
                </div>
              </div>

              {/* Company Info */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Building className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-900 text-sm">
                    {distributor.companyName}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <MapPin className="h-3 w-3 mr-2" />
                  {distributor.officeAddress}
                </div>
                <div className="text-xs text-gray-500">
                  {distributor.businessType?.replace('_', ' ')}
                </div>
              </div>

              {/* Documents - Simplified for now */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Application</span>
                  <span className="text-xs text-gray-500">
                    ID: {distributor.id.slice(-8)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                    <FileText className="h-3 w-3 mr-1" />
                    Application Form
                  </span>
                </div>
              </div>

              {/* Created Date */}
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                Created {formatDate(new Date(distributor.createdAt))}
              </div>

              {/* Action Buttons for Pending/Under Review Status */}
              {(distributor.status === 'PENDING' || distributor.status === 'UNDER_REVIEW') && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleApproveDistributor(distributor.id)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectDistributor(distributor.id)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}
            </motion.div>
          )) : null}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {(!filteredDistributors || filteredDistributors.length === 0) && (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'ALL' 
              ? 'Try adjusting your search criteria' 
              : 'No distributor applications have been submitted yet'
            }
          </p>
          {!searchTerm && statusFilter === 'ALL' && (
            <button
              onClick={refetch}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateDistributorModal
        key={`create-${selectedDistributor?.id || 'new'}`}
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleCreateSuccess}
        editMode={isEditing}
        initialData={selectedDistributor as any}
      />

      <ViewDistributorModal
        key={`view-${selectedDistributor?.id || 'new'}`}
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        distributor={selectedDistributor as any}
      />

      <DistributorApprovalModal
        key={`approval-${selectedDistributor?.id || 'new'}`}
        isOpen={isApprovalModalOpen}
        onClose={handleCloseApprovalModal}
        onApprove={handleApprovalSubmit}
        distributor={selectedDistributor}
      />
    </div>
  );
}

