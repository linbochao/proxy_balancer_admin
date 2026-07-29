<template>
  <div class="home-view">
    <!-- 顶部概览卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card" v-for="card in overviewCards" :key="card.key">
        <div class="stat-icon" :style="{ backgroundColor: card.bgColor, color: card.color }">
          <el-icon :size="28"><component :is="card.icon" /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ card.value }}</div>
          <el-tooltip :content="card.tooltip" placement="top" effect="dark">
            <div class="stat-label">{{ card.label }}</div>
          </el-tooltip>
        </div>
      </el-card>
    </div>

    <!-- Broker负载 & 设备分布倾斜率 -->
    <div class="middle-row">
      <el-card class="half-card">
        <template #header>
          <div class="card-header">
            <span>Broker 负载</span>
          </div>
        </template>
        <div class="chart-container" ref="brokerLoadChartRef" v-loading="state.brokerLoading"></div>
      </el-card>

      <el-card class="half-card">
        <template #header>
          <div class="card-header">
            <span>设备分布倾斜率</span>
          </div>
        </template>
        <div class="distribution-wrap" v-loading="state.brokerLoading || state.distributionLoading">
          <!-- 承载卡片 -->
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
          <!-- 分布进度条 -->
          <div class="dist-progress-list">
            <div class="dist-progress-item" v-for="item in state.distributionData" :key="item.agentType">
              <div class="dist-progress-header">
                <span class="dist-progress-name">{{ item.host }}</span>
                <span class="dist-progress-pct">{{ item.loadRate ?? 0}}%</span>
              </div>
              <div class="dist-progress-bar">
                <div
                  class="dist-progress-fill"
                  :style="{ width: (item.loadRate ?? 0) + '%' }"
                ></div>
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
    <div class="bottom-row">
      <el-card class="half-card">
        <template #header>
          <div class="card-header">
            <span>连接运行质量</span>
          </div>
        </template>
        <div class="chart-container" ref="qualityChartRef" v-loading="state.qualityLoading"></div>
      </el-card>

      <el-card class="half-card">
        <template #header>
          <div class="card-header">
            <span>连接分类</span>
          </div>
        </template>
        <div class="chart-container" ref="agentTypeChartRef" v-loading="state.agentTypeLoading"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import {
  DataAnalysis, Connection, DataBoard,
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import {
  brokersOverview, brokersList, brokersDistribution,
  connectorsRuntimeQuality, connectorsDeviceCountsByAgentType,
} from '@/api'

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
  // overview
  overviewData: {} as Record<string, any>,
  // broker load
  brokerList: [] as any[],
  brokerMaxDevice: 0,
  brokerMinDevice: 0,
  brokerAvgDevice: 0,
  brokerLoading: false,
  // distribution
  distributionData: [] as any[],
  maxDeviceCount: 0,
  minDeviceCount: 0,
  avgDeviceCount: 0,
  distributionLoading: false,
  // runtime quality
  qualityData: {} as Record<string, any>,
  qualityLoading: false,
  // agent type
  agentTypeData: [] as any[],
  agentTypeLoading: false,
})

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
      bgColor: 'rgba(144, 147, 153, 0.1)',
      color: '#909399',
    },
  ]
})

// ---------------------------------------------------------------------------
// API 调用
// ---------------------------------------------------------------------------

const fetchOverview = () => {
  brokersOverview().then((res: any) => {
    state.overviewData = res.data ?? {}
  })
}

const fetchBrokerList = () => {
  state.brokerLoading = true
  brokersList({ page: 1, pageSize: 999 })
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
  brokersDistribution()
    .then((res: any) => {
      const data = res.data as any
      console.log(data,'>>>>>>>>') // debug
      state.distributionData = data.brokers
      state.maxDeviceCount = data.maxDeviceCount ?? 0
      state.minDeviceCount = data.minDeviceCount ?? 0
      state.avgDeviceCount = data.avgDeviceCount ?? 0
    })
    .finally(() => { state.distributionLoading = false })
}

const fetchRuntimeQuality = () => {
  state.qualityLoading = true
  connectorsRuntimeQuality()
    .then((res: any) => {
      state.qualityData = res.data ?? {}
    })
    .finally(() => { state.qualityLoading = false })
}

const fetchAgentType = () => {
  state.agentTypeLoading = true
  connectorsDeviceCountsByAgentType()
    .then((res: any) => {
      state.agentTypeData = res.data?.items ?? res.data ?? []
    })
    .finally(() => { state.agentTypeLoading = false })
}

// ---------------------------------------------------------------------------
// 图表 refs 与实例
// ---------------------------------------------------------------------------

const brokerLoadChartRef = ref<HTMLDivElement>()
const agentTypeChartRef = ref<HTMLDivElement>()
const qualityChartRef = ref<HTMLDivElement>()

let brokerLoadChart: echarts.ECharts | null = null
let agentTypeChart: echarts.ECharts | null = null
let qualityChart: echarts.ECharts | null = null

// ---------------------------------------------------------------------------
// 设备分布倾斜率 - 柱状图
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Broker 负载 - 条形图
// ---------------------------------------------------------------------------

