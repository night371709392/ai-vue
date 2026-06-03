import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建axios实例
const service = axios.create({
  baseURL: '/api',
  timeout: 5000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['token'] = token
    }
    return config
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const { data, config } = response
    if (data.code === '200' || data.code === 200) {
      return data.data
    }

    if (data.code === '-1' || data.code === -1) {
      const isAuthError = (data.msg || '').includes('登录') || (data.msg || '').includes('token') || (data.msg || '').includes('认证')
      if (isAuthError && !config.url?.includes('/login')) {
        ElMessage.error(data.msg || '登录状态已过期，请重新登录')
        localStorage.removeItem('mh-auth')
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        router.push('/login')
        return Promise.reject(Object.assign(new Error(data.msg || '登录状态已过期'), { response: data }))
      }
      if (config.url?.includes('/login')) {
        ElMessage.error(data.msg || '登录失败')
        return Promise.reject(Object.assign(new Error(data.msg || '登录失败'), { response: data }))
      }
      ElMessage.error(data.msg || '请求失败')
      return Promise.reject(Object.assign(new Error(data.msg || '请求失败'), { response: data }))
    }

    ElMessage.error(data.msg || '请求失败')
    return Promise.reject(Object.assign(new Error(data.msg || '请求失败'), { response: data }))
  },
  error => {
    const msg = error.response?.data?.msg || error.message || '网络请求失败'
    ElMessage.error(msg)
    return Promise.reject(error)
  },
)

export default service