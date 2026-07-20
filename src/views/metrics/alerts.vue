<template>
  <div class="alerts-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>告警配置</span>
          <el-button type="primary" icon="Plus">添加规则</el-button>
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
          <template #default>
            <el-button size="small">编辑</el-button>
            <el-button size="small" type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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