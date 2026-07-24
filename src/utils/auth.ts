/**
 * Auth 工具模块 — Token 与用户信息管理
 *
 * 支持"记住我"功能：
 *   - 勾选"记住我"：token 存入 localStorage（关闭浏览器后仍保留）
 *   - 不勾选：token 存入 sessionStorage（关闭浏览器后自动清除）
 */

const USER_TOKEN = 'USER_TOKEN'
const REFRESH_TOKEN = 'refresh_token'
const USER_INFO = 'user_info'
const REMEMBER_ME = 'remember_me'

// ---------------------------------------------------------------------------
// 内部辅助：根据 rememberMe 标记选择存储介质
// ---------------------------------------------------------------------------

function getStorage(): Storage {
  const remembered = localStorage.getItem(REMEMBER_ME)
  return remembered === 'true' ? localStorage : sessionStorage
}

// ---------------------------------------------------------------------------
// Token
// ---------------------------------------------------------------------------

export function getToken(): string | null {
  return getStorage().getItem(USER_TOKEN)
}

export function setToken(token: string, remember = false): void {
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(USER_TOKEN, token)
  // 持久化"记住我"标记，保证页面刷新后仍能选对存储介质
  localStorage.setItem(REMEMBER_ME, String(remember))
}

export function removeToken(): void {
  localStorage.removeItem(USER_TOKEN)
  sessionStorage.removeItem(USER_TOKEN)
}

// ---------------------------------------------------------------------------
// Refresh Token
// ---------------------------------------------------------------------------

export function getRefreshToken(): string | null {
  return getStorage().getItem(REFRESH_TOKEN)
}

export function setRefreshToken(token: string, remember = false): void {
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(REFRESH_TOKEN, token)
}

export function removeRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN)
  sessionStorage.removeItem(REFRESH_TOKEN)
}

// ---------------------------------------------------------------------------
// JWT 解码 — 从 token 中提取 payload（不验证签名）
// ---------------------------------------------------------------------------

export interface JwtPayload {
  sub?: string        // 通常为用户 ID
  username?: string
  name?: string
  exp?: number        // 过期时间戳（秒）
  iat?: number        // 签发时间戳（秒）
  [key: string]: unknown
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    // 取 payload 部分（第二段），base64url 解码
    const payload = parts[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

/** 检查 token 是否已过期 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token)
  if (!payload || !payload.exp) return false
  return Date.now() >= payload.exp * 1000
}

// ---------------------------------------------------------------------------
// 用户信息
// ---------------------------------------------------------------------------

export interface UserInfo {
  id?: number | string
  username?: string
  name?: string
  role?: string
  avatar?: string
  [key: string]: unknown
}

export function getUserInfo(): UserInfo | null {
  const raw = getStorage().getItem(USER_INFO)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserInfo
  } catch {
    return null
  }
}

export function setUserInfo(info: UserInfo, remember = false): void {
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(USER_INFO, JSON.stringify(info))
}

export function removeUserInfo(): void {
  localStorage.removeItem(USER_INFO)
  sessionStorage.removeItem(USER_INFO)
}

// ---------------------------------------------------------------------------
// 组织信息
// ---------------------------------------------------------------------------

export interface OrganizationInfo {
  organizationId: string
  organizationName: string
  userRoleName: string
  userRoleCode: string
}

const ORG_INFO = 'org_info'
const ORG_ID = 'org_id'

export function getOrganizationInfo(): OrganizationInfo | null {
  const raw = getStorage().getItem(ORG_INFO)
  if (!raw) return null
  try {
    return JSON.parse(raw) as OrganizationInfo
  } catch {
    return null
  }
}

export function setOrganizationInfo(info: OrganizationInfo, remember = false): void {
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(ORG_INFO, JSON.stringify(info))
  storage.setItem(ORG_ID, info.organizationId)
}

/** 获取当前选中的组织 ID，用于请求头 */
export function getOrganizationId(): string | null {
  return getStorage().getItem(ORG_ID)
}

export function removeOrganizationInfo(): void {
  localStorage.removeItem(ORG_INFO)
  sessionStorage.removeItem(ORG_INFO)
  localStorage.removeItem(ORG_ID)
  sessionStorage.removeItem(ORG_ID)
}

// ---------------------------------------------------------------------------
// 一键清除
// ---------------------------------------------------------------------------

export function clearAuth(): void {
  removeToken()
  removeRefreshToken()
  removeUserInfo()
  removeOrganizationInfo()
  localStorage.removeItem(REMEMBER_ME)
}
