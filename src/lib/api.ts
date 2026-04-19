import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || "localhost";
const API_PORT = process.env.NEXT_PUBLIC_API_PORT || "8000";

function getApiBaseUrl(): string {
  if (typeof window === "undefined") return `http://localhost:${API_PORT}`;

  const host = window.location.hostname;
  const subdomain = host.endsWith(`.${BASE_DOMAIN}`)
    ? host.slice(0, -BASE_DOMAIN.length - 1)
    : null;

  const apiHost = subdomain ? `${subdomain}.${BASE_DOMAIN}` : BASE_DOMAIN;

  return `http://${apiHost}:${API_PORT}`;
}

// Public domain API — for login, register, my-organizations
export const publicApi: AxiosInstance = axios.create({
  baseURL: `http://${BASE_DOMAIN}:${API_PORT}`,
  headers: { "Content-Type": "application/json" },
});

// Tenant-aware API — baseURL set dynamically from current subdomain
export const api: AxiosInstance = axios.create({
  headers: { "Content-Type": "application/json" },
});

// Dynamically set baseURL before every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.baseURL = getApiBaseUrl();
  return config;
});

// Attach JWT to every request
const attachToken = (config: InternalAxiosRequestConfig) => {
  const token = Cookies.get("access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(attachToken);
publicApi.interceptors.request.use(attachToken);

// Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = Cookies.get("refresh_token");
        if (!refresh) throw new Error("No refresh token");

        const { data } = await publicApi.post("/api/v1/auth/refresh/", {
          refresh,
        });
        Cookies.set("access_token", data.access, { expires: 1 });
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        // Refresh failed — clear tokens and redirect to login
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        window.location.href = `http://${BASE_DOMAIN}:${process.env.NEXT_PUBLIC_APP_PORT || 3000}/login`;
      }
    }
    return Promise.reject(error);
  },
);

export default api;
