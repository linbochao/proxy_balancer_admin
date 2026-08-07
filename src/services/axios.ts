import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  type AxiosError,
} from "axios";
import { ElMessage } from "element-plus";
import { getToken, setToken, getRefreshToken, getOrganizationId, clearAuth } from "@/utils/auth";

export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

/** 系统接口路径前缀（认证服务等），可通过环境变量 VITE_API_PREFIX_SYS 配置 */
export const prefixSys = import.meta.env.VITE_API_PREFIX_SYS || "/oneths/authenticator";

export const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ---------------------------------------------------------------------------
// Token 刷新状态管理（避免并发请求同时刷新 token）
// ---------------------------------------------------------------------------

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void): void {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(newToken: string): void {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function clearRefreshSubscribers(): void {
  refreshSubscribers = [];
}

// ---------------------------------------------------------------------------
// 请求拦截器 — 自动附加 token
// ---------------------------------------------------------------------------

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const orgId = getOrganizationId();
  if (orgId) {
    config.headers["organization-id"] = orgId;
  }
  return config;
});

// ---------------------------------------------------------------------------
// 响应拦截器 — 处理 401 与业务层鉴权错误，自动刷新 token
// ---------------------------------------------------------------------------

let isRedirecting = false;

/**
 * 强制登出（账号冲突处理）
 * 当检测到账号已在其他地方登录时触发：
 *   1. 清除本地所有 token 与用户信息
 *   2. 显示警告消息
 *   3. 延迟 800ms 后跳转至登录页
 */
function forceLogout(): void {
  clearAuth();
  if (!isRedirecting && window.location.pathname !== "/login") {
    isRedirecting = true;
    ElMessage.warning("您的账号已在其他地方登录，请重新登录");
    setTimeout(() => {
      window.location.href = "/login";
      isRedirecting = false;
    }, 800);
  }
}

/** 判断响应是否为鉴权相关的业务错误 */
function isAuthBusinessError(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const { code, message } = data as { code?: number; message?: string };
  if (code !== 1 || !message) return false;
  // 仅当消息包含鉴权关键词时才视为鉴权错误，避免误判普通业务错误
  const authPatterns = [
    "未能读取到有效令牌",
    "令牌无效",
    "令牌已过期",
    "令牌不存在",
    "登录已过期",
    "未登录",
    "认证失败",
  ];
  return authPatterns.some((p) => message.includes(p));
}

/** 判断是否为无需鉴权的接口（登录、验证码等），这些接口的鉴权错误不应触发刷新 */
function isAuthEndpoint(config: InternalAxiosRequestConfig): boolean {
  if (!config.url) return false;
  const publicPaths = [
    "/authentication/login",
    "/authentication/refresh",
    "/captcha/create",
    "/email/send/loginCode",
    "/email/verify/email/code",
  ];
  return publicPaths.some((p) => config.url!.includes(p));
}

/** 判断是否为刷新 token 请求（避免无限循环） */
function isRefreshTokenRequest(config: InternalAxiosRequestConfig): boolean {
  if (!config.url) return false;
  return config.url.includes("/authentication/refresh");
}

/** 跳转到登录页（防重复跳转）— 已委托给 forceLogout 处理账号冲突 */
function redirectToLogin(): void {
  forceLogout();
}

