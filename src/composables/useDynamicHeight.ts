import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * 动态计算容器高度，用于图表自适应。
 *
 * 使用方式：
 *   const { containerHeight, recalculate } = useDynamicHeight(elRef, {
 *     offsets: [60, 40, 136, 20],  // 从 viewport 顶部向下逐层扣减的固定高度
 *     minHeight: 280,
 *     maxHeight: 600,
 *   })
 *   // containerHeight 是响应式的 px 数值，可直接 :style="{ height: containerHeight + 'px' }"
 *
 * @param elRef      可选 — 如果提供，则以元素顶部到 viewport 顶部的距离作为额外偏移
 * @param options    配置项
 */
export function useDynamicHeight(
  elRef?: ReturnType<typeof ref<HTMLElement | null>>,
  options: {
    /** 需要从 viewport 高度中扣除的固定像素列表（header / padding / 其他固定元素） */
    offsets?: number[]
    /** 最小高度，防止内容被压扁（默认 280） */
    minHeight?: number
    /** 最大高度，防止超大屏幕上内容过于松散（默认 600） */
    maxHeight?: number
  } = {},
) {
  const { offsets = [], minHeight = 280, maxHeight = 600 } = options

  const containerHeight = ref(minHeight)

  function calculate() {
    let available = window.innerHeight

    // 扣除所有固定偏移
    for (const offset of offsets) {
      available -= offset
    }

    // 如果提供了容器元素引用，额外扣除其距顶部的距离
    if (elRef?.value) {
      const rect = elRef.value.getBoundingClientRect()
      available -= rect.top
    }

    // 边界约束
    const clamped = Math.round(Math.min(Math.max(available, minHeight), maxHeight))
    containerHeight.value = clamped
  }

  // requestAnimationFrame 防抖 — 在一帧内多次 resize 只计算一次
  let rafId: number | null = null
  function onResize() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
    }
    rafId = requestAnimationFrame(() => {
      rafId = null
      calculate()
    })
  }

  onMounted(() => {
    calculate()
    window.addEventListener('resize', onResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
    }
  })

  return { containerHeight, recalculate: calculate }
}
