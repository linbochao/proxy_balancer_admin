import {  request } from '@/services/axios'
const API = {
    regDevicesList: '/oneths/register/api/connectors/instances/registered-devices',  // 获取注册设备列表
    connectorsByAgentType: '/oneths/register/api/connectors/connectors-by-agent-type',   // 获取连接列表（扁平化 connectors）
    connectorsDistribution: '/oneths/register/api/connectors/distribution',  // 获取broker列表（扁平化 connectors）
    deviceRoutes: '/oneths/register/api/device-routes',  // 设备路由查询
    deviceRoutesAvailability: '/oneths/register/api/device-routes/availability',  // 设备路由可用性
    getProxyDetail: '/proxy/detail',
    createProxy: '/proxy/create',
    updateProxy: '/proxy/update',
    deleteProxy: '/proxy/delete',
    brokersList: '/oneths/register/api/brokers',  // 获取broker列表
    brokersDetail: '/oneths/register/api/brokers/detail',  // 获取broker详情
    brokersOverview: '/oneths/register/api/brokers/overview',  // broker概览统计
    brokersDistribution: '/oneths/register/api/brokers/distribution',  // 设备分布倾斜率
    connectorsRuntimeQuality: '/oneths/register/api/connectors/runtime-quality',  // 连接运行质量
    connectorsDeviceCountsByAgentType: '/oneths/register/api/connectors/device-counts-by-agent-type',  // 连接分类统计
    deviceInstanceQuality: '/oneths/register/api/connectors/device-instance-quality',  // 设备运行质量
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