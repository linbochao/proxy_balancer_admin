<template>
  <div class="metrics-view">
    <el-card>
      <template #header>
        <span>监控指标总览</span>
      </template>
      <div class="metrics-grid">
        <div class="metric-item">
          <div class="metric-title">消息发送速率</div>
          <div class="metric-value">1.2M/s</div>
        </div>
        <div class="metric-item">
          <div class="metric-title">消息消费速率</div>
          <div class="metric-value">1.1M/s</div>
        </div>
        <div class="metric-item">
          <div class="metric-title">消息堆积量</div>
          <div class="metric-value">12,500</div>
        </div>
        <div class="metric-item">
          <div class="metric-title">平均延迟</div>
          <div class="metric-value">25ms</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.metrics-view {
  padding: 0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.metric-item {
  text-align: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.metric-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}
</style>