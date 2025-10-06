'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  Mail, 
  Phone,
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  RefreshCw,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { DistributorApplication } from '@/lib/distributorApi';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  title: string;
  description?: string;
  slug: string;
  isActive: boolean;
}

interface DistributorCredentials {
  id: string;
  distributorId: string;
  username: string;
  email: string;
  password: string;
  isActive: boolean;
  categories?: Category[];
  createdAt: string;
  updatedAt: string;
}

interface ApprovedDistributor extends DistributorApplication {
  credentials?: DistributorCredentials;
  userId?: string;
  isActive?: boolean;
}

export default function ApprovedDistributors() {
  const [distributors, setDistributors] = useState<ApprovedDistributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [editingCredentials, setEditingCredentials] = useState<string | null>(null);
  const [credentialForms, setCredentialForms] = useState<{ [key: string]: {
    username: string;
    email: string;
    password: string;
    categories: string[];
  } }>({});
  
  // Add a separate state to track which distributor is being edited
  const [editingDistributorId, setEditingDistributorId] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Get appropriate icon for category
  const getCategoryIcon = (categoryTitle: string) => {
    const title = categoryTitle.toLowerCase();
    if (title.includes('food') || title.includes('achar') || title.includes('sukuti')) {
      return <Users className="h-5 w-5 text-white" />;
    } else if (title.includes('electronics') || title.includes('tech')) {
      return <Key className="h-5 w-5 text-white" />;
    } else if (title.includes('clothing') || title.includes('fashion')) {
      return <UserCheck className="h-5 w-5 text-white" />;
    } else if (title.includes('home') || title.includes('furniture')) {
      return <Mail className="h-5 w-5 text-white" />;
    } else {
      return <Key className="h-5 w-5 text-white" />;
    }
  };

  // Fetch available categories
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch('http://localhost:5000/api/categories?isActive=true');
      if (response.ok) {
        const data = await response.json();
        setAvailableCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch approved distributors
  const fetchApprovedDistributors = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/applications/dev?status=APPROVED');
      if (response.ok) {
        const data = await response.json();
        const applications = data.data || [];
        
        // For each approved application, check if it has a corresponding User account
        const distributorsWithCredentials = await Promise.all(
          applications.map(async (application: any) => {
            try {
              // Use the new endpoint to find the corresponding User account
              const userResponse = await fetch(`http://localhost:5000/api/distributors/find-by-application/${application.id}`);
              if (userResponse.ok) {
                const userData = await userResponse.json();
                const user = userData.data;
                
                if (user) { // Process all users (active and inactive)
                  // Fetch credentials for this user
                  const credentialsResponse = await fetch(`http://localhost:5000/api/distributors/${user.id}/credentials`);
                  if (credentialsResponse.ok) {
                    const credentials = await credentialsResponse.json();
                    return {
                      ...application,
                      credentials: credentials.data,
                      userId: user.id,
                      isActive: user.isActive
                    };
                  }
                }
              }
              
              return {
                ...application,
                credentials: null,
                userId: null,
                isActive: false
              };
            } catch (error) {
              console.error('Error fetching credentials for application:', application.id, error);
              return {
                ...application,
                credentials: null,
                userId: null,
                isActive: false
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

  // Fetch credentials for a distributor
  const fetchCredentials = async (distributorId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/distributors/${distributorId}/credentials`);
      if (response.ok) {
        const credentials = await response.json();
        return credentials;
      }
      return null;
    } catch (error) {
      console.error('Error fetching credentials:', error);
      return null;
    }
  };

  // Create or update credentials
  const saveCredentials = useCallback(async (applicationId: string) => {
    try {
      // Find the distributor that corresponds to this application
      const distributor = distributors.find(d => d.id === applicationId);
      if (!distributor) {
        throw new Error('Application not found');
      }
      
      // Create a deep copy to prevent shared state issues
      const safeDistributor = JSON.parse(JSON.stringify(distributor));
      
      const currentForm = credentialForms[applicationId];
      if (!currentForm) {
        throw new Error('Form data not found for this distributor');
      }
      

      // Use the userId if we already have it, otherwise find it
      let userId = safeDistributor.userId;
      
      if (!userId) {
        try {
          const findUserResponse = await fetch(`http://localhost:5000/api/distributors/find-by-application/${applicationId}`);
          if (findUserResponse.ok) {
            const userData = await findUserResponse.json();
            userId = userData.data?.id;
          }
        } catch (error) {
          console.log('Could not find existing user, will create one');
        }
      }

      // If no existing user found, create one
      if (!userId) {
        const createUserResponse = await fetch('http://localhost:5000/api/distributors/dev', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: safeDistributor.fullName.split(' ')[0] || 'Distributor',
            lastName: safeDistributor.fullName.split(' ').slice(1).join(' ') || 'User',
            email: currentForm.email || safeDistributor.email || `${safeDistributor.id}@distributor.local`,
            username: currentForm.username || `dist_${safeDistributor.id.slice(-8)}`,
            password: currentForm.password || 'temp123',
            phoneNumber: safeDistributor.mobileNumber || '9843803568',
            address: safeDistributor.permanentAddress || 'Nepal',
            dateOfBirth: '1990-01-01', // Default date
            nationalId: safeDistributor.citizenshipNumber || '0000000000',
            companyName: safeDistributor.companyName || 'Distributor Company',
            companyType: 'SOLE_PROPRIETORSHIP', // Default company type
            registrationNumber: safeDistributor.registrationNumber || 'REG123456',
            panNumber: safeDistributor.panVatNumber || 'PAN123456',
            vatNumber: safeDistributor.panVatNumber || 'VAT123456',
            establishedDate: '2020-01-01', // Default date
            companyAddress: safeDistributor.officeAddress || 'Nepal',
            website: '',
            description: `Distributor for ${safeDistributor.desiredDistributorArea || 'Nepal'}`
          }),
        });

        if (!createUserResponse.ok) {
          const errorData = await createUserResponse.json();
          console.error('Create user error:', errorData);
          throw new Error(`Failed to create distributor account: ${errorData.message || 'Unknown error'}`);
        }

        const createUserData = await createUserResponse.json();
        userId = createUserData.data.distributor.id;
      }

      // Now save/update the credentials
      const response = await fetch(`http://localhost:5000/api/distributors/${userId}/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: currentForm.username,
          email: currentForm.email,
          password: currentForm.password,
          categories: currentForm.categories
        }),
      });

      if (response.ok) {
        toast.success('Credentials saved successfully');
        
        // Update the local state immediately for better UX - only for the specific distributor
        setDistributors(prevDistributors => 
          prevDistributors.map(d => {
            if (d.id === applicationId) {
              return {
                ...d,
                credentials: {
                  id: d.credentials?.id || '',
                  distributorId: d.credentials?.distributorId || d.userId || '',
                  username: currentForm.username,
                  email: currentForm.email,
                  password: currentForm.password, // Store the actual password from form
                  isActive: d.credentials?.isActive || true,
                  categories: availableCategories.filter(cat => currentForm.categories.includes(cat.id)),
                  createdAt: d.credentials?.createdAt || new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              };
            }
            // Return the distributor unchanged if it's not the one being updated
            return d;
          })
        );
        
        setEditingCredentials(null);
        // Clear the form for this distributor
        setCredentialForms(prev => {
          const newForms = { ...prev };
          delete newForms[applicationId];
          return newForms;
        });
        // Clear any existing password visibility states
        setShowPassword({});
        
        // Note: Removed automatic page refresh for immediate UI updates
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save credentials');
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast.error((error as Error).message || 'Failed to save credentials');
    }
  }, [distributors, credentialForms, availableCategories]);

  // Toggle distributor account status (activate/deactivate)
  const toggleDistributorStatus = useCallback(async (applicationId: string) => {
    const distributor = distributors.find(d => d.id === applicationId);
    if (!distributor) {
      toast.error('Distributor not found');
      return;
    }

    // Create a deep copy to prevent shared state issues
    const safeDistributor = JSON.parse(JSON.stringify(distributor));
    const isCurrentlyActive = safeDistributor.isActive;
    const action = isCurrentlyActive ? 'deactivate' : 'activate';
    const actionText = isCurrentlyActive ? 'deactivate' : 'activate';

    if (!confirm(`Are you sure you want to ${actionText} this distributor account?`)) {
      return;
    }

    try {
      let userId = safeDistributor.userId;
      
      // If userId is not available, try to find it using the find-by-application endpoint
      if (!userId) {
        const findResponse = await fetch(`http://localhost:5000/api/distributors/find-by-application/${applicationId}`);
        if (findResponse.ok) {
          const findData = await findResponse.json();
          userId = findData.data.id;
        }
      }

      // If still no userId, try the old method as fallback
      if (!userId) {
        const userResponse = await fetch(`http://localhost:5000/api/distributors?search=${safeDistributor.fullName}`);
        if (!userResponse.ok) {
          throw new Error('Failed to find distributor account');
        }
        
        const userData = await userResponse.json();
        const user = userData.data?.find((u: any) => 
          u.fullName === safeDistributor.fullName || 
          u.email === safeDistributor.email
        );
        
        if (!user) {
          throw new Error('Distributor account not found');
        }
        userId = user.id;
      }

      // Toggle the user account status
      const response = await fetch(`http://localhost:5000/api/distributors/${userId}/${action}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success(`Distributor account ${actionText}d successfully`);
        
        // Update local state immediately - only for the specific distributor
        setDistributors(prevDistributors => 
          prevDistributors.map(d => {
            if (d.id === applicationId) {
              return {
                ...d,
                isActive: !isCurrentlyActive
              };
            }
            return d;
          })
        );
        
        // Note: Removed automatic page refresh for immediate UI updates
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${actionText} account`);
      }
    } catch (error) {
      console.error(`Error ${action}ing account:`, error);
      toast.error(`Failed to ${actionText} account`);
    }
  }, [distributors]);

  // Generate random password
  const generatePassword = useCallback((distributorId: string) => {
    if (editingDistributorId === distributorId) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let password = '';
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setCredentialForms(prev => ({ 
        ...prev, 
        [distributorId]: { 
          ...prev[distributorId], 
          password 
        } 
      }));
    }
  }, [editingDistributorId]);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback((distributorId: string) => {
    if (editingDistributorId === distributorId) {
      setShowPassword(prev => ({
        ...prev,
        [distributorId]: !prev[distributorId]
      }));
    }
  }, [editingDistributorId]);

  // Start editing credentials
  const startEditing = useCallback((distributor: ApprovedDistributor) => {
    // Clear any existing editing state first
    setEditingCredentials(null);
    setEditingDistributorId(null);
    setCredentialForms({});
    setShowPassword({});
    
    // Create a deep copy of the distributor to prevent shared state issues
    const safeDistributor = JSON.parse(JSON.stringify(distributor));
    
    // Prepare form data
    const formData = {
      username: safeDistributor.credentials?.username || '',
      email: safeDistributor.credentials?.email || safeDistributor.email || '',
      password: safeDistributor.credentials?.password || '',
      categories: safeDistributor.credentials?.categories?.map(cat => cat.id) || []
    };
    
    // Use a single state update to set everything at once
    setCredentialForms({ [safeDistributor.id]: formData });
    setEditingCredentials(safeDistributor.id);
    setEditingDistributorId(safeDistributor.id);
  }, []);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    // Clear all form data and editing state
    setCredentialForms({});
    setEditingCredentials(null);
    setEditingDistributorId(null);
    setShowPassword({});
  }, []);

  useEffect(() => {
    fetchApprovedDistributors();
    fetchCategories();
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approved Distributors</h1>
          <p className="text-gray-600 mt-1">Manage credentials for approved distributors</p>
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

      {/* Distributors List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDistributors.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No approved distributors found</h3>
            <p className="text-gray-500">There are no approved distributors matching your criteria.</p>
          </div>
        ) : (
          filteredDistributors.map((distributor) => (
            <div key={`distributor-${distributor.id}-${distributor.isActive ? 'active' : 'inactive'}`} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                      <UserCheck className="h-6 w-6 text-white" />
                      </div>
                      <div>
                      <h3 className="text-lg font-semibold text-gray-900">{distributor.fullName}</h3>
                      <p className="text-sm text-gray-500">{distributor.companyName}</p>
                    </div>
                      </div>
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

              {/* Card Body */}
              <div className="p-6">
                {/* Contact Information */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                      <p className="text-sm font-medium text-gray-900">{distributor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Phone className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{distributor.mobileNumber}</p>
                    </div>
                  </div>
                </div>


                {/* Credentials Section */}
                {distributor.credentials ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Key className="h-4 w-4 text-green-600" />
                      <h4 className="text-sm font-semibold text-green-900">Current Credentials</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-green-700 font-medium uppercase tracking-wide">Username</p>
                        <p className="text-sm font-semibold text-green-900 mt-1">{distributor.credentials.username}</p>
                      </div>
                      <div>
                        <p className="text-xs text-green-700 font-medium uppercase tracking-wide">Email</p>
                        <p className="text-sm font-semibold text-green-900 mt-1">{distributor.credentials.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-green-700 font-medium uppercase tracking-wide">Password</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-sm font-semibold text-green-900">
                            {showPassword[distributor.id] ? distributor.credentials.password : '••••••••'}
                          </p>
                          <button
                            onClick={() => togglePasswordVisibility(distributor.id)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title={showPassword[distributor.id] ? 'Hide password' : 'Show password'}
                          >
                            {showPassword[distributor.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      {distributor.credentials.categories && distributor.credentials.categories.length > 0 && (
                        <div>
                          <p className="text-xs text-green-700 font-medium uppercase tracking-wide mb-2">Categories</p>
                          <div className="grid grid-cols-1 gap-2">
                            {distributor.credentials.categories.map((category, index) => {
                              const colors = [
                                'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 
                                'bg-teal-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500'
                              ];
                              const colorClass = colors[index % colors.length];
                              
                              return (
                                <div 
                                  key={category.id}
                                  className="flex items-center p-2 rounded-lg bg-white border border-gray-200 shadow-sm"
                                >
                                  <div className={`w-6 h-6 ${colorClass} rounded-md flex items-center justify-center mr-2 flex-shrink-0`}>
                                    {getCategoryIcon(category.title)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-xs font-semibold text-gray-900 truncate">
                                      {category.title}
                                    </h5>
                                    {category.description && (
                                      <p className="text-xs text-gray-500 truncate">
                                        {category.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-orange-600" />
                      <p className="text-sm text-orange-800 font-medium">No credentials set for this distributor.</p>
                    </div>
                  </div>
                )}

                {/* Edit Credentials Form */}
                {editingCredentials === distributor.id && editingDistributorId === distributor.id && (
                  <div key={`edit-form-${distributor.id}-${Date.now()}`} className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Set Credentials</h4>
                    <div className="space-y-4">
                          <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                              type="text"
                              value={editingDistributorId === distributor.id ? (credentialForms[distributor.id]?.username || '') : ''}
                              onChange={(e) => {
                                if (editingDistributorId === distributor.id) {
                                  setCredentialForms(prev => ({ 
                                    ...prev, 
                                    [distributor.id]: { 
                                      ...prev[distributor.id], 
                                      username: e.target.value 
                                    } 
                                  }));
                                }
                              }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="Enter username"
                            />
                          </div>
                          <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                              type="email"
                              value={editingDistributorId === distributor.id ? (credentialForms[distributor.id]?.email || '') : ''}
                              onChange={(e) => {
                                if (editingDistributorId === distributor.id) {
                                  setCredentialForms(prev => ({ 
                                    ...prev, 
                                    [distributor.id]: { 
                                      ...prev[distributor.id], 
                                      email: e.target.value 
                                    } 
                                  }));
                                }
                              }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="Enter email"
                            />
                          </div>
                          <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="flex space-x-2">
                              <input
                                type={showPassword[distributor.id] ? 'text' : 'password'}
                                value={editingDistributorId === distributor.id ? (credentialForms[distributor.id]?.password || '') : ''}
                                onChange={(e) => {
                                  if (editingDistributorId === distributor.id) {
                                    setCredentialForms(prev => ({ 
                                      ...prev, 
                                      [distributor.id]: { 
                                        ...prev[distributor.id], 
                                        password: e.target.value 
                                      } 
                                    }));
                                  }
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter password"
                            autoComplete="new-password"
                              />
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(distributor.id)}
                            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            title={showPassword[distributor.id] ? 'Hide password' : 'Show password'}
                              >
                                {showPassword[distributor.id] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => generatePassword(distributor.id)}
                            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                              >
                                <Key className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Categories</label>
                            <div className="max-h-48 overflow-y-auto">
                              {loadingCategories ? (
                                <div className="flex items-center justify-center py-8">
                                  <div className="text-sm text-gray-500">Loading categories...</div>
                                </div>
                              ) : availableCategories.length === 0 ? (
                                <div className="flex items-center justify-center py-8">
                                  <div className="text-sm text-gray-500">No categories available</div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 gap-3">
                                  {availableCategories.map((category, index) => {
                                    const isSelected = editingDistributorId === distributor.id ? (credentialForms[distributor.id]?.categories?.includes(category.id) || false) : false;
                                    const colors = [
                                      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 
                                      'bg-teal-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500'
                                    ];
                                    const colorClass = colors[index % colors.length];
                                    
                                    return (
                                      <label 
                                        key={category.id} 
                                        className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                          isSelected 
                                            ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={(e) => {
                                            if (editingDistributorId === distributor.id) {
                                              if (e.target.checked) {
                                                setCredentialForms(prev => ({
                                                  ...prev,
                                                  [distributor.id]: {
                                                    ...prev[distributor.id],
                                                    categories: [...(prev[distributor.id]?.categories || []), category.id]
                                                  }
                                                }));
                                              } else {
                                                setCredentialForms(prev => ({
                                                  ...prev,
                                                  [distributor.id]: {
                                                    ...prev[distributor.id],
                                                    categories: (prev[distributor.id]?.categories || []).filter(id => id !== category.id)
                                                  }
                                                }));
                                              }
                                            }
                                          }}
                                          className="sr-only"
                                        />
                                        
                                        {/* Icon */}
                                        <div className={`w-10 h-10 ${colorClass} rounded-lg flex items-center justify-center mr-3 flex-shrink-0`}>
                                          {getCategoryIcon(category.title)}
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                                              {category.title}
                                            </h4>
                                            {isSelected && (
                                              <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                                                <CheckCircle className="h-3 w-3 text-white" />
                                              </div>
                                            )}
                                          </div>
                                          {category.description && (
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                              {category.description}
                                            </p>
                                          )}
                                        </div>
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                          <button
                            onClick={cancelEditing}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveCredentials(distributor.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            <Save className="h-4 w-4" />
                            <span>Save Credentials</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => startEditing(distributor)}
                    className="flex items-center space-x-2 px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    <span className="text-sm font-medium">Edit</span>
                    </button>
                      <button
                    onClick={() => toggleDistributorStatus(distributor.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      distributor.isActive 
                        ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                        : 'text-green-600 bg-green-50 hover:bg-green-100'
                    }`}
                  >
                    {distributor.isActive ? (
                      <>
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Deactivate</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Activate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
}

