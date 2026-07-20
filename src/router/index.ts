import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layout/index.vue'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('../views/home/index.vue'),
        meta: { title: '首页概览', icon: 'Home' }
      },
      {
        path: '/cluster',
        redirect: '/cluster/list'
      },
      {
        path: '/cluster',
        name: 'Cluster',
        meta: { title: '集群管理', icon: 'Cluster' },
        children: [
          {
            path: '/cluster/list',
            name: 'ClusterList',
            component: () => import('../views/cluster/list.vue'),
            meta: { title: 'Broker列表', icon: 'Database' }
          },
          {
            path: '/cluster/nodes',
            name: 'ClusterNodes',
            component: () => import('../views/cluster/nodes.vue'),
            meta: { title: '节点状态', icon: 'Monitor' }
          },
          {
            path: '/cluster/topology',
            name: 'ClusterTopology',
            component: () => import('../views/cluster/topology.vue'),
            meta: { title: '拓扑视图', icon: 'BarChart3' }
          }
        ]
      },
      {
        path: '/metrics',
        redirect: '/metrics/overview'
      },
      {
        path: '/metrics',
        name: 'Metrics',
        meta: { title: '监控指标', icon: 'BarChart3' },
        children: [
          {
            path: '/metrics/overview',
            name: 'MetricsOverview',
            component: () => import('../views/metrics/overview.vue'),
            meta: { title: '指标总览', icon: 'BarChart3' }
          },
          {
            path: '/metrics/performance',
            name: 'MetricsPerformance',
            component: () => import('../views/metrics/performance.vue'),
            meta: { title: '性能分析', icon: 'Database' }
          },
          {
            path: '/metrics/alerts',
            name: 'MetricsAlerts',
            component: () => import('../views/metrics/alerts.vue'),
            meta: { title: '告警配置', icon: 'Bell' }
          }
        ]
      },
      {
        path: '/security',
        redirect: '/security/users'
      },
      {
        path: '/security',
        name: 'Security',
        meta: { title: '安全管理', icon: 'Shield' },
        children: [
          {
            path: '/security/users',
            name: 'SecurityUsers',
            component: () => import('../views/security/users.vue'),
            meta: { title: '用户管理', icon: 'User' }
          },
          {
            path: '/security/roles',
            name: 'SecurityRoles',
            component: () => import('../views/security/roles.vue'),
            meta: { title: '角色权限', icon: 'Shield' }
          }
        ]
      },
      {
        path: '/logs',
        name: 'Logs',
        component: () => import('../views/logs/index.vue'),
        meta: { title: '日志管理', icon: 'FileText' }
      },
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('../views/settings/index.vue'),
        meta: { title: '系统设置', icon: 'Setting' }
      }
    ]
  }
]

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

export default router