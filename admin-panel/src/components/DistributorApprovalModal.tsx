'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Building,
  Package,
  Plus,
  Minus,
  Send,
  AlertCircle,
  FileCheck,
  UserCheck,
  ShieldCheck,
  MapPinCheck,
  Clock,
  Calendar,
  Truck,
  Briefcase,
  Target,
  ChevronRight
} from 'lucide-react';
import { config } from '@/lib/config';
import toast from 'react-hot-toast';

const NEPAL_PROVINCES = [
  { id: 'province-1', name: 'Province 1', nameNepali: 'प्रदेश १' },
  { id: 'madhesh', name: 'Madhesh Province', nameNepali: 'मधेश प्रदेश' },
  { id: 'bagmati', name: 'Bagmati Province', nameNepali: 'बागमती प्रदेश' },
  { id: 'gandaki', name: 'Gandaki Province', nameNepali: 'गण्डकी प्रदेश' },
  { id: 'lumbini', name: 'Lumbini Province', nameNepali: 'लुम्बिनी प्रदेश' },
  { id: 'karnali', name: 'Karnali Province', nameNepali: 'कर्णाली प्रदेश' },
  { id: 'sudurpashchim', name: 'Sudurpashchim Province', nameNepali: 'सुदूरपश्चिम प्रदेश' }
];

interface Product {
  id: string;
  name: string;
  description?: string;
  size?: string;
  price: string | number;
  costPrice?: string | number;
  brand?: string;
  // Legacy fields for backward compatibility
  units?: string;
  packaging?: string;
  distributorPrice?: number;
  wholesalePrice?: number;
  rate?: number;
  mrp?: number;
}

interface DistributorInfo {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  companyName: string;
  officeAddress: string;
  desiredDistributorArea: string;
}

interface DistributorApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (distributorId: string, products: Product[], additionalData: any) => Promise<void>;
  distributor: DistributorInfo | null;
}

