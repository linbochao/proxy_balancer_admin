import {  request } from '@/services/axios'
const API = {
    regDevicesList: '/oneths/register/api/connectors/instances/registered-devices',  // 获取注册设备列表
    connectorsByAgentType: '/oneths/register/api/connectors/connectors-by-agent-type',   // 获取连接列表（扁平化 connectors）
    connectorsByBroker: '/oneths/register/api/brokers/connectors',  // 获取指定 broker 下的 connectors 列表
    connectorsDistribution: '/oneths/register/api/connectors/distribution',  // 获取broker列表（扁平化 connectors）
    deviceRoutes: '/oneths/register/api/device-routes',  // 设备路由查询
    deviceRoutesAvailability: '/oneths/register/api/device-routes/availability',  // 设备路由可用性
    loads: '/oneths/register/api/brokers/loads',  // 获取broker负载数据
    brokersList: '/oneths/register/api/brokers',  // 获取broker列表
    brokersDetail: '/oneths/register/api/brokers/detail',  // 获取broker详情
    brokersOverview: '/oneths/register/api/brokers/overview',  // broker概览统计
    brokersDistribution: '/oneths/register/api/brokers/distribution',  // 设备分布倾斜率
    connectorsRuntimeQuality: '/oneths/register/api/connectors/runtime-quality',  // 连接运行质量
    connectorsDeviceCountsByAgentType: '/oneths/register/api/connectors/device-counts-by-agent-type',  // 连接分类统计
    connectorsReportProcessing: '/oneths/register/api/observability/report-processing',  // Register 处理概览
    deviceInstanceQuality: '/oneths/register/api/connectors/device-instance-quality',  // 设备运行质量
    operationsActions: '/oneths/register/api/operations/actions',  // 运维操作方向列表
    operationsTasks: '/oneths/register/api/operations/tasks',  // 运维任务列表
}

export const regDevicesList = (params: any) => {
    return request({
        url: API.regDevicesList,
        method: 'get',
        params,
    })
}

export const connectorsByAgentType = (params: { agentType: number }) => {
    return request({
        url: API.connectorsByAgentType,
        method: 'get',
        params,
    })
}

/**
 * 获取指定 broker 下的 connectors 列表
 * @param brokerInstanceId broker 实例 ID，例如 broker-192.168.110.5-3000
 */
export const connectorsByBroker = (brokerInstanceId: string) => {
    return request({
        url: `${API.connectorsByBroker}/${brokerInstanceId}`,
        method: 'get',
    })
}

export const connectorsDistribution = (connectorId: string) => {
    return request({
        url: `${API.connectorsDistribution}/${connectorId}`,
        method: 'get',
    })
}

export const deviceRoutes = (params: any) => {
    return request({
        url: API.deviceRoutes,
        method: 'get',
        params,
    })
}

export const deviceRoutesAvailability = (params: { uniqueId: string }) => {
    return request({
        url: API.deviceRoutesAvailability,
        method: 'get',
        params,
    })
}

export const loads = () => {
    return request({
        url: API.loads,
        method: 'get',
    })
}

export const brokersList = (params: { page: number; pageSize: number }) => {
    return request({
        url: API.brokersList,
        method: 'get',
        params,
    })
}

export const brokersDetail = (params: { brokerInstanceId: string }) => {
    return request({
        url: API.brokersDetail,
        method: 'get',
        params,
    })
}

export const brokersOverview = () => {
    return request({
        url: API.brokersOverview,
        method: 'get',
    })
}

export const brokersDistribution = () => {
    return request({
        url: API.brokersDistribution,
        method: 'get',
    })
}

export const connectorsRuntimeQuality = () => {
    return request({
        url: API.connectorsRuntimeQuality,
        method: 'get',
    })
}

export const connectorsDeviceCountsByAgentType = () => {
    return request({
        url: API.connectorsDeviceCountsByAgentType,
        method: 'get',
    })
}

export const deviceInstanceQuality = () => {
    return request({
        url: API.deviceInstanceQuality,
        method: 'get',
    })
}

export const operationsActions = () => {
    return request({
        url: API.operationsActions,
        method: 'get',
    })
}

export const connectorsReportProcessing = () => {
    return request({
        url: API.connectorsReportProcessing,
        method: 'get',
    })
}

export const operationsTasks = (params: {
    category?: string
    page: number
    pageSize: number
    includeArchived?: boolean
    status?: string
    keyword?: string
}) => {
    return request({
        url: API.operationsTasks,
        method: 'get',
        params,
    })
}

export const createOperationsTask = (data: {
    actionId: string
    batchSize?: number
    brokerInstanceId?: string
    connectorId?: string
    mode?: string
    requestId: string
}) => {
    return request({
        url: API.operationsTasks,
        method: 'post',
        data,
    })
}