/** 统一处理鉴权错误：尝试刷新 token，失败则跳转登录页 */
async function handleAuthError(
  config: InternalAxiosRequestConfig
): Promise<unknown> {
  // 刷新接口本身的错误不处理，直接拒绝（避免死循环）
  if (isRefreshTokenRequest(config)) {
    return Promise.reject(new Error("Token 刷新失败"));
  }

  // 已经重试过的请求不再重试，直接跳转登录（防止无限循环）
  if ((config as any).__isRetry) {
    redirectToLogin();
    return Promise.reject(new Error("Token 刷新后仍鉴权失败，请重新登录"));
  }

  // 检查原始请求是否携带了 token — 若没带 token 说明根本没登录
  const hadToken = !!(config.headers.Authorization ||
    (config.headers as any)?.["authorization"]);

  const storedRefreshToken = getRefreshToken();

  // 没有 refresh token，直接跳转登录
  if (!storedRefreshToken) {
    if (hadToken) {
      // 有 token 但无 refresh token（异常状态），清除后跳转
      redirectToLogin();
    } else {
      // 根本没带 token，不做清除（避免误清其他标签页的登录态）
      // 仅跳转当前页
      if (!isRedirecting && window.location.pathname !== "/login") {
        isRedirecting = true;
        window.location.href = `/login?redirect=${encodeURIComponent(
          window.location.pathname + window.location.search
        )}`;
      }
    }
    return Promise.reject(new Error("未登录，缺少刷新令牌"));
  }

  // 正在刷新中：将当前请求加入等待队列
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      subscribeTokenRefresh((newToken: string) => {
        (config as any).__isRetry = true;
        config.headers.Authorization = `Bearer ${newToken}`;
        resolve(http.request(config));
      });
      // 超时保护：15 秒后仍未完成则拒绝
      setTimeout(() => {
        reject(new Error("Token 刷新超时"));
      }, 15000);
    });
  }

  // 开始刷新 token
  isRefreshing = true;

  try {
    // 直接使用 http 实例调用刷新接口，避免循环依赖
    const res = await http.post<ApiResponse<{ token: string }>>(
      prefixSys + "/api/authentication/refresh",
      { refreshToken: storedRefreshToken }
    );
    const result = res.data;
    const newToken =
      typeof result.data === "string"
        ? result.data
        : (result.data as { token: string }).token;

    if (!newToken) {
      throw new Error("刷新 token 失败：响应中未包含 token");
    }

    // 刷新成功：存储新 token
    setToken(newToken, true);
    onTokenRefreshed(newToken);
    isRefreshing = false;

    // 重试当前请求
    (config as any).__isRetry = true;
    config.headers.Authorization = `Bearer ${newToken}`;
    return http.request(config);
  } catch (refreshError: any) {
    isRefreshing = false;
    clearRefreshSubscribers();

    // 区分刷新失败的原因：
    // 1. 刷新接口不可达（404/网络错误）→ 保留现有 auth，不跳转登录
    // 2. 刷新令牌本身无效 → 清除 auth 并跳转登录
    const status = refreshError?.response?.status;
    const isEndpointUnavailable =
      !status || // 网络错误（无响应）
      status === 404 ||
      status === 500 ||
      status === 502 ||
      status === 503;

    if (isEndpointUnavailable) {
      // 刷新接口不可用，保留现有登录态，仅拒绝本次请求
      console.warn(
        "Token 刷新接口不可用（状态码: " + (status || "网络错误") + "），保留当前登录态"
      );
      return Promise.reject(
        new Error("Token 刷新接口暂时不可用，请稍后重试")
      );
    }

    // 刷新令牌无效或已过期，清除登录态
    redirectToLogin();
    return Promise.reject(new Error("Token 刷新失败，请重新登录"));
  }
}
const num=ref(1)

http.interceptors.response.use(
  (res: AxiosResponse<ApiResponse>) => {
    const { code, message } = res.data
    console.log('>>>>>>>>>>', code, message)
    if (!code) return res
    if(num.value>1) return res
    if (code == 1 && message == 'Cloud Gateway 异常: 您已被顶下线!') {
      num.value++
      const newLocal = '';
      
      ElMessage.error(message || '登录已失效，请重新登录')
      clearAuth()
      window.sessionStorage.clear()
      setTimeout(() => {
        window.location.href = '/login'
      }, 1000)
      return Promise.reject(res.data)
    } else if (code != 0) {
      setTimeout(() => ElMessage.warning(message), 0)
    }

    return res
  },

  (error: AxiosError) => {
    if (error.response?.status === 401) {
      
      forceLogout()
      return Promise.reject(error)
    }

    const msg = error.response?.data?.message
      || error.message
      || '网络异常，请稍后重试'
      console.log('>>>>>>>>>>')
    setTimeout(() => ElMessage.error(msg), 0)
    return Promise.reject(error)
  },
);

// ---------------------------------------------------------------------------
// 公共 request 方法
// ---------------------------------------------------------------------------

export async function request<T>(
  config: Parameters<typeof http.request>[0],
): Promise<ApiResponse<T>> {
  const res = await http.request<ApiResponse<T>>(config);
  return res.data;
}
