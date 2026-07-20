<template>
  <div class="performance-view">
    <el-card>
      <template #header>
        <span>性能分析</span>
      </template>
      <div class="chart-placeholder">
        <div class="loading-ring"></div>
        <p class="placeholder-text">性能图表展示区域</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.performance-view {
  padding: 0;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>