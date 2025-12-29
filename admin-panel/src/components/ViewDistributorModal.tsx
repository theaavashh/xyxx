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
  AlertCircle,
  Briefcase,
  Users,
  Truck,
  Handshake,
  Award,
  TrendingUp,
  Shield,
  Globe,
  CreditCard,
  Package,
  Target,
  Star,
  ChevronRight,
  Info,
  FileCheck,
  Building2
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl mx-4 bg-white rounded-3xl shadow-2xl z-[70] max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header with Gradient Background */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {distributor.fullName}
                    </h2>
                    <div className="flex items-center space-x-3 text-white/90">
                      <Building2 className="h-5 w-5" />
                      <span className="text-lg font-medium">{distributor.companyName}</span>
                    </div>
                    <div className="flex items-center mt-3 space-x-6 text-white/80 text-sm">
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
                  <div className={`inline-flex items-center px-6 py-3 rounded-full text-sm font-bold bg-white/20 backdrop-blur-sm border-2 border-white/30`}>
                    {getStatusIcon(distributor.status)}
                    <span className="ml-2 text-white">{distributor.status}</span>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>

{/* Content */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
              {/* Quick Stats Cards */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Application ID</p>
                      <p className="text-lg font-bold text-gray-900">{distributor.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Award className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Business Type</p>
                      <p className="text-lg font-bold text-gray-900">{distributor.businessType?.replace('_', ' ') || 'N/A'}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Staff Count</p>
                      <p className="text-lg font-bold text-gray-900">{(distributor.salesManCount || 0) + (distributor.driverCount || 0) + (distributor.helperCount || 0)}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Storage Space</p>
                      <p className="text-lg font-bold text-gray-900">{distributor.storageSpace || 0} sq ft</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Package className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personal Information Card */}
                <div className="lg:col-span-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Personal Info</h3>
                        <p className="text-blue-100 text-sm">Applicant Details</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start space-x-3">
                      <User className="h-5 w-5 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium uppercase">Full Name</p>
                        <p className="text-gray-900 font-semibold">{distributor.fullName}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium uppercase">Email</p>
                        <a href={`mailto:${distributor.email}`} className="text-blue-600 hover:text-blue-800 font-semibold">{distributor.email}</a>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium uppercase">Phone</p>
                        <a href={`tel:${distributor.mobileNumber}`} className="text-blue-600 hover:text-blue-800 font-semibold">{distributor.mobileNumber}</a>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium uppercase">Address</p>
                        <p className="text-gray-900 font-semibold">{distributor.permanentAddress}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Age</p>
                        <p className="text-gray-900 font-semibold">{distributor.age} years</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Gender</p>
                        <p className="text-gray-900 font-semibold">{distributor.gender}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Information Card */}
                <div className="lg:col-span-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Business Info</h3>
                        <p className="text-purple-100 text-sm">Company Details</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start space-x-3">
                      <Building2 className="h-5 w-5 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium uppercase">Company Name</p>
                        <p className="text-gray-900 font-semibold">{distributor.companyName}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Briefcase className="h-5 w-5 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium uppercase">Business Type</p>
                        <p className="text-gray-900 font-semibold">{distributor.businessType?.replace('_', ' ') || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium uppercase">Registration</p>
                        <p className="text-gray-900 font-semibold">{distributor.registrationNumber || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CreditCard className="h-5 w-5 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium uppercase">PAN/VAT</p>
                        <p className="text-gray-900 font-semibold">{distributor.panVatNumber || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium uppercase">Office Address</p>
                        <p className="text-gray-900 font-semibold">{distributor.officeAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operations & Infrastructure Card */}
                <div className="lg:col-span-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <TrendingUp className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Operations</h3>
                        <p className="text-green-100 text-sm">Infrastructure</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-xs text-gray-500 font-medium uppercase mb-3">Staff Team</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Sales Executives</span>
                          <span className="font-bold text-gray-900">{distributor.salesManCount || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Drivers</span>
                          <span className="font-bold text-gray-900">{distributor.driverCount || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Helpers</span>
                          <span className="font-bold text-gray-900">{distributor.helperCount || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Accountants</span>
                          <span className="font-bold text-gray-900">{distributor.accountantCount || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-xs text-gray-500 font-medium uppercase mb-3">Vehicles</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Trucks</span>
                          <span className="font-bold text-gray-900">{distributor.truckCount || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Four Wheelers</span>
                          <span className="font-bold text-gray-900">{distributor.fourWheelerCount || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Motorcycles</span>
                          <span className="font-bold text-gray-900">{distributor.motorcycleCount || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-xs text-gray-500 font-medium uppercase mb-1">Storage</p>
                      <p className="text-2xl font-bold text-gray-900">{distributor.storageSpace || 0}</p>
                      <p className="text-xs text-gray-500">square feet</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="px-6 pb-6">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <FileText className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Documents</h3>
                        <p className="text-orange-100 text-sm">Application Files</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {distributor.citizenshipId && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200 hover:shadow-lg transition-all duration-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                              <Shield className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">Required</span>
                          </div>
                          <h4 className="font-bold text-gray-900 mb-1">Citizenship</h4>
                          <p className="text-sm text-gray-600 mb-3">Identity Document</p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => previewDocument({ name: 'Citizenship Document', url: distributor.citizenshipId! })}
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
                            >
                              <Eye className="h-4 w-4 mr-1" /> Preview
                            </button>
                            <button
                              onClick={() => downloadDocument({ name: 'Citizenship Document', url: distributor.citizenshipId })}
                              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
                            >
                              <Download className="h-4 w-4 mr-1" /> Download
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {distributor.companyRegistration && (
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200 hover:shadow-lg transition-all duration-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">Required</span>
                          </div>
                          <h4 className="font-bold text-gray-900 mb-1">Company Reg.</h4>
                          <p className="text-sm text-gray-600 mb-3">Business Registration</p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => previewDocument({ name: 'Company Registration', url: distributor.companyRegistration! })}
                              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
                            >
                              <Eye className="h-4 w-4 mr-1" /> Preview
                            </button>
                            <button
                              onClick={() => downloadDocument({ name: 'Company Registration', url: distributor.companyRegistration })}
                              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
                            >
                              <Download className="h-4 w-4 mr-1" /> Download
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {distributor.panVatRegistration && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200 hover:shadow-lg transition-all duration-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                              <CreditCard className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">Required</span>
                          </div>
                          <h4 className="font-bold text-gray-900 mb-1">PAN/VAT</h4>
                          <p className="text-sm text-gray-600 mb-3">Tax Registration</p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => previewDocument({ name: 'PAN/VAT Registration', url: distributor.panVatRegistration! })}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
                            >
                              <Eye className="h-4 w-4 mr-1" /> Preview
                            </button>
                            <button
                              onClick={() => downloadDocument({ name: 'PAN/VAT Registration', url: distributor.panVatRegistration })}
                              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
                            >
                              <Download className="h-4 w-4 mr-1" /> Download
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
</div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-900 to-gray-800 border-t border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Info className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Application ID</p>
                  <p className="text-white font-bold">{distributor.id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-xs text-gray-400">Submitted</p>
                  <p className="text-sm text-white font-medium">{formatDate(new Date(distributor.createdAt))}</p>
                </div>
                <button
                  onClick={onClose}
                  className="px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <span>Close</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
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








