import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/user';

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

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // Check for session on initial load
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      getUser().then((userData) => {
        setUser(userData);
        setIsAuthenticated(true);
      }).catch(() => {
        logout();
      });
    }
  }, []);

  const login = async (username: string, password: string) => {
    await axios.login(username, password);
    const userData = await getUser();
    setUser(userData);
    setIsAuthenticated(true);
  };

  const register = async (username: string, password: string) => {
    await axios.register(username, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const getUserProfile = async () => {
    const profileData = await axios.getUserProfile();
    setUser(profileData);
    return profileData;
  };

  const updateUserProfile = async (newProfile: any) => {
    const updatedProfile = await axios.updateUserProfile(newProfile);
    setUser(updatedProfile);
    return updatedProfile;
  };

  const updatePassword = async (newPassword: string) => {
    await axios.updatePassword(newPassword);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout, getUserProfile, updateUserProfile, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};
