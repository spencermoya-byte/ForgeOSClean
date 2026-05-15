import React, { createContext, useState, useEffect } from 'react';
import * as userApi from '../api/user';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  getUserProfile: () => Promise<any>;
  updateUserProfile: (newProfile: any) => Promise<any>;
  updatePassword: (newPassword: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  getUserProfile: async () => {},
  updateUserProfile: async () => {},
  updatePassword: async () => {},
});

export { AuthContext };

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // Check for dev mode bypass
    const isDevMode = localStorage.getItem('forgeos_dev_auth') === 'true';
    if (isDevMode) {
      setIsAuthenticated(true);
      setUser({
        username: 'devuser',
        email: 'dev@example.com'
      });
      return;
    }
    
    // Check for session on initial load
    const token = localStorage.getItem('token');
    if (token) {
      getUser().then((userData) => {
        setUser(userData);
        setIsAuthenticated(true);
      }).catch(() => {
        logout();
      });
    }
  }, []);

  const login = async (username: string, password: string) => {
    await userApi.login(username, password);
    const userData = await getUser();
    setUser(userData);
    setIsAuthenticated(true);
  };

  const register = async (username: string, password: string) => {
    await userApi.register(username, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('forgeos_dev_auth');
    setUser(null);
    setIsAuthenticated(false);
  };

  const getUserProfile = async () => {
    const profileData = await userApi.getUserProfile();
    setUser(profileData);
    return profileData;
  };

  const updateUserProfile = async (newProfile: any) => {
    const updatedProfile = await userApi.updateUserProfile(newProfile);
    setUser(updatedProfile);
    return updatedProfile;
  };

  const updatePassword = async (newPassword: string) => {
    await userApi.updatePassword(newPassword);
  };

  const getUser = async () => {
    try {
      const userData = await userApi.getUserProfile();
      return userData;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout, getUserProfile, updateUserProfile, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
