import * as echarts from 'echarts/core'


// ============================================================
// 类型定义：图表数据系列的标准格式
// ============================================================

/**
 * 多系列数据项（适用于折线图、柱状图等）
 * @property name - 系列名称（会显示在图例中）
 * @property data - 数值数组（必须与 X 轴标签数量一致）
 * @property color - 颜色值（可选，不传则使用默认蓝色）
 */
export interface MultiSeries {
  name: string
  data: number[]
  color?: string  // 问号 ? 表示这个属性是可选的
}

// ============================================================
// ECharts option 工厂
// 统一深石板蓝主题:文字色/网格色/坐标轴色由设计令牌派生
// ============================================================

const TEXT = '#9aabc0'
const TEXT_DIM = '#5c6f87'
const GRID = '#1c2433'
const AXIS = '#2a3548'

/** 公共网格配置 */
function baseGrid() {
  return {
    top: 24,
    right: 18,
    bottom: 36,
    left: 48,
    containLabel: true
  }
}

/** 公共 X 轴 */
function baseXAxis(labels: string[]) {
  return {
    type: 'category',
    data: labels,
    boundaryGap: true,
    axisLine: { lineStyle: { color: AXIS } },
    axisTick: { show: false },
    axisLabel: {
      color: TEXT_DIM,
      fontSize: 10,
      fontFamily: 'Fira Code, monospace'
    }
  }
}

/** 公共 Y 轴 */
function baseYAxis(opts: { fmt?: (v: number) => string; max?: number; min?: number } = {}) {
  return {
    type: 'value',
    max: opts.max,
    min: opts.min,
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: {
      lineStyle: { color: GRID, type: [3, 4] as any, dashOffset: 0 }
    },
    axisLabel: {
      color: TEXT_DIM,
      fontSize: 10,
      fontFamily: 'Fira Code, monospace',
      formatter: opts.fmt ? (v: number) => opts.fmt!(v) : undefined
    }
  }
}

/** 公共 tooltip */
function baseTooltip() {
  return {
    trigger: 'axis',
    backgroundColor: '#16223a',
    borderColor: '#1e2a42',
    borderWidth: 1,
    textStyle: { color: TEXT, fontSize: 12, fontFamily: 'Fira Sans' },
    axisPointer: {
      type: 'line',
      lineStyle: { color: '#3b82f6', width: 1, type: 'dashed' }
    }
  }
}

/** 公共 legend 1 */
function baseLegend(series: MultiSeries[]) {
  return {
    data: series.map((s) => s.name),
    textStyle: { color: TEXT, fontSize: 11 },
    icon: 'roundRect',
    itemWidth: 10,
    itemHeight: 10,
    itemGap: 14,
    top: 0,
    right: 0
  }
}

// ============================================================
// 1. 折线图(多系列 + 渐变面积)
// ============================================================
export function lineOption(
  labels: string[],
  series: MultiSeries[],
  opts: { fmt?: (v: number) => string; area?: boolean; smooth?: boolean } = {}
): echarts.EChartsCoreOption {
  const { area = true, smooth = true } = opts
  return {
    tooltip: baseTooltip(),
    legend: baseLegend(series),
    grid: { ...baseGrid(), top: 36 },
    xAxis: { ...baseXAxis(labels), boundaryGap: false },
    yAxis: baseYAxis({ fmt: opts.fmt }),
    series: series.map((s) => ({
      name: s.name,
      type: 'line',
      smooth,
      symbol: 'circle',
      symbolSize: 5,
      showSymbol: false,
      data: s.data,
      lineStyle: { width: 2, color: s.color },
      itemStyle: {
        borderRadius: [3, 3, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: s.color || '#3b82f6' },
          { offset: 1, color: (s.color || '#3b82f6') + '80' }
        ])
      },
      emphasis: { focus: 'series' },
      ...(area
        ? {
          areaStyle: {
            opacity: 0.18,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: s.color || '#3b82f6' },
              { offset: 1, color: 'transparent' }
            ])
          }
        }
        : {})
    }))
  }
}

// ============================================================
// 2. 柱线混合图(多柱 + 多线，自适应宽度)
// ============================================================
export function barLineOption(
  labels: string[],
  barSeries: MultiSeries[],
  lineSeries: MultiSeries[] = []
): echarts.EChartsCoreOption {
  const n = barSeries.length
  const barWidth = n <= 2 ? '32%' : n <= 3 ? '22%' : n <= 4 ? '16%' : '12%'
  const barGap = n <= 3 ? '15%' : '10%'

  const allNames = [...barSeries.map((s) => s.name), ...lineSeries.map((s) => s.name)]

  const bars: any[] = barSeries.map((s, i) => ({
    name: s.name,
    type: 'bar',
    data: s.data,
    barWidth,
    barGap: i === 0 ? barGap : undefined,
    itemStyle: {
      borderRadius: [3, 3, 0, 0],
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: s.color || '#3b82f6' },
        { offset: 1, color: (s.color || '#3b82f6') + '80' }
      ])
    }
  }))

  const lines: any[] = lineSeries.map((s) => ({
    name: s.name,
    type: 'line',
    yAxisIndex: 1,
    smooth: true,
    symbol: 'circle',
    symbolSize: 6,
    data: s.data,
    lineStyle: { width: 2, color: s.color },
    itemStyle: { color: s.color },
    emphasis: { focus: 'series' }
  }))

  return {
    tooltip: baseTooltip(),
    legend: {
      data: allNames,
      textStyle: { color: TEXT, fontSize: 11 },
      icon: 'roundRect',
      itemWidth: 10,
      itemHeight: 10,
      top: 0,
      right: 0
    },
    grid: { ...baseGrid(), top: 36 },
    xAxis: baseXAxis(labels),
    yAxis: [
      { ...baseYAxis(), position: 'left' },
      { ...baseYAxis(), position: 'right', splitLine: { show: false } }
    ],
    series: [...bars, ...lines]
  }
}

