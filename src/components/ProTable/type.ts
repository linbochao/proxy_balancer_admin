import type { Component, VNode } from 'vue'

export interface TableBtn {
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  icon?: Component
  link?: boolean
  auth?: string
  action?: string
}

export type ColumnType = 'selection' | 'index' | 'operation' | 'default'

export interface Column {
  prop: string
  label: string
  type?: ColumnType
  width?: number | string
  minWidth?: number | string
  fixed?: 'left' | 'right' | boolean
  align?: 'left' | 'center' | 'right'
  sortable?: boolean | 'custom'
  showOverflowTooltip?: boolean
  hideable?: boolean
  formatter?: (row: Record<string, any>, column: Column, cellValue: any, index: number) => string | VNode
  slot?: string
  tableBtns?: TableBtn[]
}

export interface ProTableProps {
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
}

export interface ProTableEmits {
  selectionChange: [value: any[]]
  sortChange: [value: any]
  rowClick: [value: any]
  tableRowClick: [btn?: TableBtn, row?: any]
  refresh: []
}
