'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  Mail, 
  Phone,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Building,
  MapPin,
  Eye,
  EyeOff,
  X,
  Key
} from 'lucide-react';
import { DistributorApplication } from '@/lib/distributorApi';
import { config } from '@/lib/config';
import toast from 'react-hot-toast';

interface ApprovedDistributor extends DistributorApplication {
  userId?: string;
  isActive?: boolean;
  credentials?: {
    username: string;
    email: string;
    password: string;
  };
}

export default function ApprovedDistributors() {
  const [distributors, setDistributors] = useState<ApprovedDistributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [selectedDistributor, setSelectedDistributor] = useState<ApprovedDistributor | null>(null);
  const [selectedDistributorForCredentials, setSelectedDistributorForCredentials] = useState<ApprovedDistributor | null>(null);
  const [showCredentialForm, setShowCredentialForm] = useState(false);

  // Fetch approved distributors
  const fetchApprovedDistributors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/applications/dev?status=APPROVED`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(config.tokenKey)}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const applications = data.data || [];
        
        // For each approved application, check if it has a corresponding User account
        const distributorsWithCredentials = await Promise.all(
          applications.map(async (application: DistributorApplication) => {
            try {
              // Use new endpoint to find the corresponding User account
              const userResponse = await fetch(`${config.apiUrl}/distributors/find-by-application/${application.id}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem(config.tokenKey)}`,
                }
              });
              
              if (userResponse.ok) {
                const userData = await userResponse.json();
                const user = userData.data;
                
                if (user) {
                  // Process all users (active and inactive)
                  return {
                    ...application,
                    userId: user.id,
                    isActive: user.isActive,
                    credentials: {
                      username: user.username || '',
                      email: user.email || '',
                      password: user.password || '••••'
                    }
                  };
                }
              }
              
              return {
                ...application,
                userId: null,
                isActive: false,
                credentials: null
              };
            } catch (error) {
              console.error('Error fetching credentials for application:', application.id, error);
              return {
                ...application,
                userId: null,
                isActive: false,
                credentials: null
              };
            }
          })
        );
        
        setDistributors(distributorsWithCredentials);
      } else {
        throw new Error('Failed to fetch approved distributors');
      }
    } catch (error) {
      console.error('Error fetching approved distributors:', error);
      toast.error('Failed to fetch approved distributors');
    } finally {
      setLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = useCallback((distributorId: string) => {
    setShowPassword(prev => ({
      ...prev,
      [distributorId]: !prev[distributorId]
    }));
  }, []);

  // Show distributor details in modal
  const showDistributorDetails = useCallback((distributor: ApprovedDistributor) => {
    setSelectedDistributor(distributor);
  }, []);

  useEffect(() => {
    fetchApprovedDistributors();
  }, []);

  // Filter distributors with memoization for better performance
  const filteredDistributors = useMemo(() => {
    return distributors.filter(distributor => {
      const matchesSearch = distributor.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           distributor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           distributor.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || 
                           (filterStatus === 'with-credentials' && distributor.credentials) ||
                           (filterStatus === 'without-credentials' && !distributor.credentials);
      
      return matchesSearch && matchesFilter;
    });
  }, [distributors, searchTerm, filterStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-indigo-600" />
          <span className="text-gray-600">Loading approved distributors...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approved Distributors</h1>
          <p className="text-gray-600 mt-1">Manage approved distributor accounts and credentials</p>
        </div>
        <button
          onClick={fetchApprovedDistributors}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Distributors</option>
              <option value="with-credentials">With Credentials</option>
              <option value="without-credentials">Without Credentials</option>
            </select>
          </div>
        </div>
      </div>

      {/* Distributors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDistributors.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No approved distributors found</h3>
            <p className="text-gray-500">There are no approved distributors matching your criteria.</p>
          </div>
        ) : (
          filteredDistributors.map((distributor) => (
            <div key={distributor.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{distributor.fullName}</h3>
                      <p className="text-sm text-gray-600">{distributor.companyName}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        {distributor.credentials ? (
                          <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-xs font-medium">Credentials Set</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                            <XCircle className="h-4 w-4" />
                            <span className="text-xs font-medium">No Credentials</span>
                          </div>
                        )}
                        {distributor.userId && !distributor.isActive && (
                          <div className="flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded-full">
                            <XCircle className="h-4 w-4" />
                            <span className="text-xs font-medium">Inactive</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => showDistributorDetails(distributor)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                      title="View details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDistributorForCredentials(distributor);
                        setShowCredentialForm(true);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                      title="Set credentials"
                    >
                      <Key className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Body - Distributor Details */}
              <div className="p-6">
                {/* Contact Information */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Email</p>
                        <p className="text-sm font-semibold text-gray-900">{distributor.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 bg-purple-50 p-4 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Phone className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">Phone</p>
                        <p className="text-sm font-semibold text-gray-900">{distributor.mobileNumber}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 bg-green-50 p-4 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Building className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Company</p>
                        <p className="text-sm font-semibold text-gray-900">{distributor.companyName || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 bg-orange-50 p-4 rounded-lg">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-orange-600 font-medium uppercase tracking-wide">Area</p>
                        <p className="text-sm font-semibold text-gray-900">{distributor.desiredDistributorArea || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    <DistributorDetailsModal 
      distributor={selectedDistributor}
      isOpen={!!selectedDistributor}
      onClose={() => setSelectedDistributor(null)}
    />
    <CredentialFormModal
      distributor={selectedDistributorForCredentials}
      isOpen={showCredentialForm}
      onClose={() => setShowCredentialForm(false)}
      onSave={async (username, email, password) => {
        if (!selectedDistributorForCredentials) return;
        
        try {
          const response = await fetch(`${config.apiUrl}/distributors/${selectedDistributorForCredentials.id}/credentials`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem(config.tokenKey)}`,
            },
            body: JSON.stringify({
              username,
              email,
              password,
            }),
          });

          if (response.ok) {
            toast.success('Credentials saved successfully');
            setShowCredentialForm(false);
            // Refresh the distributors list to show the updated credentials
            fetchApprovedDistributors();
          } else {
            const errorData = await response.json();
            toast.error(errorData.message || 'Failed to save credentials');
          }
        } catch (error) {
          console.error('Error saving credentials:', error);
          toast.error('Error saving credentials');
        }
      }}
    />
  </>);
}

