import axios, { AxiosInstance } from 'axios';
import { toast } from 'react-toastify';

const instance: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
});

instance.interceptors.request.use(
  (config) => {
    // Add any request headers here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
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
