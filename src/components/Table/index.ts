// ==================== ProTable 类型定义 ====================
import type { VNode } from 'vue'

/** 列配置 */
export interface Column {
  /** 字段名 */
  prop: string
  /** 列标题 */
  label: string
  /** 列宽 */
  width?: number | string
  /** 最小列宽 */
  minWidth?: number | string
  /** 固定列 */
  fixed?: 'left' | 'right'
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 是否可排序 */
  sortable?: boolean | 'custom'
  /** 超出隐藏 tooltip，默认 true */
  showOverflowTooltip?: boolean
  /** 自定义格式化 */
  formatter?: (row: Record<string, any>, column?: any, cellValue?: any, index?: number) => string | VNode
  /** 自定义插槽名，配合具名插槽使用 */
  selectable?: (row: Record<string, any>, index: number) => boolean
  slot?: string
  tableBtns?: TableBtn[]
  /** 是否允许列设置中隐藏，默认 true */
  hideable?: boolean
}

/** 操作列按钮配置 */
export interface TableBtn {
  /** 按钮文字 */
  label: string
  /** 按钮类型 */
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** 图标名（Element Plus 图标） */
  icon?: string
  /** 是否链接按钮 */
  link?: boolean
  /** 是否禁用（支持函数动态判断） */
  disabled?: (row: Record<string, any>) => boolean
  /** 是否显示（支持函数动态判断） */
  show?: (row: Record<string, any>) => boolean
  /** 点击回调 */
  onClick?: (row: Record<string, any>) => void
  // 按钮的作用
  key?: string,
  auth?: string | boolean
}

/** 操作列配置 */
export interface OperationConfig {
  /** 列宽 */
  width?: number | string
  /** 固定列 */
  fixed?: 'left' | 'right'
  /** 按钮列表 */
  btns: TableBtn[]
}
