
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { verifyAdminCredentials } from '@/services/adminUserService'; 

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthContext] useEffect to check localStorage for isAdminLoggedIn.');
    try {
      const storedAuthState = localStorage.getItem('isAdminLoggedIn');
      if (storedAuthState === 'true') {
        console.log('[AuthContext] Found isAdminLoggedIn=true in localStorage.');
        setIsLoggedIn(true);
      } else {
        console.log('[AuthContext] No isAdminLoggedIn=true in localStorage.');
      }
    } catch (e) {
      console.warn("[AuthContext] Could not access localStorage for auth state.");
    }
    setIsLoading(false);
    console.log('[AuthContext] Initial auth state loading complete.');
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    console.log(`[AuthContext] Attempting login for username: ${username}`);
    setIsLoading(true);
    try {
      // Call the server action to verify credentials
      const result = await verifyAdminCredentials(username, password);

      if (result.success && result.user) {
        console.log(`[AuthContext] Login successful for ${username}. User data:`, result.user);
        setIsLoggedIn(true);
        try {
          localStorage.setItem('isAdminLoggedIn', 'true');
          console.log('[AuthContext] isAdminLoggedIn set to true in localStorage.');
        } catch (e) {
          console.warn("[AuthContext] Could not persist auth state to localStorage.");
        }
        setIsLoading(false);
        return true;
      } else {
        console.warn(`[AuthContext] Login failed for username: ${username}. Reason: ${result.message}`);
        setIsLoggedIn(false);
        setIsLoading(false);
        return false;
      }
    } catch (error: any) {
      // This error should now be a simple Error object thrown by the Server Action
      console.error("[AuthContext] Error during login process:", error.message, error.stack);
      setIsLoggedIn(false);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    console.log('[AuthContext] Logging out.');
    setIsLoggedIn(false);
    try {
      localStorage.removeItem('isAdminLoggedIn');
      console.log('[AuthContext] isAdminLoggedIn removed from localStorage.');
    } catch (e) {
       console.warn("[AuthContext] Could not remove auth state from localStorage.");
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
