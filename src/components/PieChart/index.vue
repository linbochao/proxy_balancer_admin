<template>
  <div ref="chartRef" class="pie-chart" v-loading="loading" :style="{ height }" />
</template>

<script setup lang="ts">
import * as echarts from 'echarts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PieDataItem {
  name: string
  value: number
  itemStyle?: { color?: string; [key: string]: any }
  [key: string]: any
}

export interface CenterText {
  label: string
  sublabel?: string
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

const props = withDefaults(
  defineProps<{
    /** Pie data items — each requires name + value; optional itemStyle.color */
    data: PieDataItem[]
    /** Center display text (e.g. total count + label). Omit to hide. */
    centerText?: CenterText | null
    /** [innerRadius, outerRadius] for ring/doughnut style */
    radius?: [string, string]
    /** Pie center position [x%, y%] */
    center?: [string, string]
    /** Whether to show labels on each slice */
    showLabel?: boolean
    /** Slice label formatter — string template or function */
    labelFormatter?: string | ((p: any) => string)
    /** Custom tooltip: (params, dataArray) => htmlString */
    tooltipFormatter?: (p: any, data: PieDataItem[]) => string
    /** Custom legend label: (name, dataArray) => string */
    legendFormatter?: (name: string, data: PieDataItem[]) => string
    /** Emphasis (hover) label formatter */
    emphasisLabelFormatter?: string | ((p: any) => string)
    /** Loading state — shows Element Plus skeleton overlay */
    loading?: boolean
    /** Container height (CSS value) */
    height?: string
  }>(),
  {
    radius: () => ['55%', '78%'],
    center: () => ['50%', '50%'],
    showLabel: false,
    labelFormatter: '{b}\n{d}%',
    loading: false,
    height: '100%',
  },
)

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

// ---------------------------------------------------------------------------
// Build ECharts option
// ---------------------------------------------------------------------------

function buildOption(): echarts.EChartsOption {
  const { data, centerText, radius, center, showLabel, labelFormatter } = props

  // Center text graphic — positioned to match pie center
  const graphic: echarts.GraphicComponentOption[] = []
  if (centerText?.label) {
    const [cx, cy] = center
    // Use 'center'/'middle' special values when pie is at default 50%/50% so
    // the bounding box is perfectly centred. For custom offsets fall back to
    // the exact percentage values (horizontal centering via textAlign still
    // works; vertical may need a slight user adjustment for multi‑line text).
    graphic.push({
      type: 'text',
      left: cx === '50%' ? 'center' : cx,
      top: cy === '50%' ? 'middle' : cy,
      style: {
        text: centerText.sublabel
          ? `${centerText.label}\n${centerText.sublabel}`
          : centerText.label,
        textAlign: 'center',
        fill: '#303133',
        fontSize: 16,
        fontWeight: 'bold',
        lineHeight: 22,
      },
    })
  }

  return {
    tooltip: {
      trigger: 'item',
      formatter: props.tooltipFormatter
        ? (params: any) => props.tooltipFormatter!(params, data)
        : undefined,
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
      formatter: props.legendFormatter
        ? (name: string) => props.legendFormatter!(name, data)
        : undefined,
    },
    graphic,
    series: [
      {
        type: 'pie',
        radius,
        center,
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: showLabel,
          formatter: labelFormatter,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 13,
            fontWeight: 'bold',
            formatter: props.emphasisLabelFormatter,
          },
        },
        data,
      },
    ],
  }
}

// ---------------------------------------------------------------------------
// Render & lifecycle
// ---------------------------------------------------------------------------

function render() {
  if (!chartRef.value) return
  if (!chart) {
    chart = echarts.init(chartRef.value)
  }
  chart.setOption(buildOption(), { notMerge: true })
}

onMounted(() => {
  nextTick(render)

  // ResizeObserver is more precise than window.resize — it fires on parent
  // layout changes and CSS transitions, not just viewport resizes.
  resizeObserver = new ResizeObserver(() => {
    chart?.resize()
  })
  if (chartRef.value) {
    resizeObserver.observe(chartRef.value)
  }
})

// Re-render when relevant props change
watch(
  () => [props.data, props.centerText, props.showLabel, props.loading],
  () => nextTick(render),
  { deep: true },
)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.pie-chart {
  width: 100%;
  min-height: 200px;
}
</style>
