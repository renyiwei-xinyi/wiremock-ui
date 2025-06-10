import React from 'react';
import { Button, Tag, Typography } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

// 获取方法标签样式
const getMethodTag = (method) => {
  const colors = {
    GET: 'blue',
    POST: 'green',
    PUT: 'orange',
    DELETE: 'red',
    PATCH: 'purple',
    HEAD: 'cyan',
    OPTIONS: 'magenta',
  };
  return (
    <Tag color={colors[method] || 'default'} className={`method-${method?.toLowerCase()}`}>
      {method}
    </Tag>
  );
};

// 获取状态码标签样式
const getStatusTag = (status) => {
  let color = 'default';
  if (status >= 200 && status < 300) color = 'green';
  else if (status >= 300 && status < 400) color = 'blue';
  else if (status >= 400 && status < 500) color = 'orange';
  else if (status >= 500) color = 'red';

  return <Tag color={color}>{status}</Tag>;
};

// 获取时间字段值
const getTimeValue = (record) => {
  // 尝试多种可能的时间字段名
  return record.loggedDate || 
         record.timestamp || 
         record.receivedAt || 
         record.time || 
         record.date ||
         record.loggedDateString ||
         null;
};

// 创建表格列配置
export const createColumns = (handleView) => [
  {
    title: '时间',
    key: 'time',
    width: 180,
    render: (_, record) => {
      const timeValue = getTimeValue(record);
      if (!timeValue) return '-';
      
      // 处理不同的时间格式
      try {
        // 如果是时间戳（毫秒）
        if (typeof timeValue === 'number') {
          return dayjs(timeValue).format('YYYY-MM-DD HH:mm:ss');
        }
        // 如果是字符串格式的时间
        if (typeof timeValue === 'string') {
          return dayjs(timeValue).format('YYYY-MM-DD HH:mm:ss');
        }
        return '-';
      } catch (error) {
        console.warn('时间格式解析失败:', timeValue, error);
        return timeValue.toString();
      }
    },
    sorter: (a, b) => {
      const timeA = getTimeValue(a);
      const timeB = getTimeValue(b);
      
      if (!timeA && !timeB) return 0;
      if (!timeA) return 1;
      if (!timeB) return -1;
      
      try {
        const dateA = new Date(timeA);
        const dateB = new Date(timeB);
        return dateB - dateA; // 降序排列，最新的在前
      } catch (error) {
        return 0;
      }
    },
    defaultSortOrder: 'descend',
  },
  {
    title: '方法',
    dataIndex: ['request', 'method'],
    key: 'method',
    width: 80,
    render: (method) => getMethodTag(method),
  },
  {
    title: 'URL',
    key: 'url',
    render: (_, record) => {
      const url = record.request?.url || 
                  record.request?.absoluteUrl || 
                  record.request?.path || 
                  record.url || 
                  '-';
      return <Text code>{url}</Text>;
    },
  },
  {
    title: '状态码',
    key: 'status',
    width: 80,
    render: (_, record) => {
      const status = record.response?.status || 
                    record.responseDefinition?.status || 
                    record.status || 
                    0;
      return getStatusTag(status);
    },
  },
  {
    title: '匹配状态',
    dataIndex: 'wasMatched',
    key: 'wasMatched',
    width: 100,
    render: (matched) => (
      <Tag color={matched ? 'green' : 'red'}>
        {matched ? '已匹配' : '未匹配'}
      </Tag>
    ),
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (_, record) => (
      <Button
        type="text"
        icon={<EyeOutlined />}
        onClick={() => handleView(record)}
        title="查看详情"
      />
    ),
  },
];
