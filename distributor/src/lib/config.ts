// Configuration for the distributor application
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  appName: 'Distributor Portal',
  version: '1.0.0',
} as const;


