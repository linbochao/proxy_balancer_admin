<template>
  <div class="roles-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色权限</span>
          <el-button type="primary" icon="Plus">添加角色</el-button>
        </div>
      </template>
      <el-table :data="roles" border>
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="permissions" label="权限数量" width="120" />
        <el-table-column label="操作">
          <template #default>
            <el-button size="small">编辑权限</el-button>
            <el-button size="small" type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Role {
  name: string
  description: string
  permissions: number
}

const roles = ref<Role[]>([
  { name: '管理员', description: '系统管理员，拥有所有权限', permissions: 24 },
  { name: '普通用户', description: '普通用户，拥有基本查看权限', permissions: 12 },
  { name: '只读用户', description: '只读权限，无法进行修改操作', permissions: 6 }
])
</script>

<style scoped>
.roles-view {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>