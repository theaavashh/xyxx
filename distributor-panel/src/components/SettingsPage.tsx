'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  Key, 
  Lock, 
  User, 
  Bell, 
  Monitor,
  Smartphone,
  Globe,
  Mail,
  CreditCard,
  Database,
  Settings as SettingsIcon,
  LogOut,
  Moon,
  Sun,
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import PersonalInfoModal from '@/components/PersonalInfoModal';

const SettingsPage: React.FC = () => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPersonalInfoModalOpen, setIsPersonalInfoModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('general');

  const settingsConfig = {
    general: {
      title: 'General Settings',
      icon: <SettingsIcon className="h-5 w-5" />,
      items: [
        {
          label: 'Profile Information',
          description: 'Update your name, email and contact details',
          icon: <User className="h-5 w-5" />,
          badge: null,
          action: () => setIsPersonalInfoModalOpen(true),
          color: 'blue'
        },
        {
          label: 'Email Preferences',
          description: 'Configure email notifications and communications',
          icon: <Mail className="h-5 w-5" />,
          badge: 'Updated',
          action: () => console.log('Email'),
          color: 'green'
        },
        {
          label: 'Language & Region',
          description: 'Set your preferred language and timezone',
          icon: <Globe className="h-5 w-5" />,
          badge: null,
          action: () => console.log('Language'),
          color: 'purple'
        }
      ]
    },
    security: {
      title: 'Security & Privacy',
      icon: <Shield className="h-5 w-5" />,
      items: [
        {
          label: 'Change Password',
          description: 'Update your account password for security',
          icon: <Key className="h-5 w-5" />,
          badge: null,
          action: () => setIsPasswordModalOpen(true),
          color: 'red'
        },
        {
          label: 'Two-Factor Authentication',
          description: 'Add an extra layer of security to your account',
          icon: <Lock className="h-5 w-5" />,
          badge: 'Recommended',
          action: () => console.log('2FA'),
          color: 'orange'
        },
        {
          label: 'Login Activity',
          description: 'View recent login attempts and security events',
          icon: <Database className="h-5 w-5" />,
          badge: 'New',
          action: () => console.log('Login Activity'),
          color: 'indigo'
        }
      ]
    },
    payments: {
      title: 'Payment & Billing',
      icon: <CreditCard className="h-5 w-5" />,
      items: [
        {
          label: 'Payment Methods',
          description: 'Manage your payment cards and billing info',
          icon: <CreditCard className="h-5 w-5" />,
          badge: null,
          action: () => console.log('Payment Methods'),
          color: 'green'
        },
        {
          label: 'Billing History',
          description: 'View your transaction history and invoices',
          icon: <Database className="h-5 w-5" />,
          badge: null,
          action: () => console.log('Billing'),
          color: 'blue'
        }
      ]
    },
    preferences: {
      title: 'Preferences',
      icon: <SettingsIcon className="h-5 w-5" />,
      items: [
        {
          label: 'Appearance',
          description: 'Customize theme and display settings',
          icon: <Moon className="h-5 w-5" />,
          badge: null,
          action: () => console.log('Appearance'),
          color: 'purple'
        },
        {
          label: 'Notifications',
          description: 'Control how you receive alerts and updates',
          icon: <Bell className="h-5 w-5" />,
          badge: '3 Active',
          action: () => console.log('Notifications'),
          color: 'blue'
        },
        {
          label: 'API Access',
          description: 'Manage API keys and integrations',
          icon: <ExternalLink className="h-5 w-5" />,
          badge: 'Pro',
          action: () => console.log('API'),
          color: 'gray'
        }
      ]
    }
  };

  const sections = Object.keys(settingsConfig) as Array<keyof typeof settingsConfig>;

  const getBadgeColor = (badge: string) => {
    const badgeColors: Record<string, string> = {
      'New': 'bg-green-100 text-green-800',
      'Updated': 'bg-blue-100 text-blue-800',
      'Recommended': 'bg-orange-100 text-orange-800',
      'Pro': 'bg-purple-100 text-purple-800'
    };
    return badgeColors[badge] || 'bg-gray-100 text-gray-800';
  };

  const getItemColor = (color: string) => {
    const colorMap: Record<string, { bg: string; iconBg: string; iconColor: string }> = {
      blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
      green: { bg: 'bg-green-50', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
      red: { bg: 'bg-red-50', iconBg: 'bg-red-100', iconColor: 'text-red-600' },
      orange: { bg: 'bg-orange-50', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
      purple: { bg: 'bg-purple-50', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
      indigo: { bg: 'bg-indigo-50', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
      gray: { bg: 'bg-gray-50', iconBg: 'bg-gray-100', iconColor: 'text-gray-600' }
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-gray-600" />
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                      activeSection === section
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5">
                        {settingsConfig[section].icon}
                      </div>
                      <span>{settingsConfig[section].title}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Section Header */}
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {settingsConfig[activeSection].title}
                </h2>
              </div>

              {/* Settings Items */}
              <div className="divide-y divide-gray-200">
                {settingsConfig[activeSection].items.map((item, index) => {
                  const colors = getItemColor(item.color);
                  
                  return (
                    <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`p-3 ${colors.iconBg} rounded-lg`}>
                            <div className={colors.iconColor}>{item.icon}</div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 text-base">{item.label}</h3>
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {item.badge && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor(item.badge)}`}>
                              {item.badge}
                            </span>
                          )}
                          <button
                            onClick={item.action}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Section Footer */}
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Info className="h-4 w-4" />
                  <span>
                    Need help with {settingsConfig[activeSection].title}?{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                      Visit Help Center
                    </a>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors">
                  <Database className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">Export Data</div>
                  <div className="text-xs text-gray-500 mt-1">Download all your data</div>
                </button>
                
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors">
                  <ExternalLink className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">Integrations</div>
                  <div className="text-xs text-gray-500 mt-1">Connect third-party apps</div>
                </button>
                
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors">
                  <SettingsIcon className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">Advanced</div>
                  <div className="text-xs text-gray-500 mt-1">Developer options</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      {/* Personal Information Modal */}
      <PersonalInfoModal 
        isOpen={isPersonalInfoModalOpen}
        onClose={() => setIsPersonalInfoModalOpen(false)}
      />
    </div>
  );
};

export default SettingsPage;