<template>
  <div class="cluster-list-view">
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <span>Broker 列表</span>
        </div>
      </template>

      <div class="table-section">
        <ProVirtualTable
          :columns="columns"
          :data="state.brokerList"
          :show-toolbar="true"
          :loading="state.loading"
          @table-row-click="onOperationClick"
        />
      </div>
    </el-card>

    <!-- Broker 详情弹窗 -->
    <el-dialog
      v-model="state.detailVisible"
      title="Broker 详情"
      width="680px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-descriptions :column="2" border v-loading="state.detailLoading">
        <el-descriptions-item label="Broker实例ID" :span="2">
          {{ state.detail.brokerInstanceId || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="主机地址">
          {{ state.detail.host || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="端口">
          {{ state.detail.port ?? '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <span
            v-if="state.detail.status"
            class="status-tag"
            :class="state.detail.status === 'STARTED' ? 'online' : 'offline'"
          >
            {{ state.detail.status === 'STARTED' ? '运行中' : state.detail.status }}
          </span>
          <span v-else>--</span>
        </el-descriptions-item>
        <el-descriptions-item label="Nacos存活">
          <span
            v-if="state.detail.nacosAlive !== undefined"
            class="status-tag"
            :class="state.detail.nacosAlive ? 'online' : 'offline'"
          >
            {{ state.detail.nacosAlive ? '是' : '否' }}
          </span>
          <span v-else>--</span>
        </el-descriptions-item>
        <el-descriptions-item label="Connector运行数">
          {{ state.detail.runningConnectorCount ?? '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="Connector总数">
          {{ state.detail.totalConnectorCount ?? '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="在线设备数">
          {{ state.detail.onlineDeviceCount ?? '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="不稳定设备数">
          {{ state.detail.unavailableDeviceCount ?? '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="离线设备数">
          {{ state.detail.offlineDeviceCount ?? '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="注册设备数">
          {{ state.detail.registeredDeviceCount ?? '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="最大承载设备数">
          {{ state.detail.maxDeviceCount ?? '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="快照上报">
          <span
            v-if="state.detail.snapshotReported !== undefined"
            class="status-tag"
            :class="state.detail.snapshotReported ? 'online' : 'offline'"
          >
            {{ state.detail.snapshotReported ? '已上报' : '未上报' }}
          </span>
          <span v-else>--</span>
        </el-descriptions-item>
        <el-descriptions-item label="启动时间">
          {{ state.detail.startTime ? formatTime(state.detail.startTime) : '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="最近快照时间">
          {{ state.detail.lastSnapshotAt ? formatTime(state.detail.lastSnapshotAt) : '--' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import ProVirtualTable from '@/components/ProTable/ProVirtualTable.vue'
import type { Column, TableBtn } from '@/components/ProTable/type'
import { brokersList, brokersDetail } from '@/api'
import dayjs from 'dayjs'

interface BrokerItem {
  brokerInstanceId: string
  host: string
  port: number
  status: string
  nacosAlive: boolean
  loadRate: number
  snapshotReported: boolean
  runningConnectorCount: number
  totalConnectorCount: number
  onlineDeviceCount: number
  offlineDeviceCount: number
  registeredDeviceCount: number
  unavailableDeviceCount: number
  maxDeviceCount: number
  startTime: number
  lastSnapshotAt: number
  updatedAt: number
}

const state = reactive({
  brokerList: [] as BrokerItem[],
  total: 0,
  currentPage: 1,
  pageSize: 10,
  loading: false,
  detailVisible: false,
  detailLoading: false,
  detail: {
    brokerInstanceId: '',
    host: '',
    port: 0,
    status: '',
    nacosAlive: false,
    loadRate: 0,
    snapshotReported: false,
    runningConnectorCount: 0,
    totalConnectorCount: 0,
    onlineDeviceCount: 0,
    offlineDeviceCount: 0,
    registeredDeviceCount: 0,
    unavailableDeviceCount: 0,
    maxDeviceCount: 0,
    startTime: 0,
    lastSnapshotAt: 0,
    updatedAt: 0,
  } as BrokerItem,
})

// 格式化时间戳
const formatTime = (timestamp: number) => {
  if (!timestamp) return '--'
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

// 状态格式化
const statusFormatter = (row: Record<string, any>) => {
  const isOnline = row.snapshotReported
  return `<span class="status-tag ">${isOnline ? '已上报' : '未上报'}</span>`
}

// Nacos存活格式化
const nacosAliveFormatter = (row: Record<string, any>) => {
  const isAlive = row.nacosAlive
  return `<span class="status-tag ${isAlive ? 'status-online' : 'status-offline'}"><span class="status-dot"></span>${isAlive ? '存活' : '离线'}</span>`
}

// Connector在线/总数格式化
const connectorFormatter = (row: Record<string, any>) => {
  return `<span class="status-tag online">${row.runningConnectorCount}/${row.totalConnectorCount}</span>`
}

// 负载率进度条格式化（列表用，内联样式避免 scoped 失效）
const loadRateFormatter = (row: Record<string, any>) => {
  const rate = row.loadRate ?? 0
  let color = '#67c23a'
  if (rate >= 80) color = '#f56c6c'
  else if (rate >= 60) color = '#e6a23c'
  return `<div style="display:flex;align-items:center;gap:8px;min-width:120px;">
    <div style="flex:1;height:8px;background:#ebeef5;border-radius:4px;overflow:hidden;">
      <div style="height:100%;border-radius:4px;width:${rate}%;background:${color};"></div>
    </div>
    <span style="font-size:12px;color:#606266;white-space:nowrap;">${rate}%</span>
  </div>`
}

const operationBtns: TableBtn[] = [
  { label: '详情', type: 'primary', link: true },
]

const columns = computed<Column[]>(() => [
  { prop: 'brokerInstanceId', label: 'Broker实例ID', sortable: true, minWidth: 180 },
  { prop: 'host', label: '主机地址', minWidth: 120 },
  { prop: 'port', label: '端口', minWidth: 80 },
  { prop: 'nacosAlive', label: 'Nacos存活', formatter: nacosAliveFormatter, minWidth: 100 },
  { prop: 'snapshotReported', label: '快照', formatter: statusFormatter, minWidth: 100 },
  { prop: 'runningConnectorCount', label: 'Connector在线/总数', formatter: connectorFormatter, minWidth: 130 },
  { prop: 'registeredDeviceCount', label: '注册设备', sortable: true, minWidth: 100 },
  { prop: 'maxDeviceCount', label: '最大承载', sortable: true, minWidth: 100 },
  { prop: 'loadRate', label: '负载率', formatter: loadRateFormatter, minWidth: 160 },
  { prop: 'operation', label: '操作', type: 'operation', tableBtns: operationBtns, minWidth: 100 },
])

const getList = () => {
  state.loading = true
  brokersList({
    page: state.currentPage,
    pageSize: state.pageSize,
  })
    .then((res) => {
      const data = res.data as any
      state.brokerList = data.records ?? data ?? []
      state.total = data.total ?? 0
    })
    .catch(() => {
      ElMessage.error('获取Broker列表失败')
    })
    .finally(() => {
      state.loading = false
    })
}

const getDetail = (brokerInstanceId: string) => {
  state.detailVisible = true
  state.detailLoading = true
  brokersDetail({ brokerInstanceId })
    .then((res) => {
      state.detail = (res.data ?? {}) as BrokerItem
    })
    .catch(() => {
      ElMessage.error('获取Broker详情失败')
    })
    .finally(() => {
      state.detailLoading = false
    })
}

const onOperationClick = (btn?: TableBtn, row?: BrokerItem) => {
  if (btn && row) {
    if (btn.label === '详情') {
      getDetail(row.brokerInstanceId)
    }
  }
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.cluster-list-view {
  height: 100%;
  padding: 0;
}

.cluster-list-view :deep(.el-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.cluster-list-view :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px;
}

.detail-card {
  height: 100%;
}

.table-section {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* 详情弹窗负载率进度条 */
.load-rate-bar {
  width: 100%;
  padding: 4px 0;
}
</style>