export default function DistributorApprovalModal({
  isOpen,
  onClose,
  onApprove,
  distributor
}: DistributorApprovalModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [responseDays, setResponseDays] = useState(7);
  const [assignedProvinces, setAssignedProvinces] = useState<string[]>([]);
  const [assignedAreas, setAssignedAreas] = useState<string[]>([]);
  const [coverageNotes, setCoverageNotes] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch products when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const toggleProductSelection = (product: Product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.some(p => p.id === product.id);
      if (isSelected) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const toggleProvinceSelection = (provinceId: string) => {
    setAssignedProvinces(prev => {
      const isSelected = prev.includes(provinceId);
      if (isSelected) {
        return prev.filter(p => p !== provinceId);
      } else {
        return [...prev, provinceId];
      }
    });
  };

  const addArea = () => {
    const areaInput = document.getElementById('area-input') as HTMLInputElement;
    const area = areaInput.value.trim();
    if (area && !assignedAreas.includes(area)) {
      setAssignedAreas(prev => [...prev, area]);
      areaInput.value = '';
    }
  };

  const removeArea = (area: string) => {
    setAssignedAreas(prev => prev.filter(a => a !== area));
  };

  const handleApprove = async () => {
    console.log('🔥 handleApprove called:', { 
      distributor: distributor?.fullName, 
      selectedProductsCount: selectedProducts.length,
      selectedProducts: selectedProducts.map(p => p.name),
      assignedProvincesCount: assignedProvinces.length,
      assignedAreas: assignedAreas.length
    });
    
    if (!distributor) {
      console.error('❌ No distributor provided');
      return;
    }
    
    // Validation checks with detailed logging
    if (selectedProducts.length === 0) {
      console.error('❌ No products selected');
      toast.error('Please select at least one product to assign to this distributor');
      return;
    }
    
    if (assignedProvinces.length === 0) {
      console.error('❌ No provinces assigned');
      toast.error('Please assign at least one province for sales coverage');
      return;
    }
    
    console.log('✅ Validation passed, proceeding with approval...');
    
    try {
      setSending(true);
      
      const additionalData = {
        responseDays: responseDays,
        approvalDate: new Date().toISOString(),
        approvedBy: 'Admin', // You can get this from user context
        assignedProvinces: assignedProvinces,
        assignedAreas: assignedAreas,
        coverageNotes: coverageNotes
      };

      console.log('📧 Sending approval data:', {
        distributorId: distributor.id,
        products: selectedProducts,
        additionalData
      });

      await onApprove(distributor.id, selectedProducts, additionalData);
      
      toast.success('✅ Distributor approved! Offer letter will be sent to: ' + distributor.email, {
        duration: 5000,
        style: {
          background: '#10b981',
          color: 'white',
          border: '1px solid #059669',
        },
      });
      onClose();
    } catch (error) {
      console.error('❌ Error approving distributor:', error);
      toast.error('Failed to approve distributor. Please try again.', {
        duration: 6000,
        style: {
          background: '#ef4444',
          color: 'white',
        },
      });
    } finally {
      setSending(false);
    }
  };

  if (!isOpen || !distributor) return null;

  // Debug logging
  console.log('DistributorApprovalModal rendered:', { isOpen, distributor: distributor?.fullName, selectedProductsCount: selectedProducts.length });

  return (
    <>
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                  <FileCheck className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Distributor Approval Portal</h2>
                  <p className="text-green-100">Configure offer details and assign coverage areas</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="flex items-center space-x-1">
                      <UserCheck className="h-4 w-4 text-green-100" />
                      <span className="text-sm text-green-100">Distributor: {distributor?.fullName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPinCheck className="h-4 w-4 text-green-100" />
                      <span className="text-sm text-green-100">Area: {distributor?.desiredDistributorArea}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-2xl transition-all duration-200 backdrop-blur-sm"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Scroll Indicator - Visual cue for scrolling */}
            <div className="absolute top-4 right-4 z-10">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            {/* Distributor Information */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Distributor Profile</h3>
                    <p className="text-blue-700 text-sm">Review applicant details and configure offer</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <UserCheck className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Full Name</p>
                        <p className="text-blue-900 font-semibold">{distributor.fullName}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Email Address</p>
                        <a href={`mailto:${distributor.email}`} className="text-blue-900 font-semibold hover:text-blue-700">{distributor.email}</a>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Mobile Number</p>
                        <a href={`tel:${distributor.mobileNumber}`} className="text-blue-900 font-semibold hover:text-blue-700">{distributor.mobileNumber}</a>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPinCheck className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Desired Area</p>
                        <p className="text-blue-900 font-semibold">{distributor.desiredDistributorArea}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Building className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Company Name</p>
                        <p className="text-blue-900 font-semibold">{distributor.companyName || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-100 rounded-xl p-4 border border-blue-200">
                      <h4 className="text-sm font-bold text-blue-800 mb-3">Application Summary</h4>
                      <div className="space-y-2 text-sm text-blue-700">
                        <div className="flex justify-between">
                          <span>Application ID:</span>
                          <span className="font-mono font-bold">{distributor.id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Submission Date:</span>
                          <span>{new Date(distributor.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">{distributor.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Select Products</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Package className="h-4 w-4" />
                  <span>{selectedProducts.length} products selected</span>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading products...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => {
                    const isSelected = selectedProducts.some(p => p.id === product.id);
                    return (
                      <div
                        key={product.id}
                        onClick={() => toggleProductSelection(product)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Size: {product.size || product.units || 'N/A'}</p>
                          <p>Brand: {product.brand || 'N/A'}</p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <p className="text-xs text-gray-500">Price</p>
                              <p className="font-medium">रु. {product.distributorPrice || product.costPrice || product.price}/-</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">MRP</p>
                              <p className="font-medium">रु. {product.mrp || product.price}/-</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sales Coverage Assignment */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Coverage Assignment</h3>
              
              {/* Province Assignment */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Provinces *
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {NEPAL_PROVINCES.map((province) => (
                    <label key={province.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assignedProvinces.includes(province.id)}
                        onChange={() => toggleProvinceSelection(province.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{province.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Area Assignment */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Areas
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    id="area-input"
                    type="text"
                    placeholder="Enter area name (e.g., Kathmandu Valley, Pokhara City)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    onKeyPress={(e) => e.key === 'Enter' && addArea()}
                  />
                  <button
                    onClick={addArea}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {assignedAreas.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {assignedAreas.map((area) => (
                      <span
                        key={area}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                      >
                        {area}
                        <button
                          onClick={() => removeArea(area)}
                          className="ml-2 text-indigo-600 hover:text-indigo-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Coverage Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coverage Notes
                </label>
                <textarea
                  value={coverageNotes}
                  onChange={(e) => setCoverageNotes(e.target.value)}
                  placeholder="Additional notes about sales coverage, restrictions, or special conditions..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Additional Settings */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Offer Letter Settings</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">
                    Response Deadline (Days):
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setResponseDays(Math.max(1, responseDays - 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={responseDays}
                      onChange={(e) => setResponseDays(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      min="1"
                      max="30"
                    />
                    <button
                      onClick={() => setResponseDays(Math.min(30, responseDays + 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Preview */}
            {selectedProducts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Products Preview</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-blue-200">
                          <th className="text-left py-2">Product</th>
                          <th className="text-left py-2">Units</th>
                          <th className="text-right py-2">Dist. Price</th>
                          <th className="text-right py-2">MRP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProducts.map((product) => (
                          <tr key={product.id} className="border-b border-blue-100">
                            <td className="py-2 font-medium">{product.name}</td>
                            <td className="py-2">{product.size || product.units || 'N/A'}</td>
                            <td className="py-2 text-right">रु. {product.distributorPrice || product.costPrice || product.price}/-</td>
                            <td className="py-2 text-right">रु. {product.mrp || product.price}/-</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Next Button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setShowReviewModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Review & Approve</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>

    {/* Review Modal */}
    <AnimatePresence>
      {showReviewModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowReviewModal(false)}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ 
              opacity: 0,
              x: "100%", // Start completely off-screen to the right
              scale: 0.95
            }}
            animate={{ 
              opacity: 1,
              x: 0, // Slide into view from right
              scale: 1
            }}
            exit={{ 
              opacity: 0,
              x: "100%", // Slide back out to the right
              scale: 0.95
            }}
            transition={{
              type: "tween",
              ease: "easeInOut",
              duration: 0.3,
              opacity: { duration: 0.2 }
            }}
            className="fixed right-0 top-0 h-full w-full max-w-4xl bg-white shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <FileCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Review & Approve</h2>
                    <p className="text-blue-100 text-sm">Final review before sending offer letter</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-6">
                {/* Footer - Enhanced with Offer Letter Receipt */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 border-t border-gray-700 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-white font-bold text-base mb-3 flex items-center space-x-2">
                      <Mail className="h-5 w-5" />
                      <span>Offer Letter Recipient</span>
                    </h4>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="text-sm text-gray-400 uppercase tracking-wide">Email Address</p>
                          <p className="text-white font-mono text-sm">{distributor.email}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-blue-400" />
                          <div>
                            <p className="text-sm text-gray-400 uppercase tracking-wide">Response Deadline</p>
                            <p className="text-white font-semibold text-sm">{responseDays} days</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <div className="flex items-center space-x-3">
                          <Package className="h-5 w-5 text-blue-400" />
                          <div>
                            <p className="text-sm text-gray-400 uppercase tracking-wide">Products Assigned</p>
                            <p className="text-white font-semibold text-sm">{selectedProducts.length} products</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <div className="flex items-center space-x-3">
                          <Truck className="h-5 w-5 text-blue-400" />
                          <div>
                            <p className="text-sm text-gray-400 uppercase tracking-wide">Coverage Areas</p>
                            <p className="text-white font-semibold text-sm">{assignedProvinces.length} provinces, {assignedAreas.length} areas</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-yellow-400/20 backdrop-blur-sm rounded-xl p-3 border border-yellow-400/30">
                        <div className="flex items-center space-x-2">
                          <ShieldCheck className="h-5 w-5 text-yellow-400" />
                          <div>
                            <p className="text-xs text-yellow-400 font-medium uppercase tracking-wide">Approval Status</p>
                            <p className="text-white font-semibold text-sm">PENDING CONFIGURATION</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-white font-bold text-base mb-3 flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5" />
                      <span>Important Information</span>
                    </h4>
                    <div className="space-y-3 text-xs text-gray-300">
                      <p>• Offer letter will include all selected products and coverage details</p>
                      <p>• Distributor will receive approval activation email upon offer acceptance</p>
                      <p>• Response deadline: {responseDays} days from offer date</p>
                      <p>• Account activation required before using distributor portal</p>
                    </div>
                  </div>
                </div>
              </div>
              </div>
               
              {/* Sticky Footer */}
              <div className="sticky bottom-0 bg-gradient-to-r from-gray-900 to-gray-800 p-6 border-t border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="space-y-4">
                    <h4 className="text-white font-bold text-base mb-3 flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5" />
                      <span>Important Information</span>
                    </h4>
                    <div className="space-y-3 text-xs text-gray-300">
                      <p>• Offer letter will include all selected products and coverage details</p>
                      <p>• Distributor will receive approval activation email upon offer acceptance</p>
                      <p>• Response deadline: {responseDays} days from offer date</p>
                      <p>• Account activation required before using distributor portal</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-all duration-200"
                  >
                    <X className="h-5 w-5" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={sending || selectedProducts.length === 0 || assignedProvinces.length === 0}
                    className={`flex items-center space-x-3 px-8 py-4 text-lg font-bold rounded-xl transition-all duration-200 backdrop-blur-sm relative ${
                      sending || selectedProducts.length === 0 || assignedProvinces.length === 0
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-60'
                        : 'bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 text-white hover:from-green-700 hover:via-emerald-600 hover:to-teal-700 shadow-2xl hover:shadow-teal-500/50 transform hover:scale-105'
                    }`}
                    title={selectedProducts.length === 0 ? 'Please select products' : assignedProvinces.length === 0 ? 'Please assign provinces' : 'Click to approve Distributor'}
                  >
                    {sending ? (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-400"></div>
                            <span className="text-green-700 font-medium">Processing Approval...</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-6 w-6 text-white" />
                        <div className="text-left">
                          <span className="block text-white font-bold">Approve Distributor</span>
                          <span className="text-teal-100 text-sm block">Send offer letter & activate account</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-white transform group-hover:translate-x-1 transition-transform duration-200" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}