// Distributor Details Modal
function DistributorDetailsModal({ 
  distributor, 
  isOpen, 
  onClose 
}: { 
  distributor: ApprovedDistributor | null; 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  if (!isOpen || !distributor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Distributor Details</h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <UserCheck className="h-4 w-4 mr-2" />
                Personal Information
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Full Name</p>
                  <p className="font-medium text-gray-900">{distributor.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Age</p>
                  <p className="font-medium text-gray-900">{distributor.age || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Gender</p>
                  <p className="font-medium text-gray-900">{distributor.gender || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Citizenship No</p>
                  <p className="font-medium text-gray-900">{distributor.citizenshipNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Issued District</p>
                  <p className="font-medium text-gray-900">{distributor.issuedDistrict || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Contact Information
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                  <p className="font-medium text-gray-900">{distributor.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Mobile</p>
                  <p className="font-medium text-gray-900">{distributor.mobileNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Permanent Address</p>
                  <p className="font-medium text-gray-900">{distributor.permanentAddress || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Temporary Address</p>
                  <p className="font-medium text-gray-900">{distributor.temporaryAddress || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Company Information
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Company Name</p>
                  <p className="font-medium text-gray-900">{distributor.companyName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Registration No</p>
                  <p className="font-medium text-gray-900">{distributor.registrationNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">PAN/VAT No</p>
                  <p className="font-medium text-gray-900">{distributor.panVatNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Office Address</p>
                  <p className="font-medium text-gray-900">{distributor.officeAddress || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Business Information
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Operating Area</p>
                  <p className="font-medium text-gray-900">{distributor.operatingArea || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Desired Distributor Area</p>
                  <p className="font-medium text-gray-900">{distributor.desiredDistributorArea || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Current Business</p>
                  <p className="font-medium text-gray-900">{distributor.currentBusiness || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Business Type</p>
                  <p className="font-medium text-gray-900">{distributor.businessType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Product Category</p>
                  <p className="font-medium text-gray-900">{distributor.productCategory || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Years in Business</p>
                  <p className="font-medium text-gray-900">{distributor.yearsInBusiness || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Monthly Sales</p>
                  <p className="font-medium text-gray-900">{distributor.monthlySales || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Payment Preference</p>
                  <p className="font-medium text-gray-900">{distributor.paymentPreference || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Credit Days</p>
                  <p className="font-medium text-gray-900">{distributor.creditDays || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Applied At</p>
                  <p className="font-medium text-gray-900">{distributor.createdAt ? new Date(distributor.createdAt).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Credential Form Modal
function CredentialFormModal({ 
  distributor, 
  isOpen, 
  onClose,
  onSave
}: { 
  distributor: ApprovedDistributor | null; 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (username: string, email: string, password: string) => void;
}) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (distributor) {
      // Set default email from distributor's email
      setEmail(distributor.email || '');
    } else {
      // Reset form when distributor is null
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  }, [distributor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      // Using a simple alert instead of toast since it's not available in this component
      alert('Passwords do not match');
      return;
    }
    if (!username.trim() || !email.trim() || !password.trim()) {
      alert('Please fill in all fields');
      return;
    }
    onSave(username, email, password);
  };

  if (!isOpen || !distributor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Set Credentials</h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter username"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter email"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter password"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Confirm password"
                required
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Save Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
