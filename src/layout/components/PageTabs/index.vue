<template>
  <div v-if="tabsStore.tabs.length" class="page-tabs-bar">
    <!-- 标签滚动区域 -->
    <div class="page-tabs-scroll" ref="scrollRef">
      <div
        v-for="tab in tabsStore.tabs"
        :key="tab.path"
        class="page-tab"
        :class="{
          'page-tab--active': tab.path === tabsStore.activeTabPath,
          'page-tab--fixed': tab.fixed,
        }"
        @click="handleTabClick(tab)"
        @contextmenu.prevent="openContextMenu($event, tab)"
      >
        <span class="page-tab-title">{{ tab.title }}</span>
        <span
          v-if="!tab.fixed"
          class="page-tab-close"
          @click.stop="handleClose(tab)"
        >
          <el-icon :size="12"><Close /></el-icon>
        </span>
      </div>
    </div>

    <!-- 右侧操作下拉 -->
    <el-dropdown placement="bottom-end" trigger="click" @command="handleDropdownCommand">
      <div class="tabs-action-btn">
        <el-icon :size="16"><ArrowDown /></el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="refresh">
            <el-icon><Refresh /></el-icon>
            <span>刷新当前</span>
          </el-dropdown-item>
          <el-dropdown-item command="closeCurrent">
            <el-icon><Close /></el-icon>
            <span>关闭当前</span>
          </el-dropdown-item>
          <el-dropdown-item command="closeOthers">
            <el-icon><CircleClose /></el-icon>
            <span>关闭其他</span>
          </el-dropdown-item>
          <el-dropdown-item command="closeAll">
            <el-icon><Remove /></el-icon>
            <span>关闭全部</span>
          </el-dropdown-item>
          <el-dropdown-item divided command="toggleFix">
            <el-icon><component :is="isActiveFixed ? Unlock : Lock" /></el-icon>
            <span>{{ isActiveFixed ? '取消固定' : '固定当前' }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 右键菜单 -->
    <transition name="ctx-fade">
      <div
        v-if="contextMenu.visible"
        class="context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      >
        <div class="ctx-item" @click="ctxRefresh">刷新</div>
        <div
          class="ctx-item"
          :class="{ 'ctx-disabled': contextMenu.tab?.fixed }"
          @click="ctxClose"
        >
          关闭
        </div>
        <div class="ctx-item" @click="ctxCloseOthers">关闭其他</div>
        <div class="ctx-item" @click="ctxCloseAll">关闭全部</div>
        <div class="ctx-divider"></div>
        <div class="ctx-item" @click="ctxToggleFix">
          {{ contextMenu.tab?.fixed ? '取消固定' : '固定' }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { Close, ArrowDown, Refresh, CircleClose, Remove, Lock, Unlock } from '@element-plus/icons-vue'
import { usePageTabsStore, type PageTab } from '@/stores/pageTabs'

const router = useRouter()
const route = useRoute()
const tabsStore = usePageTabsStore()

/** 当前激活的 tab 是否已固定 */
const isActiveFixed = computed(() => {
  return tabsStore.activeTab?.fixed ?? false
})

/** 右键菜单状态 */
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  tab: null as PageTab | null,
})

const scrollRef = ref<HTMLElement>() // 保留用于未来滚动定位功能

/** 监听路由变化，自动添加标签 */
watch(
  () => route.path,
  (path) => {
    if (!path || path === '/login' || path === '/') return
    tabsStore.addTab({
      path,
      fullPath: route.fullPath,
      title: (route.meta?.title as string) || (route.name as string) || path,
      name: route.name as string,
    })
  },
  { immediate: true },
)

/** 点击标签切换 */
function handleTabClick(tab: PageTab) {
  tabsStore.setActiveTab(tab.path)
  router.push(tab.fullPath)
}

/** 关闭标签 */
function handleClose(tab: PageTab) {
  if (tab.fixed) return
  const newActivePath = tabsStore.removeTab(tab.path)
  if (tab.path === route.path && newActivePath) {
    const target = tabsStore.tabs.find((t) => t.path === newActivePath)
    if (target) router.push(target.fullPath)
  }
}

/** 下拉菜单操作 */
function handleDropdownCommand(command: string) {
  switch (command) {
    case 'refresh':
      refreshCurrent()
      break
    case 'closeCurrent':
      if (tabsStore.activeTab && !tabsStore.activeTab.fixed) {
        handleClose(tabsStore.activeTab)
      }
      break
    case 'closeOthers':
      tabsStore.closeOthers()
      break
    case 'closeAll': {
      const newActive = tabsStore.closeAll()
      if (newActive) {
        const target = tabsStore.tabs.find((t) => t.path === newActive)
        if (target) router.push(target.fullPath)
      }
      break
    }
    case 'toggleFix':
      if (isActiveFixed.value) {
        tabsStore.unfixTab()
      } else {
        tabsStore.fixTab()
      }
      break
  }
}

