import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  type AxiosError,
} from "axios";

export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

export const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export async function request<T>(
  config: Parameters<typeof http.request>[0],
): Promise<ApiResponse<T>> {
  const res = await http.request<ApiResponse<T>>(config)
  return res.data
}