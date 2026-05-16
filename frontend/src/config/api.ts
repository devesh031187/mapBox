import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '@/store/authStore';

const baseURL = import.meta.env.VITE_API_BASE_URL as string;

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetriableConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

let refreshInFlight: Promise<string> | null = null;

async function performRefresh(): Promise<string> {
  const response = await axios.post<{
    success: boolean;
    data: { access_token: string };
  }>(
    `${baseURL}/auth/refresh`,
    {},
    { withCredentials: true },
  );
  const newToken = response.data.data.access_token;
  useAuthStore.getState().setAccessToken(newToken);
  return newToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login')
    ) {
      original._retry = true;
      try {
        if (!refreshInFlight) {
          refreshInFlight = performRefresh().finally(() => {
            refreshInFlight = null;
          });
        }
        const newToken = await refreshInFlight;
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization =
          `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.assign('/login');
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
