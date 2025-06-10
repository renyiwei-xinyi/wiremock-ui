import React from 'react';
import { Button, Space, Tag, Typography, Popconfirm } from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  CopyOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

// 获取方法标签样式
const getMethodTag = (method) => {
  const colors = {
    GET: 'blue', POST: 'green', PUT: 'orange', DELETE: 'red',
    PATCH: 'purple', HEAD: 'cyan', OPTIONS: 'magenta',
  };
  return (
    <Tag color={colors[method] || 'default'}>
      {method}
    </Tag>
  );
};

// 创建表格列配置
export const createColumns = (handlers) => {
  const { handleView, handleEdit, handleCopy, handleDelete } = handlers;

  return [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div>{text || `${record.request?.method} ${record.request?.urlPath}`}</div>
          {record.comment && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.comment}
            </Text>
          )}
        </div>
      ),
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
      dataIndex: ['request'],
      key: 'url',
      render: (request) => {
        const url = request?.urlPath || request?.urlPathPattern || request?.urlPattern || request?.url || request?.urlEqualTo || '-';
        return <Text code>{url}</Text>;
      },
    },
    {
      title: '状态码',
      dataIndex: ['response', 'status'],
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status >= 200 && status < 300 ? 'green' : status >= 400 ? 'red' : 'orange'}>
          {status}
        </Tag>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority) => priority || 5,
    },
    {
      title: '场景',
      dataIndex: 'scenarioName',
      key: 'scenario',
      width: 100,
      render: (scenario) => scenario ? <Tag color="blue">{scenario}</Tag> : '-',
    },
    {
      title: '操作',
      key: 'actions',
      width: 250,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} title="查看详情" />
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} title="编辑" />
          <Button type="text" icon={<CopyOutlined />} onClick={() => handleCopy(record)} title="复制" />
          <Popconfirm
            title="确定要删除这个映射吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} title="删除" />
          </Popconfirm>
        </Space>
      ),
    },
  ];
};
