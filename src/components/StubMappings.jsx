import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Typography,
  Input,
  Modal,
  Form,
  Select,
  Card,
  Tag,
  Popconfirm,
  notification,
  Drawer,
  Row,
  Col,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  ClearOutlined,
  ExportOutlined,
  ImportOutlined,
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { stubMappingsApi } from '../services/wiremockApi';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const StubMappings = () => {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedMapping, setSelectedMapping] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm();

  // 获取所有映射
  const fetchMappings = async () => {
    setLoading(true);
    try {
      const response = await stubMappingsApi.getAll();
      setMappings(response.data.mappings || []);
    } catch (error) {
      notification.error({
        message: '获取映射失败',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  // 创建新映射
  const handleCreate = () => {
    setSelectedMapping(null);
    form.resetFields();
    form.setFieldsValue({
      request: {
        method: 'GET',
        url: '/',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{}',
      },
    });
    setModalVisible(true);
  };

  // 编辑映射
  const handleEdit = (record) => {
    setSelectedMapping(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  // 查看映射详情
  const handleView = (record) => {
    setSelectedMapping(record);
    setDrawerVisible(true);
  };

  // 删除映射
  const handleDelete = async (id) => {
    try {
      await stubMappingsApi.delete(id);
      notification.success({
        message: '删除成功',
        description: '映射已成功删除',
      });
      fetchMappings();
    } catch (error) {
      notification.error({
        message: '删除失败',
        description: error.message,
      });
    }
  };

  // 保存映射
  const handleSave = async (values) => {
    try {
      if (selectedMapping) {
        await stubMappingsApi.update(selectedMapping.id, values);
        notification.success({
          message: '更新成功',
          description: '映射已成功更新',
        });
      } else {
        await stubMappingsApi.create(values);
        notification.success({
          message: '创建成功',
          description: '映射已成功创建',
        });
      }
      setModalVisible(false);
      fetchMappings();
    } catch (error) {
      notification.error({
        message: selectedMapping ? '更新失败' : '创建失败',
        description: error.message,
      });
    }
  };

  // 清空所有映射
  const handleClearAll = async () => {
    try {
      await stubMappingsApi.deleteAll();
      notification.success({
        message: '清空成功',
        description: '所有映射已被删除',
      });
      fetchMappings();
    } catch (error) {
      notification.error({
        message: '清空失败',
        description: error.message,
      });
    }
  };

  // 重置映射
  const handleReset = async () => {
    try {
      await stubMappingsApi.reset();
      notification.success({
        message: '重置成功',
        description: '映射已重置到初始状态',
      });
      fetchMappings();
    } catch (error) {
      notification.error({
        message: '重置失败',
        description: error.message,
      });
    }
  };

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

  // 过滤映射
  const filteredMappings = mappings.filter((mapping) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      mapping.request?.url?.toLowerCase().includes(searchLower) ||
      mapping.request?.method?.toLowerCase().includes(searchLower) ||
      mapping.name?.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => text || `${record.request?.method} ${record.request?.url}`,
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
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            title="查看详情"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="编辑"
          />
          <Popconfirm
            title="确定要删除这个映射吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="删除"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Stub 映射管理
            </Title>
            <Text type="secondary">管理 API 模拟映射规则</Text>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <Space>
          <Search
            placeholder="搜索映射..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchMappings} loading={loading}>
            刷新
          </Button>
          <Button icon={<ExportOutlined />}>
            导出
          </Button>
          <Button icon={<ImportOutlined />}>
            导入
          </Button>
          <Popconfirm
            title="确定要重置所有映射吗？"
            onConfirm={handleReset}
            okText="确定"
            cancelText="取消"
          >
            <Button icon={<ClearOutlined />}>
              重置
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确定要清空所有映射吗？此操作不可恢复！"
            onConfirm={handleClearAll}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />}>
              清空
            </Button>
          </Popconfirm>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建映射
          </Button>
        </Space>
      </div>

      <Card className="content-card">
        <Table
          columns={columns}
          dataSource={filteredMappings}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredMappings.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 创建/编辑映射模态框 */}
      <Modal
        title={selectedMapping ? '编辑映射' : '创建映射'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="映射名称"
                name="name"
              >
                <Input placeholder="可选，用于标识映射" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="优先级"
                name="priority"
                initialValue={5}
              >
                <Input type="number" placeholder="数字越小优先级越高" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>请求匹配条件</Divider>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="HTTP 方法"
                name={['request', 'method']}
                rules={[{ required: true, message: '请选择HTTP方法' }]}
              >
                <Select>
                  <Option value="GET">GET</Option>
                  <Option value="POST">POST</Option>
                  <Option value="PUT">PUT</Option>
                  <Option value="DELETE">DELETE</Option>
                  <Option value="PATCH">PATCH</Option>
                  <Option value="HEAD">HEAD</Option>
                  <Option value="OPTIONS">OPTIONS</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                label="URL 路径"
                name={['request', 'url']}
                rules={[{ required: true, message: '请输入URL路径' }]}
              >
                <Input placeholder="/api/users" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>响应配置</Divider>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="状态码"
                name={['response', 'status']}
                rules={[{ required: true, message: '请输入状态码' }]}
              >
                <Input type="number" placeholder="200" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                label="Content-Type"
                name={['response', 'headers', 'Content-Type']}
              >
                <Select>
                  <Option value="application/json">application/json</Option>
                  <Option value="text/html">text/html</Option>
                  <Option value="text/plain">text/plain</Option>
                  <Option value="application/xml">application/xml</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="响应体"
            name={['response', 'body']}
          >
            <div className="json-editor">
              <Editor
                height="200px"
                defaultLanguage="json"
                theme="vs-light"
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                }}
              />
            </div>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {selectedMapping ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看映射详情抽屉 */}
      <Drawer
        title="映射详情"
        placement="right"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedMapping && (
          <div>
            <Title level={4}>基本信息</Title>
            <p><strong>ID:</strong> {selectedMapping.id}</p>
            <p><strong>名称:</strong> {selectedMapping.name || '未命名'}</p>
            <p><strong>优先级:</strong> {selectedMapping.priority || 5}</p>
            
            <Divider />
            
            <Title level={4}>请求匹配</Title>
            <div className="json-editor">
              <Editor
                height="200px"
                defaultLanguage="json"
                value={JSON.stringify(selectedMapping.request, null, 2)}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
            
            <Divider />
            
            <Title level={4}>响应配置</Title>
            <div className="json-editor">
              <Editor
                height="200px"
                defaultLanguage="json"
                value={JSON.stringify(selectedMapping.response, null, 2)}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default StubMappings;