const renderBrokerLoadChart = () => {
  if (!brokerLoadChartRef.value) return
  if (!brokerLoadChart) {
    brokerLoadChart = echarts.init(brokerLoadChartRef.value)
  }
  const list = state.brokerList
  const hosts = list.map((d: any) => d.host || '')
  const loads = list.map((d: any) => d.loadRate ?? 0)

  brokerLoadChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const item = params[0]
        const d = list[item.dataIndex]
        return `${d.host}<br/>负载率: ${d.loadRate}%<br/>在线设备: ${d.onlineDeviceCount}/${d.maxDeviceCount}`
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
  })
}

// ---------------------------------------------------------------------------
// 连接运行质量 - 饼图
// ---------------------------------------------------------------------------

const renderQualityChart = () => {
  if (!qualityChartRef.value) return
  if (!qualityChart) {
    qualityChart = echarts.init(qualityChartRef.value)
  }
  const d = state.qualityData
  const items: any[] = d.items ?? []
  const total = d.totalInstanceCount ?? 0

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

  qualityChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const item = items[params.dataIndex]
        return `${statusLabelMap[item.status] || item.status}<br/>数量: ${item.count}<br/>占比: ${item.ratio}%`
      },
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
    },
    graphic: total > 0 ? [
      {
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
          text: `${total}\nConnector总数`,
          textAlign: 'center',
          fill: '#303133',
          fontSize: 18,
          fontWeight: 'bold',
          lineHeight: 24,
        },
      },
    ] : [],
    series: [{
      type: 'pie',
      radius: ['55%', '78%'],
      center: ['55%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 4,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: true,
        formatter: '{b}\n{d}%',
      },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' },
      },
      data: items.map((item: any) => ({
        name: statusLabelMap[item.status] || item.status,
        value: item.count,
        itemStyle: { color: statusColorMap[item.status] || '#409eff' },
      })),
    }],
  })
}

// ---------------------------------------------------------------------------
// 连接分类 - 饼图
// ---------------------------------------------------------------------------

const renderAgentTypeChart = () => {
  if (!agentTypeChartRef.value) return
  if (!agentTypeChart) {
    agentTypeChart = echarts.init(agentTypeChartRef.value)
  }
  const data = state.agentTypeData.map((d: any) => ({
    name: d.agentTypeName || d.name || '',
    value: d.deviceCount ?? d.connectorCount ?? 0,
  }))

  agentTypeChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
    },
    series: [{
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['55%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 4,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' },
      },
      data,
    }],
  })
}

// ---------------------------------------------------------------------------
// 响应式 resize
// ---------------------------------------------------------------------------

const handleResize = () => {
  brokerLoadChart?.resize()
  qualityChart?.resize()
  agentTypeChart?.resize()
}

// ---------------------------------------------------------------------------
// 监听数据变化重新渲染
// ---------------------------------------------------------------------------

watch(() => state.brokerList, () => nextTick(renderBrokerLoadChart), { deep: true })
watch(() => state.qualityData, () => nextTick(renderQualityChart), { deep: true })
watch(() => state.agentTypeData, () => nextTick(renderAgentTypeChart), { deep: true })

// ---------------------------------------------------------------------------
// 生命周期
// ---------------------------------------------------------------------------

onMounted(() => {
  fetchOverview()
  fetchBrokerList()
  fetchDistribution()
  fetchRuntimeQuality()
  fetchAgentType()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  brokerLoadChart?.dispose()
  qualityChart?.dispose()
  agentTypeChart?.dispose()
})
</script>

<style scoped>
.home-view {
  padding: 0;
}

/* ---------------------------------------------------------------------------
   概览卡片
   --------------------------------------------------------------------------- */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
  min-width: 0;
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

/* ---------------------------------------------------------------------------
   中间行 & 底部行
   --------------------------------------------------------------------------- */

.middle-row,
.bottom-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.half-card {
  min-height: 360px;
}

/* ---------------------------------------------------------------------------
   卡片头部
   --------------------------------------------------------------------------- */

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

/* ---------------------------------------------------------------------------
   设备分布倾斜率
   --------------------------------------------------------------------------- */

.distribution-wrap {
  padding: 0;
}

.dist-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
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
  display: flex;
  flex-direction: column;
  gap: 16px;
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

/* ---------------------------------------------------------------------------
   图表容器
   --------------------------------------------------------------------------- */

.chart-container {
  width: 100%;
  height: 300px;
}

/* ---------------------------------------------------------------------------
   连接运行质量 - 列表
   --------------------------------------------------------------------------- */

.quality-list-wrap {
  max-height: 300px;
  overflow-y: auto;
}

.quality-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  gap: 8px;
  position: sticky;
  top: 0;
  z-index: 1;
}

.quality-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 13px;
  color: #303133;
  gap: 8px;
  transition: background 0.15s;
}

.quality-item:hover {
  background: #fafafa;
}

.q-col-host { flex: 1.2; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.q-col-port { width: 50px; text-align: center; flex-shrink: 0; }
.q-col-nacos { width: 55px; text-align: center; flex-shrink: 0; }
.q-col-load { flex: 1.5; min-width: 100px; flex-shrink: 0; }
.q-col-online { width: 65px; text-align: center; flex-shrink: 0; }
.q-col-reg { width: 65px; text-align: center; flex-shrink: 0; }

.quality-load-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quality-load-track {
  flex: 1;
  height: 8px;
  background: #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.quality-load-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.quality-load-num {
  font-size: 12px;
  color: #909399;
  width: 35px;
  text-align: right;
  flex-shrink: 0;
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
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

/* ---------------------------------------------------------------------------
   响应式
   --------------------------------------------------------------------------- */

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
