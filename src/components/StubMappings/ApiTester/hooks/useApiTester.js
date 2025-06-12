import { useState } from 'react';
import { notification } from 'antd';

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

  // 使用原生fetch API发送请求，避免axios的CORS预检问题
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
      let fullUrl = `${mockServiceUrl}${values.url.startsWith('/') ? values.url : '/' + values.url}`;

      // 构建查询参数
      const urlParams = new URLSearchParams();
      if (values.queryParams) {
        values.queryParams.forEach(param => {
          if (param.name && param.value) {
            urlParams.append(param.name, param.value);
          }
        });
      }
      
      if (urlParams.toString()) {
        fullUrl += '?' + urlParams.toString();
      }

      // 构建请求头 - 只添加用户明确设置的请求头
      const headers = {};
      if (values.headers) {
        values.headers.forEach(header => {
          if (header.name && header.value) {
            headers[header.name] = header.value;
          }
        });
      }

      // 构建请求体
      let body = null;
      if (values.body && ['POST', 'PUT', 'PATCH'].includes(values.method)) {
        body = values.body;
        
        // 只有在用户没有设置Content-Type时才自动设置
        if (!headers['Content-Type'] && !headers['content-type']) {
          try {
            JSON.parse(values.body);
            headers['Content-Type'] = 'application/json';
          } catch {
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
        body,
        timestamp: new Date().toISOString(),
      };

      console.log('=== 发送请求调试信息 ===');
      console.log('表单原始值:', values);
      console.log('请求方法:', values.method, typeof values.method);
      console.log('完整URL:', fullUrl);
      console.log('请求头:', headers);
      console.log('请求体:', body);
      console.log('========================');

      // 使用fetch API发送请求
      const fetchOptions = {
        method: values.method,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        body: body,
        mode: 'cors', // 明确设置CORS模式
        credentials: 'omit', // 不发送凭据，避免复杂的CORS
      };

      console.log('Fetch选项:', fetchOptions);

      const fetchResponse = await fetch(fullUrl, fetchOptions);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 读取响应数据
      let responseData;
      const contentType = fetchResponse.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          responseData = await fetchResponse.json();
        } catch {
          responseData = await fetchResponse.text();
        }
      } else {
        responseData = await fetchResponse.text();
      }

      // 构建响应头对象
      const responseHeaders = {};
      fetchResponse.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // 处理响应
      const responseObj = {
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        headers: responseHeaders,
        data: responseData,
        duration,
        size: JSON.stringify(responseData).length,
        timestamp: new Date().toISOString(),
        request: requestInfo,
      };

      setResponse(responseObj);

      // 添加到历史记录
      setRequestHistory(prev => [{
        id: Date.now(),
        request: requestInfo,
        response: responseObj,
        success: fetchResponse.ok,
      }, ...prev.slice(0, 9)]); // 保留最近10条记录

      if (fetchResponse.ok) {
        notification.success({
          message: '请求发送成功',
          description: `状态码: ${responseObj.status}, 耗时: ${duration}ms`,
        });
      } else {
        notification.warning({
          message: '请求已发送',
          description: `状态码: ${responseObj.status} ${responseObj.statusText}, 耗时: ${duration}ms`,
        });
      }

      return responseObj;

    } catch (error) {
      console.error('=== 请求发送失败 ===');
      console.error('错误对象:', error);
      console.error('错误消息:', error.message);
      console.error('错误类型:', error.name);
      console.error('==================');
      
      // 详细的错误信息
      let errorMessage = error.message;
      let errorDetails = {
        name: error.name,
        message: error.message,
        type: 'fetch_error'
      };

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = '网络错误：无法连接到服务器';
        errorDetails.type = 'network_error';
      } else if (error.name === 'AbortError') {
        errorMessage = '请求超时';
        errorDetails.type = 'timeout_error';
      }

      const errorResponse = {
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: { error: errorMessage, details: errorDetails },
        duration: 0,
        size: 0,
        timestamp: new Date().toISOString(),
        error: true,
        request: {
          method: values.method,
          url: `${mockServiceUrl}${values.url.startsWith('/') ? values.url : '/' + values.url}`,
          timestamp: new Date().toISOString(),
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

      notification.error({
        message: '请求发送失败',
        description: errorMessage,
        duration: 5,
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
      if (req.body) {
        curl += ` -d '${req.body}'`;
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
      url: historyItem.request.url.replace(mockServiceUrl, '').split('?')[0], // 移除查询参数
      headers: Object.entries(historyItem.request.headers || {}).map(([name, value]) => ({
        key: Math.random().toString(36).substr(2, 9),
        name,
        value
      })),
      queryParams: [], // 暂时简化，不从URL中解析查询参数
      body: historyItem.request.body || ''
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
