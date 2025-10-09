'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedToken = localStorage.getItem('distributor_token');
    const savedUser = localStorage.getItem('distributor_user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        apiClient.setToken(savedToken);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('distributor_token');
        localStorage.removeItem('distributor_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Check if user is a distributor
        if (data.data.role !== 'DISTRIBUTOR') {
          toast.error('Access denied. Only distributors can access this portal.');
          return false;
        }

        // Get user profile to get full user details
        const profileResponse = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${data.data.token}`,
            'Content-Type': 'application/json',
          },
        });

        const profileData = await profileResponse.json();
        
        if (profileData.success) {
          // Store token and user data
          setToken(data.data.token);
          apiClient.setToken(data.data.token);
          
          const userData = {
            id: profileData.data.user.id,
            email: profileData.data.user.email,
            name: profileData.data.user.fullName,
            distributorId: profileData.data.user.id,
            role: 'distributor' as const
          };
          
          setUser(userData);

          localStorage.setItem('distributor_token', data.data.token);
          localStorage.setItem('distributor_user', JSON.stringify(userData));

          return true;
        }
      }
      
      toast.error(data.message || 'Login failed');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    apiClient.setToken(null);
    localStorage.removeItem('distributor_token');
    localStorage.removeItem('distributor_user');
    toast.success('Logged out successfully');
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

