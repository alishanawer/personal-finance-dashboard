import axios from "axios";
import useStore from "../store";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const { auth } = useStore.getState();
    if (auth?.accessToken) {
      config.headers.Authorization = `Bearer ${auth.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: auto logout if token expired (401)
    if (error.response?.status === 401) {
      useStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
