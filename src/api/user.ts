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

const getUserProfile = async () => {
  const response = await axios.get('/profile/me');
  return response.data;
};

const updateUserProfile = async (newProfile: any) => {
  const response = await axios.put('/profile/update', newProfile);
  return response.data;
};

const updatePassword = async (newPassword: string) => {
  const response = await axios.post('/auth/change-password', { password: newPassword });
  return response.data;
};

export default { getUser, login, register, logout, getUserProfile, updateUserProfile, updatePassword };
