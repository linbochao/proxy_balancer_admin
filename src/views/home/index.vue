<template>
  <div class="home-view">
    <!-- 顶部概览卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card" v-for="card in overviewCards" :key="card.key">
        <div v-if="card.key === 'refresh'" class="stat-info">
          <div>
            <el-tooltip :content="card.tooltip" placement="top" effect="dark">
              <div class="stat-label">{{ card.label }}</div>
            </el-tooltip>
            <div class="refresh-controls">
              <el-select v-model="state.refreshInterval" placeholder="刷新频率" size="small" style="width: 100px"
                @change="onRefreshIntervalChange">
                <el-option label="手动" :value="0" />
                <el-option label="10s" :value="10" />
                <el-option label="30s" :value="30" />
                <el-option label="60s" :value="60" />
              </el-select>
            </div>
          </div>
          <div class="stat-icon" :style="{ backgroundColor: card.bgColor, color: card.color }" style="cursor: pointer" @click="refreshAll">
            <el-icon :size="28">
              <component :is="card.icon" />
            </el-icon>
          </div>
        </div>
        <template v-else>
          <div class="stat-info">
            <template style="display: flex;flex-direction: column;align-items: center;justify-content: center;gap: 10px;">
              <el-tooltip :content="card.tooltip" placement="top" effect="dark">
                <div class="stat-label">{{ card.label }}</div>
              </el-tooltip>
              <div class="stat-value">
                <template v-if="card.key === 'registerProcessing'">
                  <div v-if="registerLoading">加载中...</div>
                  <div v-else-if="registerError">错误: {{ registerError }}</div>
                  <div v-else>
                    <div style="font-size:20px;font-weight:700">{{ state.registerData.todayMessageCount ?? 0 }}</div>
                    <div style="font-size:12px;color:#909399">今日处理消息数</div>
                    <div style="height:6px"></div>
                    <div style="font-size:16px">累计: {{ state.registerData.totalMessageCount ?? 0 }}</div>
                  </div>
                </template>
                <template v-else>
                  {{ card.value }}
                </template>
              </div>
            </template>
            <div class="stat-icon" :style="{ backgroundColor: card.bgColor, color: card.color }">
              <el-icon :size="28">
                <component :is="card.icon" />
              </el-icon>
            </div>
          </div>
        </template>
      </el-card>
    </div>

    <!-- Broker负载 & 设备分布倾斜率 -->
    <div class="middle-row" :style="{ height: rowHeight + 'px' }">
      <el-card class="half-card">
        <template #header>
          <div class="card-header">
            <span>Broker 负载</span>
          </div>
        </template>
        <!-- ✅ 改造：使用 Chart.vue 组件替代手动 ECharts 实例 -->
        <div class="chart-container" v-loading="state.brokerLoading">
          <Chart :option="brokerLoadOption" height="100%" @chart-click="handleBrokerClick" />
        </div>
      </el-card>

      <el-card class="half-card">
        <template #header>
          <div class="card-header">
            <span>设备分布倾斜率</span>
          </div>
        </template>
        <div class="distribution-wrap" v-loading="state.brokerLoading || state.distributionLoading">
          <div class="dist-cards">
            <div class="dist-card">
              <div class="dist-card-value">{{ state.maxDeviceCount }}</div>
              <div class="dist-card-label">最大承载</div>
            </div>
            <div class="dist-card">
              <div class="dist-card-value">{{ state.minDeviceCount }}</div>
              <div class="dist-card-label">最小承载</div>
            </div>
            <div class="dist-card">
              <div class="dist-card-value">{{ state.avgDeviceCount }}</div>
              <div class="dist-card-label">平均承载</div>
            </div>
          </div>
          <div class="dist-progress-list">
            <div class="dist-progress-item" v-for="item in state.distributionData" :key="item.agentType">
              <div class="dist-progress-header">
                <span class="dist-progress-name">{{ item.host }}</span>
                <span class="dist-progress-pct">{{ item.loadRate ?? 0 }}%</span>
              </div>
              <div class="dist-progress-bar">
                <div class="dist-progress-fill" :style="{ width: (item.loadRate ?? 0) + '%' }"></div>
              </div>
              <div class="dist-progress-meta">
                <span>最大承载数: {{ item.maxDeviceCount }}</span>
                <span>设备数: {{ item.onlineDeviceCount }}</span>
              </div>
            </div>
            <div v-if="state.distributionData.length === 0" class="empty-tip">暂无数据</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 连接运行质量 & 连接分类 -->
    <div class="bottom-row" :style="{ height: rowHeight + 'px' }">
      <el-card class="half-card">
        <template #header>
          <div class="card-header">
            <span>连接运行质量</span>
          </div>
        </template>
        <PieChart
          :data="qualityChartData"
          :centerText="qualityCenterText"
          :showLabel="true"
          labelFormatter="{b}{d}%"
          :tooltipFormatter="qualityTooltipFormatter"
          :loading="state.qualityLoading"
        />
      </el-card>

      <el-card class="half-card">
        <template #header>
          <div class="card-header">
            <span>连接分类</span>
          </div>
        </template>
        <PieChart
          :data="agentTypeChartData"
          :centerText="agentTypeCenterText"
          :tooltipFormatter="agentTypeTooltipFormatter"
          :legendFormatter="agentTypeLegendFormatter"
          :emphasisLabelFormatter="agentTypeEmphasisFormatter"
          :loading="state.agentTypeLoading"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import {
  DataAnalysis, Connection, DataBoard, Refresh,
} from '@element-plus/icons-vue'
import {
  brokersOverview, brokersDistribution, loads,
  connectorsRuntimeQuality, connectorsDeviceCountsByAgentType, connectorsReportProcessing,
} from '@/api'
import PieChart from '@/components/PieChart/index.vue'
import Chart from '@/components/Chart/index.vue'
import type { PieDataItem, CenterText } from '@/components/PieChart/index.vue'
import { useDynamicHeight } from '@/composables/useDynamicHeight'

