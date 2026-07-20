<template>
  <el-aside 
    :width="isCollapsed ? '64px' : '220px'" 
    class="sidebar-container"
    :class="{ 'sidebar-collapsed': isCollapsed }"
  >
    <div class="sidebar-logo" @click="handleLogoClick">
      <el-icon :size="24" class="logo-icon">
        <Setting />
      </el-icon>
      <span v-show="!isCollapsed" class="logo-text">Broker管理平台</span>
    </div>
    
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapsed"
      :collapse-transition="false"
      :router="true"
      mode="vertical"
      class="sidebar-menu"
    >
      <template v-for="item in menuItems" :key="item.path">
        <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.path">
          <template #title>
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </template>
          <el-menu-item 
            v-for="child in item.children" 
            :key="child.path" 
            :index="child.path"
          >
            <template #title>
              <el-icon v-if="child.icon"><component :is="child.icon" /></el-icon>
              <span>{{ child.label }}</span>
            </template>
          </el-menu-item>
        </el-sub-menu>
        
        <el-menu-item 
          v-else 
          :index="item.path"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </template>
    </el-menu>
    
    <div class="collapse-btn" @click="toggleCollapse">
      <el-icon :size="18" :class="{ 'rotate-icon': isCollapsed }">
        <Fold />
      </el-icon>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Setting, 
  Fold, 
  HomeFilled, 
  DataAnalysis, 
  DataBoard, 
  PieChart, 
  Lock, 
  Bell,
  Files,
  User,
  Monitor
} from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'

interface MenuItem {
  path: string
  label: string
  icon: any
  children?: MenuItem[]
}

const emit = defineEmits<{
  (e: 'collapse-change', collapsed: boolean): void
}>()

const isCollapsed = ref(false)
const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => {
  return route.path
})

const menuItems: MenuItem[] = [
  {
    path: '/home',
    label: '首页概览',
    icon: HomeFilled
  },
  {
    path: '/cluster',
    label: '集群管理',
    icon: DataBoard,
    children: [
      {
        path: '/cluster/list',
        label: 'Broker列表',
        icon: DataAnalysis
      },
      {
        path: '/cluster/nodes',
        label: '节点状态',
        icon: Monitor
      },
      {
        path: '/cluster/topology',
        label: '拓扑视图',
        icon: PieChart
      }
    ]
  },
  {
    path: '/metrics',
    label: '监控指标',
    icon: PieChart,
    children: [
      {
        path: '/metrics/overview',
        label: '指标总览',
        icon: PieChart
      },
      {
        path: '/metrics/performance',
        label: '性能分析',
        icon: DataAnalysis
      },
      {
        path: '/metrics/alerts',
        label: '告警配置',
        icon: Bell
      }
    ]
  },
  {
    path: '/security',
    label: '安全管理',
    icon: Lock,
    children: [
      {
        path: '/security/users',
        label: '用户管理',
        icon: User
      },
      {
        path: '/security/roles',
        label: '角色权限',
        icon: Lock
      }
    ]
  },
  {
    path: '/logs',
    label: '日志管理',
    icon: Files
  },
  {
    path: '/settings',
    label: '系统设置',
    icon: Setting
  }
]

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  emit('collapse-change', isCollapsed.value)
}

const handleLogoClick = () => {
  router.push('/home')
}
</script>

<style scoped>
.sidebar-container {
  height: 100%;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  position: relative;
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: padding 0.3s ease;
}

.sidebar-logo:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.logo-icon {
  color: #409eff;
  flex-shrink: 0;
}

.logo-text {
  margin-left: 12px;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-menu {
  border-right: none;
  background: transparent;
  height: calc(100% - 60px);
  overflow-y: auto;
}

.sidebar-menu::-webkit-scrollbar {
  width: 4px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.el-menu-item,
.el-sub-menu__title {
  color: rgba(255, 255, 255, 0.85) !important;
  height: 48px !important;
  line-height: 48px !important;
  margin: 0 8px !important;
  border-radius: 8px !important;
  margin-bottom: 4px !important;
}

.el-menu-item:hover,
.el-sub-menu__title:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.el-menu-item.is-active,
.el-sub-menu__title.is-active {
  background-color: rgba(64, 158, 255, 0.3) !important;
  color: #fff !important;
}

.el-sub-menu .el-menu-item {
  height: 40px !important;
  line-height: 40px !important;
  padding-left: 56px !important;
  margin-left: 16px !important;
}

.el-sub-menu__icon-arrow {
  color: rgba(255, 255, 255, 0.6) !important;
}

.collapse-btn {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.85);
}

.collapse-btn:hover {
  background-color: rgba(64, 158, 255, 0.3);
  color: #fff;
}

.rotate-icon {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

.sidebar-collapsed .el-menu-item,
.sidebar-collapsed .el-sub-menu__title {
  padding: 0 !important;
  text-align: center;
}

.sidebar-collapsed .el-sub-menu .el-menu-item {
  padding-left: 0 !important;
  margin-left: 0 !important;
}
</style>