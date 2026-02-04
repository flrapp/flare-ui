import axios from 'axios';

const baseURL = "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let clearUserCallback: (() => void) | null = null;

export function setAuthClearCallback(callback: () => void) {
  clearUserCallback = callback;
}

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      if (clearUserCallback) {
        clearUserCallback();
      }

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data?.detail || error.response.data?.title || 'You do not have permission to perform this action');
    }
    return Promise.reject(error);
  }
);
