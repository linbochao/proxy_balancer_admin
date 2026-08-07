<template>
  <div class="operations-view">
    <!-- 状态标签栏 -->
    <!-- <el-tabs
      v-model="state.activeStatusTab"
      class="status-tabs"
      @tab-change="onStatusTabChange"
    >
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="待处理" name="PENDING" />
      <el-tab-pane label="运行中" name="RUNNING" />
      <el-tab-pane label="已完成" name="SUCCEEDED" />
      <el-tab-pane label="失败" name="FAILED" />
    </el-tabs> -->

    <!-- 操作分类标签栏 -->
    <el-tabs
      v-model="state.activeCategoryTab"
      class="category-tabs"
      @tab-change="onCategoryTabChange"
    >
      <el-tab-pane label="全部" name="" />
      <el-tab-pane
        v-for="group in allCategoryGroups"
        :key="group.category"
        :label="group.category"
        :name="group.category"
      />
    </el-tabs>

    <!-- 操作方向卡片区 -->
    <div class="actions-section">
      <!-- 全部分类：所有卡片平铺，不分板块 -->
      <div v-if="!state.activeCategoryTab" class="category-group">
        <div class="action-cards">
          <div
            v-for="action in allActions"
            :key="action.id"
            class="action-card"
            :class="{
              'is-active': state.selectedActionId === action.id,
            }"
            @click="onActionClick(action.category, action.id)"
          >
            <div class="action-card-title">{{ action.title }}</div>
            <div class="action-card-meta">
              <el-tag size="small" type="info">{{ action.scope }}</el-tag>
              <span class="action-id">{{ action.id }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 单个分类：带分类头部 -->
      <template v-else>
        <div
          v-for="group in visibleCategoryGroups"
          :key="group.category"
          class="category-group"
        >
          <div class="category-header">
            <el-tag
              :type="categoryTagType(group.category)"
              size="small"
              effect="dark"
            >
              {{ group.category }}
            </el-tag>
            <span class="category-count">{{ group.actions.length }} 个操作</span>
          </div>
          <div class="action-cards">
            <div
              v-for="action in group.actions"
              :key="action.id"
              class="action-card"
              :class="{
                'is-active': state.selectedActionId === action.id,
              }"
              @click="onActionClick(group.category, action.id)"
            >
              <div class="action-card-title">{{ action.title }}</div>
              <div class="action-card-meta">
                <el-tag size="small" type="info">{{ action.scope }}</el-tag>
                <span class="action-id">{{ action.id }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 任务列表区 -->
    <el-card class="tasks-card">
      <template #header>
        <div class="card-header">
          <span>
            任务列表
          </span>
          <div class="header-right">
            <el-button
              v-if="state.selectedActionId"
              type="primary"
              size="small"
              @click="openCreateDialog"
            >
              新建任务
            </el-button>
            <!-- <span class="header-tip" v-if="state.total > 0">
              共 {{ state.total }} 条记录
            </span> -->
          </div>
        </div>
      </template>

      <!-- 表格 -->
      <div class="table-section">
        <ProVirtualTable
          :columns="columns"
          :data="state.taskList"
          :show-toolbar="true"
          :loading="state.loading"
          @table-row-click="onOperationClick"
        />
      </div>

      <!-- 分页 -->
      <Pagination
        v-if="state.total > 0"
        v-model:page-number="state.currentPage"
        v-model:page-size="state.pageSize"
        :total="state.total"
        @change="fetchTasks"
      />
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="state.detailVisible"
      title="任务详情"
      width="720px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="任务ID" :span="2">
          {{ state.detail.id || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="请求ID" :span="2">
          {{ state.detail.requestId || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="Trace ID" :span="2">
          {{ state.detail.traceId || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="操作ID">
          {{ state.detail.actionId || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="操作名称">
          {{ state.detail.actionTitle || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="Broker实例ID">
          {{ state.detail.brokerInstanceId || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="Connector ID">
          {{ state.detail.connectorId || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="范围">
          {{ state.detail.scope || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <span
            v-if="state.detail.status"
            class="status-tag"
            :class="statusClass(state.detail.status)"
          >
            {{ statusLabel(state.detail.status) }}
          </span>
          <span v-else>--</span>
        </el-descriptions-item>
        <el-descriptions-item label="模式">
          {{ state.detail.mode || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="操作人">
          {{ state.detail.operator || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="进度">
          <div class="detail-progress" v-if="state.detail.progress != null">
            <div class="detail-progress-bar">
              <div
                class="detail-progress-fill"
                :style="{ width: state.detail.progress + '%' }"
              ></div>
            </div>
            <span>{{ state.detail.progress }}%</span>
          </div>
          <span v-else>--</span>
        </el-descriptions-item>
        <el-descriptions-item label="结果" :span="2">
          {{ state.detail.result || '--' }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="state.detail.status === 'FAILED' && state.detail.errorMessage"
          label="错误信息"
          :span="2"
        >
          <span class="error-text">{{ state.detail.errorMessage }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">
          {{ formatTime(state.detail.startedAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="完成时间">
          {{ formatTime(state.detail.finishedAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatTime(state.detail.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatTime(state.detail.updatedAt) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 新建任务弹窗 -->
    <el-dialog
      v-model="state.createVisible"
      title="新建运维任务"
      width="560px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        label-width="120px"
        :model="state.createForm"
        @submit.prevent="submitCreateTask"
      >
        <el-form-item label="操作方向" required>
          <el-input
            :model-value="selectedAction?.title || state.createForm.actionId"
            readonly
            disabled
          />
        </el-form-item>
        <el-form-item label="Broker 实例" required>
          <el-select
            v-model="state.createForm.brokerInstanceId"
            placeholder="请选择 Broker 实例"
            style="width: 100%"
            clearable
            filterable
            :loading="state.brokerOptionsLoading"
            @change="onBrokerChange"
          >
            <el-option
              v-for="broker in state.brokerOptions"
              :key="broker.value"
              :label="broker.label"
              :value="broker.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="showConnectorField" label="Connector">
          <el-select
            v-model="state.createForm.connectorId"
            placeholder="请选择 Connector"
            style="width: 100%"
            clearable
            filterable
            :loading="state.connectorOptionsLoading"
          >
            <el-option
              v-for="conn in state.connectorOptions"
              :key="conn.value"
              :label="conn.label"
              :value="conn.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="执行模式" required>
          <el-select
            v-model="state.createForm.mode"
            style="width: 100%"
            :disabled="isCheckCategory"
          >
            <el-option label="只检查" value="DRY_RUN" />
            <el-option label="执行在线" value="APPLY" :disabled="isCheckCategory" />
          </el-select>
          <div v-if="isCheckCategory" class="form-tip">校验类操作仅支持"只检查"模式</div>
        </el-form-item>
        <el-form-item label="批量大小">
          <el-select
            v-model="state.createForm.batchSize"
            style="width: 100%"
          >
            <el-option label="500" value="500" />
            <el-option label="1000" value="1000" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="state.createVisible = false" :disabled="state.createLoading">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="state.createLoading"
          @click="submitCreateTask"
        >
          确认创建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import ProVirtualTable from '@/components/ProTable/ProVirtualTable.vue'
import type { Column, TableBtn } from '@/components/ProTable/type'
import {
  operationsActions, operationsTasks, createOperationsTask,
  brokersList, connectorsByBroker,
} from '@/api'
import dayjs from 'dayjs'

// ---------------------------------------------------------------------------
// 类型定义
// ---------------------------------------------------------------------------

interface ActionItem {
  id: string
  category: string
  title: string
  scope: string
}

interface TaskItem {
  id: string
  requestId: string
  actionId: string
  actionTitle: string
  brokerInstanceId: string | null
  connectorId: string | null
  scope: string
  status: string
  mode: string
  operator: string
  progress: number
  result: string | null
  errorMessage: string | null
  traceId: string
  startedAt: number
  finishedAt: number | null
  createdAt: number
  updatedAt: number
}

interface CategoryGroup {
  category: string
  actions: ActionItem[]
}

// ---------------------------------------------------------------------------
// 状态管理
// ---------------------------------------------------------------------------

const state = reactive({
  // 操作方向
  actions: [] as ActionItem[],
  actionsLoading: false,
  selectedCategory: '' as string,
  selectedActionId: '' as string,

  // 状态标签栏
  activeStatusTab: '' as string,

  // 操作分类标签栏
  activeCategoryTab: '' as string,

  // 任务列表
  taskList: [] as TaskItem[],
  total: 0,
  currentPage: 1,
  pageSize: 20,
  loading: false,

  // 筛选
  keyword: '',
  includeArchived: false,

  // 详情弹窗
  detailVisible: false,
  detail: {} as TaskItem,

  // 新建任务弹窗
  createVisible: false,
  createForm: {
    actionId: '',
    brokerInstanceId: '',
    connectorId: '',
    mode: 'DRY_RUN',
    batchSize: 500,
  },
  createLoading: false,

  // 下拉选项
  brokerOptions: [] as { label: string; value: string }[],
  brokerOptionsLoading: false,
  connectorOptions: [] as { label: string; value: string }[],
  connectorOptionsLoading: false,
})

let searchTimer: ReturnType<typeof setTimeout> | null = null

// ---------------------------------------------------------------------------
// 状态映射
// ---------------------------------------------------------------------------

const statusMap: Record<string, { label: string; class: string }> = {
  SUCCEEDED: { label: '成功', class: 'status-suc' },
  FAILED: { label: '失败', class: 'status-unsuc' },
  RUNNING: { label: '运行中', class: 'status-running' },
  PENDING: { label: '待处理', class: 'status-warn' },
}

const statusLabel = (status: string) => statusMap[status]?.label || status || '--'
const statusClass = (status: string) => statusMap[status]?.class || ''

// ---------------------------------------------------------------------------
// 分类分组
// ---------------------------------------------------------------------------

const categoryOrder = ['CHECK', 'RECALC', 'CLEAR', 'SYNC']

const categoryGroups = computed<CategoryGroup[]>(() => {
  const groupMap: Record<string, ActionItem[]> = {}
  for (const action of state.actions) {
    const cat = action.category || 'OTHER'
    if (!groupMap[cat]) {
      groupMap[cat] = []
    }
    groupMap[cat].push(action)
  }
  const sorted: CategoryGroup[] = []
  for (const cat of categoryOrder) {
    if (groupMap[cat]) {
      sorted.push({ category: cat, actions: groupMap[cat] })
      delete groupMap[cat]
    }
  }
  for (const cat of Object.keys(groupMap)) {
    sorted.push({ category: cat, actions: groupMap[cat] })
  }
  return sorted
})

// 所有分类分组（用于分类标签栏）
const allCategoryGroups = categoryGroups

// 所有操作的扁平列表（"全部"tab 时使用）
const allActions = computed<ActionItem[]>(() => state.actions)

// 当前选中的分类分组（用于卡片展示）
const visibleCategoryGroups = computed<CategoryGroup[]>(() => {
  if (!state.activeCategoryTab) {
    return allCategoryGroups.value
  }
  return allCategoryGroups.value.filter(g => g.category === state.activeCategoryTab)
})

// 当前选中的操作对象
const selectedAction = computed<ActionItem | null>(() =>
  state.actions.find(a => a.id === state.selectedActionId) || null,
)

// 是否为 CHECK 校验类操作：执行模式仅允许"只检查"，在线执行相关功能禁用
const isCheckCategory = computed(() => selectedAction.value?.category === 'CHECK')

// 是否显示连接下拉框：仅 connector 相关操作时可见
const showConnectorField = computed(() => {
  const title = selectedAction.value?.title?.toLowerCase() || ''
  return title.includes('connector')
})

const categoryTagType = (category: string) => {
  const typeMap: Record<string, string> = {
    CHECK: 'primary',
    RECALC: 'warning',
    CLEAR: 'danger',
    SYNC: 'success',
  }
  return typeMap[category] || 'info'
}

// ---------------------------------------------------------------------------
// 表格列定义
// ---------------------------------------------------------------------------

const operationBtns: TableBtn[] = [
  { label: '详情', type: 'primary', link: true },
]

const statusFormatter = (row: Record<string, any>) => {
  const status = row.status as string
  const info = statusMap[status]
  if (!info) return `<span>${status || '--'}</span>`
  return `<span class="status-tag ${info.class}"><span class="status-dot"></span>${info.label}</span>`
}

const progressFormatter = (row: Record<string, any>) => {
  const progress = row.progress ?? 0
  let color = '#67c23a'
  if (row.status === 'FAILED') color = '#f56c6c'
  else if (row.status === 'RUNNING') color = '#409eff'
  return `<div style="display:flex;align-items:center;gap:6px;min-width:80px;">
    <div style="flex:1;height:6px;background:#ebeef5;border-radius:3px;overflow:hidden;">
      <div style="height:100%;border-radius:3px;width:${progress}%;background:${color};"></div>
    </div>
    <span style="font-size:12px;color:#606266;">${progress}%</span>
  </div>`
}

const timeFormatter = (_row: Record<string, any>, _col: any, cellValue: any) => {
  if (!cellValue) return '--'
  return dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss')
}

const columns = computed<Column[]>(() => [
  { prop: 'id', label: '任务ID', minWidth: 200, showOverflowTooltip: true },
  { prop: 'requestId', label: '请求ID', minWidth: 180, showOverflowTooltip: true },
  { prop: 'actionTitle', label: '操作名称', minWidth: 150 },
  { prop: 'scope', label: '范围', minWidth: 200, showOverflowTooltip: true },
  { prop: 'status', label: '状态', minWidth: 100, formatter: statusFormatter },
  { prop: 'mode', label: '模式', minWidth: 90 },
  { prop: 'operator', label: '操作人', minWidth: 100 },
  { prop: 'progress', label: '进度', minWidth: 120, formatter: progressFormatter },
  { prop: 'startedAt', label: '开始时间', minWidth: 160, formatter: timeFormatter },
  { prop: 'updatedAt', label: '更新时间', minWidth: 160, formatter: timeFormatter },
  { prop: 'operation', label: '操作', type: 'operation', tableBtns: operationBtns, minWidth: 80 },
])

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

const formatTime = (timestamp: number | null | undefined) => {
  if (!timestamp) return '--'
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

// ---------------------------------------------------------------------------
// API 调用
// ---------------------------------------------------------------------------

const fetchActions = () => {
  state.actionsLoading = true
  operationsActions()
    .then((res: any) => {
      state.actions = (res.data ?? []) as ActionItem[]
      if (state.actions.length > 0 && !state.selectedActionId) {
        const first = state.actions[0]
        state.selectedCategory = first.category
        state.selectedActionId = first.id
      }
    })
    .catch(() => {
      ElMessage.error('获取操作方向列表失败')
    })
    .finally(() => {
      state.actionsLoading = false
    })
}

const fetchTasks = () => {
  state.loading = true
  const params: Record<string, any> = {
    page: state.currentPage,
    pageSize: state.pageSize,
    includeArchived: state.includeArchived,
  }
  if (state.selectedCategory) {
    params.category = state.selectedCategory
  }
  if (state.activeStatusTab) {
    params.status = state.activeStatusTab
  }
  if (state.keyword) {
    params.keyword = state.keyword
  }
  operationsTasks(params as any)
    .then((res: any) => {
      const data = res.data ?? {}
      state.taskList = (data.records ?? []) as TaskItem[]
      state.total = Number(data.total) || 0
    })
    .catch(() => {
      ElMessage.error('获取任务列表失败')
    })
    .finally(() => {
      state.loading = false
    })
}

// ---------------------------------------------------------------------------
// 事件处理
// ---------------------------------------------------------------------------

const onActionClick = (category: string, actionId: string) => {
  // 在"全部"分类下，只选中操作卡片用于新建任务，不过滤表格数据
  if (state.activeCategoryTab === '') {
    state.selectedActionId = actionId
  } else {
    // 在特定分类下，保持原有逻辑：选中操作卡片并过滤表格
    state.selectedCategory = category
    state.selectedActionId = actionId
  }
  state.currentPage = 1
  fetchTasks()
}

const onStatusTabChange = () => {
  state.currentPage = 1
  fetchTasks()
}

const onCategoryTabChange = (category: string) => {
  state.activeCategoryTab = category
  state.selectedCategory = category
  // 切换分类时清空已选中的具体操作
  state.selectedActionId = ''
  state.currentPage = 1
  fetchTasks()
}

const onSearchInput = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    state.currentPage = 1
    fetchTasks()
  }, 300)
}

const onSearchClear = () => {
  state.keyword = ''
  state.currentPage = 1
  fetchTasks()
}

const onFilterChange = () => {
  state.currentPage = 1
  fetchTasks()
}

const onOperationClick = (btn?: TableBtn, row?: TaskItem) => {
  if (btn && row) {
    if (btn.label === '详情') {
      state.detail = { ...row }
      state.detailVisible = true
    }
  }
}

// ---------------------------------------------------------------------------
// 新建任务
// ---------------------------------------------------------------------------

const generateRequestId = () => {
  const timestamp = Date.now()
  const random = Math.random().toString(16).slice(2, 14)
  return `ops-${timestamp}-${random}`
}

/** 获取 Broker 下拉选项，加载完成后默认选中第一个并触发 Connector 加载 */
const fetchBrokerOptions = () => {
  state.brokerOptionsLoading = true
  brokersList({ page: 1, pageSize: 200 })
    .then((res: any) => {
      const list = res.data?.records ?? res.data ?? []
      state.brokerOptions = list.map((item: any) => ({
        label: `${item.brokerInstanceId || item.host || ''} (${item.host || item.ip || '--'})`,
        value: item.brokerInstanceId || item.host || '',
      }))
      // 默认选中第一个 broker
      if (state.brokerOptions.length > 0 && !state.createForm.brokerInstanceId) {
        state.createForm.brokerInstanceId = state.brokerOptions[0].value
        // 选中后自动加载对应的 connector 列表
        if (showConnectorField.value) {
          fetchConnectorOptions(state.createForm.brokerInstanceId)
        }
      }
    })
    .catch(() => {
      ElMessage.error('获取 Broker 列表失败')
    })
    .finally(() => {
      state.brokerOptionsLoading = false
    })
}

/**
 * 获取指定 broker 下的 Connector 下拉选项
 * @param brokerInstanceId broker 实例 ID，为空时清空列表
 */
const fetchConnectorOptions = (brokerInstanceId: string) => {
  state.createForm.connectorId = ''
  if (!brokerInstanceId) {
    state.connectorOptions = []
    return
  }
  state.connectorOptionsLoading = true
  connectorsByBroker(brokerInstanceId)
    .then((res: any) => {
      const list = res.data?.items ?? res.data ?? []
      state.connectorOptions = list.map((item: any) => ({
        label: item.connectorName || '',
        value: item.connectorId || item.id || '',
      }))
    })
    .catch(() => {
      ElMessage.error('获取 Connector 列表失败')
      state.connectorOptions = []
    })
    .finally(() => {
      state.connectorOptionsLoading = false
    })
}

/**
 * Broker 下拉选项值变化时，联动加载对应的 Connector 数据
 */
const onBrokerChange = (value: string) => {
  if (showConnectorField.value) {
    fetchConnectorOptions(value)
  }
}

const openCreateDialog = () => {
  state.createForm = {
    actionId: state.selectedActionId,
    brokerInstanceId: '',
    connectorId: '',
    mode: isCheckCategory.value ? 'DRY_RUN' : 'DRY_RUN',
    batchSize: 500,
  }
  state.connectorOptions = []
  state.createVisible = true

  // 打开弹窗时加载 broker 列表（默认选中第一个并自动触发 connector 加载）
  fetchBrokerOptions()
}

const submitCreateTask = () => {
  if (!state.createForm.actionId) {
    ElMessage.warning('请先选择一个操作方向')
    return
  }
  state.createLoading = true
  createOperationsTask({
    actionId: state.createForm.actionId,
    batchSize: state.createForm.batchSize,
    brokerInstanceId: state.createForm.brokerInstanceId || undefined,
    connectorId: state.createForm.connectorId || undefined,
    mode: state.createForm.mode,
    requestId: generateRequestId(),
  })
    .then((_res: any) => {
      ElMessage.success('任务已创建')
      state.createVisible = false
      state.currentPage = 1
      fetchTasks()
    })
    .catch(() => {
      ElMessage.error('创建任务失败')
    })
    .finally(() => {
      state.createLoading = false
    })
}

// ---------------------------------------------------------------------------
// 生命周期
// ---------------------------------------------------------------------------

onMounted(() => {
  fetchActions()
  fetchTasks()
})

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
    searchTimer = null
  }
})
</script>

<style scoped>
.operations-view {
  height: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
}

/* ===== 操作分类标签栏 ===== */
.category-tabs {
  margin-bottom: 12px;
  flex-shrink: 0;
}

.category-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.category-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

/* ===== 操作方向卡片区 ===== */
.actions-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.category-group {
  background: #fff;
  border-radius: 8px;
  padding: 10px 16px;
  border: 1px solid #e4e7ed;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.category-count {
  font-size: 12px;
  color: #909399;
}

.action-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.action-card {
  padding: 8px 14px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafafa;
  min-width: 170px;
}

.action-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
  transform: translateY(-2px);
}

.action-card.is-active {
  border-color: #409eff;
  background: #ecf5ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.action-card-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.action-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.action-id {
  font-size: 11px;
  color: #c0c4cc;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== 任务列表区 ===== */
.tasks-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tasks-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px;
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

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ===== 筛选栏 ===== */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.archive-switch {
  display: flex;
  align-items: center;
  gap: 6px;
}

.switch-label {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
}

/* ===== 表格区域 ===== */
.table-section {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* ===== 状态标签 ===== */
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-suc {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.status-suc .status-dot {
  background-color: #67c23a;
}

.status-unsuc {
  background-color: rgba(255, 77, 79, 0.1);
  color: #f56c6c;
}

.status-unsuc .status-dot {
  background-color: #f56c6c;
}

.status-running {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.status-running .status-dot {
  background-color: #409eff;
}

.status-warn {
  background-color: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}

.status-warn .status-dot {
  background-color: #e6a23c;
}

/* ===== 详情弹窗进度条 ===== */
.detail-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-progress-bar {
  flex: 1;
  height: 8px;
  background: #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.detail-progress-fill {
  height: 100%;
  background: #409eff;
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* ===== 错误信息 ===== */
.error-text {
  color: #f56c6c;
  font-weight: 500;
  word-break: break-all;
}

/* ===== 新建任务表单提示 ===== */
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

/* ===== 全局滚动条适配 ===== */
.operations-view :deep(.el-card) {
  overflow: hidden;
}

/* ===== 响应式 ===== */
@media screen and (max-width: 1200px) {
  .action-cards {
    gap: 20px;
  }

  .action-card {
    min-width: 150px;
    padding: 8px 12px;
  }

  .filter-bar {
    gap: 8px;
  }

  .filter-bar .el-input {
    width: 240px !important;
  }
}

@media screen and (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-bar .el-input,
  .filter-bar .el-select {
    width: 100% !important;
  }

  .action-cards {
    flex-direction: column;
  }

  .action-card {
    min-width: unset;
  }
}
</style>
