import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Table,
  Tag,
  notification,
  Popconfirm,
} from 'antd';
import {
  FileTextOutlined,
  ReloadOutlined,
  ClearOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { scenariosApi } from '../services/wiremockApi';

const { Title, Text } = Typography;

const Scenarios = () => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(false);

  // 获取所有场景
  const fetchScenarios = async () => {
    setLoading(true);
    try {
      const response = await scenariosApi.getAll();
      setScenarios(response.data.scenarios || []);
    } catch (error) {
      notification.error({
        message: '获取场景失败',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  // 重置所有场景
  const handleResetAll = async () => {
    try {
      await scenariosApi.resetAll();
      notification.success({
        message: '重置成功',
        description: '所有场景已重置到初始状态',
      });
      fetchScenarios();
    } catch (error) {
      notification.error({
        message: '重置失败',
        description: error.message,
      });
    }
  };

  // 重置特定场景
  const handleReset = async (name) => {
    try {
      await scenariosApi.reset(name);
      notification.success({
        message: '重置成功',
        description: `场景 "${name}" 已重置`,
      });
      fetchScenarios();
    } catch (error) {
      notification.error({
        message: '重置失败',
        description: error.message,
      });
    }
  };

  const columns = [
    {
      title: '场景名称',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: '当前状态',
      dataIndex: 'state',
      key: 'state',
      render: (state) => (
        <Tag color="blue">{state || 'Started'}</Tag>
      ),
    },
    {
      title: '可能状态',
      dataIndex: 'possibleStates',
      key: 'possibleStates',
      render: (states) => (
        <Space>
          {states?.map(state => (
            <Tag key={state} color="geekblue">{state}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Popconfirm
          title={`确定要重置场景 "${record.name}" 吗？`}
          onConfirm={() => handleReset(record.name)}
          okText="确定"
          cancelText="取消"
        >
          <Button
            type="text"
            icon={<ClearOutlined />}
            title="重置场景"
          >
            重置
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              场景管理
            </Title>
            <Text type="secondary">管理有状态的模拟场景</Text>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div></div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchScenarios} loading={loading}>
            刷新
          </Button>
          <Popconfirm
            title="确定要重置所有场景吗？"
            onConfirm={handleResetAll}
            okText="确定"
            cancelText="取消"
          >
            <Button icon={<ClearOutlined />}>
              重置所有场景
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Card className="content-card">
        {scenarios.length > 0 ? (
          <Table
            columns={columns}
            dataSource={scenarios}
            rowKey="name"
            loading={loading}
            pagination={false}
          />
        ) : (
          <div className="empty-state">
            <FileTextOutlined />
            <h3>暂无场景</h3>
            <p>当前没有配置任何场景，场景用于管理有状态的 API 模拟</p>
          </div>
        )}
      </Card>

      <Card title="场景说明" className="content-card" style={{ marginTop: 16 }}>
        <div>
          <Title level={4}>什么是场景？</Title>
          <p>
            场景（Scenarios）是 WireMock 中用于管理有状态模拟的功能。通过场景，您可以：
          </p>
          <ul>
            <li>创建具有多个状态的 API 模拟</li>
            <li>根据请求历史改变响应行为</li>
            <li>模拟复杂的业务流程和状态转换</li>
            <li>实现条件性的响应逻辑</li>
          </ul>
          
          <Title level={4} style={{ marginTop: 24 }}>如何使用场景？</Title>
          <p>
            在创建 Stub 映射时，您可以指定场景名称和状态转换规则：
          </p>
          <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
{`{
  "scenarioName": "购物车流程",
  "requiredScenarioState": "Started",
  "newScenarioState": "商品已添加",
  "request": {
    "method": "POST",
    "url": "/cart/add"
  },
  "response": {
    "status": 200,
    "body": "商品添加成功"
  }
}`}
          </pre>
        </div>
      </Card>
    </div>
  );
};

export default Scenarios;
