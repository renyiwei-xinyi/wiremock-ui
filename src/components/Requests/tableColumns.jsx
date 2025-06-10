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

// 创建表格列配置
export const createColumns = (handleView) => [
  {
    title: '时间',
    dataIndex: 'loggedDate',
    key: 'loggedDate',
    width: 180,
    render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-',
    sorter: (a, b) => {
      const dateA = a.loggedDate ? new Date(a.loggedDate) : new Date(0);
      const dateB = b.loggedDate ? new Date(b.loggedDate) : new Date(0);
      return dateA - dateB;
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
    dataIndex: ['request', 'url'],
    key: 'url',
    render: (url) => <Text code>{url}</Text>,
  },
  {
    title: '状态码',
    dataIndex: ['response', 'status'],
    key: 'status',
    width: 80,
    render: (status) => getStatusTag(status),
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