// ---------------------------------------------------------------------------
// 概览卡片
// ---------------------------------------------------------------------------

interface OverviewCard {
  key: string
  label: string
  value: string | number
  tooltip: string
  icon: any
  bgColor: string
  color: string
}

const state = reactive({
  overviewData: {} as Record<string, any>,
  brokerList: [] as any[],
  brokerMaxDevice: 0,
  brokerMinDevice: 0,
  brokerAvgDevice: 0,
  brokerLoading: false,
  distributionData: [] as any[],
  maxDeviceCount: 0,
  minDeviceCount: 0,
  avgDeviceCount: 0,
  distributionLoading: false,
  qualityData: {} as Record<string, any>,
  qualityLoading: false,
  agentTypeData: [] as any[],
  agentTypeLoading: false,
  refreshInterval: 0,
  isRefreshing: false,
  registerData: {} as Record<string, any>,
  registerLoading: false,
  registerError: '',
  conTypeTotal: 0,
})

let refreshTimer: ReturnType<typeof setInterval> | null = null

const refreshAll = () => {
  state.isRefreshing = true
  Promise.all([
    fetchOverview(),
    fetchBrokerList(),
    fetchDistribution(),
    fetchRuntimeQuality(),
    fetchAgentType(),
    fetchRegisterProcessing(),
  ]).finally(() => {
    state.isRefreshing = false
  })
}

const startRefreshTimer = () => {
  stopRefreshTimer()
  if (state.refreshInterval > 0) {
    refreshTimer = setInterval(() => {
      fetchOverview()
      fetchBrokerList()
      fetchDistribution()
      fetchRuntimeQuality()
      fetchAgentType()
    }, state.refreshInterval * 1000)
  }
}

const stopRefreshTimer = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

const onRefreshIntervalChange = () => {
  startRefreshTimer()
}

const overviewCards = computed<OverviewCard[]>(() => {
  const d = state.overviewData
  return [
    {
      key: 'clusterHealth',
      label: '集群健康度',
      value: d.clusterHealth != null ? d.clusterHealth + '%' : '--',
      tooltip: '当前集群中处于健康状态的Broker占比，反映集群整体运行状况',
      icon: DataAnalysis,
      bgColor: 'rgba(64, 158, 255, 0.1)',
      color: '#409eff',
    },
    {
      key: 'averageLoad',
      label: '平均负载',
      value: d.averageLoad != null ? d.averageLoad + '%' : '--',
      tooltip: '所有Broker节点的平均负载率，数值越高表示负载越重',
      icon: Connection,
      bgColor: 'rgba(103, 194, 58, 0.1)',
      color: '#67c23a',
    },
    {
      key: 'registeredDeviceCount',
      label: '注册设备数',
      value: d.registeredDeviceCount ?? '--',
      tooltip: '系统中已注册的设备总数',
      icon: DataBoard,
      bgColor: 'rgba(64, 158, 255, 0.1)',
      color: '#409eff',
    },
    {
      key: 'registerProcessing',
      label: 'Register 处理概览',
      value: '',
      tooltip: '今日与累计处理消息数',
      icon: DataBoard,
      bgColor: 'rgba(64, 158, 255, 0.06)',
      color: '#409eff',
    },
    {
      key: 'refresh',
      label: '数据刷新',
      value: '',
      tooltip: '每隔多少秒刷新一次首页数据',
      icon: Refresh,
      bgColor: 'rgba(103, 194, 58, 0.1)',
      color: '#67c23a',
    },
  ]
})

