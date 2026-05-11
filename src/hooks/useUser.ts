import { useQuery } from 'react-query';
import userApi from '../api/user';

const useUser = () => {
  return useQuery('user', userApi.getUser, {
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

export default useUser;
