import { useState } from 'react';
import { notification } from 'antd';
import axios from 'axios';

export const useApiTester = (mockServiceUrl) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  // 从mapping中提取默认值
  const getDefaultValues = (mapping) => {
    if (!mapping) return {};
    
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

      // 构建完整URL
      const fullUrl = `${mockServiceUrl}${values.url.startsWith('/') ? values.url : '/' + values.url}`;

      // 构建请求头
      const headers = {};
      if (values.headers) {
        values.headers.forEach(header => {
          if (header.name && header.value) {
            headers[header.name] = header.value;
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
        } catch {
          data = values.body;
        }
      }

      const startTime = Date.now();

      // 发送请求
      const axiosResponse = await axios({
        method: values.method.toLowerCase(),
        url: fullUrl,
        headers,
        params,
        data,
        timeout: 30000,
        validateStatus: () => true, // 接受所有状态码
      });

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
      };

      setResponse(responseData);

      notification.success({
        message: '请求发送成功',
        description: `状态码: ${responseData.status}, 耗时: ${duration}ms`,
      });

      return responseData;

    } catch (error) {
      console.error('请求发送失败:', error);
      
      const errorResponse = {
        status: error.response?.status || 0,
        statusText: error.response?.statusText || 'Network Error',
        headers: error.response?.headers || {},
        data: error.response?.data || { error: error.message },
        duration: 0,
        size: 0,
        timestamp: new Date().toISOString(),
        error: true,
      };

      setResponse(errorResponse);

      notification.error({
        message: '请求发送失败',
        description: error.message,
      });

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

  return {
    loading,
    response,
    sendRequest,
    copyResponse,
    getDefaultValues,
  };
};
