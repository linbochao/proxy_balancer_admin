import { defineStore } from 'pinia'

export interface PageTab {
  /** 路由路径（唯一标识） */
  path: string
  /** 完整路径（含 query） */
  fullPath: string
  /** 标签标题 */
  title: string
  /** 路由名称（用于 keep-alive 缓存） */
  name?: string
  /** 是否固定，固定后不可关闭且排在最前 */
  fixed?: boolean
}

const STORAGE_KEY = 'PAGE_TABS'
const MAX_TABS = 15

/** 不需要留存的路径 */
const EXCLUDE_PATHS = ['/login', '/']

export const usePageTabsStore = defineStore('pageTabs', {
  state: () => ({
    tabs: [] as PageTab[],
    activeTabPath: '' as string,
  }),

  getters: {
    /** 当前激活的 tab 对象 */
    activeTab(): PageTab | undefined {
      return this.tabs.find((t) => t.path === this.activeTabPath)
    },

    /** 所有需要缓存的组件名称列表（用于 keep-alive :include） */
    cachedNames(): string[] {
      return this.tabs
        .filter((t) => t.name)
        .map((t) => t.name!) as string[]
    },
  },

  actions: {
    /** 添加或激活一个标签 */
    addTab(tab: PageTab) {
      if (EXCLUDE_PATHS.includes(tab.path)) return

      const existing = this.tabs.find((t) => t.path === tab.path)
      if (existing) {
        // 更新 fullPath（query 可能变化）
        existing.fullPath = tab.fullPath
        existing.title = tab.title || existing.title
      } else {
        this.tabs.push(tab)
        if (this.tabs.length > MAX_TABS) {
          // 移除第一个非固定的
          const idx = this.tabs.findIndex((t) => !t.fixed)
          if (idx > -1) this.tabs.splice(idx, 1)
        }
      }
      this.activeTabPath = tab.path
      this.saveToStorage()
    },

    /** 关闭标签，返回新的激活路径 */
    removeTab(path: string): string {
      const index = this.tabs.findIndex((t) => t.path === path)
      if (index === -1) return this.activeTabPath

      const tab = this.tabs[index]
      if (tab.fixed) return this.activeTabPath

      this.tabs.splice(index, 1)

      if (this.activeTabPath === path) {
        this.activeTabPath = this.findNextActive()
      }

      this.saveToStorage()
      return this.activeTabPath
    },

    /** 关闭其他标签（保留当前激活的 + 固定的） */
    closeOthers() {
      this.tabs = this.tabs.filter(
        (t) => t.path === this.activeTabPath || t.fixed,
      )
      this.saveToStorage()
    },

    /** 关闭全部标签（保留固定的，激活最后一个） */
    closeAll() {
      this.tabs = this.tabs.filter((t) => t.fixed)
      this.activeTabPath = this.tabs[this.tabs.length - 1]?.path || ''
      this.saveToStorage()
      return this.activeTabPath
    },

    /** 固定当前激活的标签 */
    fixTab() {
      const active = this.activeTab
      if (!active) return
      active.fixed = true
      this.sortTabs()
      this.saveToStorage()
    },

    /** 取消固定当前激活的标签 */
    unfixTab() {
      const active = this.activeTab
      if (!active) return
      active.fixed = false
      this.sortTabs()
      this.saveToStorage()
    },

    /** 设置当前激活标签 */
    setActiveTab(path: string) {
      this.activeTabPath = path
      this.saveToStorage()
    },

    /** 查找下一个可激活的路径（取最后一个） */
    findNextActive(): string {
      if (this.tabs.length === 0) return ''
      return this.tabs[this.tabs.length - 1]?.path || ''
    },

    /** 将固定标签排在前面 */
    sortTabs() {
      this.tabs.sort((a, b) => {
        if (a.fixed && !b.fixed) return -1
        if (!a.fixed && b.fixed) return 1
        return 0
      })
    },

    /** 从 localStorage 恢复标签数据 */
    restore() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const saved = JSON.parse(raw)
          if (saved?.tabs?.length) {
            this.tabs = saved.tabs
            this.activeTabPath = saved.activeTabPath || ''
          }
        }
      } catch {
        this.tabs = []
        this.activeTabPath = ''
      }
    },

    /** 持久化到 localStorage */
    saveToStorage() {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            tabs: this.tabs,
            activeTabPath: this.activeTabPath,
          }),
        )
      } catch {
        // ignore
      }
    },
  },
})