// ============================================================
// 3. 分组柱状图(多序列自适应宽度)
// ============================================================
export function barGroupOption(
  cats: string[],
  series: MultiSeries[]
): echarts.EChartsCoreOption {
  const n = series.length
  const barWidth = n <= 2 ? '32%' : n <= 3 ? '22%' : n <= 4 ? '16%' : '12%'
  const barGap = n <= 3 ? '15%' : '10%'
  return {
    tooltip: baseTooltip(),
    legend: baseLegend(series),
    grid: { ...baseGrid(), top: 36 },
    xAxis: baseXAxis(cats),
    yAxis: baseYAxis(),
    series: series.map((s, i) => ({
      name: s.name,
      type: 'bar',
      data: s.data,
      barWidth,
      barGap: i === 0 ? barGap : undefined,
      itemStyle: {
        borderRadius: [3, 3, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: s.color || '#3b82f6' },
          { offset: 1, color: (s.color || '#3b82f6') + '80' }
        ])
      }
    }))
  }
}

// ============================================================
// 4. 仪表/进度 Gauge(单 KPI,带阈值色)
// ============================================================
export function gaugeOption(
  value: number,
  opts: { max?: number; unit?: string; color?: string } = {}
): echarts.EChartsCoreOption {
  const max = opts.max ?? 100
  const unit = opts.unit ?? '%'
  // 按值自动取色(健康语义)
  const color =
    opts.color ||
    (value >= 80 ? '#dc2626' : value >= 60 ? '#d97706' : '#22c55e')
  return {
    series: [
      {
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max,
        progress: {
          show: true,
          width: 10,
          roundCap: true,
          itemStyle: { color }
        },
        axisLine: {
          roundCap: true,
          lineStyle: { width: 10, color: [[1, '#1c2433']] }
        },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        anchor: { show: false },
        title: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 24,
          fontFamily: 'Fira Code, monospace',
          fontWeight: 700,
          color: TEXT,
          offsetCenter: [0, '0%'],
          formatter: `{value}${unit}`
        },
        data: [{ value }]
      }
    ]
  }
}

// ============================================================
// 5. 迷你折线(sparkline,无轴,用于小卡)
// ============================================================
export function sparklineOption(
  data: number[],
  color: string,
  unit?: string
): echarts.EChartsCoreOption {
  return {
    grid: { top: 4, right: 4, bottom: 4, left: 4 },
    xAxis: { type: 'category', show: false, boundaryGap: false },
    yAxis: { type: 'value', show: false },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#16223a',
      borderColor: '#1e2a42',
      textStyle: { color: TEXT, fontSize: 11 },
      formatter: (p: any) => `${p[0].value}${unit || ''}`
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'none',
        data,
        lineStyle: { width: 2, color },
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color },
            { offset: 1, color: 'transparent' }
          ])
        }
      }
    ]
  }
}

// ============================================================
// 6. 饼图(环形, 用于占比展示: 在线/离线/不稳定)
// ============================================================
export interface PieSlice {
  name: string
  value: number
  color: string
}

export function pieOption(
  slices: PieSlice[]
): echarts.EChartsCoreOption {

  return {

    tooltip: {
      trigger: 'item',
      backgroundColor: '#16223a',
      borderColor: '#1e2a42',
      textStyle: { color: '#E2E8F0', fontSize: 12 },
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      top: '5%',
      left: 'left',
      textStyle: { color: '#94A3B8', fontSize: 11 },
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      orient: 'vertical',
      itemGap: 24
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: slices.map((s) => ({
          name: s.name,
          value: s.value,
          itemStyle: { color: s.color }
        }))
      }
    ],
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    }
  }
}


// 柱状图和折线图
export function barandLineOption(
  labels: string[],
  barData: number[],
  lineData: number[],
  opts: { barName?: string; lineName?: string; barColor?: string; lineColor?: string } = {}
): echarts.EChartsCoreOption {
  const barName = opts.barName || '柱'
  const lineName = opts.lineName || '线'
  const barColor = opts.barColor || '#a78bfa'
  const lineColor = opts.lineColor || '#ef4444'
  return {
    tooltip: baseTooltip(),
    legend: {
      data: [barName, lineName],
      textStyle: { color: TEXT, fontSize: 11 },
      icon: 'roundRect',
      itemWidth: 10,
      itemHeight: 10,
      top: 0,
      right: 0
    },
    grid: { ...baseGrid(), top: 36 },
    xAxis: baseXAxis(labels),
    yAxis: [
      { ...baseYAxis(), name: '', position: 'left' },
      { ...baseYAxis(), position: 'right', splitLine: { show: false } }
    ],
    series: [
      {
        name: barName,
        type: 'bar',
        data: barData,
        barWidth: '45%',
        itemStyle: {
          borderRadius: [3, 3, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: barColor },
            { offset: 1, color: barColor + '80' }
          ])
        }
      },
      {
        name: lineName,
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: lineData,
        lineStyle: { width: 2, color: lineColor },
        itemStyle: {
          borderRadius: [3, 3, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: lineColor },
            { offset: 1, color: lineColor + '80' }
          ])
        },
        emphasis: { focus: 'series' }
      }
    ]
  }
}
