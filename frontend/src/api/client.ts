import axios from 'axios';

const rawBase = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = rawBase
  ? (rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/$/, '')}/api`)
  : '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token to protected requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('diagno_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh / friendly error formatting
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized token expiry if refresh token exists
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('diagno_refresh_token');
      
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          localStorage.setItem('diagno_access_token', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return apiClient(originalRequest);
        } catch {
          // Token refresh failed, clear tokens
          localStorage.removeItem('diagno_access_token');
          localStorage.removeItem('diagno_refresh_token');
          localStorage.removeItem('diagno_user');
          window.dispatchEvent(new Event('auth-logout'));
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to extract user-friendly error messages from Django errors
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (!data) {
      if (error.message === 'Network Error') {
        return 'Unable to reach the server. Please check your network connection.';
      }
      return error.message || 'An unexpected error occurred.';
    }

    if (typeof data === 'string') return data;

    // Double-booking check: error response may contain detail or non_field_errors
    if (data.detail) {
      if (data.detail.toLowerCase().includes('already booked')) {
        return 'This time slot is no longer available. Please choose another time or date.';
      }
      return data.detail;
    }

    if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
      const msg = data.non_field_errors.join(' ');
      if (msg.includes('unique set') || msg.includes('booked')) {
        return 'This time slot is no longer available. Please choose another time or date.';
      }
      return msg;
    }

    // Collect first field validation error
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const val = data[firstKey];
      if (Array.isArray(val)) {
        return `${firstKey}: ${val[0]}`;
      }
      if (typeof val === 'string') {
        return `${firstKey}: ${val}`;
      }
    }
  }
  return 'An unexpected error occurred. Please try again.';
}
