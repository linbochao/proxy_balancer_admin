<template>
  <el-header class="header-container">
    <div class="header-left">
      <div 
        class="toggle-sidebar-btn" 
        @click="toggleSidebar"
        title="切换侧边栏"
      >
        <el-icon :size="20">
          <Menu />
        </el-icon>
      </div>
      <div class="header-title">
        <span class="title-text">{{ pageTitle }}</span>
        <span v-if="pageSubtitle" class="subtitle-text">{{ pageSubtitle }}</span>
      </div>
    </div>
    
    <div class="header-right">
      <div class="header-action">
        <!-- <el-dropdown trigger="click" @command="handleCommand">
          <div class="action-item notification-item">
            <el-icon :size="20">
              <Bell />
            </el-icon>
            <el-badge 
              v-if="notificationCount > 0" 
              :value="notificationCount" 
              :max="99" 
              class="notification-badge"
            />
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item 
                v-for="notification in notifications" 
                :key="notification.id"
                :command="notification.id"
                class="notification-content"
              >
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-time">{{ notification.time }}</div>
              </el-dropdown-item>
              <el-dropdown-item divided disabled v-if="notifications.length === 0">
                暂无通知
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown> -->
        
        <!-- <el-dropdown trigger="click">
          <div class="action-item">
            <el-icon :size="20">
              <Search />
            </el-icon>
          </div>
        </el-dropdown> -->
        
        <!-- 系统切换开关 -->
        <div class="system-switch">
          <div 
            class="switch-item" 
            :class="{ active: currentSystem === 'registry' }"
            @click="switchSystem('registry')"
          >
            注册中心
          </div>
          <div 
            class="switch-item" 
            :class="{ active: currentSystem === 'iot' }"
            @click="switchSystem('iot')"
          >
            IOT平台
          </div>
        </div>
        
        <el-dropdown trigger="click" @command="handleSettingCommand">
          <div class="action-item">
            <el-icon :size="20">
              <Setting />
            </el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <User />
                <span>个人设置</span>
              </el-dropdown-item>
              <el-dropdown-item command="system">
                <Setting />
                <span>系统设置</span>
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <SwitchButton />
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      
      <div class="user-info">
        <el-dropdown trigger="click" @command="handleUserCommand">
          <div class="user-item">
            <div class="user-avatar">
              <el-icon :size="20">
                <User />
              </el-icon>
            </div>
            <span class="user-name">{{ userInfo.name }}</span>
            <el-icon :size="14" class="arrow-icon">
              <ArrowDown />
            </el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <User />
                <span>个人中心</span>
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <Setting />
                <span>账号设置</span>
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <SwitchButton />
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import {
  Menu,
  Bell,
  Search,
  Setting,
  User,
  ArrowDown,
  SwitchButton
} from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { clearAuth, getUserInfo } from '@/utils/auth'
import { logout as logoutApi } from '@/api/auth'

interface Notification {
  id: string
  title: string
  time: string
}

interface UserInfo {
  name: string
  role: string
  avatar?: string
}

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

const route = useRoute()
const router = useRouter()

const notificationCount = ref(3)
const notifications = ref<Notification[]>([
  { id: '1', title: 'Broker节点 broker-01 下线', time: '2分钟前' },
  { id: '2', title: '内存使用率超过80%', time: '5分钟前' },
  { id: '3', title: '新用户 admin 登录系统', time: '10分钟前' }
])

const savedUserInfo = getUserInfo()
const userInfo = ref<UserInfo>({
  name: savedUserInfo?.name || savedUserInfo?.username || '系统管理员',
  role: savedUserInfo?.role || 'Administrator'
})

const pageTitle = computed(() => {
  const routeTitleMap: Record<string, string> = {
    '/home': '首页概览',
    '/cluster/list': 'Broker列表',
    '/cluster/nodes': '节点状态',
    '/cluster/topology': '拓扑视图',
    '/metrics/serviceType': '服务类型',
    '/metrics/performance': '性能分析',
    '/metrics/alerts': '告警配置',
    '/security/users': '用户管理',
    '/security/roles': '角色权限',
    '/deviceQuery': '设备路由查询',
    '/settings': '系统设置'
  }
  return routeTitleMap[route.path] || '中科元景万象注册中心'
})

const pageSubtitle = computed(() => {
  return '分布式代理负载均衡管理平台'
})

// 系统切换
const currentSystem = ref<'registry' | 'iot'>('registry')
const IOT_PLATFORM_URL = 'http://14.22.81.114:4000/'

const switchSystem = (system: 'registry' | 'iot') => {
  if (system === 'iot') {
    window.location.href = IOT_PLATFORM_URL
  } else {
    currentSystem.value = 'registry'
  }
}

const toggleSidebar = () => {
  emit('toggle-sidebar')
}

const handleCommand = (_command: string) => {
  notificationCount.value = Math.max(0, notificationCount.value - 1)
}

const handleSettingCommand = async (command: string) => {
  if (command === 'logout') {
    await logoutApi().catch(() => {})
    clearAuth()
    router.push('/login')
  }
}

const handleUserCommand = async (command: string) => {
  if (command === 'logout') {
    await logoutApi().catch(() => {})
    clearAuth()
    router.push('/login')
  }
}

onMounted(() => {
})

onUnmounted(() => {
})
</script>

<style scoped>
.header-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 20px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.toggle-sidebar-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #606266;
}

.toggle-sidebar-btn:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.header-title {
  display: flex;
  flex-direction: column;
  margin-left: 16px;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.subtitle-text {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-action {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.action-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #606266;
  position: relative;
}

.action-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
}

.notification-content {
  padding: 12px !important;
}

.notification-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

/* 系统切换开关 */
.system-switch {
  display: flex;
  align-items: center;
  background-color: #f0f2f5;
  border-radius: 20px;
  padding: 3px;
  margin-right: 16px;
  height: 34px;
}

.switch-item {
  padding: 6px 16px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  border-radius: 17px;
  transition: all 0.25s ease;
  font-weight: 500;
  white-space: nowrap;
}

.switch-item:hover {
  color: #409eff;
}

.switch-item.active {
  background-color: #409eff;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
}

.switch-item.active:hover {
  color: #ffffff;
}

.user-info {
  display: flex;
  align-items: center;
  padding-left: 20px;
  border-left: 1px solid #ebeef5;
}

.user-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.user-item:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 10px;
}

.user-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.arrow-icon {
  margin-left: 6px;
  color: #909399;
  transition: transform 0.2s ease;
}

.user-item:hover .arrow-icon {
  transform: rotate(180deg);
}

@media screen and (max-width: 768px) {
  .header-title {
    display: none;
  }
  
  .user-name {
    display: none;
  }
  
  .header-action {
    margin-right: 10px;
  }
  
  .system-switch {
    margin-right: 8px;
    height: 30px;
  }
  
  .switch-item {
    padding: 5px 12px;
    font-size: 12px;
  }
}

@media screen and (max-width: 480px) {
  .switch-item {
    padding: 5px 8px;
    font-size: 11px;
  }
}
</style>