import axios, { AxiosInstance } from 'axios';
import { toast } from 'react-toastify';

const instance: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
});

instance.interceptors.request.use(
  (config) => {
    // Add any request headers here
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Refresh token logic here
        const refreshResponse = await axios.post('/auth/refresh', { refreshToken: localStorage.getItem('refresh_token') });
        const newAccessToken = refreshResponse.data.accessToken;
        localStorage.setItem('access_token', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    if (error.response) {
      toast.error(`Error: ${error.response.status}`);
    } else if (error.request) {
      toast.error('No response received');
    } else {
      toast.error('Request failed');
    }
    return Promise.reject(error);
  }
);

export default instance;
