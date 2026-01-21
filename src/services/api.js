import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true // This allows sending cookies to the backend
});

// Memory storage for token
let accessToken = null;

// Helper to set token from AuthProvider
export const setAuthToken = (token) => {
  accessToken = token;
};

// Request Interceptor: Attach the memory token
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 403/401 (Expired Token)
api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't try to refresh if we are already calling refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refreshToken")
    ) {
      originalRequest._retry = true;
      try {
        const res = await api.post("/auth/refreshToken");
        setAuthToken(res.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        // Refresh failed logout or redirect
        setAuthToken(null);
        window.location.href = "/";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);


export default api;
