<template>
  <div class="service-type-view">
    <div class="two-panel-layout">
      <!-- 左侧：连接卡片列表 -->
      <el-card class="left-panel">
        <template #header>
          <div class="card-header">
            <span>连接列表</span>
            <span class="header-tip">共 {{ connectorList.length }} 个连接</span>
          </div>
        </template>

        <div v-loading="connectionLoading" class="panel-body">
          <template v-if="connectorList.length > 0">
            <div
              v-for="connector in connectorList"
              :key="connector.connectorId"
              class="connector-card"
              :class="{ 'is-active': selectedConnector?.connectorId === connector.connectorId }"
              @click="onConnectorClick(connector)"
            >
              <div class="card-top">
                <span class="card-name">{{ connector.connectorName }}</span>
                <el-tag :type="connector.status === 'RUNNING' ? 'success' : 'info'" size="small">
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

      <!-- 右侧：Broker 分布 + 趋势图 -->
      <div class="right-col">
        <el-card class="right-panel broker-section">
          <template #header>
            <div class="card-header">
              <span>
                Broker 分布
                <template v-if="selectedConnector"> — {{ selectedConnector.connectorName }} </template>
              </span>
              <div v-if="selectedConnector">
                <el-button link size="small" class="refresh-btn" @click.stop="onRefreshClick" title="刷新 Broker 列表">
                  <el-icon :size="16"><Refresh /></el-icon>
                </el-button>
                <span class="connector-port">端口: {{ selectedConnector.port }}</span>
              </div>
            </div>
          </template>

          <div v-loading="brokerLoading" class="panel-body">
            <template v-if="!selectedConnector">
              <el-empty description="请选择左侧连接查看 Broker 分布" />
            </template>
            <template v-else>
              <ProTable
                :columns="brokerColumns"
                :data="brokerList"
                :loading="brokerLoading"
                max-height="auto"
                row-key="brokerInstanceId"
                highlight-current-row
                @row-click="onBrokerRowClick"
                @table-row-click="onOperationClick"
              />
            </template>
          </div>
        </el-card>

        <!-- 趋势图区域 -->
        <div class="trend-section">
          <el-card class="trend-card" v-loading="qpsLoading">
            <template #header>
              <div class="card-header">
                <span>QPS 趋势图</span>
                <span v-if="selectedBroker" class="header-tip">{{ selectedBroker.brokerInstanceId }}</span>
              </div>
            </template>
            <div v-if="qpsError" class="trend-error">
              <el-alert :title="qpsError" type="error" :closable="false" show-icon />
            </div>
            <el-empty
              v-else-if="!selectedBroker || !qpsRaw.length"
              description="请选择上方表格中的 Broker 行查看趋势"
              :image-size="60"
            />
            <Chart v-else :option="qpsOption" height="220px" />
          </el-card>

          <el-card class="trend-card" v-loading="msgLoading">
            <template #header>
              <div class="card-header">
                <span>Connector 消息数趋势图</span>
                <span v-if="selectedBroker" class="header-tip">{{ selectedBroker.brokerInstanceId }}</span>
              </div>
            </template>
            <div v-if="msgError" class="trend-error">
              <el-alert :title="msgError" type="error" :closable="false" show-icon />
            </div>
            <el-empty
              v-else-if="!selectedBroker || !msgRaw.length"
              description="请选择上方表格中的 Broker 行查看趋势"
              :image-size="60"
            />
            <Chart v-else :option="msgOption" height="220px" />
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import ProTable from '@/components/Table/index.vue'
import Chart from '@/components/Chart/index.vue'
import type { Column, TableBtn } from '@/components/Table/index'
import { qpsTrend, messageCountTrend } from '@/api'
import { useConnectorList, type ConnectorItem, type Broker } from '../common/useConnectorList'
import { createStatusFormatter, createTimeFormatter } from '@/utils/formatters'

const router = useRouter()

const {
  connectorList,
  connectionLoading,
  selectedConnector,
  brokerList,
  brokerLoading,
  fetchList,
  fetchBrokerList,
  selectConnector,
} = useConnectorList(1)

const selectedBroker = ref<Broker | null>(null)
const autoSelected = ref(false) // 是否已完成自动选择

const qpsLoading = ref(false)
const msgLoading = ref(false)
const qpsError = ref('')
const msgError = ref('')
const qpsRaw = ref<any[]>([])
const msgRaw = ref<any[]>([])

const statusFormatter = createStatusFormatter('status')
const timeFormatter = createTimeFormatter()

const brokerColumns = computed<Column[]>(() => [
  { prop: 'brokerInstanceId', label: 'Broker 实例', minWidth: 200 },
  { prop: 'status', label: '状态', minWidth: 100, formatter: statusFormatter },
  { prop: 'registeredDeviceCount', label: '注册设备', minWidth: 80 },
  { prop: 'requestQps', label: 'QPS', minWidth: 80 },
  { prop: 'totalRequestCount', label: '总消息数', minWidth: 80 },
  { prop: 'startedAt', label: '启动时间', minWidth: 150, formatter: timeFormatter },
  { prop: 'lastMessageAt', label: '最近消息', minWidth: 150, formatter: timeFormatter },
  {
    prop: 'operation',
    label: '操作',
    type: 'operation',
    tableBtns: [{ label: '注册设备', type: 'primary', link: true }],
    minWidth: 100,
  },
])

