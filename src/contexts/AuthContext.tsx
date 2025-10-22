"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { API_URLS } from '@/lib/api-config';

// Define the user data structure
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string; // URL to the avatar image (optional)
  role: 'student' | 'instructor' | 'admin';
}

// Define the context value structure
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  login: (userData: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  isLoading: boolean;
  refreshAuthToken: () => Promise<boolean>;
  syncTokenToCookies: () => void;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Try to load user data and token from localStorage on initial load
    try {
      const storedToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('user');
      
      console.log('AuthContext - Loading tokens from localStorage:');
      console.log('accessToken:', storedToken?.substring(0, 20) + '...');
      console.log('refreshToken:', storedRefreshToken?.substring(0, 20) + '...');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
        setUser(JSON.parse(storedUser));
        
        // Sync token to cookies for middleware access
        document.cookie = `authToken=${storedToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        if (storedRefreshToken) {
          document.cookie = `refreshToken=${storedRefreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
        }
        
        console.log('AuthContext - Token synced from localStorage to cookies');
        console.log('Token preview:', storedToken.substring(0, 20) + '...');
      }
    } catch (error) {
      console.error("Failed to load auth data from localStorage", error);
      // Clear potentially corrupted data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData: User, authToken: string, refreshTokenValue?: string) => {
    try {
      // Ensure user has required fields
      const userWithDefaults = {
        ...userData,
        avatar: userData.avatar || '/images/default-avatar.svg',
        role: userData.role || 'student'
      };
      
      // Store user data and token
      setUser(userWithDefaults);
      setToken(authToken);
      if (refreshTokenValue) {
        setRefreshToken(refreshTokenValue);
      }
      
      // Persist to localStorage - lưu accessToken và refreshToken
      localStorage.setItem('user', JSON.stringify(userWithDefaults));
      localStorage.setItem('accessToken', authToken);
      if (refreshTokenValue) {
        localStorage.setItem('refreshToken', refreshTokenValue);
      }
      
      // Also store in cookies for middleware access
      document.cookie = `authToken=${authToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      if (refreshTokenValue) {
        document.cookie = `refreshToken=${refreshTokenValue}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      }
      
      console.log('AuthContext - Login successful');
      console.log('User:', userWithDefaults.name, 'Role:', userWithDefaults.role);
      console.log('AccessToken preview:', authToken.substring(0, 20) + '...');
      console.log('RefreshToken preview:', refreshTokenValue?.substring(0, 20) + '...');
    } catch (error) {
      console.error('Failed to save auth data:', error);
    }
  };

  const logout = async () => {
    try {
      // Always notify backend to revoke refresh token and clear its cookie
      await fetch(API_URLS.LOGOUT + (refreshToken ? `?refreshToken=${encodeURIComponent(refreshToken)}` : ''), {
        method: 'POST',
        // include credentials so backend can set/delete its HttpOnly cookie if CORS allows
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(() => {/* ignore network errors on logout */});
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear state and localStorage
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear cookies
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Redirect to home page
      router.push('/');
    }
  };

  const refreshAuthToken = async (): Promise<boolean> => {
    if (!refreshToken) {
      console.log('No refresh token available');
      return false;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.token;
        const newRefreshToken = data.refreshToken || refreshToken;
        
        // Update tokens
        setToken(newToken);
        setRefreshToken(newRefreshToken);
        localStorage.setItem('accessToken', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Update cookies
        document.cookie = `authToken=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        document.cookie = `refreshToken=${newRefreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
        
        console.log('Token refreshed successfully');
        return true;
      } else {
        // Refresh token is invalid, logout user
        logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return false;
    }
  };

  const syncTokenToCookies = () => {
    if (token) {
      document.cookie = `authToken=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      if (refreshToken) {
        document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      }
      console.log('AuthContext - Token synced to cookies manually');
    }
  };

  const value = {
    isAuthenticated: !!token,
    user,
    token,
    refreshToken,
    login,
    logout,
    isLoading,
    refreshAuthToken,
    syncTokenToCookies,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
