// Simple test file to verify API integration
import { apiService } from './api';

// Test function to verify API connection
export async function testApiConnection() {
  try {
    console.log('Testing API connection...');
    
    // Test health endpoint
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Test applications endpoint (this might fail if no auth, but we can see the response)
    try {
      const appsResponse = await fetch(`${baseUrl}/applications`);
      const appsData = await appsResponse.json();
      console.log('Applications endpoint response:', appsData);
    } catch (error) {
      console.log('Applications endpoint error (expected if no auth):', error);
    }
    
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
}

// Export for use in development
if (typeof window !== 'undefined') {
  (window as any).testApiConnection = testApiConnection;
}