// ---------------------------------------------------------------------------
// Register 处理概览 - 接口调用
// ---------------------------------------------------------------------------

const fetchRegisterProcessing = () => {
  state.registerLoading = true
  state.registerError = ''
  return connectorsReportProcessing()
    .then((res: any) => {
      const data = res.data ?? res
      const payload = data.registerMetrics ?? data
      state.registerData = payload ?? {}
    })
    .catch((err: any) => {
      state.registerError = err?.message || '获取数据失败'
      state.registerData = {}
    })
    .finally(() => { state.registerLoading = false })
}

// ---------------------------------------------------------------------------
// API 调用
// ---------------------------------------------------------------------------

const fetchOverview = () => {
  return brokersOverview().then((res: any) => {
    state.overviewData = res.data ?? {}
  })
}

const fetchBrokerList = () => {
  state.brokerLoading = true
  return loads()
    .then((res: any) => {
      const data = res.data as any
      state.brokerList = data.brokers ?? data.records ?? data ?? []
      state.brokerMaxDevice = data.maxDeviceCount ?? 0
      state.brokerMinDevice = data.minDeviceCount ?? 0
      state.brokerAvgDevice = data.avgDeviceCount ?? 0
    })
    .finally(() => { state.brokerLoading = false })
}

const fetchDistribution = () => {
  state.distributionLoading = true
  return brokersDistribution()
    .then((res: any) => {
      const data = res.data as any
      state.distributionData = data.brokers
      state.maxDeviceCount = data.maxDeviceCount ?? 0
      state.minDeviceCount = data.minDeviceCount ?? 0
      state.avgDeviceCount = data.avgDeviceCount ?? 0
    })
    .finally(() => { state.distributionLoading = false })
}

const fetchRuntimeQuality = () => {
  state.qualityLoading = true
  return connectorsRuntimeQuality()
    .then((res: any) => {
      state.qualityData = res.data ?? {}
    })
    .finally(() => { state.qualityLoading = false })
}

const fetchAgentType = () => {
  state.agentTypeLoading = true
  return connectorsDeviceCountsByAgentType()
    .then((res: any) => {
      state.agentTypeData = res.data?.items ?? res.data ?? []
      state.conTypeTotal = res.data.totalConnectorCount
    })
    .finally(() => { state.agentTypeLoading = false })
}

// ---------------------------------------------------------------------------
// Broker 负载 - 使用 Chart.vue 组件（通过 computed 生成 option）
// ---------------------------------------------------------------------------

const brokerLoadOption = computed(() => {
  const list = state.brokerList
  const hosts = list.map((d: any) => d.host || '')
  const loads = list.map((d: any) => d.loadRate ?? 0)

  // 如果没有数据，返回空配置
  if (hosts.length === 0) {
    return {
      title: { text: '暂无数据', left: 'center', top: 'center', textStyle: { color: '#909399', fontSize: 14 } },
    }
  }

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const item = params[0]
        const d = list[item.dataIndex]
        return `Broker状态: ${d.nacosAlive ? '存活' : '离线'}<br/>${d.host}<br/>负载率: ${d.loadRate}%<br/>在线设备: ${d.onlineDeviceCount}/${d.maxDeviceCount}`
      },
    },
    grid: { left: '3%', right: '5%', bottom: '3%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: hosts,
      axisLabel: { rotate: 30, fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%' },
    },
    series: [{
      type: 'bar',
      data: loads.map((v: number) => ({
        value: v,
        itemStyle: {
          color: v >= 80 ? '#f56c6c' : v >= 60 ? '#e6a23c' : '#67c23a',
          borderRadius: [4, 4, 0, 0],
        },
      })),
      barMaxWidth: 40,
      label: {
        show: true,
        position: 'top',
        formatter: '{c}%',
        fontSize: 11,
        color: '#606266',
      },
    }],
  }
})

// Broker 图表点击事件
const handleBrokerClick = (params: any) => {
  console.log('Broker 负载图表点击：', params)
}

// ---------------------------------------------------------------------------
// Pie chart data (derived from API responses)
// ---------------------------------------------------------------------------

const statusColorMap: Record<string, string> = {
  RUNNING: '#67c23a',
  STOPPED: '#909399',
  FAILED: '#f56c6c',
}
const statusLabelMap: Record<string, string> = {
  RUNNING: '运行中',
  STOPPED: '已停止',
  FAILED: '失败',
}

const qualityChartData = computed<PieDataItem[]>(() => {
  const items: any[] = state.qualityData?.items ?? []
  return items.map((item: any) => ({
    name: statusLabelMap[item.status] || item.status,
    value: item.count,
    itemStyle: { color: statusColorMap[item.status] || '#409eff' },
    _raw: item,
  }))
})

