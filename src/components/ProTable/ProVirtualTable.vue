<template>
  <div class="pro-virtual-table mt10">
    <div v-if="showToolbar" class="pro-table-toolbar">
      <el-dropdown trigger="click" :hide-on-click="false">
        <el-button size="small" :icon="Grid" />
        <template #dropdown>
          <el-dropdown-menu class="column-setting-dropdown">
            <el-checkbox v-for="col in toggleableColumns" :key="col.prop" :model-value="!hiddenColumns.has(col.prop)"
              @change="toggleColumn(col.prop)" style="padding: 4px 12px; display: block">
              {{ col.label }}
            </el-checkbox>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <div class="table-container">
      <el-auto-resizer>
        <template #default="{ height, width }">
          <el-table-v2 ref="tableRef" :columns="getComputedColumns(width)" :data="data"
            :width="Math.max(width || 0, totalMinWidth)" :height="tableHeight(height)" v-loading="loading"
            :scrollbar-always-on="true" @cell-click="onCellClick" @row-click="onRowClick" />
        </template>
      </el-auto-resizer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { Grid } from '@element-plus/icons-vue'
import type { Column, TableBtn } from './type'

const props = withDefaults(
  defineProps<{
    columns: Column[]
    data: Record<string, any>[]
    showToolbar?: boolean
    loading?: boolean
    maxHeight?: string | number
    fit?: boolean
  }>(),
  {
    maxHeight: 0,
    fit: true,
  }
)

// 统一处理表格高度：优先使用容器高度，maxHeight 作为上限
function tableHeight(containerHeight: number) {
  const maxH = typeof props.maxHeight === 'number' ? props.maxHeight : parseInt(props.maxHeight || '0')

  if (!containerHeight || containerHeight <= 0) {
    return maxH > 0 ? maxH : 400
  }

  if (maxH > 0 && containerHeight > maxH) {
    return maxH
  }

  return containerHeight
}

const emit = defineEmits<{
  rowClick: [value: any]
  tableRowClick: [btn?: TableBtn, row?: any]
}>()

const tableRef = ref()
const hiddenColumns = ref<Set<string>>(new Set())

const DEFAULT_MIN_WIDTH = 80  // 默认最小宽度
const DEFAULT_WIDTH = 120  // 默认宽度

const toggleableColumns = computed(() =>
  props.columns.filter(
    (c) => c.hideable !== false && c.type !== 'selection' && c.type !== 'operation'
  )
)

function toggleColumn(prop: string) {
  const next = new Set(hiddenColumns.value)
  if (next.has(prop)) {
    next.delete(prop)
  } else {
    next.add(prop)
  }
  hiddenColumns.value = next
}

const visibleColumns = computed(() =>
  props.columns.filter((c) => !hiddenColumns.value.has(c.prop))
)

function getColumnMinWidth(col: Column): number {
  if (col.minWidth) {
    return typeof col.minWidth === 'number' ? col.minWidth : parseInt(col.minWidth) || DEFAULT_MIN_WIDTH
  }
  if (col.width) {
    return typeof col.width === 'number' ? col.width : parseInt(col.width) || DEFAULT_WIDTH
  }
  return DEFAULT_MIN_WIDTH
}

function getColumnFixedWidth(col: Column): number | null {
  if (col.width) {
    return typeof col.width === 'number' ? col.width : parseInt(col.width) || null
  }
  return null
}

const totalMinWidth = computed(() => {
  return visibleColumns.value.reduce((sum, col) => {
    return sum + getColumnMinWidth(col)
  }, 0)
})

