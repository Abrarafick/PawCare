import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add JWT Bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('pawcare_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register')
    ) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('pawcare_refresh_token');
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh });
          const newAccess = res.data.access;
          localStorage.setItem('pawcare_access_token', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return apiClient(originalRequest);
        } catch {
          localStorage.removeItem('pawcare_access_token');
          localStorage.removeItem('pawcare_refresh_token');
          localStorage.removeItem('pawcare_user');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('pawcare_access_token');
        localStorage.removeItem('pawcare_refresh_token');
        localStorage.removeItem('pawcare_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

