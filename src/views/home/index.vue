<template>
  <div class="home-view">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>欢迎使用 Broker 管理平台</span>
          <el-tag type="success">运行中</el-tag>
        </div>
      </template>
      <div class="welcome-content">
        <p class="welcome-text">这是一个分布式代理负载均衡管理系统，用于监控和管理您的 Broker 集群。</p>
      </div>
    </el-card>
    
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-icon broker-icon">
          <el-icon :size="28"><DataAnalysis /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">12</div>
          <div class="stat-label">Broker 节点</div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-icon cpu-icon">
          <el-icon :size="28"><Cpu /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">68%</div>
          <div class="stat-label">CPU 使用率</div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-icon memory-icon">
          <el-icon :size="28"><DataBoard /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">4.2 GB</div>
          <div class="stat-label">内存使用</div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-icon msg-icon">
          <el-icon :size="28"><Message /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">1.2M/s</div>
          <div class="stat-label">消息吞吐量</div>
        </div>
      </el-card>
    </div>
    
    <div class="bottom-cards">
      <el-card class="chart-card">
        <template #header>
          <span>节点状态分布</span>
        </template>
        <div class="chart-placeholder">
          <div class="loading-ring"></div>
        </div>
      </el-card>
      
      <el-card class="chart-card">
        <template #header>
          <span>最近告警</span>
        </template>
        <div class="alerts-list">
          <el-alert 
            v-for="alert in recentAlerts" 
            :key="alert.id"
            :title="alert.title"
            :type="alert.type"
            :closable="false"
            show-icon
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DataAnalysis, Cpu, DataBoard, Message } from '@element-plus/icons-vue'

interface Alert {
  id: string
  title: string
  type: 'success' | 'warning' | 'danger' | 'info'
}

const recentAlerts = ref<Alert[]>([
  { id: '1', title: 'Broker-03 内存使用率超过80%', type: 'warning' },
  { id: '2', title: '集群同步完成', type: 'success' },
  { id: '3', title: '新节点 Broker-12 加入集群', type: 'info' }
])
</script>

<style scoped>
.home-view {
  padding: 0;
}

.welcome-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-content {
  padding: 20px 0;
}

.welcome-text {
  font-size: 16px;
  color: #606266;
  line-height: 1.8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.broker-icon {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.cpu-icon {
  background-color: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}

.memory-icon {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.msg-icon {
  background-color: rgba(144, 147, 153, 0.1);
  color: #909399;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.bottom-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-card {
  height: 300px;
}

.chart-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
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

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media screen and (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .bottom-cards {
    grid-template-columns: 1fr;
  }
}
</style>