function getComputedColumns(availableWidth: number) {
  if (!props.fit || availableWidth <= 0 || totalMinWidth.value >= availableWidth) {
    return visibleColumns.value.map((col) => {
      const fixedWidth = getColumnFixedWidth(col)
      const width = fixedWidth !== null ? fixedWidth : getColumnMinWidth(col)
      return buildColumnConfig(col, width)
    })
  }

  const fixedColumns = visibleColumns.value.filter(col => getColumnFixedWidth(col) !== null)
  const flexibleColumns = visibleColumns.value.filter(col => getColumnFixedWidth(col) === null)
  
  const fixedWidthTotal = fixedColumns.reduce((sum, col) => {
    return sum + (getColumnFixedWidth(col) || 0)
  }, 0)
  
  const flexibleMinWidthTotal = flexibleColumns.reduce((sum, col) => {
    return sum + getColumnMinWidth(col)
  }, 0)

  const remainingWidth = availableWidth - fixedWidthTotal - flexibleMinWidthTotal
  
  if (remainingWidth <= 0) {
    return visibleColumns.value.map((col) => {
      const fixedWidth = getColumnFixedWidth(col)
      const width = fixedWidth !== null ? fixedWidth : getColumnMinWidth(col)
      return buildColumnConfig(col, width)
    })
  }

  const flexibleCount = flexibleColumns.length
  const extraPerColumn = Math.floor(remainingWidth / flexibleCount)
  const remainder = remainingWidth % flexibleCount

  let remainderIndex = 0

  return visibleColumns.value.map((col) => {
    const fixedWidth = getColumnFixedWidth(col)
    if (fixedWidth !== null) {
      return buildColumnConfig(col, fixedWidth)
    }

    const baseWidth = getColumnMinWidth(col)
    const extra = extraPerColumn + (remainderIndex < remainder ? 1 : 0)
    remainderIndex++
    return buildColumnConfig(col, baseWidth + extra)
  })
}

function buildColumnConfig(col: Column, width: number) {
  if (col.type === 'selection' || col.type === 'index') {
    return {
      key: col.prop,
      title: col.label,
      dataKey: col.prop,
      width: width,
      align: col.align ?? 'left',
      cellRenderer: ({ cellData }: { cellData: any }) => {
        if (col.type === 'selection') {
          return ''
        }
        return cellData
      },
    }
  }

  if (col.type === 'operation') {
    return {
      key: col.prop,
      title: col.label,
      dataKey: col.prop,
      width: width,
      align: col.align ?? 'center',
      cellRenderer: ({ rowData }: { rowData: any }) => {
        return h(
          'div',
          { class: 'operation-cell' },
          col.tableBtns?.length
            ? col.tableBtns.slice(0, 3).map((btn: TableBtn) =>
              h(
                'button',
                {
                  type: 'button',
                  class: ['el-button', 'el-button--small', `el-button--${btn.type}`, btn.link ? 'el-button--link' : ''],
                  onClick: () => onOperationClick(btn, rowData),
                },
                btn.label
              )
            )
            : []
        )
      },
    }
  }

  return {
    key: col.prop,
    title: col.label,
    dataKey: col.prop,
    width: width,
    align: col.align ?? 'center',
    sortable: col.sortable,
    cellRenderer: col.formatter
      ? ({ cellData, rowData, rowIndex }: { cellData: any; rowData: any; rowIndex: number }) => {
        if (!col.formatter) return cellData
        const result = col.formatter(rowData, col, cellData, rowIndex)
        if (result && typeof result === 'object' && '__v_isVNode' in result) {
          return result
        }
        if (typeof result === 'string') {
          return h('div', { innerHTML: result })
        }
        return result
      }
      : undefined,
  }
}

function onOperationClick(btn: TableBtn, row: any) {
  emit('tableRowClick', btn, row)
}

function onCellClick({ row }: { row: any }) {
  emit('rowClick', row)
}

function onRowClick({ row }: { row: any }) {
  emit('rowClick', row)
}

defineExpose({
  tableRef,
})
</script>

<style scoped>
.pro-virtual-table {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

:deep(.el-table-v2) {
  min-width: 100%;
}

:deep(.el-table-v2 .el-table-v2__root) {
  min-width: 100%;
}

:deep(.el-table-v2__header-wrapper) {
  width: 100%;
}

:deep(.el-table-v2__header-wrapper th) {
  background-color: #fafafa;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.el-table-v2__body-wrapper) {
  width: 100%;
}

:deep(.el-table-v2__row) {
  width: 100%;
}

:deep(.el-table-v2__row-cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.operation-cell {
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
}

:deep(.el-table-v2 .el-button) {
  padding: 4px 10px;
  font-size: 12px;
}
</style>