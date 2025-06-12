import React from 'react';
import dayjs from 'dayjs';

// 格式化时间
export const formatTime = (timestamp, dateString) => {
  if (timestamp) {
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss.SSS');
  }
  if (dateString) {
    return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss.SSS');
  }
  return '-';
};

// 格式化JSON
export const formatJson = (obj) => {
  if (!obj) return '';
  if (typeof obj === 'string') {
    try {
      return JSON.stringify(JSON.parse(obj), null, 2);
    } catch {
      return obj;
    }
  }
  return JSON.stringify(obj, null, 2);
};

// 解析查询参数
export const parseQueryParams = (queryParams) => {
  if (!queryParams) return [];
  return Object.entries(queryParams).map(([key, value]) => ({
    key,
    name: key,
    value: Array.isArray(value.values) ? value.values.join(', ') : value.values || value
  }));
};

// 解析请求头
export const parseHeaders = (headers) => {
  if (!headers) return [];
  return Object.entries(headers).map(([key, value]) => ({
    key,
    name: key,
    value: Array.isArray(value) ? value.join(', ') : value
  }));
};

// 获取匹配的Stub信息
export const getMatchedStubInfo = (request) => {
  if (!request.stubMapping) return null;
  return {
    id: request.stubMapping.id,
    name: request.stubMapping.name,
    priority: request.stubMapping.priority,
    scenario: request.stubMapping.scenarioName,
    description: request.stubMapping.metadata?.wmui?.description
  };
};

// 获取Webhook事件
export const getWebhookEvents = (request) => {
  if (!request.subEvents) return [];
  return request.subEvents.filter(event => 
    event.type === 'WEBHOOK_REQUEST' || event.type === 'WEBHOOK_RESPONSE'
  );
};

// 获取状态颜色
export const getStatusColor = (status) => {
  if (!status) return 'orange';
  if (status >= 200 && status < 300) return 'green';
  if (status >= 400) return 'red';
  return 'orange';
};

// 表格列配置
export const getTableColumns = () => [
  { title: '头部名称', dataIndex: 'name', key: 'name', width: '30%' },
  { 
    title: '头部值', 
    dataIndex: 'value', 
    key: 'value', 
    render: (text) => React.createElement('span', {
      style: { fontFamily: 'monospace', fontSize: '12px' }
    }, text)
  }
];

export const getParamTableColumns = () => [
  { title: '参数名', dataIndex: 'name', key: 'name', width: '30%' },
  { 
    title: '参数值', 
    dataIndex: 'value', 
    key: 'value', 
    render: (text) => React.createElement('span', {
      style: { fontFamily: 'monospace', fontSize: '12px' }
    }, text)
  }
];
