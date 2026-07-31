<template>
  <div class="service-type-view">
    <div class="two-panel-layout">
      <!-- 左侧：连接卡片列表 -->
      <el-card class="left-panel">
        <template #header>
          <div class="card-header">
            <span>连接列表</span>
            <span class="header-tip">共 {{ state.connectorList.length }} 个连接</span>
          </div>
        </template>

        <div v-loading="state.connectionLoading" class="panel-body">
          <template v-if="state.connectorList.length > 0">
            <div
              v-for="connector in state.connectorList"
              :key="connector.connectorId"
              class="connector-card"
              :class="{ 'is-active': state.selectedConnector?.connectorId === connector.connectorId }"
              @click="onConnectorClick(connector)"
            >
              <div class="card-top">
                <span class="card-name">{{ connector.connectorName }}</span>
                <el-tag
                  :type="connector.status === 'RUNNING' ? 'success' : 'info'"
                  size="small"
                >
                  {{ connector.status === 'RUNNING' ? '运行中' : '已停止' }}
                </el-tag>
              </div>
              <div class="card-body">
                <div class="card-info-item">
                  <span class="info-label">Connector ID</span>
                  <span class="info-value" :title="connector.connectorId">{{ connector.connectorId }}</span>
                </div>
                <div class="card-info-row">
                  <div class="card-info-item">
                    <span class="info-label">协议</span>
                    <span class="info-value">{{ connector.protocol }}</span>
                  </div>
                  <div class="card-info-item">
                    <span class="info-label">端口</span>
                    <span class="info-value">{{ connector.port }}</span>
                  </div>
                  <div class="card-info-item">
                    <span class="info-label">Broker 数</span>
                    <span class="info-value highlight">{{ connector.brokerCount ?? '--' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <el-empty v-else description="暂无连接数据" />
        </div>
      </el-card>

      <!-- 右侧：Broker 分布数据 -->
      <el-card class="right-panel">
        <template #header>
          <div class="card-header">
            <span>
              Broker 分布
              <template v-if="state.selectedConnector">
                — {{ state.selectedConnector.connectorName }}
              </template>
            </span>
            <template v-if="state.selectedConnector">
              <!-- <el-tag size="small">{{ state.selectedConnector.protocol }}</el-tag> -->
              <span class="connector-port">端口: {{ state.selectedConnector.port }}</span>
            </template>
          </div>
        </template>

        <div v-loading="state.brokerLoading" class="panel-body">
          <template v-if="!state.selectedConnector">
            <el-empty description="请选择左侧连接查看 Broker 分布" />
          </template>
          <template v-else>
            <ProVirtualTable
              :columns="brokerColumns"
              :data="state.brokerList"
              :max-height="500"
              :show-toolbar="true"
              @table-row-click="onOperationClick"
            />
          </template>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'
import ProVirtualTable from '@/components/ProTable/ProVirtualTable.vue'
import type { Column, TableBtn } from '@/components/ProTable/type'
import { useRouter } from 'vue-router'
import { connectorsByAgentType, connectorsDistribution } from '@/api'
const router = useRouter()
import dayjs from 'dayjs'

interface ConnectorItem {
  connectorId: string
  connectorName: string
  protocol: string
  port: number
  brokerCount: number
  status: string
}

interface Broker {
  id: string
  brokerInstanceId: string
  [key: string]: any
}

const state = reactive({
  connectorList: [] as ConnectorItem[],
  connectionLoading: false,
  selectedConnector: null as ConnectorItem | null,

  brokerList: [] as Broker[],
  brokerTotal: 0,
  brokerPageSize: 10,
  brokerLoading: false,
})

const operationBtns: TableBtn[] = [
  { label: '注册设备', type: 'primary', link: true },
  // { label: '重启', type: 'warning' },
  // { label: '删除', type: 'danger' }
]

// 状态映射
const statusMap: Record<string, { text: string; class: string }> = {
  RUNNING: { text: '运行中', class: 'status-online' },
  STOPPED: { text: '离线', class: 'status-offline' }
}

// 状态格式化
const statusFormatter = (row: Record<string, any>) => {
  const status = statusMap[row.status] || { text: '未知', class: 'status-unknown' }
  return `<span class="status-tag ${status.class}"><span class="status-dot"></span>${status.text}</span>`
}

// 时间格式化
const timeFormatter = (_row: Record<string, any>, _column: Column, cellValue: any) => {
  if (!cellValue) return '--'
  return dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss')
}

// Broker 列表列定义
const brokerColumns = computed<Column[]>(() => [
  { prop: 'brokerInstanceId', label: 'Broker 实例', minWidth: 200 },
  { prop: 'status', label: '状态', minWidth: 100, formatter: statusFormatter },
  { prop: 'registeredDeviceCount', label: '注册设备', minWidth: 80 },
  { prop: 'requestQps', label: 'QPS', minWidth: 80 },
  { prop: 'totalRequestCount', label: '总消息数', minWidth: 80 },
  { prop: 'startedAt', label: '启动时间', minWidth: 80, formatter: timeFormatter },
  { prop: 'lastMessageAt', label: '最近消息', minWidth: 80, formatter: timeFormatter },
  { prop: 'operation', label: '操作', type: 'operation', tableBtns: operationBtns, minWidth: 100 }
])

// 获取连接列表（扁平化 connectors）
const fetchConnectionList = () => {
  state.connectionLoading = true
  connectorsByAgentType({ agentType: 1 })
    .then((res) => {
      const raw: any = res.data
      const list: ConnectorItem[] = []
      if (Array.isArray(raw)) {
        raw.forEach((group: any) => {
          if (Array.isArray(group.connectors)) {
            group.connectors.forEach((c: any) => {
              list.push({
                connectorId: c.connectorId,
                connectorName: c.connectorName,
                protocol: c.protocol,
                port: c.port,
                brokerCount: c.brokerCount,
                status: c.status,
              })
            })
          }
        })
      }
      state.connectorList = list
      // 默认选中第一个
      if (list.length > 0 && !state.selectedConnector) {
        state.selectedConnector = list[0]
        fetchBrokerList(list[0].connectorId)
      }
    })
    .catch(() => {
      state.connectorList = []
    })
    .finally(() => {
      state.connectionLoading = false
    })
}

// 获取 Broker 分布数据
const fetchBrokerList = (connectorId: string) => {
  state.brokerLoading = true
  connectorsDistribution(connectorId)
    .then((res) => {
      console.log('fetchBrokerList》〉》〉》〉。', res)
      const data: any = res.data.instances
      if (Array.isArray(data)) {
        state.brokerList = data
        state.brokerTotal = data.length
      } else if (data?.records) {
        state.brokerList = data.records
        state.brokerTotal = data.total || 0
      } else {
        state.brokerList = []
        state.brokerTotal = 0
      }
    })
    .catch(() => {
      state.brokerList = []
      state.brokerTotal = 0
    })
    .finally(() => {
      state.brokerLoading = false
    })
}

// 点击连接卡片
const onConnectorClick = (row: ConnectorItem) => {
  state.selectedConnector = row
  fetchBrokerList(row.connectorId)
}

// 操作按钮点击
const onOperationClick = (btn?: TableBtn, row?: Broker) => {
  if (btn && row) {
    if (btn.label === '注册设备') {
      const connectorId = state.selectedConnector?.connectorId
      const brokerInstanceId = row.brokerInstanceId
      router.push({ path: '/metrics/serviceType/detail', query: { connectorId, brokerInstanceId } })
    }
  }
}

onMounted(() => {
  fetchConnectionList()
})
</script>

<style scoped>
.service-type-view {
  padding: 0;
}

.two-panel-layout {
  display: flex;
  gap: 16px;
  height: calc(100vh - 120px);
}

/* ===== 左侧面板 ===== */
.left-panel {
  flex: 0 0 420px;
  display: flex;
  flex-direction: column;
}

/* ===== 右侧面板 ===== */
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.header-tip {
  font-size: 12px;
  color: #909399;
  font-weight: 400;
}

.connector-port {
  font-size: 12px;
  color: #909399;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* ===== 连接卡片 ===== */
.connector-card {
  padding: 14px 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fff;
}

.connector-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.12);
}

.connector-card.is-active {
  border-color: #409eff;
  background: #ecf5ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.card-info-item .info-label {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  flex-shrink: 0;
}

.card-info-item .info-value {
  font-size: 13px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-info-item .info-value.highlight {
  color: #409eff;
  font-weight: 600;
}

.card-info-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

/* ===== 分页 ===== */
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
