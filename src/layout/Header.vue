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
        <el-dropdown trigger="click" @command="handleCommand">
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
        </el-dropdown>
        
        <el-dropdown trigger="click">
          <div class="action-item">
            <el-icon :size="20">
              <Search />
            </el-icon>
          </div>
        </el-dropdown>
        
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  Menu, 
  Bell, 
  Search, 
  Setting, 
  User, 
  ArrowDown, 
  SwitchButton 
} from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'

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

const notificationCount = ref(3)
const notifications = ref<Notification[]>([
  { id: '1', title: 'Broker节点 broker-01 下线', time: '2分钟前' },
  { id: '2', title: '内存使用率超过80%', time: '5分钟前' },
  { id: '3', title: '新用户 admin 登录系统', time: '10分钟前' }
])

const userInfo = ref<UserInfo>({
  name: '系统管理员',
  role: 'Administrator'
})

const pageTitle = computed(() => {
  const routeTitleMap: Record<string, string> = {
    '/home': '首页概览',
    '/cluster/list': 'Broker列表',
    '/cluster/nodes': '节点状态',
    '/cluster/topology': '拓扑视图',
    '/metrics/overview': '指标总览',
    '/metrics/performance': '性能分析',
    '/metrics/alerts': '告警配置',
    '/security/users': '用户管理',
    '/security/roles': '角色权限',
    '/logs': '日志管理',
    '/settings': '系统设置'
  }
  return routeTitleMap[route.path] || 'Broker管理平台'
})

const pageSubtitle = computed(() => {
  return '分布式代理负载均衡管理平台'
})

const toggleSidebar = () => {
  emit('toggle-sidebar')
}

const handleCommand = (_command: string) => {
  notificationCount.value = Math.max(0, notificationCount.value - 1)
}

const handleSettingCommand = (command: string) => {
  if (command === 'logout') {
  }
}

const handleUserCommand = (command: string) => {
  if (command === 'logout') {
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
  padding: 0 20px;
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
}
</style>