const qualityCenterText = computed<CenterText | null>(() => {
  const total = state.qualityData?.totalInstanceCount ?? 0
  if (total <= 0) return null
  return { label: String(total), sublabel: '连接实例' }
})

const qualityTooltipFormatter = (params: any, data: PieDataItem[]) => {
  const item = (data[params.dataIndex] as any)?._raw
  return `${statusLabelMap[item?.status] || item?.status}<br/>数量: ${item?.count}<br/>占比: ${item?.ratio}%`
}

// --- agent type ---

const agentTypeChartData = computed<PieDataItem[]>(() => {
  return state.agentTypeData.map((d: any) => ({
    name: d.agentTypeName || d.name || '',
    value: d.connectorCount ?? 0,
    deviceCount: d.deviceCount ?? 0,
  }))
})

const agentTypeCenterText = computed<CenterText | null>(() => {
  if (state.conTypeTotal <= 0) return null
  return { label: String(state.conTypeTotal), sublabel: '连接总数' }
})

const agentTypeTooltipFormatter = (params: any, data: PieDataItem[]) => {
  const item = data[params.dataIndex]
  return `${params.name}<br/>连接实例: ${params.value} (${params.percent}%)<br/>设备数量: ${(item as any).deviceCount}`
}

const agentTypeLegendFormatter = (name: string, data: PieDataItem[]) => {
  const item = data.find((d: any) => d.name === name) as any
  return item ? `${name}  (设备 ${item.deviceCount})` : name
}

const agentTypeEmphasisFormatter = (params: any) => {
  const data = agentTypeChartData.value
  const item = data[params.dataIndex] as any
  return `${params.name}\n连接: ${params.value}  设备: ${item?.deviceCount}`
}

// ---------------------------------------------------------------------------
// 响应式 resize
// ---------------------------------------------------------------------------

// Chart.vue 组件内部已经监听了 window resize，所以这里不需要再手动处理了！
// 但为了保险，如果有其他需要 resize 的元素，可以保留

// ---------------------------------------------------------------------------
// 动态行高
// ---------------------------------------------------------------------------

const FIXED_OFFSETS = [60, 40, 136, 20]

const { containerHeight: totalAvailable } = useDynamicHeight(undefined, {
  offsets: FIXED_OFFSETS,
  minHeight: 560,
  maxHeight: 1000,
})

const rowHeight = computed(() => Math.round(totalAvailable.value / 2))

// ---------------------------------------------------------------------------
// 监听数据变化
// ---------------------------------------------------------------------------

// 因为 brokerLoadOption 是 computed，数据变化时 Chart 组件会自动响应
// 不需要额外的 watch 来触发重绘

// ---------------------------------------------------------------------------
// 生命周期
// ---------------------------------------------------------------------------

onMounted(() => {
  fetchOverview()
  fetchBrokerList()
  fetchDistribution()
  fetchRuntimeQuality()
  fetchAgentType()
  fetchRegisterProcessing()
  // ❌ 移除 window.addEventListener('resize', handleResize)
  // Chart.vue 组件内部已经处理了 resize
})

onBeforeUnmount(() => {
  stopRefreshTimer()
  // ❌ 移除 window.removeEventListener('resize', handleResize)
  // ❌ 移除 brokerLoadChart?.dispose()
  // Chart.vue 组件内部已经处理了销毁
})
</script>

<style scoped>
.home-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.stat-card {
  width: 100%;
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
  flex-shrink: 0;
}

:deep(.el-card__body) {
  width: 100%;
  padding: 0
}

.stat-info {
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.stat-value {
  font-size: 26px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.refresh-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.middle-row,
.bottom-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  flex-shrink: 0;
}

.middle-row {
  margin-bottom: 20px;
}

.half-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.half-card :deep(.el-card__body) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 0 20px 20px;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-tip {
  text-align: center;
  color: #909399;
  padding: 40px 0;
  font-size: 14px;
}

.distribution-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dist-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.dist-card {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 14px 12px;
  text-align: center;
}

.dist-card-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.dist-card-label {
  font-size: 12px;
  color: #909399;
  margin-top: 6px;
}

.dist-progress-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dist-progress-item {
  padding: 10px;
}

.dist-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.dist-progress-name {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}

.dist-progress-pct {
  font-size: 13px;
  color: #409eff;
  font-weight: 500;
}

.dist-progress-bar {
  height: 10px;
  background: #ebeef5;
  border-radius: 5px;
  overflow: hidden;
}

.dist-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #79bbff);
  border-radius: 5px;
  transition: width 0.4s ease;
}

.dist-progress-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 11px;
  color: #909399;
}

.chart-container {
  flex: 1;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.chart-container :deep(.chart) {
  flex: 1;
  min-height: 0;
}

@media screen and (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .middle-row,
  .bottom-row {
    grid-template-columns: 1fr;
  }
}

@media screen and (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>