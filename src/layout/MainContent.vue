<template>
  <el-main class="main-content">
    <div class="content-wrapper">
      <transition name="fade" mode="out-in">
        <router-view 
          v-slot="{ Component }" 
          :key="$route.path"
        >
          <component 
            :is="Component" 
            :key="$route.path"
            v-show="isLoaded"
            class="route-component"
          />
        </router-view>
      </transition>
      
      <div v-if="!isLoaded" class="loading-container">
        <div class="loading-ring"></div>
        <span class="loading-text">加载中...</span>
      </div>
    </div>
  </el-main>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isLoaded = ref(true)

watch(() => route.path, () => {
  isLoaded.value = false
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media screen and (max-width: 768px) {
  .main-content {
    padding: 12px;
  }
}
</style>