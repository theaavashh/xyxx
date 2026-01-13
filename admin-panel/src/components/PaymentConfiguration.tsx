'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  QrCode, 
  Building2, 
  Globe, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye,
  EyeOff
} from 'lucide-react';
import { PaymentConfig } from '@/types';
import { paymentConfigService } from '@/services/paymentConfig.service';
import toast from 'react-hot-toast';

interface PaymentConfigurationProps {
  searchTerm?: string;
}

export default function PaymentConfiguration({ searchTerm }: PaymentConfigurationProps) {
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<PaymentConfig | null>(null);
  const [formData, setFormData] = useState<Omit<PaymentConfig, 'id' | 'createdAt' | 'updatedAt'>>({
    companyType: 'bank',
    businessName: '',
    businessId: '',
    isActive: true,
    bankName: '',
    branchName: '',
    bankAccountNumber: '',
    bankAccountName: '',
    swiftCode: '',
    gatewayName: '',
    supportedMethods: [],
    apiKey: '',
    secretKey: '',
    merchantId: '',
    webhookUrl: '',
    qrCodeUrl: '',
    paymentInstructions: '',
    contactPhone: '',
    contactEmail: '',
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Load payment configurations on component mount
  useEffect(() => {
    loadPaymentConfigs();
  }, []);

  const loadPaymentConfigs = async () => {
    try {
      setIsLoading(true);
      const configs = await paymentConfigService.getPaymentConfigs();
      setPaymentConfigs(configs);
    } catch (error) {
      console.error('Error loading payment configurations:', error);
      toast.error('Failed to load payment configurations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      companyType: 'bank',
      businessName: '',
      businessId: '',
      isActive: true,
      bankName: '',
      branchName: '',
      bankAccountNumber: '',
      bankAccountName: '',
      swiftCode: '',
      gatewayName: '',
      supportedMethods: [],
      apiKey: '',
      secretKey: '',
      merchantId: '',
      webhookUrl: '',
      qrCodeUrl: '',
      paymentInstructions: '',
      contactPhone: '',
      contactEmail: '',
    });
    setSelectedConfig(null);
    setShowAddModal(true);
  };

  const handleEdit = (config: PaymentConfig) => {
    setSelectedConfig(config);
    setFormData({
      companyType: config.companyType,
      businessName: config.businessName,
      businessId: config.businessId || '',
      isActive: config.isActive,
      bankName: config.bankName || '',
      branchName: config.branchName || '',
      bankAccountNumber: config.bankAccountNumber || '',
      bankAccountName: config.bankAccountName || '',
      swiftCode: config.swiftCode || '',
      gatewayName: config.gatewayName || '',
      supportedMethods: config.supportedMethods || [],
      apiKey: config.apiKey || '',
      secretKey: config.secretKey || '',
      merchantId: config.merchantId || '',
      webhookUrl: config.webhookUrl || '',
      qrCodeUrl: config.qrCodeUrl || '',
      paymentInstructions: config.paymentInstructions || '',
      contactPhone: config.contactPhone || '',
      contactEmail: config.contactEmail || '',
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment configuration?')) {
      try {
        await paymentConfigService.deletePaymentConfig(id);
        setPaymentConfigs(prev => prev.filter(config => config.id !== id));
        toast.success('Payment configuration deleted successfully');
      } catch (error) {
        console.error('Error deleting payment configuration:', error);
        toast.error('Failed to delete payment configuration');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (selectedConfig) {
        // Update existing configuration
        const updatedConfig = await paymentConfigService.updatePaymentConfig(selectedConfig.id, formData);
        if (updatedConfig) {
          setPaymentConfigs(prev => 
            prev.map(config => config.id === selectedConfig.id ? updatedConfig : config)
          );
          toast.success('Payment configuration updated successfully');
          setShowEditModal(false);
        }
      } else {
        // Create new configuration
        const newConfig = await paymentConfigService.createPaymentConfig(formData);
        if (newConfig) {
          setPaymentConfigs(prev => [...prev, newConfig]);
          toast.success('Payment configuration created successfully');
          setShowAddModal(false);
        }
      }
    } catch (error) {
      console.error('Error saving payment configuration:', error);
      toast.error('Failed to save payment configuration');
    }
  };

  const filteredConfigs = paymentConfigs.filter(config => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      config.businessName.toLowerCase().includes(searchLower) ||
      (config.bankName?.toLowerCase().includes(searchLower) || false) ||
      (config.gatewayName?.toLowerCase().includes(searchLower) || false) ||
      (config.businessId?.toLowerCase().includes(searchLower) || false) ||
      (config.bankAccountNumber?.toLowerCase().includes(searchLower) || false)
    );
  });

  const renderPaymentConfigs = () => (
    <div className="space-y-4">
      {filteredConfigs.map((config) => (
        <div key={config.id} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-medium text-gray-900">
                  {config.businessName}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  config.companyType === 'bank' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {config.companyType === 'bank' ? 'Bank' : 'Payment Gateway'}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  config.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {config.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                {config.businessId && (
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                    <span>ID: {config.businessId}</span>
                  </div>
                )}
                
                {config.companyType === 'bank' ? (
                  <>
                    {config.bankName && (
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                        <span>Bank: {config.bankName}</span>
                      </div>
                    )}
                    {config.branchName && (
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                        <span>Branch: {config.branchName}</span>
                      </div>
                    )}
                    {config.bankAccountNumber && (
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                        <span>Account: {config.bankAccountNumber}</span>
                      </div>
                    )}
                    {config.bankAccountName && (
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                        <span>Account Name: {config.bankAccountName}</span>
                      </div>
                    )}
                    {config.swiftCode && (
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-gray-500" />
                        <span>SWIFT: {config.swiftCode}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {config.gatewayName && (
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-gray-500" />
                        <span>Gateway: {config.gatewayName}</span>
                      </div>
                    )}
                    {config.supportedMethods && config.supportedMethods.length > 0 && (
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-gray-500" />
                        <span>Methods: {config.supportedMethods.join(', ')}</span>
                      </div>
                    )}
                    {config.merchantId && (
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                        <span>Merchant ID: {config.merchantId}</span>
                      </div>
                    )}
                  </>
                )}
                
                {config.qrCodeUrl && (
                  <div className="flex items-center">
                    <QrCode className="w-4 h-4 mr-2 text-gray-500" />
                    <span>QR Code: </span>
                    <a 
                      href={config.qrCodeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-1 text-blue-600 hover:text-blue-800 underline"
                    >
                      View QR
                    </a>
                  </div>
                )}
                
                {config.contactPhone && (
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                    <span>Phone: {config.contactPhone}</span>
                  </div>
                )}
                
                {config.contactEmail && (
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-gray-500" />
                    <span>Email: {config.contactEmail}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEdit(config)}
                className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                title="Edit configuration"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(config.id)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete configuration"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderForm = () => {
    const isEdit = !!selectedConfig;
    const title = isEdit ? 'Edit Payment Configuration' : 'Add Payment Configuration';

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setSelectedConfig(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* QR Code Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QR Code URL
              </label>
              <input
                type="url"
                value={formData.qrCodeUrl || ''}
                onChange={(e) => setFormData({ ...formData, qrCodeUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com/qr-code.png"
              />
              <p className="mt-1 text-sm text-gray-500">
                URL to the QR code image for payment
              </p>
            </div>

            {/* Bank Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankName || ''}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Nabil Bank"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={formData.branchName || ''}
                  onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., New Road Branch"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.bankAccountNumber || ''}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 1234567890"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={formData.bankAccountName || ''}
                  onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Your Company Name"
                />
              </div>
            </div>

            {/* Payment Gateway Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Gateway</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gateway Name
                  </label>
                  <input
                    type="text"
                    value={formData.paymentGateway || ''}
                    onChange={(e) => setFormData({ ...formData, paymentGateway: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., eSewa, Khalti, IME Pay"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={formData.paymentGatewayApiKey || ''}
                      onChange={(e) => setFormData({ ...formData, paymentGatewayApiKey: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                      placeholder="Enter API key"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secret Key
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? "text" : "password"}
                      value={formData.paymentGatewaySecret || ''}
                      onChange={(e) => setFormData({ ...formData, paymentGatewaySecret: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                      placeholder="Enter secret key"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setSelectedConfig(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
            >
              {isEdit ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment configurations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Configuration</h1>
          <p className="text-gray-600 mt-1">Manage payment methods and gateway configurations</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Payment Configuration
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {filteredConfigs.length > 0 ? (
          renderPaymentConfigs()
        ) : (
          <div className="text-center py-12">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payment configurations</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first payment configuration.
            </p>
            <div className="mt-6">
              <button
                onClick={handleAdd}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Configuration
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && renderForm()}
      {showEditModal && renderForm()}
    </div>
  );
}