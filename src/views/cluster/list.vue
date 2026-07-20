<template>
  <div class="cluster-list-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Broker 列表</span>
          <el-button type="primary" icon="Plus">添加节点</el-button>
        </div>
      </template>
      
      <el-table :data="brokerList" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="节点名称" />
        <el-table-column prop="host" label="主机地址" />
        <el-table-column prop="port" label="端口" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag 
              :type="scope.row.status === 'online' ? 'success' : 'danger'"
            >
              {{ scope.row.status === 'online' ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cpu" label="CPU" width="100" />
        <el-table-column prop="memory" label="内存" width="120" />
        <el-table-column prop="messages" label="消息数" width="120" />
        <el-table-column label="操作" width="180">
          <template #default>
            <el-button size="small">详情</el-button>
            <el-button size="small" type="warning">重启</el-button>
            <el-button size="small" type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination 
        class="pagination"
        layout="total, prev, pager, next, jumper"
        :total="total"
        :page-size="10"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Broker {
  id: string
  name: string
  host: string
  port: number
  status: 'online' | 'offline'
  cpu: string
  memory: string
  messages: string
}

const brokerList = ref<Broker[]>([
  { id: '1', name: 'Broker-01', host: '192.168.1.101', port: 9092, status: 'online', cpu: '45%', memory: '2.1 GB', messages: '120,000' },
  { id: '2', name: 'Broker-02', host: '192.168.1.102', port: 9092, status: 'online', cpu: '52%', memory: '2.4 GB', messages: '150,000' },
  { id: '3', name: 'Broker-03', host: '192.168.1.103', port: 9092, status: 'offline', cpu: '--', memory: '--', messages: '--' },
  { id: '4', name: 'Broker-04', host: '192.168.1.104', port: 9092, status: 'online', cpu: '38%', memory: '1.8 GB', messages: '98,000' },
  { id: '5', name: 'Broker-05', host: '192.168.1.105', port: 9092, status: 'online', cpu: '61%', memory: '2.9 GB', messages: '180,000' }
])

const total = ref(100)
</script>

<style scoped>
.cluster-list-view {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>