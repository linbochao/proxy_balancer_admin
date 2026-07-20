<template>
  <div class="nodes-view">
    <el-card>
      <template #header>
        <span>节点状态</span>
      </template>
      <div class="nodes-grid">
        <div 
          v-for="node in nodes" 
          :key="node.id"
          class="node-card"
          :class="{ 'node-offline': node.status === 'offline' }"
        >
          <div class="node-header">
            <el-icon :size="20" :class="{ 'node-icon-offline': node.status === 'offline' }">
              <Monitor />
            </el-icon>
            <span class="node-name">{{ node.name }}</span>
            <el-tag 
              :type="node.status === 'online' ? 'success' : 'danger'"
              size="small"
            >
              {{ node.status === 'online' ? '在线' : '离线' }}
            </el-tag>
          </div>
          <div class="node-info">
            <div class="info-item">
              <span class="info-label">IP:</span>
              <span class="info-value">{{ node.ip }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">CPU:</span>
              <el-progress :percentage="parseInt(node.cpu)" :stroke-width="8" />
            </div>
            <div class="info-item">
              <span class="info-label">内存:</span>
              <el-progress :percentage="parseInt(node.memory)" :stroke-width="8" color="#67c23a" />
            </div>
            <div class="info-item">
              <span class="info-label">磁盘:</span>
              <el-progress :percentage="parseInt(node.disk)" :stroke-width="8" color="#e6a23c" />
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Monitor } from '@element-plus/icons-vue'

interface Node {
  id: string
  name: string
  ip: string
  status: 'online' | 'offline'
  cpu: string
  memory: string
  disk: string
}

const nodes = ref<Node[]>([
  { id: '1', name: 'Node-01', ip: '192.168.1.101', status: 'online', cpu: '45', memory: '62', disk: '38' },
  { id: '2', name: 'Node-02', ip: '192.168.1.102', status: 'online', cpu: '52', memory: '71', disk: '45' },
  { id: '3', name: 'Node-03', ip: '192.168.1.103', status: 'offline', cpu: '0', memory: '0', disk: '0' },
  { id: '4', name: 'Node-04', ip: '192.168.1.104', status: 'online', cpu: '38', memory: '45', disk: '29' },
  { id: '5', name: 'Node-05', ip: '192.168.1.105', status: 'online', cpu: '61', memory: '58', disk: '52' },
  { id: '6', name: 'Node-06', ip: '192.168.1.106', status: 'online', cpu: '29', memory: '35', disk: '22' }
])
</script>

<style scoped>
.nodes-view {
  padding: 0;
}

.nodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.node-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  background-color: #fff;
  transition: all 0.2s ease;
}

.node-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.node-offline {
  opacity: 0.6;
}

.node-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.node-name {
  flex: 1;
  font-weight: 600;
  margin-left: 10px;
}

.node-icon-offline {
  color: #f56c6c;
}

.node-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-label {
  width: 50px;
  font-size: 13px;
  color: #909399;
}

.info-value {
  flex: 1;
  font-size: 14px;
  color: #303133;
}

.el-progress {
  flex: 1;
  margin-left: 10px;
}
</style>