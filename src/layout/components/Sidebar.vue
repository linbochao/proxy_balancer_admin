<template>
  <el-aside :width="isCollapsed ? '64px' : '220px'" class="sidebar-container"
    :class="{ 'sidebar-collapsed': isCollapsed }">
    <div class="sidebar-logo" @click="handleLogoClick">
      <el-icon :size="24" class="logo-icon">
        <img src="@/assets/images/oneths2.png" alt="">
      </el-icon>
      <span v-show="!isCollapsed" class="logo-text">中科元景万象注册中心</span>
    </div>

    <el-menu :default-active="activeMenu" :collapse="isCollapsed" :collapse-transition="false" :router="true"
      mode="vertical" class="sidebar-menu">
      <template v-for="item in menuItems" :key="item.path">
        <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.path" class="sub-menu-item">
          <template #title>
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.label }}</span>
          </template>
          <template v-for="child in item.children" :key="child.path">
            <el-menu-item  :index="child.path" v-if="child.hidden !== true">
              <template #title>
                <el-icon v-if="child.icon">
                  <component :is="child.icon" />
                </el-icon>
                <span>{{ child.label }}</span>
              </template>
            </el-menu-item>
          </template>

        </el-sub-menu>

        <el-menu-item v-else :index="item.path">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
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
  Monitor,
  Search
} from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { routes } from '@/router/routes'

interface MenuItem {
  path: string
  label: string
  icon: any
  meta?: any;  // 是否隐藏该菜单项（用于控制路由是否显示） 
  children?: MenuItem[],
  hidden?: boolean;  // 是否隐藏该菜单项（用于控制路由是否显示） 
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

// 图标映射：将路由 meta.icon 的字符串转换为组件
const iconMap: Record<string, any> = {
  Home: HomeFilled,
  Cluster: DataAnalysis,
  Monitor: Monitor,
  Bell: Bell,
  Shield: Lock,
  User: User,
  FileText: Files,
  Setting: Setting,
  Database: DataBoard,
  BarChart3: PieChart,
  Search: Search,
}

// 使用 computed 生成菜单（也可用普通变量，但 computed 更规范）
const menuItems = computed<MenuItem[]>(() => {
  // 找到包含 children 的布局路由（routes[0] 是登录路由，没有 children）
  const root = routes.find(r => r.children && r.children.length > 0)
  if (!root || !root.children) return []

  // 递归构建菜单树
  function buildMenu(routeList: any[], parentFullPath: string = ''): MenuItem[] {
    return routeList.map(route => {
      // 1. 组装完整路径（绝对路径，供 router 使用）
      let fullPath = route.path.startsWith('/') ? route.path : `/${route.path}`
      if (parentFullPath && parentFullPath !== '/') {
        fullPath = parentFullPath + fullPath
      }

      // 2. 提取标题和图标
      const meta = route.meta || {}
      const item: MenuItem = {
        path: fullPath,
        label: meta.title || route.name || '',
        icon: iconMap[meta.icon] || Setting,  // 未匹配到则用 Setting
        hidden: meta.hidden || false,  // 从 meta 中获取 hidden 属性，如果不存在则默认为 false
      }

      // 3. 递归处理子路由
      if (route.children && route.children.length > 0) {
        item.children = buildMenu(route.children, fullPath)
      }
      return item
    })
  }
  return buildMenu(root.children, '')
})


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
  background-color: #fff;
  color: #000;
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
  /* background-color: rgba(255, 255, 255, 0.05); */
}

.logo-icon {

  color: #409eff;
  flex-shrink: 0;
    img {
    width: 40px;
    height: 40px;
  }
}

.logo-text {
  margin-left: 12px;
  font-size: 14px;
  /* white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; */
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
  /* background: rgba(255, 255, 255, 0.2); */
  border-radius: 2px;
}

.el-menu-item,
.el-sub-menu__title {
  height: 48px !important;
  line-height: 48px !important;
  border-radius: 8px !important;
  margin-bottom: 4px !important;
}

.el-menu-item:hover,
.el-sub-menu__title:hover {
  /* background-color: rgba(255, 255, 255, 0.1) !important; */
}

.el-menu-item.is-active,
.el-sub-menu__title.is-active {}

.el-sub-menu .el-menu-item {
  height: 40px !important;
  line-height: 40px !important;
  padding-left: 40px !important;
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
  /* background-color: rgba(255, 255, 255, 0.1); */
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