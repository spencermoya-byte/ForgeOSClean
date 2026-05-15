import { useQuery } from 'react-query';
import * as userApi from '../api/user';

const useUser = () => {
  return useQuery('user', userApi.getUserProfile, {
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

export default useUser;
