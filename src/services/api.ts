import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://a5e707978f40247c2824e0cfc2c9fb3a-384219716.us-east-1.elb.amazonaws.com:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rednorte_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor to handle specific HTTP errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        console.warn('Unauthorized request (401). Clearing token.');
        localStorage.removeItem('rednorte_jwt_token');
        localStorage.removeItem('rednorte_user_role');
        localStorage.removeItem('rednorte_username');
        localStorage.removeItem('rednorte_rut');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
