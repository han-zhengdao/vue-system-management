import request from '@/utils/request';

// 用户登录
export function login(data: any) {
    return request({
        url: '/auth/login',
        method: 'post',
        data
    });
}

// 商品相关接口
export function getProducts(params: any) {
    return request({
        url: '/products',
        method: 'get',
        params
    });
}

export function createProduct(data: any) {
    return request({
        url: '/products',
        method: 'post',
        data
    });
}

export function updateProduct(id: string, data: any) {
    return request({
        url: `/products/${id}`,
        method: 'put',
        data
    });
}

// 分类相关接口
export function getCategories() {
    return request({
        url: '/categories',
        method: 'get'
    });
}

// 订单相关接口
export function getOrders(params: any) {
    return request({
        url: '/orders',
        method: 'get',
        params
    });
}

// 用户相关接口
export function getUsers(params: any) {
    return request({
        url: '/users',
        method: 'get',
        params
    });
}

// 文件上传接口
export function uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return request({
        url: '/upload',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}
