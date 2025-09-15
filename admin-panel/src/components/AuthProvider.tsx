'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types';
import { authService } from '@/lib/auth';
import { config } from '@/lib/config';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setIsLoading(true);
    
    try {
      // Check for stored user session first
      const storedUser = localStorage.getItem(config.userKey) || sessionStorage.getItem(config.userKey);
      if (storedUser) {
        try {2
          const user = JSON.parse(storedUser);
          // Quick token check without API call
          const token = authService.getToken();
          if (token) {
            setUser(user);
          } else {
            // Clear invalid session
            localStorage.removeItem(config.userKey);
            sessionStorage.removeItem(config.userKey);
          }
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem(config.userKey);
          sessionStorage.removeItem(config.userKey);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    }
    
    setIsLoading(false);
  };

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const loginResponse = await authService.login(email, password);
      
      if (loginResponse.success && loginResponse.data) {
        const { username, role } = loginResponse.data;
        // Convert API response to local User format
        const localUser: User = {
          id: username, // Using username as ID since we don't have full ID
          email: email, // Use the email from login form
          firstName: username,
          lastName: '',
          role: role as any,
          department: 'Management', // Default value
          employeeId: username,
          isActive: true,
          createdAt: new Date(),
          phoneNumber: '',
          joiningDate: new Date(),
          salary: 0,
          permissions: []
        };
        
        setUser(localUser);
        
        // Store user data based on remember me preference
        if (rememberMe) {
          localStorage.setItem(config.userKey, JSON.stringify(localUser));
        } else {
          sessionStorage.setItem(config.userKey, JSON.stringify(localUser));
        }
        
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    authService.logout();
    // Clear both localStorage and sessionStorage
    localStorage.removeItem(config.userKey);
    sessionStorage.removeItem(config.userKey);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}



