# 布局组件使用文档

## 概述

本布局组件用于 Broker 集群数据的后台可视化展示系统，采用 Vue 3 + Element Plus 技术栈开发，包含左侧菜单栏、头部导航栏和内容区域三个核心组件。

## 组件结构

```
layout/
├── index.vue        # 主布局容器
├── Sidebar.vue      # 左侧菜单栏组件
├── Header.vue       # 头部导航栏组件
├── MainContent.vue  # 内容区域组件
└── README.md        # 组件使用文档
```

## 组件详细说明

### 1. Sidebar.vue - 左侧菜单栏

**功能特性**：
- 支持可折叠/展开功能
- 多级导航菜单（支持二级菜单）
- 高亮当前选中项（与路由同步）
- 响应式设计，移动端适配

**Props**：无

**Events**：
| 事件名称 | 参数 | 说明 |
|---------|------|------|
| collapse-change | collapsed: boolean | 侧边栏折叠状态改变时触发 |

**使用方式**：
```vue
<Sidebar @collapse-change="handleCollapseChange" />
```

### 2. Header.vue - 头部导航栏

**功能特性**：
- 显示系统名称和当前页面标题
- 用户信息展示和下拉菜单
- 通知中心（带消息数量徽章）
- 搜索入口和设置入口

**Props**：无

**Events**：
| 事件名称 | 参数 | 说明 |
|---------|------|------|
| toggle-sidebar | 无 | 点击切换侧边栏按钮时触发 |

**使用方式**：
```vue
<Header @toggle-sidebar="toggleSidebar" />
```

### 3. MainContent.vue - 内容区域

**功能特性**：
- 自适应布局，支持路由视图切换
- 页面切换动画过渡效果
- 加载状态显示

**Props**：无

**Events**：无

**使用方式**：
```vue
<MainContent />
```

### 4. index.vue - 主布局容器

**功能特性**：
- 整合三个子组件
- 管理侧边栏折叠状态
- 响应式布局适配

**使用方式**：
```vue
<Layout />
```

## 状态通信机制

布局组件间通过以下方式实现状态通信：

1. **Sidebar ↔ Layout**：通过 `collapse-change` 事件传递折叠状态
2. **Header ↔ Layout**：通过 `toggle-sidebar` 事件触发折叠切换
3. **Sidebar ↔ Router**：通过 `el-menu` 的 `:router="true"` 属性实现菜单与路由同步
4. **Header ↔ Router**：通过 `useRoute()` 获取当前路由信息，动态显示页面标题

## 路由配置示例

布局组件已在路由中配置为父组件，子路由示例：

```typescript
{
  path: '/',
  component: Layout,
  children: [
    {
      path: '/home',
      name: 'Home',
      component: () => import('../views/home/index.vue'),
      meta: { title: '首页概览' }
    }
  ]
}
```

## 样式说明

### 全局样式
- 文件：`src/style.css`
- 包含全局重置样式、滚动条样式和响应式基础设置

### 组件样式
- 每个组件使用 `<style scoped>` 实现样式隔离
- Sidebar 使用深色主题渐变背景
- Header 使用白色背景配合阴影效果

## 注意事项

1. **菜单与路由同步**：菜单的 `path` 属性必须与路由配置中的 `path` 一致，才能实现正确的高亮和导航

2. **图标使用**：菜单图标从 `@element-plus/icons-vue` 导入，确保使用正确的图标名称

3. **响应式断点**：
   - 桌面端（≥768px）：侧边栏默认展开
   - 移动端（<768px）：侧边栏默认折叠，点击头部按钮展开

4. **页面标题动态显示**：Header 组件通过 `route.path` 映射到标题，新增页面时需在 Header.vue 的 `pageTitle` 计算属性中添加对应映射

5. **组件复用**：三个子组件均可独立复用，但建议在 Layout 容器中统一使用

## 扩展指南

### 添加新菜单项

在 `Sidebar.vue` 的 `menuItems` 数组中添加新项：

```typescript
{
  path: '/new-page',
  label: '新页面',
  icon: YourIcon,
  children?: []  // 二级菜单可选
}
```

### 添加新页面路由

在 `router/index.ts` 中添加子路由：

```typescript
{
  path: '/new-page',
  name: 'NewPage',
  component: () => import('../views/new-page/index.vue'),
  meta: { title: '新页面' }
}
```

### 自定义侧边栏样式

修改 `Sidebar.vue` 的 `<style scoped>` 部分，可自定义：
- 背景色和渐变效果
- 菜单项高度和间距
- 激活状态样式
- 折叠按钮位置和样式