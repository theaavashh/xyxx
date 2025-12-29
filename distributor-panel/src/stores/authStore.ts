import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, AuthState } from '@/types';

interface AuthStore extends AuthState {
  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        setUser: (user) => {
          set({ user, isAuthenticated: !!user }, false, 'setUser');
        },

        setToken: (token) => {
          set({ token }, false, 'setToken');
          if (token) {
            localStorage.setItem('auth_token', token);
          } else {
            localStorage.removeItem('auth_token');
          }
        },

        setLoading: (isLoading) => {
          set({ isLoading }, false, 'setLoading');
        },

        setError: (error) => {
          set({ error }, false, 'setError');
        },

        login: async (email: string, password: string) => {
          const { setLoading, setError, setUser, setToken } = get();
          
          try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.message || 'Login failed');
            }

            const { user, token } = data.data;
            
            setUser(user);
            setToken(token);
            setLoading(false);
            
            return true;
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Login failed');
            setLoading(false);
            return false;
          }
        },

        logout: () => {
          const { user } = get();
          
          // Call logout API if we have a user
          if (user) {
            fetch('/api/auth/logout', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
              },
            }).catch(() => {
              // Ignore errors during logout
            });
          }

          // Clear state and localStorage
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
            isLoading: false,
          }, false, 'logout');
          
          localStorage.removeItem('auth_token');
        },

        refreshToken: async () => {
          const { setToken, setUser } = get();
          const currentToken = localStorage.getItem('auth_token');
          
          if (!currentToken) return false;

          try {
            const response = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`,
              },
            });

            if (!response.ok) {
              throw new Error('Token refresh failed');
            }

            const data = await response.json();
            setToken(data.data.token);
            setUser(data.data.user);
            
            return true;
          } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
          }
        },

        updateProfile: async (data: Partial<User>) => {
          const { user, setUser } = get();
          
          if (!user) return false;

          try {
            const response = await fetch('/api/auth/profile', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
              },
              body: JSON.stringify(data),
            });

            if (!response.ok) {
              throw new Error('Profile update failed');
            }

            const updatedUser = await response.json();
            setUser(updatedUser.data);
            
            return true;
          } catch (error) {
            console.error('Profile update failed:', error);
            return false;
          }
        },
      }),
      {
        name: 'distributor-auth-storage',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);