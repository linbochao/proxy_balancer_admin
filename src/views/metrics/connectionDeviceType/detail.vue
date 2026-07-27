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
        :max-height="500"
        :show-toolbar="true"
      />
      
      <el-pagination 
        class="pagination"
        layout="total, prev, pager, next, jumper"
        :total="state.total"
        :page-size="10"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'   // 确保导入 reactive、onMounted
import ProVirtualTable from '@/components/ProTable/ProVirtualTable.vue'
import type { Column, TableBtn } from '@/components/ProTable/type'
import { regDevicesList } from '@/api'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
const router = useRouter()

const state = reactive({
  brokerList: [],
  total: 0,
})

// 状态格式化
const statusFormatter = (row: Record<string, any>) => {
  const isOnline = row.routeStatus === 'ONLINE'
  return `<span class="routeStatus-tag ${isOnline ? 'ONLINE' : 'offline'}">${isOnline ? '在线' : '离线'}</span>`
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
  { prop: 'lastValidatedAt', label: '最近在线', minWidth: 100, formatter: timeFormatter },
])

const getList = () => {
  console.log("获取设备列表", router)   // 添加日志
  regDevicesList({
    connectorId: router.currentRoute.value.query.connectorId,
    brokerInstanceId: router.currentRoute.value.query.brokerInstanceId,
    page: 1,
    pageSize: 10,
  }).then(res => {
    state.brokerList = res.data.records   // 直接赋值
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
