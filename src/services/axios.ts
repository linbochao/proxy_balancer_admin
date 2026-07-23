import axios, {
  type AxiosInstance,
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
  console.log("request", import.meta) // 打印请求信息
  const res = await http.request<ApiResponse<T>>(config)
  return res.data
}