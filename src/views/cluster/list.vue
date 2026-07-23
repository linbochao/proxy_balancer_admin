<template>
  <div class="cluster-list-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Broker 列表</span>
          <el-button type="primary" icon="Plus">添加节点</el-button>
        </div>
      </template>
      
      <ProVirtualTable
        :columns="columns"
        :data="brokerList"
        :max-height="500"
        :show-toolbar="true"
        @row-click="onRowClick"
        @table-row-click="onOperationClick"
      />
      
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
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import ProVirtualTable from '@/components/ProTable/ProVirtualTable.vue'
import type { Column, TableBtn } from '@/components/ProTable/type'

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
  { id: '5', name: 'Broker-05', host: '192.168.1.105', port: 9092, status: 'online', cpu: '61%', memory: '2.9 GB', messages: '180,000' },
  { id: '6', name: 'Broker-06', host: '192.168.1.106', port: 9092, status: 'online', cpu: '33%', memory: '1.5 GB', messages: '85,000' },
  { id: '7', name: 'Broker-07', host: '192.168.1.107', port: 9092, status: 'online', cpu: '58%', memory: '2.7 GB', messages: '165,000' },
  { id: '8', name: 'Broker-08', host: '192.168.1.108', port: 9092, status: 'offline', cpu: '--', memory: '--', messages: '--' },
  { id: '9', name: 'Broker-09', host: '192.168.1.109', port: 9092, status: 'online', cpu: '49%', memory: '2.2 GB', messages: '135,000' },
  { id: '10', name: 'Broker-10', host: '192.168.1.110', port: 9092, status: 'online', cpu: '67%', memory: '3.1 GB', messages: '195,000' }
])

const total = ref(100)

const statusFormatter = (row: Record<string, any>, _column: Column, _cellValue: any, _index: number) => {
  const isOnline = row.status === 'online'
  return `<span class="status-tag ${isOnline ? 'online' : 'offline'}">${isOnline ? '在线' : '离线'}</span>`
}

const operationBtns: TableBtn[] = [
  { label: '详情', type: 'primary', link: true },
  { label: '重启', type: 'warning' },
  { label: '删除', type: 'danger' }
]

const columns = computed<Column[]>(() => [
  { prop: 'id', label: 'ID' , width: 50 },
  { prop: 'name', label: '节点名称',  sortable: true, minWidth: 100 },
  { prop: 'host', label: '主机地址', minWidth: 100 },
  { prop: 'port', label: '端口', minWidth: 100 },
  { prop: 'status', label: '状态', formatter: statusFormatter, minWidth: 100 },
  { prop: 'cpu', label: 'CPU', minWidth: 100 },
  { prop: 'memory', label: '内存', minWidth: 100 },
  { prop: 'messages', label: '消息数',sortable: true, minWidth: 100 },
  { prop: 'operation', label: '操作', type: 'operation', tableBtns: operationBtns, minWidth: 100 }
])

const onRowClick = (row: Broker) => {
  console.log('Row clicked:', row)
}

const onOperationClick = (btn?: TableBtn, row?: Broker) => {
  if (btn && row) {
    console.log(`Operation ${btn.label} clicked on row:`, row)
    if (btn.label === '删除') {
      ElMessage.warning(`确定要删除 ${row.name} 吗？`)
    } else if (btn.label === '重启') {
      ElMessage.info(`正在重启 ${row.name}...`)
    } else if (btn.label === '详情') {
      ElMessage.info(`查看 ${row.name} 详情`)
    }
  }
}
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

.status-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag.online {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.status-tag.offline {
  background-color: rgba(255, 77, 79, 0.1);
  color: #f56c6c;
}
</style>