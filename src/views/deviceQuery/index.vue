<template>
  <div class="device-route-view">
    <!-- 顶部查询表单 -->
    <el-card class="search-card">
      <template #header>
        <span>设备路由查询</span>
      </template>
      <el-form :model="queryForm" :inline="true" class="search-form">
        <el-form-item label="查询方式">
          <el-select
            v-model="queryForm.queryType"
            placeholder="请选择查询方式"
            style="width: 160px"
            @change="onQueryTypeChange"
          >
            <el-option label="UniqueId" :value="1" />
            <el-option label="DeviceId" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备标识">
          <el-input
            v-model="queryForm.keyword"
            :placeholder="queryForm.queryType === 1 ? '请输入 UniqueId' : '请输入 DeviceId'"
            clearable
            style="width: 280px"
            @keyup.enter="onSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="onSearch" :loading="state.loading">
            查询
          </el-button>
          <el-button @click="onReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 左右双面板 -->
    <div class="two-panel-layout">
      <!-- 左侧：设备路由卡片列表 -->
      <el-card class="left-panel">
        <template #header>
          <div class="card-header">
            <span>设备路由数据</span>
          </div>
        </template>

        <div v-loading="state.loading" class="panel-body">
          <template v-if="!state.hasSearched">
            <el-empty description="请输入设备标识进行查询" />
          </template>
          <template v-else-if="state.routeList.length === 0">
            <el-empty description="未查询到相关设备路由数据" />
          </template>
          <template v-else>
            <div
              v-for="route in state.routeList"
              :key="route.deviceId || route.uniqueId"
              class="device-card"
              :class="{ 'is-active': state.selectedRoute?.uniqueId === route.uniqueId }"
            >
              <div class="card-top">
                <div class="card-title-row">
                  <span class="card-title">{{ route.uniqueId || route.deviceId }}</span>
                  <el-tag
                    :type="route.routeStatus === 'ONLINE' ? 'success' : 'danger'"
                    size="small"
                    effect="dark"
                  >
                    {{ route.routeStatus === 'ONLINE' ? '在线' : '离线' }}
                  </el-tag>
                </div>
                <div class="card-subtitle">
                  <span class="protocol-tag">{{ route.protocol || '--' }}</span>
                  <el-tag
                    :type="route.available ? 'success' : 'warning'"
                    size="small"
                    effect="plain"
                  >
                    {{ route.available ? '可用' : '不可用' }}
                  </el-tag>
                </div>
              </div>
              <div class="card-info">
                <div class="info-row">
                  <span class="info-label">DeviceId</span>
                  <span class="info-value" :title="route.deviceId">{{ route.deviceId || '--' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">UniqueId</span>
                  <span class="info-value" :title="route.uniqueId">{{ route.uniqueId || '--' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Connector ID</span>
                  <span class="info-value" :title="route.connectorId">{{ route.connectorId || '--' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Broker 实例</span>
                  <span class="info-value" :title="route.brokerInstanceId">{{ route.brokerInstanceId || '--' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">最近客户端</span>
                  <span class="info-value" :title="route.latestClient">{{ route.latestClient || '--' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">最近在线</span>
                  <span class="info-value">{{ formatTime(route.lastOnlineAt) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">最近验证</span>
                  <span class="info-value">{{ formatTime(route.lastValidatedAt) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">上报时间</span>
                  <span class="info-value">{{ formatTime(route.reportedAt) }}</span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </el-card>

      <!-- 右侧：可用性详情面板 -->
      <el-card class="right-panel">
        <template #header>
          <div class="card-header">
            <span>
              路由可用性判断
            </span>
          </div>
        </template>

        <div v-loading="state.availabilityLoading" class="panel-body">
          <template v-if="!state.selectedRoute">
            <el-empty description="请输入设备标识进行查询" />
          </template>
          <template v-else-if="state.availabilityData">
            <div class="availability-info">
              <div class="availability-details">
                <div class="detail-row" v-if="state.availabilityData.brokerNacosAlive">
                  <span class="detail-label">Broker Nacos 存活</span>
                  <span class="detail-value">
                    <el-tag
                      :type="state.availabilityData.brokerNacosAlive ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ state.availabilityData.brokerNacosAlive ? '存活' : '离线' }}
                    </el-tag>
                  </span>
                </div>
                <div class="detail-row" v-if="state.availabilityData.connectorRunning">
                  <span class="detail-label">连接实例</span>
                  <span class="detail-value">
                    <el-tag
                      :type="state.availabilityData.connectorRunning ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ state.availabilityData.connectorRunning ? '运行中' : '离线' }}
                    </el-tag>
                  </span>
                </div>
                <div class="detail-row" v-if="state.availabilityData.routeStatus">
                  <span class="detail-label">设备路由</span>
                  <span class="detail-value">
                    <el-tag
                      :type="state.availabilityData.routeStatus === 'ONLINE' ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ state.availabilityData.routeStatus === 'ONLINE' ? '在线' : '离线' }}
                    </el-tag>
                  </span>
                </div>
                <div class="detail-row" v-if="state.availabilityData.available">
                  <span class="detail-label">可用命令定位</span>
                  <span class="detail-value">
                    <el-tag
                      :type="state.availabilityData.available  ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ state.availabilityData.available  ? '在线' : '离线' }}
                    </el-tag>
                  </span>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <el-empty description="暂无可用性数据" />
          </template>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { deviceRoutes, deviceRoutesAvailability } from '@/api'
import dayjs from 'dayjs'

interface DeviceRoute {
  deviceId?: string
  uniqueId?: string
  connectorId?: string
  brokerInstanceId?: string
  routeStatus?: string
  protocol?: string
  available?: boolean
  latestClient?: string
  clientId?: string | null
  lastOnlineAt?: number
  lastValidatedAt?: number
  reportedAt?: number
  mqttEndpointId?: string | null
  unavailableReason?: string | null
  [key: string]: any
}

interface QueryForm {
  keyword: string
  queryType: number
}

const queryForm = reactive<QueryForm>({
  keyword: '',
  queryType: 1,
})

const state = reactive({
  loading: false,
  hasSearched: false,
  routeList: [] as DeviceRoute[],
  selectedRoute: null as DeviceRoute | null,
  availabilityLoading: false,
  availabilityData: null as DeviceRoute | null,
})

const formatTime = (value?: number | string) => {
  if (!value) return '--'
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
}

const onQueryTypeChange = () => {
  queryForm.keyword = ''
}

const onSearch = () => {
  if (!queryForm.keyword.trim()) {
    return
  }

  state.loading = true
  const params = queryForm.queryType === 1
    ? { uniqueId: queryForm.keyword.trim() }
    : { deviceId: queryForm.keyword.trim() }

  deviceRoutes(params)
    .then((res) => {
      const data: any = res.data
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        state.routeList = [data]
      } else if (Array.isArray(data)) {
        state.routeList = data
      } else if (data?.records) {
        state.routeList = data.records
      } else {
        state.routeList = []
      }
      state.hasSearched = true

      // 自动选中第一条并加载可用性数据
      if (state.routeList.length > 0) {
        onSelectRoute(state.routeList[0])
      }
    })
    .catch(() => {
      state.routeList = []
      state.hasSearched = true
    })
    .finally(() => {
      state.loading = false
    })
}

const onSelectRoute = (route: DeviceRoute) => {
  state.selectedRoute = route
  fetchAvailability(route.uniqueId!)
}

const fetchAvailability = (uniqueId: string) => {
  state.availabilityLoading = true
  deviceRoutesAvailability({ uniqueId })
    .then((res) => {
      const data: any = res.data
      state.availabilityData = data && typeof data === 'object' && !Array.isArray(data)
        ? data
        : null
    })
    .catch(() => {
      state.availabilityData = null
    })
    .finally(() => {
      state.availabilityLoading = false
    })
}

const onReset = () => {
  queryForm.keyword = ''
  queryForm.queryType = 1
  state.hasSearched = false
  state.routeList = []
  state.selectedRoute = null
  state.availabilityData = null
}
</script>

<style scoped>
.device-route-view {
  padding: 0;
}

.search-card {
  margin-bottom: 16px;
}

.search-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.search-form .el-form-item {
  margin-bottom: 0;
}

/* ===== 双面板布局 ===== */
.two-panel-layout {
  display: flex;
  gap: 16px;
  height: calc(100vh - 250px);
}

/* ===== 左侧面板 ===== */
.left-panel {
  flex: 0 0 480px;
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
}

.header-tip {
  font-size: 12px;
  color: #909399;
  font-weight: 400;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* ===== 设备卡片 ===== */
.device-card {
  padding: 14px 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fff;
}

.device-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.12);
}

.device-card.is-active {
  border-color: #409eff;
  background: #ecf5ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.card-top {
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-subtitle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.protocol-tag {
  font-size: 12px;
  color: #409eff;
  background: #ecf5ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  flex-shrink: 0;
}

.info-value {
  font-size: 13px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
  text-align: right;
}

/* ===== 右侧可用性面板 ===== */
.availability-info {
  padding: 4px 0;
}

.availability-status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.status-label {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.availability-details {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 13px;
  color: #909399;
  flex-shrink: 0;
}

.detail-value {
  font-size: 13px;
  color: #303133;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 320px;
}

.unavailable-reason {
  color: #f56c6c;
  font-weight: 500;
}
</style>
