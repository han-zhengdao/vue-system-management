import request from '../utils/request'

// 分类相关接口
export const categoryApi = {
    // 获取分类列表
    getList() {
        return request({
            url: '/categories',
            method: 'get'
        })
    },

    // 创建分类
    create(data: {
        name: string
        description: string
        image: string
    }) {
        return request({
            url: '/categories',
            method: 'post',
            data
        })
    }
} 