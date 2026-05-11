import axios from '../services/axios';

const getUser = async () => {
  const response = await axios.get('/users/me');
  return response.data;
};

export default { getUser };
