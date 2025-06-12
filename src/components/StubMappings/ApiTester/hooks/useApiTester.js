import { useState } from 'react';
import { notification } from 'antd';
import axios from 'axios';

export const useApiTester = (mockServiceUrl) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [requestHistory, setRequestHistory] = useState([]);

  // 从mapping中提取默认值
  const getDefaultValues = (mapping) => {
    if (!mapping) return { method: 'GET', url: '/', headers: [], queryParams: [], body: '' };
    
    const request = mapping.request || {};
    return {
      method: request.method || 'GET',
      url: request.urlPath || request.urlPathPattern || request.url || '/',
      headers: request.headers ? Object.entries(request.headers).map(([key, value]) => ({
        key: Math.random().toString(36).substr(2, 9),
        name: key,
        value: typeof value === 'object' ? value.equalTo || value.matches || JSON.stringify(value) : value
      })) : [],
      queryParams: request.queryParameters ? Object.entries(request.queryParameters).map(([key, value]) => ({
        key: Math.random().toString(36).substr(2, 9),
        name: key,
        value: typeof value === 'object' ? value.equalTo || value.matches || JSON.stringify(value) : value
      })) : [],
      body: request.bodyPatterns ? JSON.stringify(request.bodyPatterns[0], null, 2) : ''
    };
  };

  // 发送请求
  const sendRequest = async (values) => {
    try {
      setLoading(true);
      setResponse(null);

      // 验证必要字段
      if (!values.method) {
        throw new Error('请选择请求方法');
      }
      if (!values.url) {
        throw new Error('请输入请求URL');
      }

      // 构建完整URL
      const fullUrl = `${mockServiceUrl}${values.url.startsWith('/') ? values.url : '/' + values.url}`;

      // 构建请求头 - 使用简单的请求头避免CORS预检
      const headers = {};
      
      // 只有在用户明确设置了Content-Type时才添加，否则让浏览器自动设置
      let hasContentType = false;
      if (values.headers) {
        values.headers.forEach(header => {
          if (header.name && header.value) {
            headers[header.name] = header.value;
            if (header.name.toLowerCase() === 'content-type') {
              hasContentType = true;
            }
          }
        });
      }

      // 构建查询参数
      const params = {};
      if (values.queryParams) {
        values.queryParams.forEach(param => {
          if (param.name && param.value) {
            params[param.name] = param.value;
          }
        });
      }

      // 构建请求体
      let data = null;
      if (values.body && ['POST', 'PUT', 'PATCH'].includes(values.method)) {
        try {
          data = JSON.parse(values.body);
          // 如果是JSON数据且用户没有设置Content-Type，则设置为application/json
          if (!hasContentType) {
            headers['Content-Type'] = 'application/json';
          }
        } catch {
          data = values.body;
          // 如果是纯文本且用户没有设置Content-Type，则设置为text/plain
          if (!hasContentType) {
            headers['Content-Type'] = 'text/plain';
          }
        }
      }

      const startTime = Date.now();

      // 记录请求信息用于调试
      const requestInfo = {
        method: values.method,
        url: fullUrl,
        headers,
        params,
        data,
        timestamp: new Date().toISOString(),
      };

      console.log('发送请求:', requestInfo);
      console.log('请求方法验证:', values.method, typeof values.method);

      // 创建axios配置 - 使用最简单的配置避免CORS预检
      const axiosConfig = {
        method: values.method.toLowerCase(),
        url: fullUrl,
        timeout: 30000,
        validateStatus: () => true, // 接受所有状态码
        // 不设置withCredentials，让它保持默认值
      };

      // 只在有参数时才添加params
      if (Object.keys(params).length > 0) {
        axiosConfig.params = params;
      }

      // 只在有请求头时才添加headers
      if (Object.keys(headers).length > 0) {
        axiosConfig.headers = headers;
      }

      // 只在有请求体时才添加data
      if (data !== null) {
        axiosConfig.data = data;
      }

      console.log('Axios配置:', axiosConfig);

      // 发送请求
      const axiosResponse = await axios(axiosConfig);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 处理响应
      const responseData = {
        status: axiosResponse.status,
        statusText: axiosResponse.statusText,
        headers: axiosResponse.headers,
        data: axiosResponse.data,
        duration,
        size: JSON.stringify(axiosResponse.data).length,
        timestamp: new Date().toISOString(),
        request: requestInfo,
      };

      setResponse(responseData);

      // 添加到历史记录
      setRequestHistory(prev => [{
        id: Date.now(),
        request: requestInfo,
        response: responseData,
        success: true,
      }, ...prev.slice(0, 9)]); // 保留最近10条记录

      notification.success({
        message: '请求发送成功',
        description: `状态码: ${responseData.status}, 耗时: ${duration}ms`,
      });

      return responseData;

    } catch (error) {
      console.error('请求发送失败:', error);
      console.error('错误详情:', {
        message: error.message,
        code: error.code,
        config: error.config,
        request: error.request,
        response: error.response
      });
      
      // 详细的错误信息
      let errorMessage = error.message;
      let errorDetails = {};

      if (error.response) {
        // 服务器响应了错误状态码
        errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
        errorDetails = {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          actualMethod: error.config?.method?.toUpperCase() || 'UNKNOWN',
          requestUrl: error.config?.url || 'UNKNOWN',
        };
        console.log('服务器响应错误，实际发送的方法:', error.config?.method);
        console.log('实际请求URL:', error.config?.url);
      } else if (error.request) {
        // 请求已发出但没有收到响应
        errorMessage = '网络错误：无法连接到服务器';
        errorDetails = {
          code: error.code,
          message: error.message,
          actualMethod: error.config?.method?.toUpperCase() || 'UNKNOWN',
          requestUrl: error.config?.url || 'UNKNOWN',
        };
        console.log('网络错误，实际发送的方法:', error.config?.method);
        console.log('实际请求URL:', error.config?.url);
      } else {
        // 请求配置错误
        errorMessage = `请求配置错误: ${error.message}`;
        errorDetails = {
          actualMethod: values.method,
          requestUrl: `${mockServiceUrl}${values.url.startsWith('/') ? values.url : '/' + values.url}`,
        };
      }

      const errorResponse = {
        status: error.response?.status || 0,
        statusText: error.response?.statusText || 'Network Error',
        headers: error.response?.headers || {},
        data: error.response?.data || { error: errorMessage, details: errorDetails },
        duration: 0,
        size: 0,
        timestamp: new Date().toISOString(),
        error: true,
        request: {
          method: values.method,
          url: `${mockServiceUrl}${values.url.startsWith('/') ? values.url : '/' + values.url}`,
          timestamp: new Date().toISOString(),
          actualMethod: error.config?.method?.toUpperCase() || values.method,
          actualUrl: error.config?.url || `${mockServiceUrl}${values.url.startsWith('/') ? values.url : '/' + values.url}`,
        },
      };

      setResponse(errorResponse);

      // 添加到历史记录
      setRequestHistory(prev => [{
        id: Date.now(),
        request: errorResponse.request,
        response: errorResponse,
        success: false,
        error: errorMessage,
      }, ...prev.slice(0, 9)]);

      // 特殊处理CORS预检问题
      if (error.response?.status === 404 && error.config?.method === 'options') {
        notification.error({
          message: 'CORS预检请求失败',
          description: `服务器不支持OPTIONS请求。实际请求: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
          duration: 10,
        });
      } else if (error.config?.method && error.config.method !== values.method.toLowerCase()) {
        notification.error({
          message: '请求方法不匹配',
          description: `期望发送: ${values.method}, 实际发送: ${error.config.method.toUpperCase()}`,
          duration: 8,
        });
      } else {
        notification.error({
          message: '请求发送失败',
          description: errorMessage,
          duration: 5,
        });
      }

      return errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // 复制响应数据
  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2)).then(() => {
        notification.success({ message: '响应数据已复制到剪贴板' });
      });
    }
  };

  // 复制请求为cURL命令
  const copyAsCurl = () => {
    if (response && response.request) {
      const req = response.request;
      let curl = `curl -X ${req.method} '${req.url}'`;
      
      // 添加请求头
      if (req.headers && Object.keys(req.headers).length > 0) {
        Object.entries(req.headers).forEach(([key, value]) => {
          curl += ` -H '${key}: ${value}'`;
        });
      }
      
      // 添加请求体
      if (req.data) {
        curl += ` -d '${typeof req.data === 'string' ? req.data : JSON.stringify(req.data)}'`;
      }
      
      navigator.clipboard.writeText(curl).then(() => {
        notification.success({ message: 'cURL命令已复制到剪贴板' });
      });
    }
  };

  // 从历史记录重新发送请求
  const resendFromHistory = (historyItem) => {
    return sendRequest({
      method: historyItem.request.method,
      url: historyItem.request.url.replace(mockServiceUrl, ''),
      headers: Object.entries(historyItem.request.headers || {}).map(([name, value]) => ({
        key: Math.random().toString(36).substr(2, 9),
        name,
        value
      })),
      queryParams: Object.entries(historyItem.request.params || {}).map(([name, value]) => ({
        key: Math.random().toString(36).substr(2, 9),
        name,
        value
      })),
      body: historyItem.request.data ? (typeof historyItem.request.data === 'string' ? historyItem.request.data : JSON.stringify(historyItem.request.data, null, 2)) : ''
    });
  };

  // 清空历史记录
  const clearHistory = () => {
    setRequestHistory([]);
    notification.success({ message: '历史记录已清空' });
  };

  return {
    loading,
    response,
    requestHistory,
    sendRequest,
    copyResponse,
    copyAsCurl,
    resendFromHistory,
    clearHistory,
    getDefaultValues,
  };
};