function createLineOption(
  rawData: any[],
  title: string,
  xField: string,
  yField: string,
  yLabel: string,
  lineColor: string,
) {
  if (!rawData.length) {
    return {}
  }
  const sorted = [...rawData].sort((a, b) => Number(a[xField]) - Number(b[xField]))
  const xData = sorted.map((d) => `${String(d[xField]).padStart(2, '0')}:00`)
  const yData = sorted.map((d) => Number(d[yField]) ?? 0)

  return {
    title: { text: '', left: 'left', textStyle: { fontSize: 14, fontWeight: 600, color: '#303133' } },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        const p = params[0]
        return `${p.axisValue}<br/>${p.marker} ${title}: ${Number(p.value).toLocaleString()} ${yLabel}`
      },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xData,
      name: '时间（今日）',
      nameLocation: 'middle',
      nameGap: 26,
      nameTextStyle: { color: '#909399', fontSize: 12 },
      axisLabel: { fontSize: 11, color: '#606266', interval: 2 },
    },
    yAxis: {
      type: 'value',
      name: yLabel,
      nameTextStyle: { color: '#909399', fontSize: 12 },
      axisLabel: {
        fontSize: 11,
        color: '#606266',
        formatter: (v: number) => {
          if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M'
          if (v >= 1_000) return (v / 1_000).toFixed(1) + 'K'
          return String(v)
        },
      },
      splitLine: { lineStyle: { type: 'dashed', color: '#e4e7ed' } },
    },
    series: [
      {
        name: title,
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: yData,
        lineStyle: { width: 2, color: lineColor },
        itemStyle: { color: lineColor },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: lineColor + '33' },
              { offset: 1, color: lineColor + '00' },
            ],
          },
        },
      },
    ],
  }
}

const qpsOption = computed(() => createLineOption(qpsRaw.value, 'QPS', 'hour', 'requestQps', '次/秒', '#409eff'))
const msgOption = computed(() => createLineOption(msgRaw.value, '消息数', 'hour', 'messageCount', '条', '#67C23A'))

async function loadTrend(
  apiFn: (params: any) => Promise<any>,
  connectorId: string,
  brokerInstanceId: string,
  loadingRef: { value: boolean },
  errorRef: { value: string },
  dataRef: { value: any[] },
  errorMsg: string,
) {
  if (!connectorId || !brokerInstanceId) return
  loadingRef.value = true
  errorRef.value = ''
  try {
    const res: any = await apiFn({ connectorId, brokerInstanceId })
    const payload = res?.data?.data ?? res?.data ?? res ?? []
    dataRef.value = Array.isArray(payload) ? payload : []
  } catch (err: any) {
    errorRef.value = err?.message || errorMsg
    dataRef.value = []
    ElMessage.error(errorRef.value)
  } finally {
    loadingRef.value = false
  }
}

function selectBroker(broker: Broker) {
  if (!broker) return
  selectedBroker.value = broker
  const connectorId = selectedConnector.value?.connectorId || ''
  if (!connectorId) return
  // 同时加载两个趋势
  loadTrend(qpsTrend, connectorId, broker.brokerInstanceId, qpsLoading, qpsError, qpsRaw, 'QPS 趋势数据加载失败')
  loadTrend(messageCountTrend, connectorId, broker.brokerInstanceId, msgLoading, msgError, msgRaw, '消息数趋势数据加载失败')
}

function onConnectorClick(connector: ConnectorItem) {
  // 切换连接时清空旧数据，但自动选择标志不变（避免再次自动选）
  selectedBroker.value = null
  qpsRaw.value = []
  msgRaw.value = []
  qpsError.value = ''
  msgError.value = ''
  selectConnector(connector)
}

function onBrokerRowClick(row: Broker) {
  selectBroker(row) // 复用
}

function onOperationClick(btn?: TableBtn, row?: Broker) {
  if (btn?.label === '注册设备' && row) {
    const connectorId = selectedConnector.value?.connectorId
    const brokerInstanceId = row.brokerInstanceId
    router.push({ path: '/metrics/serviceType/detail', query: { connectorId, brokerInstanceId } })
  }
}

function onRefreshClick() {
  const connectorId = selectedConnector.value?.connectorId
  if (connectorId) fetchBrokerList(connectorId)
  // 刷新后不清空 selectedBroker，让用户手动点选
}

watch(
  connectorList,
  (newList) => {
    if (!autoSelected.value && newList.length > 0 && !selectedConnector.value) {
      selectConnector(newList[0]) // 选中第一个连接
    }
  },
  { immediate: true }
)

watch(
  brokerList,
  (newList) => {
    if (!autoSelected.value && newList.length > 0 && !selectedBroker.value) {
      const first = newList[0]
      selectBroker(first)      // 选中第一个 Broker 并加载趋势
      autoSelected.value = true // 标记已完成
    }
  },
  { immediate: true }
)

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
/* 样式保持不变，完全复用 */
.service-type-view {
  height: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.two-panel-layout {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.left-panel {
  flex: 0 0 420px;
  display: flex;
  flex-direction: column;
}

.right-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.broker-section {
  min-height: 280px;
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

.refresh-btn {
  margin-right: 8px;
  padding: 0;
  color: #909399;
}

.panel-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.trend-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;
}

.trend-card {
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.trend-card :deep(.el-card__body) {
  flex: 1;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.trend-error {
  margin-bottom: 12px;
}

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

@media (max-width: 1200px) {
  .trend-card {
    min-height: 260px;
  }
}
</style>