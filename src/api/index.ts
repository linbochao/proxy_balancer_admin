import {  request } from '@/services/axios'
const API = {
    regDevicesList: '/oneths/register/api/connectors/instances/registered-devices',
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