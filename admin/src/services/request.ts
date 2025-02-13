import axios from 'axios';
import { message } from 'antd';

// 创建 axios 实例
const request = axios.create({
  baseURL: 'http://localhost:8001/api/v1',
  timeout: 15000,
  validateStatus: (status) => status >= 200 && status < 300,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    console.log('Request Config:', config);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    message.error('请求发送失败');
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    console.log('Response:', response);
    return response.data;
  },
  (error) => {
    console.error('Response Error:', error);
    console.error('Error Config:', error.config);
    console.error('Error Response:', error.response);

    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data?.detail || '请求失败';
      
      switch (status) {
        case 400:
          message.error(errorMessage);
          break;
        case 401:
          message.error('登录已过期，请重新登录');
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          message.error('没有权限访问');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器错误，请稍后重试');
          break;
        default:
          message.error(errorMessage || '未知错误');
      }
    } else if (error.request) {
      message.error('服务器无响应，请检查网络连接');
    } else {
      message.error('请求配置错误');
    }
    return Promise.reject(error);
  }
);

export { request };