/** 刷新当前页（移除缓存后重新进入） */
function refreshCurrent() {
  const current = tabsStore.activeTab
  if (!current) return
  // 临时移除 name 使 keep-alive 释放缓存，下个 tick 恢复
  const name = current.name
  if (name) {
    current.name = undefined
    nextTick(() => {
      current.name = name
      router.replace(current.fullPath)
    })
  } else {
    router.replace(current.fullPath)
  }
}

/** ===== 右键菜单 ===== */
function openContextMenu(e: MouseEvent, tab: PageTab) {
  contextMenu.visible = true
  contextMenu.x = e.clientX
  contextMenu.y = e.clientY
  contextMenu.tab = tab
}

function closeContextMenu() {
  contextMenu.visible = false
}

function ctxRefresh() {
  closeContextMenu()
  if (contextMenu.tab) {
    tabsStore.setActiveTab(contextMenu.tab.path)
    router.push(contextMenu.tab.fullPath)
    refreshCurrent()
  }
}

function ctxClose() {
  closeContextMenu()
  if (contextMenu.tab && !contextMenu.tab.fixed) {
    const newActivePath = tabsStore.removeTab(contextMenu.tab.path)
    if (contextMenu.tab.path === route.path && newActivePath) {
      const target = tabsStore.tabs.find((t) => t.path === newActivePath)
      if (target) router.push(target.fullPath)
    }
  }
}

function ctxCloseOthers() {
  closeContextMenu()
  if (contextMenu.tab) {
    tabsStore.setActiveTab(contextMenu.tab.path)
    tabsStore.closeOthers()
  }
}

function ctxCloseAll() {
  closeContextMenu()
  const newActive = tabsStore.closeAll()
  if (newActive) {
    const target = tabsStore.tabs.find((t) => t.path === newActive)
    if (target) router.push(target.fullPath)
  }
}

function ctxToggleFix() {
  closeContextMenu()
  if (contextMenu.tab) {
    tabsStore.setActiveTab(contextMenu.tab.path)
    if (contextMenu.tab.fixed) {
      tabsStore.unfixTab()
    } else {
      tabsStore.fixTab()
    }
  }
}

/** 点击其他区域关闭右键菜单 */
onMounted(() => {
  tabsStore.restore()
  document.addEventListener('click', closeContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
})
</script>

<style scoped>
.page-tabs-bar {
  height: 38px;
  display: flex;
  align-items: center;
  margin: 0 20px;
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.page-tabs-scroll {
  display: flex;
  align-items: center;
  flex: 1;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  gap: 2px;
  scrollbar-width: thin;
}

.page-tabs-scroll::-webkit-scrollbar {
  height: 3px;
}

.page-tabs-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.page-tabs-scroll::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 2px;
}

/* ===== 标签项 ===== */
.page-tab {
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 15px;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  flex-shrink: 0;
  max-width: 180px;
  transition: all 0.2s ease;
  background: #f5f7fa;
  margin-top: 10px;
}

.page-tab:hover {
  background: #ecf5ff;
}

.page-tab--active {
  color: #409eff;
  font-weight: 500;
  /* margin: 10px 10px 0; */
}

.page-tab--fixed .page-tab-title::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f56c6c;
  margin-right: 5px;
  vertical-align: middle;
}

.page-tab--active.page-tab--fixed .page-tab-title::before {
  background: #ffffff;
}

.page-tab-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 6px;
}

.page-tab-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  color: #c0c4cc;
  transition: all 0.15s ease;
}

.page-tab-close:hover {
  background: rgba(0, 0, 0, 0.15);
  color: #ffffff;
}

.page-tab--active .page-tab-close {
  color: rgba(255, 255, 255, 0.8);
}

.page-tab--active .page-tab-close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

/* ===== 右侧操作按钮 ===== */
.tabs-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  color: #606266;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-left: 4px;
}

.tabs-action-btn:hover {
  background: #f5f7fa;
  color: #409eff;
}

/* ===== 右键菜单 ===== */
.context-menu {
  position: fixed;
  z-index: 3000;
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 4px 0;
  min-width: 140px;
}

.ctx-item {
  padding: 8px 16px;
  font-size: 13px;
  color: #303133;
  cursor: pointer;
  transition: background 0.15s ease;
}

.ctx-item:hover {
  background: #ecf5ff;
  color: #409eff;
}

.ctx-disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.ctx-disabled:hover {
  background: transparent;
  color: #c0c4cc;
}

.ctx-divider {
  height: 1px;
  background: #ebeef5;
  margin: 4px 0;
}

/* ===== 动画 ===== */
.ctx-fade-enter-active,
.ctx-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.ctx-fade-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.ctx-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ===== 响应式 ===== */
@media screen and (max-width: 768px) {
  .page-tab {
    max-width: 120px;
    font-size: 11px;
    padding: 0 8px;
  }

  .page-tabs-bar {
    padding: 0 4px;
  }
}
</style>
