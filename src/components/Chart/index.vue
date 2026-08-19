<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
  import * as echarts from 'echarts/core'
  import { LineChart, BarChart, GaugeChart, PieChart } from 'echarts/charts'
  import {
    GridComponent,
    TooltipComponent,
    LegendComponent,
    DataZoomComponent,
    GraphicComponent
  } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'

  echarts.use([
    LineChart,
    BarChart,
    GaugeChart,
    PieChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    DataZoomComponent,
    GraphicComponent,
    CanvasRenderer
  ])

  const props = withDefaults(
    defineProps<{
        option: echarts.EChartsCoreOption
        height?: string
    }>(),
    { height: "240px"}
  )

  const emit = defineEmits<{
    (e: 'chart-click', params: any): void
  }>()

  const el = ref<HTMLDivElement>()
  let chart: echarts.ECharts | null = null

  function onChartClick(params: any) {
    emit('chart-click', params)
  }

  function redner() {
    if (!el.value) return
    if (!chart) {
      chart = echarts.init(el.value, undefined, { renderer: 'canvas' })
      chart.on('click', onChartClick)
    }
    chart.setOption(props.option, true)
  }

  function resize() {
    chart?.resize()
  }

  onMounted(async () => {
    await nextTick()
    redner()
    window.addEventListener('resize', resize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resize)
    chart?.off('click', onChartClick)
    chart?.dispose()
    chart = null
  })

  watch(
    () => props.option,
    () => redner(),
    { deep: true }
  )
</script>

<template>
  <div ref="el" class="chart" :style="{ height }"></div>
</template>

<style scoped>
.chart {
  width: 100%;
}
</style>