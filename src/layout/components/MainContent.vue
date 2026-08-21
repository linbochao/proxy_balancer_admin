<template>
  <el-main class="main-content">
    <div class="content-wrapper">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <keep-alive :include="cachedNames">
            <component
              :is="Component"
              :key="$route.path"
              class="route-component"
            />
          </keep-alive>
        </transition>
      </router-view>
    </div>
  </el-main>
</template>

<script setup lang="ts">
import { usePageTabsStore } from '@/stores/pageTabs'

const tabsStore = usePageTabsStore()

/** 需要缓存的组件名称列表 */
const cachedNames = computed(() => tabsStore.cachedNames)
</script>

<style scoped>
.main-content {
  flex: 1;
  min-height: 0;
  padding: 20px;
  background-color: #f5f7fa;
  overflow: hidden;
}

.content-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.route-component {
  flex: 1;
  min-height: 0;
}

.content-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.content-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.content-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.content-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
}

.loading-text {
  margin-top: 16px;
  font-size: 14px;
  color: #909399;
}

.loading-ring {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@media screen and (max-width: 768px) {
  .main-content {
    padding: 12px;
  }
}
</style>