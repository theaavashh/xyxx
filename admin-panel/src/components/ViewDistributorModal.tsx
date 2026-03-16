'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Briefcase,
  Users,
  CreditCard,
  Package,
  ChevronRight,
  Info,
  Building2,
  File,
  FolderOpen,
  Truck,
  TrendingUp
} from 'lucide-react';
import { DistributorApplication } from '@/lib/distributorApi';
import { formatDate } from '@/lib/utils';
import { config } from '@/lib/config';

interface ViewDistributorModalProps {
  isOpen: boolean;
  onClose: () => void;
  distributor: DistributorApplication | null;
}

export default function ViewDistributorModal({ 
  isOpen, 
  onClose, 
  distributor 
}: ViewDistributorModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'documents'>('details');
  
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

  const downloadDocument = (doc: { name: string; url: string }) => {
    const fullUrl = doc.url.startsWith('http') ? doc.url : `${config.apiUrl.replace('/api', '')}/${doc.url}`;
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = doc.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDocumentImageUrl = (url: string) => {
    return url.startsWith('http') ? url : `${config.apiUrl.replace('/api', '')}/${url}`;
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
            className="fixed inset-0 bg-black/50 z-[60]"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl mx-4 bg-white rounded-lg shadow-xl z-[70] max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="relative bg-white border-b border-gray-200 p-6">
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {distributor.fullName}
                    </h2>
                    <div className="flex items-center space-x-3 text-gray-800">
                      <Building2 className="h-5 w-5" />
                      <span className="text-lg font-semibold">{distributor.companyName}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`inline-flex items-center px-6 py-3 rounded-full text-sm font-bold border-2 ${getStatusColor(distributor.status)}`}>
                    {getStatusIcon(distributor.status)}
                    <span className="ml-2">{distributor.status}</span>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4 bg-gray-50">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                    activeTab === 'details'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FolderOpen className="h-4 w-4" />
                  <span>Details</span>
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                    activeTab === 'documents'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <File className="h-4 w-4" />
                  <span>Documents</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'details' ? (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-lg border border-gray-200"
                  >
                    {/* Form-like Layout */}
                    <div className="divide-y divide-gray-200">
                      {/* Personal Information Section */}
                      <div className="p-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <User className="h-5 w-5 text-gray-600" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                            <p className="text-sm text-gray-500">Applicant details and contact information</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                Full Name
                              </label>
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-900 font-medium">{distributor.fullName}</span>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                Email Address
                              </label>
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-900 font-medium">{distributor.email}</span>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                Phone Number
                              </label>
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-900 font-medium">{distributor.mobileNumber}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                Permanent Address
                              </label>
                              <div className="flex items-start space-x-2">
                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                <span className="text-gray-900 font-medium">{distributor.permanentAddress}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                  Age
                                </label>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-900 font-medium">{distributor.age} years</span>
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                  Gender
                                </label>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-900 font-medium">{distributor.gender}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Business Information Section */}
                      <div className="p-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <Building2 className="h-5 w-5 text-gray-600" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
                            <p className="text-sm text-gray-500">Company registration and legal details</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                Company Name
                              </label>
                              <div className="flex items-center space-x-2">
                                <Building2 className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-900 font-medium">{distributor.companyName}</span>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                Business Type
                              </label>
                              <div className="flex items-center space-x-2">
                                <Briefcase className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-900 font-medium">{distributor.businessType?.replace('_', ' ') || 'N/A'}</span>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                Registration Number
                              </label>
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-900 font-medium">{distributor.registrationNumber || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                PAN/VAT Number
                              </label>
                              <div className="flex items-center space-x-2">
                                <CreditCard className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-900 font-medium">{distributor.panVatNumber || 'N/A'}</span>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                Office Address
                              </label>
                              <div className="flex items-start space-x-2">
                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                <span className="text-gray-900 font-medium">{distributor.officeAddress}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Operations Section */}
                      <div className="p-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <TrendingUp className="h-5 w-5 text-gray-600" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Operations & Infrastructure</h3>
                            <p className="text-sm text-gray-500">Staff, vehicles, and storage facilities</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                              <Users className="h-4 w-4 mr-2 text-gray-400" />
                              Staff Team
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Sales Executives</span>
                                <span className="text-sm font-medium text-gray-900">{distributor.salesManCount || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Drivers</span>
                                <span className="text-sm font-medium text-gray-900">{distributor.driverCount || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Helpers</span>
                                <span className="text-sm font-medium text-gray-900">{distributor.helperCount || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Accountants</span>
                                <span className="text-sm font-medium text-gray-900">{distributor.accountantCount || 0}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                              <Truck className="h-4 w-4 mr-2 text-gray-400" />
                              Vehicles
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Trucks</span>
                                <span className="text-sm font-medium text-gray-900">{distributor.truckCount || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Four Wheelers</span>
                                <span className="text-sm font-medium text-gray-900">{distributor.fourWheelerCount || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Motorcycles</span>
                                <span className="text-sm font-medium text-gray-900">{distributor.motorcycleCount || 0}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                              <Package className="h-4 w-4 mr-2 text-gray-400" />
                              Storage Facility
                            </h4>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{distributor.storageSpace || 0}</div>
                                <div className="text-sm text-gray-500">square feet</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="documents"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-lg border border-gray-200"
                  >
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <File className="h-5 w-5 text-gray-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Supporting Documents</h3>
                          <p className="text-sm text-gray-500">Application verification files</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {distributor.citizenshipId && (
                          <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <div>
                                  <h4 className="font-medium text-gray-900">Citizenship Document</h4>
                                  <p className="text-sm text-gray-500">Identity verification</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                <img 
                                  src={getDocumentImageUrl(distributor.citizenshipId)} 
                                  alt="Citizenship Document"
                                  className="w-full h-full object-contain p-2"
                                  onError={(e) => {
                                    e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#e5e7eb">
                                        <rect width="100" height="100" rx="8"/>
                                        <text x="50%" y="50%" font-family="Arial" font-size="10" fill="#6b7280" text-anchor="middle" dy=".3em">Document</text>
                                        <text x="50%" y="60%" font-family="Arial" font-size="8" fill="#9ca3af" text-anchor="middle" dy=".3em">Image</text>
                                      </svg>
                                    `)}`;
                                  }}
                                />
                              </div>
                              <button
                                onClick={() => downloadDocument({ 
                                  name: 'Citizenship_Document', 
                                  url: distributor.citizenshipId 
                                })}
                                className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors flex items-center justify-center space-x-2"
                              >
                                <Download className="h-4 w-4" />
                                <span>Download</span>
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {distributor.companyRegistration && (
                          <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                              <div className="flex items-center space-x-3">
                                <Building2 className="h-5 w-5 text-green-600" />
                                <div>
                                  <h4 className="font-medium text-gray-900">Company Registration</h4>
                                  <p className="text-sm text-gray-500">Business registration</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                <img 
                                  src={getDocumentImageUrl(distributor.companyRegistration)} 
                                  alt="Company Registration"
                                  className="w-full h-full object-contain p-2"
                                  onError={(e) => {
                                    e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#e5e7eb">
                                        <rect width="100" height="100" rx="8"/>
                                        <text x="50%" y="50%" font-family="Arial" font-size="10" fill="#6b7280" text-anchor="middle" dy=".3em">Company</text>
                                        <text x="50%" y="60%" font-family="Arial" font-size="8" fill="#9ca3af" text-anchor="middle" dy=".3em">Registration</text>
                                      </svg>
                                    `)}`;
                                  }}
                                />
                              </div>
                              <button
                                onClick={() => downloadDocument({ 
                                  name: 'Company_Registration', 
                                  url: distributor.companyRegistration 
                                })}
                                className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors flex items-center justify-center space-x-2"
                              >
                                <Download className="h-4 w-4" />
                                <span>Download</span>
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {distributor.panVatRegistration && (
                          <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                              <div className="flex items-center space-x-3">
                                <CreditCard className="h-5 w-5 text-purple-600" />
                                <div>
                                  <h4 className="font-medium text-gray-900">PAN/VAT Registration</h4>
                                  <p className="text-sm text-gray-500">Tax registration</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                <img 
                                  src={getDocumentImageUrl(distributor.panVatRegistration)} 
                                  alt="PAN/VAT Registration"
                                  className="w-full h-full object-contain p-2"
                                  onError={(e) => {
                                    e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#e5e7eb">
                                        <rect width="100" height="100" rx="8"/>
                                        <text x="50%" y="50%" font-family="Arial" font-size="10" fill="#6b7280" text-anchor="middle" dy=".3em">PAN/VAT</text>
                                        <text x="50%" y="60%" font-family="Arial" font-size="8" fill="#9ca3af" text-anchor="middle" dy=".3em">Document</text>
                                      </svg>
                                    `)}`;
                                  }}
                                />
                              </div>
                              <button
                                onClick={() => downloadDocument({ 
                                  name: 'PAN_VAT_Registration', 
                                  url: distributor.panVatRegistration 
                                })}
                                className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors flex items-center justify-center space-x-2"
                              >
                                <Download className="h-4 w-4" />
                                <span>Download</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {(!distributor.citizenshipId && !distributor.companyRegistration && !distributor.panVatRegistration) && (
                        <div className="text-center py-12">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No documents uploaded for this application.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Info className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Application ID</p>
                  <p className="text-gray-900 font-bold">{distributor.id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Submitted</p>
                  <p className="text-sm text-gray-900 font-medium">{formatDate(new Date(distributor.createdAt))}</p>
                </div>
                <button
                  onClick={onClose}
                  className="px-8 py-3 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <span>Close</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}