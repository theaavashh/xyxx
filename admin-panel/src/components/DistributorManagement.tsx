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
  Printer,
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
  RefreshCw,
  ChevronLeft,
  ChevronRight
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
    status: statusFilter === 'ALL' ? undefined : statusFilter as 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED',
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
      status: statusFilter === 'ALL' ? undefined : statusFilter as 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED',
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
      // Success - the deleteApplication hook should handle the UI update
      console.log('Application deleted successfully');
    } catch (error) {
      console.error('Failed to delete application:', error);
      // Show user-friendly error message
      alert('Failed to delete application. Please try again.');
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

  const handleApprovalSubmit = async (distributorId: string, products: Record<string, unknown>[], additionalData: Record<string, unknown>) => {
    try {
      // First approve the application with coverage data
      await approveApplicationWithCoverage(distributorId, 'Approved with offer letter', additionalData);
      
      // Then send the offer letter email
      await sendOfferLetter(distributorId, products, additionalData);
      
    } catch (error) {
      console.error('Failed to approve and send offer letter:', error);
      throw error;
    }
  };

  const approveApplicationWithCoverage = async (distributorId: string, notes: string, additionalData: Record<string, unknown>) => {
    try {
      const response = await fetch(`${config.apiUrl}/applications/dev/${distributorId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'APPROVED',
          reviewNotes: notes,
          // Include coverage data
          assignedProvinces: additionalData.assignedProvinces,
          assignedAreas: additionalData.assignedAreas,
          coverageNotes: additionalData.coverageNotes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve application');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error approving application with coverage:', error);
      throw error;
    }
  };

  const sendOfferLetter = async (distributorId: string, products: Record<string, unknown>[], additionalData: Record<string, unknown>) => {
    const distributor = applications.find(app => app.id === distributorId);
    if (!distributor) return;

    try {
      const response = await fetch(`${config.apiUrl}/applications/send-offer-letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem(config.tokenKey)}`,
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

  // Function to handle printing distributor form
  const handlePrintDistributorForm = (distributor: DistributorApplication) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      toast.error('Failed to open print window. Please allow pop-ups.');
      return;
    }

    // Create print-friendly HTML content
    const printContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Distributor Application Form - ${distributor.fullName}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 20px;
            line-height: 1.6;
            color: #1f2937;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #1f2937;
            padding-bottom: 20px;
          }
          .logo {
            margin-bottom: 15px;
            font-size: 24px;
            font-weight: bold;
            color: #4f46e5;
          }
          .title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #1f2937;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
            background: #f9fafb;
            padding: 8px;
            border-radius: 4px;
          }
          .field {
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .field-label {
            font-weight: 600;
            min-width: 200px;
            color: #374151;
          }
          .field-value {
            flex: 1;
            text-align: left;
            word-wrap: break-word;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .status-approved { background: #d1fae5; color: #065f46; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-rejected { background: #fee2e2; color: #991b1b; }
          .status-under_review { background: #dbeafe; color: #1e40af; }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
          @media print {
            body { margin: 15px; }
            .no-print { display: none; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">ZIP ZIP</div>
          <div class="title">Distributor Application Form</div>
          <div>
            Application ID: ${distributor.id.slice(-8)}<br>
            Date: ${new Date(distributor.createdAt).toLocaleDateString()}<br>
            Status: <span class="status-badge status-${distributor.status.toLowerCase()}">${distributor.status}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">👤 Personal Information</div>
          <div class="field">
            <span class="field-label">Full Name:</span>
            <span class="field-value">${distributor.fullName || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Email:</span>
            <span class="field-value">${distributor.email || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Mobile Number:</span>
            <span class="field-value">${distributor.mobileNumber || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Age:</span>
            <span class="field-value">${distributor.age || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Gender:</span>
            <span class="field-value">${distributor.gender || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Citizenship Number:</span>
            <span class="field-value">${distributor.citizenshipNumber || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Issued District:</span>
            <span class="field-value">${distributor.issuedDistrict || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Permanent Address:</span>
            <span class="field-value">${distributor.permanentAddress || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Temporary Address:</span>
            <span class="field-value">${distributor.temporaryAddress || 'N/A'}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">🏢 Business Information</div>
          <div class="field">
            <span class="field-label">Company Name:</span>
            <span class="field-value">${distributor.companyName || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Registration Number:</span>
            <span class="field-value">${distributor.registrationNumber || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">PAN/VAT Number:</span>
            <span class="field-value">${distributor.panVatNumber || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Office Address:</span>
            <span class="field-value">${distributor.officeAddress || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Work Area District:</span>
            <span class="field-value">${distributor.workAreaDistrict || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Desired Distribution Area:</span>
            <span class="field-value">${distributor.desiredDistributorArea || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Business Type:</span>
            <span class="field-value">${distributor.businessType?.replace('_', ' ') || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Current Business:</span>
            <span class="field-value">${distributor.currentBusiness || 'N/A'}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">👥 Staff & Infrastructure</div>
          <div class="field">
            <span class="field-label">Sales Executives:</span>
            <span class="field-value">${distributor.salesManCount || 0}</span>
          </div>
          <div class="field">
            <span class="field-label">Sales Executive Experience:</span>
            <span class="field-value">${distributor.salesManExperience || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Drivers:</span>
            <span class="field-value">${distributor.driverCount || 0}</span>
          </div>
          <div class="field">
            <span class="field-label">Driver Experience:</span>
            <span class="field-value">${distributor.driverExperience || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Helpers:</span>
            <span class="field-value">${distributor.helperCount || 0}</span>
          </div>
          <div class="field">
            <span class="field-label">Helper Experience:</span>
            <span class="field-value">${distributor.helperExperience || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Accountants:</span>
            <span class="field-value">${distributor.accountantCount || 0}</span>
          </div>
          <div class="field">
            <span class="field-label">Accountant Experience:</span>
            <span class="field-value">${distributor.accountantExperience || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Storage Space:</span>
            <span class="field-value">${distributor.storageSpace || 0} sq. ft.</span>
          </div>
          <div class="field">
            <span class="field-label">Storage Details:</span>
            <span class="field-value">${distributor.storageDetails || 'N/A'}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">🚚 Vehicle Information</div>
          <div class="field">
            <span class="field-label">Trucks:</span>
            <span class="field-value">${distributor.truckCount || 0} (${distributor.truckExperience || 'N/A'} experience)</span>
          </div>
          <div class="field">
            <span class="field-label">Four Wheelers:</span>
            <span class="field-value">${distributor.fourWheelerCount || 0} (${distributor.fourWheelerExperience || 'N/A'} experience)</span>
          </div>
          <div class="field">
            <span class="field-label">Motorcycles:</span>
            <span class="field-value">${distributor.motorcycleCount || 0} (${distributor.motorcycleExperience || 'N/A'} experience)</span>
          </div>
          <div class="field">
            <span class="field-label">Cycles:</span>
            <span class="field-value">${distributor.cycleCount || 0} (${distributor.cycleExperience || 'N/A'} experience)</span>
          </div>
          <div class="field">
            <span class="field-label">Thelas:</span>
            <span class="field-value">${distributor.thelaCount || 0} (${distributor.thelaExperience || 'N/A'} experience)</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">🤝 Partnership Information</div>
          <div class="field">
            <span class="field-label">Partner Full Name:</span>
            <span class="field-value">${distributor.partnerFullName || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Partner Age:</span>
            <span class="field-value">${distributor.partnerAge || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Partner Gender:</span>
            <span class="field-value">${distributor.partnerGender || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Partner Citizenship Number:</span>
            <span class="field-value">${distributor.partnerCitizenshipNumber || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Partner Issued District:</span>
            <span class="field-value">${distributor.partnerIssuedDistrict || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Partner Mobile Number:</span>
            <span class="field-value">${distributor.partnerMobileNumber || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Partner Email:</span>
            <span class="field-value">${distributor.partnerEmail || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Partner Permanent Address:</span>
            <span class="field-value">${distributor.partnerPermanentAddress || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Partner Temporary Address:</span>
            <span class="field-value">${distributor.partnerTemporaryAddress || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Credit Days:</span>
            <span class="field-value">${distributor.creditDays || 0}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">📄 Additional Information</div>
          <div class="field">
            <span class="field-label">Additional Information:</span>
            <span class="field-value">${distributor.additionalInfo || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Agreement Accepted:</span>
            <span class="field-value">${distributor.agreementAccepted ? '✅ Yes' : '❌ No'}</span>
          </div>
          <div class="field">
            <span class="field-label">Application Status:</span>
            <span class="field-value">
              <span class="status-badge status-${distributor.status.toLowerCase()}">${distributor.status}</span>
            </span>
          </div>
          <div class="field">
            <span class="field-label">Submitted Date:</span>
            <span class="field-value">${new Date(distributor.createdAt).toLocaleString()}</span>
          </div>
          <div class="field">
            <span class="field-label">Last Updated:</span>
            <span class="field-value">${new Date(distributor.updatedAt).toLocaleString()}</span>
          </div>
        </div>

        <div class="footer">
          <p><strong>ZIP ZIP Distributor Application</strong></p>
          <p>Application ID: ${distributor.id}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>This is a computer-generated document and does not require a signature.</p>
        </div>
      </body>
      </html>
    `;

    // Write content to the new window
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        
        toast.success('Distributor form printed successfully!');
      }, 500);
    };
  };

  // Function to handle downloading distributor form as PDF
  const handleDownloadDistributorForm = async (distributor: DistributorApplication) => {
    try {
      // Create a temporary window for PDF generation
      const pdfWindow = window.open('', '_blank');
      
      if (!pdfWindow) {
        toast.error('Failed to open download window. Please allow pop-ups.');
        return;
      }

      // Generate the same content as print but optimized for PDF
      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Distributor Application - ${distributor.fullName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .section { margin-bottom: 20px; page-break-inside: avoid; }
            .section-title { font-weight: bold; margin-bottom: 10px; background: #f5f5f5; padding: 8px; }
            .field { margin-bottom: 8px; display: flex; justify-content: space-between; }
            .field-label { font-weight: 600; min-width: 200px; }
            .field-value { flex: 1; }
            @media print { body { margin: 10px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>ZIP ZIP - Distributor Application</h2>
            <p>Application ID: ${distributor.id.slice(-8)}</p>
            <p>Date: ${new Date(distributor.createdAt).toLocaleDateString()}</p>
            <p>Status: ${distributor.status}</p>
          </div>
          
          <div class="section">
            <div class="section-title">Personal Information</div>
            <div class="field"><span class="field-label">Name:</span><span class="field-value">${distributor.fullName}</span></div>
            <div class="field"><span class="field-label">Email:</span><span class="field-value">${distributor.email}</span></div>
            <div class="field"><span class="field-label">Mobile:</span><span class="field-value">${distributor.mobileNumber}</span></div>
            <div class="field"><span class="field-label">Address:</span><span class="field-value">${distributor.permanentAddress}</span></div>
          </div>
          
          <div class="section">
            <div class="section-title">Business Information</div>
            <div class="field"><span class="field-label">Company:</span><span class="field-value">${distributor.companyName}</span></div>
            <div class="field"><span class="field-label">Registration:</span><span class="field-value">${distributor.registrationNumber}</span></div>
            <div class="field"><span class="field-label">PAN/VAT:</span><span class="field-value">${distributor.panVatNumber}</span></div>
            <div class="field"><span class="field-label">Office Address:</span><span class="field-value">${distributor.officeAddress}</span></div>
          </div>
          
          <div class="section">
            <div class="section-title">Staff & Infrastructure</div>
            <div class="field"><span class="field-label">Sales Executives:</span><span class="field-value">${distributor.salesManCount || 0}</span></div>
            <div class="field"><span class="field-label">Drivers:</span><span class="field-value">${distributor.driverCount || 0}</span></div>
            <div class="field"><span class="field-label">Storage Space:</span><span class="field-value">${distributor.storageSpace || 0} sq. ft.</span></div>
          </div>
          
          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
            <p>Generated by ZIP ZIP Distributor System</p>
            <p>Application ID: ${distributor.id}</p>
          </div>
        </body>
        </html>
      `;

      pdfWindow.document.write(pdfContent);
      pdfWindow.document.close();
      
      // Wait for content to load, then trigger download
      pdfWindow.onload = () => {
        setTimeout(() => {
          pdfWindow.print();
          pdfWindow.close();
          
          toast.success('PDF download initiated! Check your downloads folder.');
        }, 500);
      };

    } catch (error) {
      console.error('Error downloading form:', error);
      toast.error('Failed to download form. Please try again.');
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
                    onClick={() => handlePrintDistributorForm(distributor)}
                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                    title="Print Form"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadDistributorForm(distributor)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Download PDF"
                  >
                    <Download className="h-4 w-4" />
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            {/* Pagination Info */}
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} applications
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => updateFilters({ page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => updateFilters({ page: pageNum })}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        pagination.page === pageNum
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => updateFilters({ page: pagination.page + 1 })}
                disabled={!pagination.hasNext}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

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
        initialData={selectedDistributor as DistributorApplication | null}
      />

      <ViewDistributorModal
        key={`view-${selectedDistributor?.id || 'new'}`}
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        distributor={selectedDistributor as DistributorApplication | null}
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

