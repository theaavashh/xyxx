import { config } from './config';

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    username: string;
    role: string;
    token: string;
  };
  error?: string;
}

interface UserProfileResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      username: string;
      fullName: string;
      address: string;
      department: string;
      position: string;
      role: string;
      isActive: boolean;
      createdAt: string;
    };
  };
  error?: string;
}

class AuthService {
  private readonly baseURL: string;

  constructor() {
    this.baseURL = config.apiUrl;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.data) {
        // Check if user has managerial access
        const userRole = data.data.role;
        if (!config.allowedRoles.includes(userRole as any)) {
          return {
            success: false,
            message: 'Access denied. Only managerial users can access the admin panel.',
            error: 'INSUFFICIENT_PERMISSIONS'
          };
        }

        // Store token in localStorage
        localStorage.setItem(config.tokenKey, data.data.token);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
        error: 'NETWORK_ERROR'
      };
    }
  }

  async getProfile(): Promise<UserProfileResponse> {
    try {
      const token = localStorage.getItem(config.tokenKey);
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
          error: 'NO_TOKEN'
        };
      }

      const response = await fetch(`${this.baseURL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data: UserProfileResponse = await response.json();

      if (!data.success && response.status === 401) {
        // Token expired or invalid, remove it
        this.logout();
      }

      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
        error: 'NETWORK_ERROR'
      };
    }
  }

  logout(): void {
    localStorage.removeItem(config.tokenKey);
    localStorage.removeItem(config.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(config.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Basic token validation (check if it's not expired)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      // Invalid token format
      this.logout();
      return false;
    }
  }
}

export const authService = new AuthService();
export type { LoginResponse, UserProfileResponse };
