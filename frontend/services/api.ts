import axios, { AxiosInstance } from "axios";

/**
 * Baseline Axios client configured for FastAPI backend integration.
 * Base URL defaults to environment variable or standard fallback.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor (Ready for Authorization Tokens)
apiClient.interceptors.request.use(
  (config) => {
    // Auth token insertion placeholder for future milestone integration
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor (Ready for Global Error Handling)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log or format error responses uniformly
    return Promise.reject(error);
  }
);

export default apiClient;
