<template>
  <div class="pro-virtual-table mt10">
    <div v-if="showToolbar" class="pro-table-toolbar">
      <el-dropdown trigger="click" :hide-on-click="false">
        <el-button size="small" :icon="Grid" />
        <template #dropdown>
          <el-dropdown-menu class="column-setting-dropdown">
            <el-checkbox
              v-for="col in toggleableColumns"
              :key="col.prop"
              :model-value="!hiddenColumns.has(col.prop)"
              @change="toggleColumn(col.prop)"
              style="padding: 4px 12px; display: block"
            >
              {{ col.label }}
            </el-checkbox>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <el-table-v2
      ref="tableRef"
      :columns="virtualColumns"
      :data="data"
      :width="tableWidth"
      :height="maxHeight"
      :fixed-columns="fixedLeftColumns"
      :fixed-right-columns="fixedRightColumns"
      v-loading="loading"
      :scrollbar-always-on="true"
      @cell-click="onCellClick"
      @row-click="onRowClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import { Grid } from '@element-plus/icons-vue'
import type { Column, TableBtn } from './type'

const props = withDefaults(
  defineProps<{
    columns: Column[]
    data: Record<string, any>[]
    showToolbar?: boolean
    loading?: boolean
    maxHeight?: string | number
  }>(),
  {
    maxHeight: 400,
  }
)

const emit = defineEmits<{
  rowClick: [value: any]
  tableRowClick: [btn?: TableBtn, row?: any]
}>()

const tableRef = ref()
const containerRef = ref<HTMLElement | null>(null)
const tableWidth = ref(800)

const hiddenColumns = ref<Set<string>>(new Set())

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

const virtualColumns = computed(() => {
  return visibleColumns.value.map((col) => {
    if (col.type === 'selection' || col.type === 'index') {
      return {
        key: col.prop,
        label: col.label,
        width: col.width ?? 60,
        align: col.align ?? 'left',
        cellRenderer: ({ cellValue }: { cellValue: any }) => {
          if (col.type === 'selection') {
            return ''
          }
          return cellValue
        },
      }
    }

    if (col.type === 'operation') {
      return {
        key: col.prop,
        label: col.label,
        width: col.width ?? 180,
        align: col.align ?? 'left',
        cellRenderer: ({ row }: { row: any }) => {
          return h(
            'div',
            { class: 'operation-cell' },
            col.tableBtns?.length
              ? col.tableBtns.slice(0, 3).map((btn: TableBtn) =>
                  h(
                    'button',
                    {
                      type: 'button',
                      class: ['el-button', `el-button--${btn.type}`, btn.link ? 'el-button--link' : ''],
                      onClick: () => onOperationClick(btn, row),
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
      label: col.label,
      width: col.width ?? 120,
      align: col.align ?? 'left',
      sortable: col.sortable,
      cellRenderer: col.formatter
        ? ({ row, cellValue, index }: { row: any; cellValue: any; index: number }) => {
            if (!col.formatter) return cellValue
            return col.formatter(row, col, cellValue, index)
          }
        : undefined,
    }
  })
})

const fixedLeftColumns = computed(() => {
  return virtualColumns.value.filter((col) => col.align === 'left').slice(0, 2)
})

const fixedRightColumns = computed(() => {
  const opsCol = virtualColumns.value.find((col) => col.key === 'operation')
  return opsCol ? [opsCol] : []
})

function onOperationClick(btn: TableBtn, row: any) {
  emit('tableRowClick', btn, row)
}

function onCellClick({ row }: { row: any }) {
  emit('rowClick', row)
}

function onRowClick({ row }: { row: any }) {
  emit('rowClick', row)
}

function handleResize() {
  if (containerRef.value) {
    tableWidth.value = containerRef.value.offsetWidth
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

defineExpose({
  tableRef,
})
</script>

<style scoped>
.pro-virtual-table {
  width: 100%;
}

.operation-cell {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
