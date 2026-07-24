import { prefixSys, request } from '@/services/axios'

// ---------------------------------------------------------------------------
// 类型定义
// ---------------------------------------------------------------------------

/** 图形验证码响应 */
export interface CaptchaResult {
  key: string
  image: string
}

/** 账号密码登录参数 */
export interface LoginParams {
  username: string
  password: string
  captchaCode: string
  captchaKey: string
}

/** 登录响应 */
export interface LoginResult {
  token: string
}

/** 邮箱验证码登录参数（发送到后端） */
export interface EmailLoginParams {
  email: string
  mailCode: string
  messageId?: string
}

/** 邮箱验证码登录（发送到后端，字段名略有不同） */
export interface EmailLogin {
  mail: string
  code: string
  messageId?: string
}

/** 发送登录验证码参数 */
export interface SendLoginCodeParams {
  mail: string
}

/** 组织信息 */
export interface OrganizationInfo {
  organizationId: string
  organizationName: string
  userRoleName: string
  userRoleCode: string
}

/** 验证码校验参数 */
export interface VerifyCodeParams {
  messageId: string
  mail: string
  mailCode: string
}

// ---------------------------------------------------------------------------
// API 路径常量
// ---------------------------------------------------------------------------

const API = {
  CreateCode: '/api/captcha/create',
  Login: '/api/authentication/login',
  LoginByCode: '/api/authentication/login/email',
  SendLoginCode: '/api/email/send/loginCode',
  Menu: '/api/personalCenter/current/menu',
  Logout: '/api/authentication/logout',
  VerfyCode: '/api/email/verify/email/code',
  RefreshToken: '/api/authentication/refresh',
  Organizations: '/api/personalCenter/current/organizations',
} as const

// ---------------------------------------------------------------------------
// API 方法
// ---------------------------------------------------------------------------

/** 获取图形验证码 */
export const getCaptcha = () => {
  return request<CaptchaResult>({
    url: prefixSys + API.CreateCode,
    method: 'get',
  })
}

/** 获取当前用户组织信息 */
export const getOrganizations = () => {
  return request<OrganizationInfo[]>({
    url: prefixSys + API.Organizations,
    method: 'get',
  })
}

/** 账号密码登录 */
export const login = (data: LoginParams) => {
  return request<LoginResult>({
    url: prefixSys + API.Login,
    data,
    method: 'post',
  })
}

/** 邮箱验证码登录 */
export const loginByCode = (data: EmailLoginParams) => {
  return request<LoginResult>({
    url: prefixSys + API.LoginByCode,
    data,
    method: 'post',
  })
}

/** 发送登录验证码到邮箱 */
export const sendLoginCode = (params: SendLoginCodeParams) => {
  return request<void>({
    url: prefixSys + API.SendLoginCode,
    params,
    method: 'post',
  })
}

/** 获取当前用户菜单 */
export const fetchMenu = (data: Record<string, unknown>) => {
  return request<Record<string, unknown>[]>({
    url: prefixSys + API.Menu,
    data,
    method: 'get',
  })
}

/** 注销 */
export const logout = () => {
  return request<unknown>({
    url: prefixSys + API.Logout,
    method: 'post',
  })
}

/** 校验验证码 */
export const verifyCode = (params: VerifyCodeParams) => {
  return request<unknown>({
    url: prefixSys + API.VerfyCode,
    params,
    method: 'put',
  })
}

/** 刷新 token */
export const refreshToken = (refreshTokenStr: string) => {
  return request<{ token: string }>({
    url: prefixSys + API.RefreshToken,
    data: { refreshToken: refreshTokenStr },
    method: 'post',
  })
}
