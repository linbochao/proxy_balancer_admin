<template>
  <div class="app-pagination pt10" id="oneths-pagin">
    <el-pagination
      v-model:current-page="innerPageNumber" v-model:page-size="innerPageSize"
      :total="safeTotal" :page-sizes="pageSizes" :layout="layout" :background="background" :disabled="disabled"
      @size-change="onSizeChange" @current-change="onPageChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
const props = withDefaults(defineProps<{
    /* 当前页 */
    pageNumber?: number
    /* 每页条数 */
    pageSize?: number
    /* 总条数 */
    total?: number | string
    /* 可选每页条数 */
    pageSizes?: number[]
    /* 分页布局 */
    layout?: string
    /* 带背景色 */
    background?: boolean
    /* 禁用 */
    disabled?: boolean
}>(), {
    pageNumber: 1,
    pageSize: 10,
    total: 0,
    pageSizes: () => [10, 20, 50, 100,],
    layout: 'total, sizes, prev, pager, next, jumper',
    background: true,
    disabled: false,
})

const emit = defineEmits<{
    'update:pageNumber': [val: number]
    'update:pageSize': [val: number]
    change: []
}>()

//用inner 前缀避免与props同名冲突
const innerPageNumber = computed({
    get: () => props.pageNumber,
    set: (val) => emit('update:pageNumber', val)
})

const innerPageSize = computed({
    get: () => props.pageSize,
    set: (val) => emit('update:pageSize', val)
})

// 容错：API 可能返回字符串类型的 total
const safeTotal = computed(() => Number(props.total) || 0)

function onPageChange() {
    emit('change')
}

function onSizeChange() {
    emit('change')
}

</script>

<style scoped>
.app-pagination {
  display: flex;
  justify-content: flex-end;
  position: absolute;
  bottom: 15px;
  right: 20px;
  z-index: 10;

}
</style>