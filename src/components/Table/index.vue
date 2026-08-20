<template>
  <div class="pro-table mt10">

    <!-- 工具栏（列设置按钮已被注释，需要时可取消注释并调整内部逻辑） -->
    <div class="pro-table-toolbar" id="oneths-tableToolbar">
      <!-- <ColumnSetting /> -->
    </div>

    <!-- 表格 -->
    <el-table
      ref="tableRef"
      :data="data"
      :border="bordered"
      :stripe="stripe"
      :height="tableHeight"
      v-loading="loading"
      :empty-text="emptyText"
      :default-sort="defaultSort"
      @selection-change="emit('selectionChange', $event)"
      @sort-change="emit('sortChange', $event)"
      @row-click="emit('rowClick', $event)"
      v-bind="$attrs"
    >

      <!-- 动态列 -->
      <template v-for="(col, idx) in visibleColumns" :key="idx">
        <!-- 操作列 -->
        <el-table-column
          v-if="col.prop === 'operation'"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
          :fixed="col.fixed"
          :align="col.align ?? 'left'"
        >
          <template #default="{ row }">
            <template v-if="col.tableBtns?.length">
              <!-- ≤3 个按钮：全部直接展示 -->
              <template v-if="col.tableBtns.length <= 3">
                <template v-for="(btn, btnIdx) in col.tableBtns" :key="btnIdx">
                  <el-divider v-if="btnIdx > 0" direction="vertical" />
                  <el-button
                    :type="btn.type"
                    :icon="btn.icon"
                    :link="btn.link"
                    @click="onOperationClick(btn, row)"
                  >
                    {{ btn.label }}
                  </el-button>
                </template>
              </template>
              <!-- >3 个按钮：展示前 2 个 + 「更多」下拉菜单 -->
              <template v-else>
                <template v-for="(btn, btnIdx) in col.tableBtns.slice(0, 2)" :key="btnIdx">
                  <el-divider v-if="btnIdx > 0" direction="vertical" />
                  <el-button
                    :type="btn.type"
                    :icon="btn.icon"
                    :link="btn.link"
                    @click="onOperationClick(btn, row)"
                  >
                    {{ btn.label }}
                  </el-button>
                </template>
                <el-divider direction="vertical" />
                <el-dropdown trigger="click">
                  <el-button link type="info">
                    更多
                    <ELIcon name="ArrowDown" :size="14" color="#919399" />
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-for="(btn, btnIdx) in col.tableBtns.slice(2)"
                        :key="btnIdx"
                        :divided="btnIdx > 0"
                      >
                        <el-button
                          :type="btn.type"
                          :icon="btn.icon"
                          :link="btn.link"
                          @click.stop="onOperationClick(btn, row)"
                          style="width: 100%;"
                        >
                          {{ btn.label }}
                        </el-button>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </template>
          </template>
        </el-table-column>

        <!-- 序号列 -->
        <el-table-column
          v-else-if="col.prop === 'index'"
          :label="col.label"
          type="index"
          :width="col.width"
        />

        <!-- 多选列 -->
        <el-table-column
          v-else-if="col.prop === 'selection'"
          type="selection"
          :width="col.width"
          fixed="left"
        />

        <!-- 普通列 -->
        <el-table-column
          v-else
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
          :fixed="col.fixed"
          :align="col.align ?? 'left'"
          :sortable="col.sortable"
          :show-overflow-tooltip="col.showOverflowTooltip ?? true"
          :formatter="col.formatter"
        >
          <template v-if="col.slot" #default="scope">
            <slot :name="col.slot" v-bind="scope" />
          </template>
        </el-table-column>
      </template>

      <!-- 额外的操作列插槽 -->
      <slot name="action" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Column, TableBtn } from './index.ts'  // 请根据实际路径调整

// ==================== Props ====================
const props = withDefaults(
  defineProps<{
    /** 列配置 */
    columns: Column[]
    /** 表格数据 */
    data: Record<string, any>[]
    /** 是否显示边框 */
    bordered?: boolean
    /** 是否斑马纹 */
    stripe?: boolean
    /** 是否 loading */
    loading?: boolean
    /** 最大高度 */
    maxHeight?: string | number
    /** 空数据文案 */
    emptyText?: string
    /** 默认排序 */
    defaultSort?: { prop: string; order: 'ascending' | 'descending' }
  }>(),
  {
    maxHeight: 'calc(100vh - 300px)',
  }
)

