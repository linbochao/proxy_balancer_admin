import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { getToken } from '@/utils/auth'

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// ---------------------------------------------------------------------------
// 全局路由守卫 — 登录鉴权
// ---------------------------------------------------------------------------

router.beforeEach((to, _from, next) => {
  const token = getToken()

  if (to.meta.requiresAuth !== false && !token) {
    // 需要登录但没有 token → 跳转登录页，携带原目标路径
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (to.path === '/login' && token) {
    // 已登录但访问登录页 → 跳转首页
    next({ path: '/home' })
  } else {
    next()
  }
})

export default router