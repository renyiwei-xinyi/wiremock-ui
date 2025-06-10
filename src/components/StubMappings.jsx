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
  Tabs,
  InputNumber,
  Upload,
  Collapse,
  Descriptions,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  CopyOutlined,
  DownloadOutlined,
  UploadOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { stubMappingsApi } from '../services/wiremockApi';

const { Title, Text } = Typography;
const { Search, TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const StubMappings = () => {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedMapping, setSelectedMapping] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();

  // 键值对编辑器组件
  const KeyValueEditor = ({ value = {}, onChange, placeholder }) => {
    const [pairs, setPairs] = useState([]);

    useEffect(() => {
      const entries = Object.entries(value || {});
      if (entries.length === 0) {
        setPairs([{ key: '', value: '', id: Math.random() }]);
      } else {
        setPairs(entries.map(([key, val]) => ({ key, value: val, id: Math.random() })));
      }
    }, [value]);

    const handleChange = (newPairs) => {
      setPairs(newPairs);
      const obj = {};
      newPairs.forEach(pair => {
        if (pair.key && pair.value) {
          obj[pair.key] = pair.value;
        }
      });
      onChange?.(obj);
    };

    const addPair = () => {
      handleChange([...pairs, { key: '', value: '', id: Math.random() }]);
    };

    const removePair = (id) => {
      handleChange(pairs.filter(pair => pair.id !== id));
    };

    const updatePair = (id, field, newValue) => {
      handleChange(pairs.map(pair => 
        pair.id === id ? { ...pair, [field]: newValue } : pair
      ));
    };

    return (
      <div>
        {pairs.map((pair) => (
          <Row key={pair.id} gutter={8} style={{ marginBottom: 8 }}>
            <Col span={10}>
              <Input
                placeholder="键"
                value={pair.key}
                onChange={(e) => updatePair(pair.id, 'key', e.target.value)}
              />
            </Col>
            <Col span={12}>
              <Input
                placeholder="值"
                value={pair.value}
                onChange={(e) => updatePair(pair.id, 'value', e.target.value)}
              />
            </Col>
            <Col span={2}>
              <Button
                type="text"
                danger
                icon={<MinusCircleOutlined />}
                onClick={() => removePair(pair.id)}
              />
            </Col>
          </Row>
        ))}
        <Button type="dashed" onClick={addPair} block>
          添加 {placeholder || '键值对'}
        </Button>
      </div>
    );
  };

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
      name: '',
      priority: 5,
      scenarioName: '',
      requiredScenarioState: '',
      newScenarioState: '',
      comment: '',
      request: {
        method: 'GET',
        urlPath: '/',
        urlPathPattern: '',
        queryParameters: {},
        headers: { 'Content-Type': 'application/json' },
        cookies: {},
        basicAuth: { username: '', password: '' },
        body: ''
      },
      response: {
        status: 200,
        statusMessage: '',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
        fixedDelayMilliseconds: 0,
        delayDistribution: { type: 'uniform', lower: 0, upper: 0 }
      },
      postServeActions: []
    });
    setModalVisible(true);
  };

  // 编辑映射
  const handleEdit = (record) => {
    setSelectedMapping(record);
    
    // 正确回写所有配置数据到表单
    const formData = {
      name: record.name || '',
      priority: record.priority || 5,
      scenarioName: record.scenarioName || '',
      requiredScenarioState: record.requiredScenarioState || '',
      newScenarioState: record.newScenarioState || '',
      comment: record.comment || '',
      request: {
        method: record.request?.method || 'GET',
        urlPath: record.request?.urlPath || record.request?.url || record.request?.urlPattern || record.request?.urlPathPattern || '/',
        urlPathPattern: record.request?.urlPathPattern || '',
        queryParameters: record.request?.queryParameters || {},
        headers: record.request?.headers || {},
        cookies: record.request?.cookies || {},
        basicAuth: record.request?.basicAuth || { username: '', password: '' },
        body: record.request?.body || ''
      },
      response: {
        status: record.response?.status || 200,
        statusMessage: record.response?.statusMessage || '',
        headers: record.response?.headers || {},
        body: record.response?.body || (record.response?.jsonBody ? JSON.stringify(record.response.jsonBody, null, 2) : '{}'),
        fixedDelayMilliseconds: record.response?.fixedDelayMilliseconds || 0,
        delayDistribution: record.response?.delayDistribution || { type: 'uniform', lower: 0, upper: 0 }
      },
      postServeActions: record.postServeActions || []
    };
    
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  // 复制映射
  const handleCopy = (record) => {
    const copiedMapping = {
      ...record,
      name: `${record.name || 'Copy'} - 副本`,
      id: undefined
    };
    setSelectedMapping(null);
    form.setFieldsValue(copiedMapping);
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
      const cleanedValues = {
        name: values.name || undefined,
        priority: values.priority || undefined,
        scenarioName: values.scenarioName || undefined,
        requiredScenarioState: values.requiredScenarioState || undefined,
        newScenarioState: values.newScenarioState || undefined,
        comment: values.comment || undefined,
        request: {
          method: values.request.method,
          urlPath: values.request.urlPath || undefined,
          urlPathPattern: values.request.urlPathPattern || undefined,
          queryParameters: Object.keys(values.request.queryParameters || {}).length > 0 
            ? values.request.queryParameters : undefined,
          headers: Object.keys(values.request.headers || {}).length > 0 
            ? values.request.headers : undefined,
          cookies: Object.keys(values.request.cookies || {}).length > 0 
            ? values.request.cookies : undefined,
          basicAuth: (values.request.basicAuth?.username || values.request.basicAuth?.password) 
            ? values.request.basicAuth : undefined,
          body: values.request.body || undefined
        },
        response: {
          ...values.response,
          headers: Object.keys(values.response.headers || {}).length > 0 
            ? values.response.headers : undefined,
          fixedDelayMilliseconds: values.response.fixedDelayMilliseconds > 0 
            ? values.response.fixedDelayMilliseconds : undefined,
          delayDistribution: (values.response.delayDistribution?.lower > 0 || values.response.delayDistribution?.upper > 0)
            ? values.response.delayDistribution : undefined
        },
        postServeActions: values.postServeActions?.length > 0 ? values.postServeActions : undefined
      };

      if (selectedMapping) {
        await stubMappingsApi.update(selectedMapping.id, cleanedValues);
        notification.success({
          message: '更新成功',
          description: '映射已成功更新',
        });
      } else {
        await stubMappingsApi.create(cleanedValues);
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

  // 导出映射
  const handleExport = () => {
    try {
      let exportMappings = mappings;
      let fileName = 'wiremock-mappings-all';
      
      if (selectedRowKeys.length > 0) {
        exportMappings = mappings.filter(mapping => selectedRowKeys.includes(mapping.id));
        fileName = 'wiremock-mappings-selected';
      }
      
      const dataStr = JSON.stringify({ mappings: exportMappings }, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      notification.success({
        message: '导出成功',
        description: `已导出 ${exportMappings.length} 个映射配置`,
      });
    } catch (error) {
      notification.error({
        message: '导出失败',
        description: error.message,
      });
    }
  };

  // 导入映射
  const handleImport = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        const importMappings = importData.mappings || [importData];
        
        for (const mapping of importMappings) {
          delete mapping.id;
          await stubMappingsApi.create(mapping);
        }
        
        notification.success({
          message: '导入成功',
          description: `成功导入 ${importMappings.length} 个映射`,
        });
        fetchMappings();
      } catch (error) {
        notification.error({
          message: '导入失败',
          description: '文件格式错误或导入过程中出现问题',
        });
      }
    };
    reader.readAsText(file);
    return false;
  };

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

  // 过滤映射
  const filteredMappings = mappings.filter((mapping) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      mapping.request?.urlPath?.toLowerCase().includes(searchLower) ||
      mapping.request?.urlPathPattern?.toLowerCase().includes(searchLower) ||
      mapping.request?.urlPattern?.toLowerCase().includes(searchLower) ||
      mapping.request?.url?.toLowerCase().includes(searchLower) ||
      mapping.request?.urlEqualTo?.toLowerCase().includes(searchLower) ||
      mapping.request?.method?.toLowerCase().includes(searchLower) ||
      mapping.name?.toLowerCase().includes(searchLower) ||
      mapping.comment?.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
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
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            导出
          </Button>
          <Upload
            accept=".json"
            showUploadList={false}
            beforeUpload={handleImport}
          >
            <Button icon={<UploadOutlined />}>
              导入
            </Button>
          </Upload>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建映射
          </Button>
        </Space>
      </div>

      <Card className="content-card">
        <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f6f8fa', borderRadius: 6 }}>
          <Title level={4} style={{ margin: '0 0 8px 0' }}>💡 映射配置说明</Title>
          <Text type="secondary">
            映射配置是 WireMock 的核心功能，用于定义如何匹配传入的 HTTP 请求并返回相应的响应。
            每个映射包含请求匹配条件（URL、方法、头部等）和响应配置（状态码、响应体、延时等）。
            您可以创建多个映射来模拟不同的 API 端点，支持正则表达式匹配、场景状态管理和 Webhook 回调。
          </Text>
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredMappings}
          rowKey="id"
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            selections: [
              Table.SELECTION_ALL,
              Table.SELECTION_INVERT,
              Table.SELECTION_NONE,
            ],
          }}
          pagination={{
            total: filteredMappings.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录${selectedRowKeys.length > 0 ? `，已选择 ${selectedRowKeys.length} 条` : ''}`,
          }}
        />
      </Card>

      {/* 创建/编辑映射模态框 */}
      <Modal
        title={selectedMapping ? '编辑映射' : '创建映射'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={1200}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Tabs defaultActiveKey="basic">
            <TabPane tab="基本信息" key="basic">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="映射名称" name="name">
                    <Input placeholder="输入映射名称" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="优先级" name="priority">
                    <InputNumber min={1} max={10} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="场景名称" name="scenarioName">
                    <Input placeholder="场景名称" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="所需场景状态" name="requiredScenarioState">
                    <Input placeholder="所需状态" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="新场景状态" name="newScenarioState">
                    <Input placeholder="新状态" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item label="备注" name="comment">
                <TextArea rows={3} placeholder="输入映射的详细说明..." />
              </Form.Item>
            </TabPane>

            <TabPane tab="请求配置" key="request">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="HTTP方法"
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
                    label="URL路径"
                    name={['request', 'urlPath']}
                    rules={[{ required: true, message: '请输入URL路径' }]}
                  >
                    <Input placeholder="/api/example" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="URL路径模式" name={['request', 'urlPathPattern']}>
                <Input placeholder="/api/users/[0-9]+" />
              </Form.Item>

              <Collapse>
                <Panel header="查询参数" key="params">
                  <Form.Item name={['request', 'queryParameters']}>
                    <KeyValueEditor placeholder="查询参数" />
                  </Form.Item>
                </Panel>

                <Panel header="请求头" key="headers">
                  <Form.Item name={['request', 'headers']}>
                    <KeyValueEditor placeholder="请求头" />
                  </Form.Item>
                </Panel>

                <Panel header="Cookies" key="cookies">
                  <Form.Item name={['request', 'cookies']}>
                    <KeyValueEditor placeholder="Cookie" />
                  </Form.Item>
                </Panel>

                <Panel header="身份验证" key="auth">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="用户名" name={['request', 'basicAuth', 'username']}>
                        <Input placeholder="用户名" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="密码" name={['request', 'basicAuth', 'password']}>
                        <Input.Password placeholder="密码" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>

                <Panel header="请求体" key="body">
                  <Form.Item name={['request', 'body']}>
                    <Editor
                      height="200px"
                      language="json"
                      options={{ minimap: { enabled: false } }}
                    />
                  </Form.Item>
                </Panel>
              </Collapse>
            </TabPane>

            <TabPane tab="响应配置" key="response">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="状态码"
                    name={['response', 'status']}
                    rules={[{ required: true, message: '请输入状态码' }]}
                  >
                    <InputNumber min={100} max={599} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={16}>
                  <Form.Item label="状态消息" name={['response', 'statusMessage']}>
                    <Input placeholder="OK" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="响应头" name={['response', 'headers']}>
                <KeyValueEditor placeholder="响应头" />
              </Form.Item>

              <Form.Item label="响应体" name={['response', 'body']}>
                <Editor
                  height="200px"
                  language="json"
                  options={{ minimap: { enabled: false } }}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="固定延时(ms)" name={['response', 'fixedDelayMilliseconds']}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="延时分布类型" name={['response', 'delayDistribution', 'type']}>
                    <Select>
                      <Option value="uniform">均匀分布</Option>
                      <Option value="lognormal">对数正态分布</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="延时下限(ms)" name={['response', 'delayDistribution', 'lower']}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="延时上限(ms)" name={['response', 'delayDistribution', 'upper']}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Webhook配置" key="webhook">
              <Form.List name="postServeActions">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card
                        key={key}
                        title={`Webhook ${name + 1}`}
                        extra={
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                          />
                        }
                        style={{ marginBottom: 16 }}
                      >
                        <Form.Item
                          {...restField}
                          label="URL"
                          name={[name, 'webhook', 'url']}
                          rules={[{ required: true, message: '请输入Webhook URL' }]}
                        >
                          <Input placeholder="{{jsonPath request.body '$.data.callbackUrl'}}" />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          label="HTTP方法"
                          name={[name, 'webhook', 'method']}
                        >
                          <Select>
                            <Option value="GET">GET</Option>
                            <Option value="POST">POST</Option>
                            <Option value="PUT">PUT</Option>
                            <Option value="DELETE">DELETE</Option>
                          </Select>
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          label="请求头"
                          name={[name, 'webhook', 'headers']}
                        >
                          <KeyValueEditor placeholder="请求头" />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          label="请求体"
                          name={[name, 'webhook', 'body']}
                        >
                          <TextArea rows={4} placeholder="请求体内容..." />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          label="延时(ms)"
                          name={[name, 'webhook', 'fixedDelayMilliseconds']}
                        >
                          <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                      </Card>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      添加 Webhook
                    </Button>
                  </>
                )}
              </Form.List>
            </TabPane>
          </Tabs>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {selectedMapping ? '更新' : '创建'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* 查看映射详情抽屉 */}
      <Drawer
        title="映射详情"
        placement="right"
        width={800}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedMapping && (
          <div>
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="名称">
                {selectedMapping.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="优先级">
                {selectedMapping.priority || 5}
              </Descriptions.Item>
              <Descriptions.Item label="场景">
                {selectedMapping.scenarioName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {selectedMapping.requiredScenarioState || '-'} → {selectedMapping.newScenarioState || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>
                {selectedMapping.comment || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={4}>请求配置</Title>
            <Editor
              height="200px"
              language="json"
              value={JSON.stringify(selectedMapping.request, null, 2)}
              options={{ readOnly: true, minimap: { enabled: false } }}
            />

            <Divider />

            <Title level={4}>响应配置</Title>
            <Editor
              height="200px"
              language="json"
              value={JSON.stringify({
                ...selectedMapping.response,
                // 格式化body字段，去除转义
                body: selectedMapping.response?.body ? 
                  (typeof selectedMapping.response.body === 'string' ? 
                    (() => {
                      try {
                        return JSON.parse(selectedMapping.response.body);
                      } catch {
                        return selectedMapping.response.body;
                      }
                    })() : selectedMapping.response.body
                  ) : undefined
              }, null, 2)}
              options={{ readOnly: true, minimap: { enabled: false } }}
            />

            {selectedMapping.postServeActions && selectedMapping.postServeActions.length > 0 && (
              <>
                <Divider />
                <Title level={4}>Webhook配置</Title>
                <Editor
                  height="200px"
                  language="json"
                  value={JSON.stringify(selectedMapping.postServeActions, null, 2)}
                  options={{ readOnly: true, minimap: { enabled: false } }}
                />
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default StubMappings;
