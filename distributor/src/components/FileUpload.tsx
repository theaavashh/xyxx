'use client';

import { Control, Controller } from 'react-hook-form';

import { FormData } from '@/types/formTypes';

interface FileUploadProps {
  name: keyof FormData;
  control: Control<FormData>;
  label: string;
  accept?: string;
  required?: boolean;
  error?: string;
}

export function FileUpload({ name, control, label, accept = "image/*,application/pdf", required = false, error }: FileUploadProps) {
  return (
    <div>
      <label className="block text-sm font-bold text-[#001011] mb-3 absans">
        {label} {required && '*'}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, ...field } }) => (
          <div className="space-y-3">
            {!value || typeof value === 'string' ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <label htmlFor={name} className="cursor-pointer">
                    <span className="text-sm text-gray-600 absans">फाइल छनोट गर्नुहोस् वा यहाँ ड्रयाग गर्नुहोस्</span>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                    <input
                      {...field}
                      id={name}
                      type="file"
                      accept={accept}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file);
                      }}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 absans">अपलोड भयो</p>
                      <p className="text-xs text-gray-500">{(value as File)?.name}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange(null)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {(value as File)?.type?.startsWith('image/') ? (
                  <div className="border border-gray-200 rounded-lg p-2 bg-white">
                    <img
                      src={URL.createObjectURL(value as File)}
                      alt={label}
                      className="w-full h-48 object-contain rounded"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-24 bg-white rounded-lg border border-gray-200">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                <div className="mt-3 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => window.open(URL.createObjectURL(value as File), '_blank')}
                    className="flex-1 px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors absans"
                  >
                    पूर्वावलोकन (Preview)
                  </button>
                  <label className="flex-1 px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200 transition-colors cursor-pointer text-center absans">
                    परिवर्तन (Change)
                    <input
                      {...field}
                      type="file"
                      accept={accept}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file);
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}