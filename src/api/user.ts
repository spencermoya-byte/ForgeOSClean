import axios from '../services/axios';

const getUser = async () => {
  const response = await axios.get('/users/me');
  return response.data;
};

const login = async (username: string, password: string) => {
  const response = await axios.post('/auth/login', { username, password });
  localStorage.setItem('token', response.data.token);
  return response.data;
};

const register = async (username: string, password: string) => {
  const response = await axios.post('/auth/register', { username, password });
  return response.data;
};

const logout = () => {
  localStorage.removeItem('token');
};

export default { getUser, login, register, logout };
