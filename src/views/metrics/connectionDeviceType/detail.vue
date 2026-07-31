<template>
  <div class="cluster-list-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>注册设备 列表</span>
        </div>
      </template>
      
      <ProVirtualTable
        :columns="columns"
        :data="state.brokerList"
        :max-height="700"
        :show-toolbar="true"
      />
      
      <Pagination
        v-model:page-number="state.currentPage"
        v-model:page-size="state.pageSize"
        :total="state.total"
        @change="getList"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'
import ProVirtualTable from '@/components/ProTable/ProVirtualTable.vue'
import Pagination from '@/components/Pagination/index.vue'
import type { Column } from '@/components/ProTable/type'
import { regDevicesList } from '@/api'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
const router = useRouter()

const state = reactive({
  brokerList: [],
  total: 0,
  currentPage: 1,
  pageSize: 10,
})

// 状态映射
const statusMap: Record<string, { text: string; class: string }> = {
  ONLINE: { text: '在线', class: 'status-online' },
  OFFLINE: { text: '离线', class: 'status-offline' },
  UNAVAILABLE: { text: '不稳定', class: 'status-unavailable' },
}

// 状态格式化
const statusFormatter = (row: Record<string, any>) => {
  const status = statusMap[row.routeStatus] || { text: '未知', class: 'status-unknown' }
  return `<span class="status-tag ${status.class}"><span class="status-dot"></span>${status.text}</span>`
}

// 时间格式化
const timeFormatter = (_row: Record<string, any>, _column: Column, cellValue: any) => {
  if (!cellValue) return '--'
  return dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss')
}

const columns = computed<Column[]>(() => [
  { prop: 'deviceId', label: 'DeviceId', minWidth: 100 },
  { prop: 'uniqueId', label: 'UniqueId', sortable: true, minWidth: 100 },
  { prop: 'brokerInstanceId', label: 'Broker', minWidth: 100 },
  { prop: 'routeStatus', label: '状态', formatter: statusFormatter, minWidth: 100 },
  { prop: 'latestClient', label: 'LatestClient', minWidth: 100 },
  { prop: 'lastOnlineAt', label: '最近在线', minWidth: 100, formatter: timeFormatter },
  { prop: 'reportedAt', label: '路由上报时间', minWidth: 100, formatter: timeFormatter },
])

const getList = () => {
  regDevicesList({
    connectorId: router.currentRoute.value.query.connectorId,
    brokerInstanceId: router.currentRoute.value.query.brokerInstanceId,
    page: state.currentPage,
    pageSize: state.pageSize,
  }).then((res: any) => {
    state.brokerList = res.data.records
    state.total = res.data.total
  })
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.cluster-list-view {
  padding: 0;
}

.cluster-list-view :deep(.el-card) {
  position: relative;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
