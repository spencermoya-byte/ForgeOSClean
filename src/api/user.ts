import axios from './axios';

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export const login = async (username: string, password: string): Promise<void> => {
  const response = await axios.post('/auth/login', { username, password });
  const { token } = response.data;
  localStorage.setItem('token', token);
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const register = async (username: string, password: string): Promise<void> => {
  await axios.post('/auth/register', { username, password });
};

export const getUserProfile = async (): Promise<User> => {
  const response = await axios.get('/auth/profile');
  return response.data;
};

export const updateUserProfile = async (profile: Partial<User>): Promise<User> => {
  const response = await axios.put('/auth/profile', profile);
  return response.data;
};

export const updatePassword = async (newPassword: string): Promise<void> => {
  await axios.put('/auth/password', { newPassword });
};
