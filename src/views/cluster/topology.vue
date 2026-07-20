<template>
  <div class="topology-view">
    <el-card>
      <template #header>
        <span>集群拓扑视图</span>
      </template>
      <div class="topology-container">
        <div class="topology-placeholder">
        <div class="loading-ring large"></div>
        <p class="placeholder-text">拓扑图展示区域</p>
      </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.topology-view {
  padding: 0;
}

.topology-container {
  height: 500px;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
}

.topology-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.placeholder-text {
  margin-top: 16px;
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

.loading-ring.large {
  width: 50px;
  height: 50px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>