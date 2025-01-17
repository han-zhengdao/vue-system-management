import request from '@/utils/request'

// 商品相关接口
export function getProducts(params: any) {
    return request({
        url: '/products',
        method: 'get',
        params
    })
}

export function getProductDetail(id: string) {
    return request({
        url: `/products/${id}`,
        method: 'get'
    })
}

export function createProduct(data: any) {
    return request({
        url: '/products',
        method: 'post',
        data
    })
}

export function updateProduct(id: string, data: any) {
    return request({
        url: `/products/${id}`,
        method: 'put',
        data
    })
}

export function deleteProduct(id: string) {
    return request({
        url: `/products/${id}`,
        method: 'delete'
    })
}

// 商品分类接口
export function getCategories() {
    return request({
        url: '/categories',
        method: 'get'
    })
}

export function createCategory(data: any) {
    return request({
        url: '/categories',
        method: 'post',
        data
    })
}

export function updateCategory(id: string, data: any) {
    return request({
        url: `/categories/${id}`,
        method: 'put',
        data
    })
}

export function deleteCategory(id: string) {
    return request({
        url: `/categories/${id}`,
        method: 'delete'
    })
}

// 文件上传接口
export function uploadFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request({
        url: '/upload',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
} 