import request from '../utils/request'

// 订单相关接口
export const orderApi = {
    // 获取订单列表
    getList(params: {
        page?: number
        limit?: number
        status?: string
    }) {
        return request({
            url: '/orders',
            method: 'get',
            params
        })
    },

    // 获取订单详情
    getDetail(id: string) {
        return request({
            url: `/orders/${id}`,
            method: 'get'
        })
    },

    // 更新订单状态
    updateStatus(id: string, status: string) {
        return request({
            url: `/orders/${id}/status`,
            method: 'put',
            data: { status }
        })
    }
} 