import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, ResponderProfile } from '../types/index';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { socketService } from '../services/socket';

interface AuthContextType {
  user: User | null;
  responderProfile: ResponderProfile | null;
  isLoading: boolean;
  login: (emailOrPhoneOrUsername: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [responderProfile, setResponderProfile] = useState<ResponderProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const response = await api.get('/users/me');
      if (response.data?.success) {
        setUser(response.data.data.user);
        setResponderProfile(response.data.data.responderProfile);
        await storage.saveUserData(response.data.data.user);
      }
    } catch (error) {
      console.warn('[AuthContext] Failed to refresh profile:', error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const token = await storage.getAccessToken();
      if (token) {
        await refreshProfile();
        await socketService.connect();
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (emailOrPhoneOrUsername: string, password: string) => {
    const res = await api.post('/auth/login', { emailOrPhoneOrUsername, password });
    if (res.data?.success) {
      const { user, accessToken, refreshToken } = res.data.data;
      await storage.saveTokens(accessToken, refreshToken);
      await storage.saveUserData(user);
      setUser(user);
      await refreshProfile();
      await socketService.connect();
    }
  };

  const register = async (payload: any) => {
    const res = await api.post('/auth/register', payload);
    if (res.data?.success) {
      const { user, accessToken, refreshToken } = res.data.data;
      await storage.saveTokens(accessToken, refreshToken);
      await storage.saveUserData(user);
      setUser(user);
      await refreshProfile();
      await socketService.connect();
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore API logout error
    } finally {
      await storage.clearSession();
      socketService.disconnect();
      setUser(null);
      setResponderProfile(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        responderProfile,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
