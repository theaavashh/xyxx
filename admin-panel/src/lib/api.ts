import { config } from './config';
import toast from 'react-hot-toast';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

// HTTP Client class
class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem(config.tokenKey);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      // Better error message handling
      let errorMessage = data.message || data.error || `HTTP Error ${response.status}`;
      
      // If message is empty or just whitespace, provide a more descriptive message
      if (!errorMessage || errorMessage.trim() === '') {
        errorMessage = `HTTP Error ${response.status}: ${response.statusText || 'Unknown error'}`;
      }
      
      const error: ApiError = {
        message: errorMessage,
        status: response.status,
        details: data,
      };
      
      console.log('HTTP Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data,
        errorMessage
      });
      
      throw error;
    }

    return data;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      ...this.defaultHeaders,
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        // Network or other fetch errors
        throw {
          message: error.message,
          status: 0,
          details: error,
        } as ApiError;
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // File upload method
  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const headers = this.getAuthHeaders();
    // Don't set Content-Type for FormData, let browser set it with boundary
    
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: formData,
    });
  }
}

// Create HTTP client instance
export const httpClient = new HttpClient(config.apiUrl);

// API Error handler utility
export const handleApiError = (error: ApiError | Error | any, showToast = true) => {
  // Safely log the error with better handling for empty objects
  if (error && typeof error === 'object') {
    // Check if it's an empty object or has no meaningful properties
    const hasProperties = Object.keys(error).length > 0;
    const hasMessage = error.message && error.message.trim() !== '';
    const hasStatus = error.status !== undefined && error.status !== null;
    
    if (hasProperties && (hasMessage || hasStatus)) {
      console.error('API Error:', error);
    } else {
      console.error('API Error: Empty or invalid error object:', error);
    }
  } else if (error) {
    console.error('API Error:', error);
  } else {
    console.error('API Error: Unknown error occurred');
  }
  
  // Normalize error object with better fallbacks
  const normalizedError: ApiError = {
    message: (error?.message && error.message.trim() !== '') 
      ? error.message 
      : 'An unknown error occurred',
    status: (error?.status !== undefined && error.status !== null) 
      ? error.status 
      : 0,
    details: error?.details || (error && Object.keys(error).length > 0 ? error : null)
  };
  
  if (showToast) {
    let message = normalizedError.message;
    
    // Handle specific error cases
    switch (normalizedError.status) {
      case 401:
        message = 'Unauthorized. Please login to access this feature.';
        // Don't clear tokens automatically, let the user decide
        break;
      case 403:
        message = 'Access denied. You do not have permission to perform this action.';
        break;
      case 404:
        message = 'Resource not found.';
        break;
      case 422:
        message = 'Validation error. Please check your input.';
        break;
      case 429:
        message = 'Too many requests. Please try again later.';
        break;
      case 500:
        message = 'Server error. Please try again later.';
        break;
      case 0:
        message = 'Network error. Please check your connection.';
        break;
      default:
        // For unknown errors, don't show toast to avoid spam
        if (normalizedError.status && normalizedError.status >= 400) {
          message = `Request failed with status ${normalizedError.status}`;
        } else {
          // Don't show toast for network errors or unknown issues
          return normalizedError;
        }
    }
    
    // Only show toast for critical errors, not for authentication issues
    if (normalizedError.status !== 401) {
      toast.error(message);
    }
  }
  
  return normalizedError;
};

// API wrapper with error handling
export const apiCall = async <T>(
  apiFunction: () => Promise<ApiResponse<T>>,
  showSuccessToast = false,
  successMessage = 'Operation completed successfully'
): Promise<T | null> => {
  try {
    const response = await apiFunction();
    
    if (showSuccessToast && response.success) {
      toast.success(response.message || successMessage);
    }
    
    return response.data || null;
  } catch (error) {
    // Add debugging information to understand what type of error we're getting
    console.log('apiCall caught error:', {
      type: typeof error,
      constructor: error?.constructor?.name,
      isError: error instanceof Error,
      keys: error && typeof error === 'object' ? Object.keys(error) : 'not an object',
      error
    });
    
    handleApiError(error);
    return null;
  }
};

// Retry mechanism for failed requests
export const retryApiCall = async <T>(
  apiFunction: () => Promise<ApiResponse<T>>,
  maxRetries = 3,
  delay = 1000
): Promise<T | null> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await apiFunction();
      return response.data || null;
    } catch (error) {
      const apiError = error as ApiError;
      
      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (apiError.status >= 400 && apiError.status < 500 && apiError.status !== 429) {
        handleApiError(apiError);
        return null;
      }
      
      if (attempt === maxRetries) {
        handleApiError(apiError);
        return null;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  return null;
};

export default httpClient;








