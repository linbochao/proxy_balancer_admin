<template>
  <div class="alerts-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>服务类型</span>
          <el-button type="primary" icon="Plus">添加服务类型</el-button>
        </div>
      </template>
      <el-table :data="alertRules" border>
        <el-table-column prop="name" label="规则名称" />
        <el-table-column prop="type" label="告警类型" />
        <el-table-column prop="threshold" label="阈值" />
        <el-table-column prop="level" label="级别">
          <template #default="scope">
            <el-tag 
              :type="getTagType(scope.row.level)"
            >
              {{ scope.row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-switch :model-value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" @click="editServiceType(scope.row)">编辑</el-button>
            <el-button size="small" type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { regDevicesList } from '@/api'
import { onMounted } from 'vue'

interface AlertRule {
  name: string
  type: string
  threshold: string
  level: 'warning' | 'error' | 'info'
  status: boolean
}

const getTagType = (level: 'warning' | 'error' | 'info') => {
  const typeMap: Record<string, string> = {
    warning: 'warning',
    error: 'danger',
    info: 'info'
  }
  return typeMap[level]
}

const alertRules = ref<AlertRule[]>([
  { name: 'CPU使用率告警', type: 'cpu', threshold: '>80%', level: 'warning', status: true },
  { name: '内存使用率告警', type: 'memory', threshold: '>85%', level: 'error', status: true },
  { name: '磁盘使用率告警', type: 'disk', threshold: '>90%', level: 'warning', status: true },
  { name: '消息堆积告警', type: 'message', threshold: '>10000', level: 'error', status: false }
])

const editServiceType = (serviceType: AlertRule) => {
  console.log('编辑服务类型', serviceType)
}

const getList = () => {
  regDevicesList({
    connectorId: 1712030923627167745,
    brokerInstanceId: '192.168.110.25-3000',
    page: 1,
    pageSize: 10,
  }).then(res => {
    console.log(res)
  })
}



onMounted(() => {
  getList()
})
</script>

<style scoped>
.alerts-view {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>