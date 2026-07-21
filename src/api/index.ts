import {  request } from '@/services/axios'
const API = {
    getProxyList: '/proxy/list',
    getProxyDetail: '/proxy/detail',
    createProxy: '/proxy/create',
    updateProxy: '/proxy/update',
    deleteProxy: '/proxy/delete',
}

export const getProxyList = (data: any) => {
    return request({
        url: API.getProxyList,
        method: 'post',
        data,
    })
}