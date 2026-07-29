import Layout from '../layout/index.vue'
export const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false },
  },
  {
    path: '',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('../views/home/index.vue'),
        meta: { title: '首页概览', icon: 'Home' }
      },
      {
        path: 'cluster',
        name: 'Cluster',
        meta: { title: 'Broker管理', icon: 'Cluster' },
        children: [
          {
            path: 'list',
            name: 'ClusterList',
            component: () => import('../views/cluster/list.vue'),
            meta: { title: 'Broker列表', icon: 'Database' }
          },
          {
            path: 'nodes',
            name: 'ClusterNodes',
            component: () => import('../views/cluster/nodes.vue'),
            meta: { title: '节点状态', icon: 'Monitor' }
          },
          {
            path: 'topology',
            name: 'ClusterTopology',
            component: () => import('../views/cluster/topology.vue'),
            meta: { title: '拓扑视图', icon: 'BarChart3' }
          }
        ]
      },
      {
        path: 'metrics',
        name: 'Metrics',
        meta: { title: 'Connector管理', icon: 'BarChart3' },
        children: [
          {
            path: 'serviceType',
            name: 'ServiceType',
            component: () => import('../views/metrics/serviceType/index.vue'),
            meta: { title: '服务类型', icon: 'BarChart3' }
          },
          {
            path: 'serviceType/detail',
            name: 'ServiceTypeDetail',
            component: () => import('../views/metrics/serviceType/detail.vue'),
            meta: { title: '服务类型详情', icon: 'Document', hidden: true }
          },
          {
            path: 'connectionDeviceType',
            name: 'connectionDeviceType',
            component: () => import('../views/metrics/connectionDeviceType/index.vue'),
            meta: { title: '直连设备类型', icon: 'Database' }
          },
          {
            path: 'connectionDeviceType/detail',
            name: 'ConnectionDeviceTypeDetail',
            component: () => import('../views/metrics/connectionDeviceType/detail.vue'),
            meta: { title: '直连设备类型详情', icon: 'Document', hidden: true }
          },
          {
            path: 'thirdPartyPlatformType',
            name: 'thirdPartyPlatformType',
            component: () => import('../views/metrics/thirdPartyPlatformType/index.vue'),
            meta: { title: '第三方平台类型', icon: 'Bell' }
          },
          {
            path: 'thirdPartyPlatformType/detail',
            name: 'thirdPartyPlatformTypeDetail',
            component: () => import('../views/metrics/thirdPartyPlatformType/detail.vue'),
            meta: { title: '第三方平台类型详情', icon: 'Document', hidden: true }
          },
        ]
      },
      {
        path: 'security',
        name: 'Security',
        meta: { title: '安全管理', icon: 'Shield' },
        children: [
          {
            path: 'users',
            name: 'SecurityUsers',
            component: () => import('../views/security/users.vue'),
            meta: { title: '用户管理', icon: 'User' }
          },
          {
            path: 'roles',
            name: 'SecurityRoles',
            component: () => import('../views/security/roles.vue'),
            meta: { title: '角色权限', icon: 'Shield' }
          }
        ]
      },
      {
        path: 'deviceQuery',
        name: 'deviceQuery',
        component: () => import('../views/deviceQuery/index.vue'),
        meta: { title: '设备路由查询', icon: 'Search' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/settings/index.vue'),
        meta: { title: '系统设置', icon: 'Setting' }
      }
    ]
  }
]