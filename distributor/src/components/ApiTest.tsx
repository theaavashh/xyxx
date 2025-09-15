'use client';

import React, { useState } from 'react';

export default function ApiTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing API call...');
      const response = await fetch('http://localhost:5000/api/applications/dev');
      const data = await response.json();
      console.log('✅ API Response:', data);
      setResult(data);
    } catch (error) {
      console.error('❌ API Error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">API Test</h3>
      <button
        onClick={testApi}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API Call'}
      </button>
      
      {result && (
        <div className="mt-4">
          <h4 className="font-semibold">Result:</h4>
          <pre className="bg-white p-2 rounded border text-xs overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}


