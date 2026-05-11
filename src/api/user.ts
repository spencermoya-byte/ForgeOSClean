import axios from './axios';

export const login = async (username: string, password: string) => {
  const response = await axios.post('/auth/login', { username, password });
  localStorage.setItem('token', response.data.token);
  return response.data;
};

export const register = async (username: string, password: string) => {
  const response = await axios.post('/auth/register', { username, password });
  return response.data;
};

export const getUserProfile = async () => {
  const response = await axios.get('/auth/profile');
  return response.data;
};

export const updateUserProfile = async (newProfile: any) => {
  const response = await axios.put('/auth/profile', newProfile);
  return response.data;
};

export const updatePassword = async (newPassword: string) => {
  const response = await axios.put('/auth/password', { newPassword });
  return response.data;
};

export default {
  login,
  register,
  getUserProfile,
  updateUserProfile,
  updatePassword,
};
