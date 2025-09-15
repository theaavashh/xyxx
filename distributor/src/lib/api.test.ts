// Simple test file to verify API integration
import { apiService } from './api';

// Test function to verify API connection
export async function testApiConnection() {
  try {
    console.log('Testing API connection...');
    
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:5000/api/health');
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Test applications endpoint (this might fail if no auth, but we can see the response)
    try {
      const appsResponse = await fetch('http://localhost:5000/api/applications');
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


