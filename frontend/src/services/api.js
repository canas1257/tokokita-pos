import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl) console.warn('VITE_API_URL belum diatur');
export const api = axios.create({ baseURL: apiUrl, timeout: 15000 });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('kasirToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
    localStorage.removeItem('kasirToken'); localStorage.removeItem('kasirUser'); window.location.href = '/login';
  }
  return Promise.reject(error);
});
export const errorMessage = error => error.response?.data?.message || 'Tidak dapat terhubung ke server';
