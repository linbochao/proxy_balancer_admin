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