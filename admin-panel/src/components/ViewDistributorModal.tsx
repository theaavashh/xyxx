'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar,
  FileText,
  Download,
  ExternalLink,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Distributor } from '@/types';
import { DistributorApplication } from '@/lib/distributorApi';
import { formatDate } from '@/lib/utils';
import { config } from '@/lib/config';

interface ViewDistributorModalProps {
  isOpen: boolean;
  onClose: () => void;
  distributor: DistributorApplication | null;
}

interface DocumentPreview {
  name: string;
  url: string;
  type: string;
}

export default function ViewDistributorModal({ 
  isOpen, 
  onClose, 
  distributor 
}: ViewDistributorModalProps) {
  const [previewDoc, setPreviewDoc] = useState<DocumentPreview | null>(null);
  
  if (!distributor) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'UNDER_REVIEW':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'REQUIRES_CHANGES':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REQUIRES_CHANGES':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const downloadDocument = (doc: any) => {
    // Construct full URL for the document
    const fullUrl = doc.url.startsWith('http') ? doc.url : `${config.apiUrl.replace('/api', '')}/${doc.url}`;
    
    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = doc.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const previewDocument = (doc: { name: string; url: string }) => {
    const fileExtension = doc.url.split('.').pop()?.toLowerCase();
    let type = 'image';
    
    if (fileExtension === 'pdf') {
      type = 'pdf';
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')) {
      type = 'image';
    } else {
      type = 'file';
    }
    
    // Construct full URL for the document
    const fullUrl = doc.url.startsWith('http') ? doc.url : `${config.apiUrl.replace('/api', '')}/${doc.url}`;
    
    console.log('Preview document:', {
      originalUrl: doc.url,
      fullUrl: fullUrl,
      type: type,
      fileExtension: fileExtension
    });
    
    setPreviewDoc({
      name: doc.name,
      url: fullUrl,
      type
    });
  };

  const getFileTypeIcon = (url: string) => {
    const fileExtension = url.split('.').pop()?.toLowerCase();
    if (fileExtension === 'pdf') {
      return <FileText className="h-4 w-4 text-white" />;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')) {
      return <FileText className="h-4 w-4 text-white" />;
    }
    return <FileText className="h-4 w-4 text-white" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[60]"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100vh', opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed top-[2%] left-1/2 transform -translate-x-1/2 w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-xl z-[70] max-h-[95vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="relative bg-white p-8 text-gray-900 border-b border-gray-200">
              <div className="absolute inset-0 bg-gray-50/50"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {distributor.fullName}
                    </h2>
                    <p className="text-gray-600 text-lg">
                      {distributor.companyName}
                    </p>
                    <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {distributor.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {distributor.mobileNumber}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(distributor.status)} border border-gray-200`}>
                    {getStatusIcon(distributor.status)}
                    <span className="ml-2">{distributor.status}</span>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50">
              {/* Personal Details */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-4">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                    <div className="mt-2 border-b-4 border-b-gray-300 w-full"></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
                    <p className="text-lg text-gray-900 font-medium">
                      {distributor.fullName}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email</label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <a 
                        href={`mailto:${distributor.email}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        {distributor.email}
                      </a>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <a 
                        href={`tel:${distributor.mobileNumber}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        {distributor.mobileNumber}
                      </a>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Age</label>
                    <p className="text-lg text-gray-900 font-medium">
                      {distributor.age} years
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Gender</label>
                    <p className="text-lg text-gray-900 font-medium">{distributor.gender}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Citizenship Number</label>
                    <p className="text-lg text-gray-900 font-medium">{distributor.citizenshipNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Issued District</label>
                    <p className="text-lg text-gray-900 font-medium">{distributor.issuedDistrict}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Permanent Address</label>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                      <p className="text-lg text-gray-900 font-medium">{distributor.permanentAddress}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Temporary Address</label>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                      <p className="text-lg text-gray-900 font-medium">{distributor.temporaryAddress || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Details */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-4">
                    <Building className="h-5 w-5 text-gray-900" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">Company Information</h3>
                    <div className="mt-2 border-b-4 border-b-gray-300 w-full"></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Company Name</label>
                    <p className="text-lg text-gray-900 font-medium">{distributor.companyName}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Business Type</label>
                    <p className="text-lg text-gray-900 font-medium">
                      {distributor.businessType}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Registration Number</label>
                    <p className="text-lg text-gray-900 font-medium">{distributor.registrationNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">PAN/VAT Number</label>
                    <p className="text-lg text-gray-900 font-medium">{distributor.panVatNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Operating Area</label>
                    <p className="text-lg text-gray-900 font-medium">{distributor.operatingArea}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Desired Distributor Area</label>
                    <p className="text-lg text-gray-900 font-medium">{distributor.desiredDistributorArea}</p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Office Address</label>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                      <p className="text-lg text-gray-900 font-medium">{distributor.officeAddress}</p>
                    </div>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4 block">Business Information</label>
                    <div className="overflow-hidden border border-gray-200 rounded-xl">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-500">Current Business</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{distributor.currentBusiness}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-500">Product Category</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{distributor.productCategory}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-500">Years in Business</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{distributor.yearsInBusiness} years</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-4">
                    <FileText className="h-5 w-5 text-gray-900" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">Documents</h3>
                    <div className="mt-2 border-b-4 border-b-gray-300 w-full"></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {distributor.citizenshipId && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-md transition-all duration-200 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mr-4">
                            {getFileTypeIcon(distributor.citizenshipId)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">Citizenship Document</p>
                            <p className="text-sm text-gray-500">Citizenship ID</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => previewDocument({ name: 'Citizenship Document', url: distributor.citizenshipId! })}
                            className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="Preview Document"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => downloadDocument({ name: 'Citizenship Document', url: distributor.citizenshipId })}
                            className="p-3 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                            title="Download Document"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {distributor.companyRegistration && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-md transition-all duration-200 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mr-4">
                            {getFileTypeIcon(distributor.companyRegistration)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">Company Registration</p>
                            <p className="text-sm text-gray-500">Registration Document</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => previewDocument({ name: 'Company Registration', url: distributor.companyRegistration! })}
                            className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="Preview Document"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => downloadDocument({ name: 'Company Registration', url: distributor.companyRegistration })}
                            className="p-3 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                            title="Download Document"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {distributor.panVatRegistration && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-md transition-all duration-200 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mr-4">
                            {getFileTypeIcon(distributor.panVatRegistration)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">PAN/VAT Registration</p>
                            <p className="text-sm text-gray-500">Tax Document</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => previewDocument({ name: 'PAN/VAT Registration', url: distributor.panVatRegistration! })}
                            className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="Preview Document"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => downloadDocument({ name: 'PAN/VAT Registration', url: distributor.panVatRegistration })}
                            className="p-3 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                            title="Download Document"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-4">
                    <Calendar className="h-5 w-5 text-gray-900" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">Application Timeline</h3>
                    <div className="mt-2 border-b-4 border-b-gray-300 w-full"></div>
                  </div>
                </div>
                <div className="space-y-4 ml-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-gray-900">Application Submitted</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(new Date(distributor.createdAt))}
                      </p>
                    </div>
                  </div>

                  {distributor.status === 'APPROVED' && distributor.reviewedAt && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">Application Approved</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(new Date(distributor.reviewedAt))}
                          {distributor.reviewedBy && (
                            <span className="ml-1">by {distributor.reviewedBy.fullName}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {distributor.status === 'REJECTED' && distributor.reviewedAt && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
                        <XCircle className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">Application Rejected</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(new Date(distributor.reviewedAt))}
                        </p>
                        {distributor.reviewNotes && (
                          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                              <strong>Reason:</strong> {distributor.reviewNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Application ID: {distributor.id.slice(-8).toUpperCase()}
              </div>
              <button
                onClick={onClose}
                className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Close
              </button>
            </div>
          </motion.div>

          {/* Document Preview Modal */}
          <AnimatePresence>
            {previewDoc && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-75"
                onClick={() => setPreviewDoc(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Preview Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center">
                      {getFileTypeIcon(previewDoc.url)}
                      <h3 className="ml-2 text-lg font-semibold text-gray-900">
                        {previewDoc.name}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => downloadDocument({ name: previewDoc.name, url: previewDoc.url })}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Download Document"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setPreviewDoc(null)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Close Preview"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Preview Content */}
                  <div className="p-4 max-h-[70vh] overflow-auto">
                    {previewDoc.type === 'pdf' ? (
                      <iframe
                        src={previewDoc.url}
                        className="w-full h-96 border-0 rounded-lg"
                        title={previewDoc.name}
                      />
                    ) : previewDoc.type === 'image' ? (
                      <img
                        src={previewDoc.url}
                        alt={previewDoc.name}
                        className="max-w-full h-auto rounded-lg mx-auto"
                        onError={(e) => {
                          console.error('Image load error:', {
                            src: previewDoc.url,
                            error: e
                          });
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', previewDoc.url);
                        }}
                      />
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                        <button
                          onClick={() => downloadDocument({ name: previewDoc.name, url: previewDoc.url })}
                          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download File
                        </button>
                      </div>
                    )}
                    
                    {/* Fallback for image load errors */}
                    {previewDoc.type === 'image' && (
                      <div className="hidden text-center py-12">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Image preview not available</p>
                        <p className="text-xs text-gray-500 mb-4 break-all">URL: {previewDoc.url}</p>
                        <button
                          onClick={() => downloadDocument({ name: previewDoc.name, url: previewDoc.url })}
                          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Image
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}








