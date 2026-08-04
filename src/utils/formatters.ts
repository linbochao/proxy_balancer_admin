import { h } from "vue";
import dayjs from 'dayjs'

// 通用状态映射
export const commonStatusMap = {
  ONLINE: { text: '在线', class: 'status-suc' },
  OFFLINE: { text: '离线', class: 'status-unsuc' },
  UNAVAILABLE: { text: '不稳定', class: 'status-warn' },
  RUNNING: { text: '运行中', class: 'status-suc' },
  STOPPED: { text: '已停止', class: 'status-unsuc' },
  DEFAULT: { text: '未知', class: 'status-unknown' },
} as const

// 状态格式化器
export function createStatusFormatter( statusKey: string = 'status', map?: Record<string, { text: string, class: string }>) {
  const mergedMap: Record<string, { text: string, class: string }> = { ...commonStatusMap, ...map}
  return (row: Record<string, any>) => {
    const status = mergedMap[row[statusKey] as string] || mergedMap.DEFAULT
    return h('span', { class: ['status-tag', status.class]}, [
        h('span', { class: 'status-dot'},),
         status.text
    ])
  }
}

// 时间格式化器
export function createTimeFormatter( format: string = 'YYYY-MM-DD HH:mm:ss' ) {
  return (_row: any, _column: any, cellValue: any) => {
    if (!cellValue) return '--'
    return dayjs(cellValue).format(format)
  }
}