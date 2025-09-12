import React from 'react';
import { Button, Space, Tag, Typography, Popconfirm, Switch } from 'antd';
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
  const { handleView, handleEdit, handleCopy, handleDelete, handleToggleStatus } = handlers;

  return [
    {
      title: '状态',
      key: 'enabled',
      width: 80,
      render: (_, record) => (
        <Switch
          checked={record.response?.fromConfiguredStub !== false}
          onChange={(checked) => handleToggleStatus(record, checked)}
          size="small"
          title={record.response?.fromConfiguredStub !== false ? '已启用' : '已禁用'}
        />
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ 
            opacity: record.response?.fromConfiguredStub !== false ? 1 : 0.6,
            textDecoration: record.response?.fromConfiguredStub === false ? 'line-through' : 'none'
          }}>
            {text || `${record.request?.method} ${record.request?.urlPath || record.request?.urlPathPattern}`}
          </div>
          {record.metadata?.wmui?.description && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.metadata?.wmui?.description}
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
        return (
          <Text code style={{ wordBreak: 'break-all' }}>
            {url.length > 50 ? `${url.substring(0, 47)}...` : url}
          </Text>
        );
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
      width: 280,
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