/** 当 maxHeight 为 auto 时返回 undefined，el-table 自动根据行高适配 */
const tableHeight = computed(() => {
  const h = props.maxHeight
  if (h === 'auto' || h === 0 || h === '0') return undefined
  return h
})

// ==================== Emits ====================
const emit = defineEmits<{
  selectionChange: [value: any[]]
  sortChange: [value: any]
  rowClick: [value: any]
  tableRowClick: [btn?: TableBtn, row?: any]
  refresh: []
}>()

// ==================== 内部状态管理（替代 Pinia Store） ====================
// 所有列（包括隐藏的），初始为 props.columns 的副本
const internalColumns = ref<Column[]>([])
// 保存初始列配置，用于重置
const initialColumns = ref<Column[]>([])
// 隐藏列的 prop 集合
const hiddenProps = ref<Set<string>>(new Set())

// 可见列（过滤掉 hiddenProps 中的列）
const visibleColumns = computed(() =>
  internalColumns.value.filter((col) => !hiddenProps.value.has(col.prop))
)

// 可隐藏的列（用于列设置面板，目前 UI 已注释，但保留逻辑）
const settingItems = computed(() =>
  internalColumns.value.filter((col) => col.hideable !== false)
)

// 全选状态（用于列设置面板）
const isAllSelected = computed(() => {
  const items = settingItems.value
  return items.length > 0 && items.every((col) => !hiddenProps.value.has(col.prop))
})
const isIndeterminate = computed(() => {
  const items = settingItems.value
  const visibleCount = items.filter((col) => !hiddenProps.value.has(col.prop)).length
  return visibleCount > 0 && visibleCount < items.length
})

// ==================== 方法 ====================
/** 切换列的显隐 */
function toggleColumn(prop: string) {
  const col = internalColumns.value.find((c) => c.prop === prop)
  if (col && col.hideable !== false) {
    if (hiddenProps.value.has(prop)) {
      hiddenProps.value.delete(prop)
    } else {
      hiddenProps.value.add(prop)
    }
  }
}

/** 全选 / 取消全选 */
function toggleAll(checked: boolean) {
  const items = settingItems.value
  if (checked) {
    // 全显示：从 hiddenProps 中移除所有 settingItems 的 prop
    items.forEach((col) => hiddenProps.value.delete(col.prop))
  } else {
    // 全隐藏：将所有 settingItems 的 prop 加入 hiddenProps
    items.forEach((col) => hiddenProps.value.add(col.prop))
  }
}

/** 重置列配置 */
function reset() {
  internalColumns.value = initialColumns.value.map((col) => ({ ...col }))
  hiddenProps.value = new Set()
}

/** 拖拽重排序 */
function reorderColumns(fromProp: string, toProp: string) {
  const fromIndex = internalColumns.value.findIndex((c) => c.prop === fromProp)
  const toIndex = internalColumns.value.findIndex((c) => c.prop === toProp)
  if (fromIndex === -1 || toIndex === -1) return
  const [moved] = internalColumns.value.splice(fromIndex, 1)
  internalColumns.value.splice(toIndex, 0, moved)
}

/** 初始化或更新列配置 */
function initColumns(cols: Column[]) {
  internalColumns.value = cols.map((col) => ({ ...col }))
  initialColumns.value = cols.map((col) => ({ ...col }))
  hiddenProps.value = new Set()
}

// ==================== 生命周期 ====================
onMounted(() => {
  initColumns(props.columns)
})

// 监听外部 columns 变化，重新初始化（若需要保留用户自定义状态，可调整逻辑）
watch(
  () => props.columns,
  (newCols) => {
    // 根据需求决定是否重置，这里简单重置（可优化为增量更新）
    initColumns(newCols)
  },
  { deep: true }
)

// ==================== 操作按钮点击 ====================
function onOperationClick(btn: TableBtn, row: any) {
  btn.onClick?.(row)
  emit('tableRowClick', btn, row)
}

// ==================== 暴露内部方法给父组件（可选） ====================
defineExpose({
  internalColumns,
  visibleColumns,
  hiddenProps,
  toggleColumn,
  toggleAll,
  reset,
  reorderColumns,
})
</script>

<style scoped>
.pro-table {
  width: 100%;
}

.pro-table-toolbar {
  display: flex;
  align-items: center;
  justify-content: end;
  padding: 8px 0;
}

.pro-table-toolbar .toolbar-left,
.pro-table-toolbar .toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>