import { useEffect, useState } from 'react';
import * as userApi from '../api/user';

const useUser = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const user = await userApi.getUserProfile();

        if (mounted) {
          setData(user);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    data,
    isLoading,
    error,
  };
};

export default useUser;
