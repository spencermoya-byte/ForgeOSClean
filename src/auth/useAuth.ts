import { useState, useEffect } from 'react';
import { useAuth } from './authContext';

const useAuthFlow = () => {
  const { isAuthenticated, login, logout } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Simulate session check
    setTimeout(() => {
      if (!isAuthenticated) {
        logout();
      }
      setIsInitializing(false);
    }, 1000);
  }, [isAuthenticated, login, logout]);

  return { isAuthenticated, isInitializing };
};

export default useAuthFlow;
