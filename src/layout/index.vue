<template>
  <div class="common-layout" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
    <el-container class="layout-container">
      <Sidebar @collapse-change="handleSidebarCollapse" />
      
      <el-container class="main-container" direction="vertical">
        <Header @toggle-sidebar="toggleSidebar" />
        
        <MainContent />
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import MainContent from './MainContent.vue'

const isSidebarCollapsed = ref(false)

const handleSidebarCollapse = (collapsed: boolean) => {
  isSidebarCollapsed.value = collapsed
}

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const handleResize = () => {
  if (window.innerWidth < 768) {
    isSidebarCollapsed.value = true
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.common-layout {
  height: 100vh;
  overflow: hidden;
  transition: all 0.3s ease;
}

.layout-container {
  height: 100%;
}

.main-container {
  height: 100%;
  transition: all 0.3s ease;
}

@media screen and (max-width: 768px) {
  .sidebar-collapsed .layout-container > .el-aside {
    position: fixed;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 200;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  }
  
  .sidebar-collapsed .main-container {
    margin-left: 0;
  }
}
</style>