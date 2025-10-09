// Configuration for the admin panel
export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  
  // App Configuration
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Admin Panel',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // Authentication
  tokenKey: 'admin_token',
  userKey: 'admin_user',
  
  // Role-based access
  allowedRoles: ['ADMIN', 'MANAGERIAL', 'SALES_MANAGER'] as const,
  
  // Development settings
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

export type AllowedRole = typeof config.allowedRoles[number];
