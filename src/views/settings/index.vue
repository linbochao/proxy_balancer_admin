<template>
  <div class="settings-view">
    <el-card>
      <template #header>
        <span>系统设置</span>
      </template>
      <el-form :model="settings" label-width="120px">
        <el-form-item label="系统名称">
          <el-input v-model="settings.systemName" />
        </el-form-item>
        <el-form-item label="数据刷新间隔">
          <el-select v-model="settings.refreshInterval">
            <el-option label="5秒" :value="5" />
            <el-option label="10秒" :value="10" />
            <el-option label="30秒" :value="30" />
            <el-option label="1分钟" :value="60" />
          </el-select>
        </el-form-item>
        <el-form-item label="告警通知">
          <el-switch v-model="settings.alertNotification" />
        </el-form-item>
        <el-form-item label="日志级别">
          <el-select v-model="settings.logLevel">
            <el-option label="DEBUG" value="debug" />
            <el-option label="INFO" value="info" />
            <el-option label="WARN" value="warn" />
            <el-option label="ERROR" value="error" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">保存设置</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const settings = reactive({
  systemName: 'Broker管理平台',
  refreshInterval: 10,
  alertNotification: true,
  logLevel: 'info'
})
</script>

<style scoped>
.settings-view {
  padding: 0;
}
</style>