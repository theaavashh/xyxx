'use client';

import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Form-specific error boundary
export const FormErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const formErrorFallback = (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 absans">
              फारममा त्रुटि भयो
            </h3>
            <div className="mt-2 text-sm text-red-700 absans">
              <p>
                फारम प्रक्रिया गर्दा त्रुटि भएको छ। कृपया पृष्ठलाई रिफ्रेस गर्नुहोस् वा केही समयपछि पुन: प्रयास गर्नुहोस्।
                (An error occurred while processing the form. Please refresh the page or try again in a few moments.)
              </p>
              <p className="mt-2 text-xs">
                यदि समस्या जारी रहेमा, कृपया हामीलाई सम्पर्क गर्नुहोस्।
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors absans"
        >
          पृष्ठ रिफ्रेस गर्नुहोस्
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={formErrorFallback}>
      {children}
    </ErrorBoundary>
  );
};

// API-specific error boundary
export const ApiErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const apiErrorFallback = (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 absans">
              नेटवर्क त्रुटि
            </h3>
            <div className="mt-2 text-sm text-yellow-700 absans">
              <p>
                सर्भरसँग जडान गर्न सकिएन। कृपया आफ्नो इन्टरनेट कनेक्शन जाँच्नुहोस् र पुन: प्रयास गर्नुहोस्।
                (Unable to connect to the server. Please check your internet connection and try again.)
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex gap-4 justify-center">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors absans"
        >
          पुन: प्रयास गर्नुहोस्
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={apiErrorFallback}>
      {children}
    </ErrorBoundary>
  );
};

// Page-level error boundary
export const PageErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pageErrorFallback = (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-600 mb-4">
            <ExclamationTriangleIcon />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2 absans">
            पृष्ठ उपलब्ध छैन
          </h1>
          <p className="text-gray-600 mb-8 absans">
            माफ गर्नुहोस्, तपाईंले खोज्नुभएको पृष्ठ फेला परेन। कृपया गृह पृष्ठमा जानुहोस्।
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors absans"
            >
              पछि जानुहोस्
            </button>
            <a
              href="/"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors absans inline-block"
            >
              गृह पृष्ठ
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={pageErrorFallback}>
      {children}
    </ErrorBoundary>
  );
};