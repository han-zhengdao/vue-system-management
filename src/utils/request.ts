import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 5000
})

// 请求拦截器
request.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    response => {
        const res = response.data
        if (res.code !== 0) {
            ElMessage.error(res.message || '请求失败')
            return Promise.reject(new Error(res.message || '请求失败'))
        }
        return res.data
    },
    error => {
        if (error.response?.status === 401) {
            // token 过期，清除登录信息并跳转到登录页
            localStorage.clear()
            window.location.href = '/login'
        }
        ElMessage.error(error.message || '请求失败')
        return Promise.reject(error)
    }
)

export default request
