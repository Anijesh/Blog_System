import axios from 'axios';

// Configure the base URL for the Flask backend
const api = axios.create({
  baseURL: 'http://localhost:5001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// SWR global fetcher using the configured axios instance
export const fetcher = (url) => api.get(url).then((res) => res.data);

export default api;
