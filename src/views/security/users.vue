<template>
  <div class="users-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" icon="Plus">添加用户</el-button>
        </div>
      </template>
      <el-table :data="users" border>
        <el-table-column prop="name" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="角色" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status ? 'success' : 'danger'">
              {{ scope.row.status ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
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

interface User {
  name: string
  email: string
  role: string
  status: boolean
  createTime: string
}

const users = ref<User[]>([
  { name: 'admin', email: 'admin@example.com', role: '管理员', status: true, createTime: '2024-01-01 10:00:00' },
  { name: 'user1', email: 'user1@example.com', role: '普通用户', status: true, createTime: '2024-02-15 14:30:00' },
  { name: 'user2', email: 'user2@example.com', role: '普通用户', status: false, createTime: '2024-03-20 09:15:00' }
])
</script>

<style scoped>
.users-view {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>