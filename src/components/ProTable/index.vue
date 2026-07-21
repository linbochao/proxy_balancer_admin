<template>
  <div class="pro-table mt10">
    <div v-if="showToolbar" class="pro-table-toolbar" id="oneths-tableToolbar">
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

    <el-table
      ref="tableRef"
      :data="data"
      :border="bordered"
      :stripe="stripe"
      :height="maxHeight"
      v-loading="loading"
      :empty-text="emptyText"
      :default-sort="defaultSort"
      @selection-change="emit('selectionChange', $event)"
      @sort-change="emit('sortChange', $event)"
      @row-click="emit('rowClick', $event)"
      v-bind="$attrs"
    >
      <template v-for="(col, idx) in visibleColumns" :key="idx">
        <el-table-column
          v-if="col.type === 'selection'"
          type="selection"
          width="50"
          fixed="left"
        />

        <el-table-column
          v-else-if="col.type === 'index'"
          type="index"
          :label="col.label"
          :width="col.width ?? 60"
          align="center"
          fixed="left"
        />

        <el-table-column
          v-else-if="col.type === 'operation'"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
          :fixed="col.fixed"
          :align="col.align ?? 'left'"
        >
          <template #default="{ row }">
            <template v-if="col.tableBtns?.length && col.tableBtns.length <= 3">
              <el-button
                v-for="(btn, btnIdx) in col.tableBtns"
                :key="btnIdx"
                :type="btn.type"
                :icon="btn.icon"
                :link="btn.link"
                @click="onOperationClick(btn, row)"
              >
                {{ btn.label }}
              </el-button>
            </template>
            <template v-else-if="col.tableBtns?.length">
              <el-button
                v-for="(btn, btnIdx) in col.tableBtns.slice(0, 2)"
                :key="btnIdx"
                :type="btn.type"
                :icon="btn.icon"
                :link="btn.link"
                @click="onOperationClick(btn, row)"
              >
                {{ btn.label }}
              </el-button>
              <el-popover placement="bottom" trigger="hover" :show-after="200">
                <template #reference>
                  <el-button type="primary" link>更多</el-button>
                </template>
                <template #default>
                  <el-button
                    v-for="(btn, btnIdx) in col.tableBtns.slice(2)"
                    :key="btnIdx"
                    :type="btn.type"
                    :icon="btn.icon"
                    :link="btn.link"
                    @click="onOperationClick(btn, row)"
                  >
                    {{ btn.label }}
                  </el-button>
                </template>
              </el-popover>
            </template>
          </template>
        </el-table-column>

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

      <slot name="action" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Grid } from '@element-plus/icons-vue'
import type { Column, TableBtn } from './type'

const props = withDefaults(
  defineProps<{
    columns: Column[]
    data: Record<string, any>[]
    showToolbar?: boolean
    bordered?: boolean
    stripe?: boolean
    loading?: boolean
    showIndex?: boolean
    indexLabel?: string
    maxHeight?: string | number
    emptyText?: string
    defaultSort?: { prop: string; order: 'ascending' | 'descending' }
  }>(),
  {
    maxHeight: 'calc(100vh - 300px)',
  }
)

const emit = defineEmits<{
  selectionChange: [value: any[]]
  sortChange: [value: any]
  rowClick: [value: any]
  tableRowClick: [btn?: TableBtn, row?: any]
  refresh: []
}>()

const tableRef = ref()

const toggleableColumns = computed(() =>
  props.columns.filter(
    (c) => c.hideable !== false && c.type !== 'selection' && c.type !== 'operation'
  )
)

const hiddenColumns = ref<Set<string>>(new Set())

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

function onOperationClick(btn: TableBtn, row: any) {
  emit('tableRowClick', btn, row)
}

defineExpose({
  tableRef,
})
</script>
