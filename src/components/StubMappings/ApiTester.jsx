import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Card,
  Tabs,
  Table,
  Alert,
  Spin,
  Tag,
  Divider,
  notification,
} from 'antd';
import {
  SendOutlined,
  PlayCircleOutlined,
  CloseOutlined,
  CopyOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const ApiTester = ({ visible, onClose, mapping }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [activeTab, setActiveTab] = useState('headers');

  // Mock服务域名
  const mockServiceUrl = 'http://os.wiremock.server.qa.17u.cn';

  // 从mapping中提取默认值
  const getDefaultValues = () => {
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

  // 初始化表单数据
  React.useEffect(() => {
    if (visible && mapping) {
      const defaultValues = getDefaultValues();
      form.setFieldsValue(defaultValues);
    }
  }, [visible, mapping, form]);

  // 发送请求
  const handleSendRequest = async () => {
    try {
      const values = await form.validateFields();
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
    } finally {
      setLoading(false);
    }
  };

  // 复制响应数据
  const handleCopyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2)).then(() => {
        notification.success({ message: '响应数据已复制到剪贴板' });
      });
    }
  };

  // 获取状态颜色
  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 300 && status < 400) return 'warning';
    if (status >= 400) return 'error';
    return 'default';
  };

  // 动态表单项组件
  const DynamicFormList = ({ name, placeholder }) => (
    <Form.List name={name}>
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name: fieldName, ...restField }) => (
            <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
              <Form.Item
                {...restField}
                name={[fieldName, 'name']}
                style={{ margin: 0, width: 150 }}
              >
                <Input placeholder="名称" />
              </Form.Item>
              <Form.Item
                {...restField}
                name={[fieldName, 'value']}
                style={{ margin: 0, flex: 1 }}
              >
                <Input placeholder="值" />
              </Form.Item>
              <Button type="text" danger onClick={() => remove(fieldName)} icon={<CloseOutlined />} />
            </Space>
          ))}
          <Button type="dashed" onClick={() => add()} block>
            添加{placeholder}
          </Button>
        </>
      )}
    </Form.List>
  );

  return (
    <Modal
      title={
        <Space>
          <PlayCircleOutlined />
          <span>API 测试工具</span>
          {mapping && (
            <Tag color="blue">
              {mapping.name || `${mapping.request?.method} ${mapping.request?.urlPath || mapping.request?.url}`}
            </Tag>
          )}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={null}
      destroyOnClose
    >
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
        <Form form={form} layout="vertical" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* 请求配置区域 */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
              <Form.Item name="method" style={{ margin: 0 }}>
                <Select style={{ width: 100 }}>
                  <Option value="GET">GET</Option>
                  <Option value="POST">POST</Option>
                  <Option value="PUT">PUT</Option>
                  <Option value="DELETE">DELETE</Option>
                  <Option value="PATCH">PATCH</Option>
                  <Option value="HEAD">HEAD</Option>
                  <Option value="OPTIONS">OPTIONS</Option>
                </Select>
              </Form.Item>
              <Form.Item name="url" style={{ margin: 0, flex: 1 }}>
                <Input 
                  placeholder="/api/example" 
                  addonBefore={<Text code style={{ fontSize: '12px' }}>{mockServiceUrl}</Text>}
                />
              </Form.Item>
              <Button 
                type="primary" 
                icon={<SendOutlined />} 
                onClick={handleSendRequest}
                loading={loading}
              >
                发送请求
              </Button>
            </Space.Compact>

            {/* 请求参数标签页 */}
            <Tabs activeKey={activeTab} onChange={setActiveTab} size="small">
              <TabPane tab="请求头" key="headers">
                <DynamicFormList name="headers" placeholder="请求头" />
              </TabPane>
              <TabPane tab="查询参数" key="queryParams">
                <DynamicFormList name="queryParams" placeholder="查询参数" />
              </TabPane>
              <TabPane tab="请求体" key="body">
                <Form.Item name="body">
                  <Editor
                    height="200px"
                    defaultLanguage="json"
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: 'on'
                    }}
                  />
                </Form.Item>
              </TabPane>
            </Tabs>
          </Card>

          {/* 响应区域 */}
          <Card 
            title={
              <Space>
                <HistoryOutlined />
                <span>响应结果</span>
                {response && (
                  <Button 
                    size="small" 
                    icon={<CopyOutlined />} 
                    onClick={handleCopyResponse}
                  >
                    复制响应
                  </Button>
                )}
              </Space>
            }
            size="small"
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>发送请求中...</div>
              </div>
            ) : response ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* 响应状态 */}
                <Space style={{ marginBottom: 16 }}>
                  <Tag color={getStatusColor(response.status)} style={{ fontSize: '14px', padding: '4px 8px' }}>
                    {response.status} {response.statusText}
                  </Tag>
                  <Text type="secondary">耗时: {response.duration}ms</Text>
                  <Text type="secondary">大小: {response.size} bytes</Text>
                  <Text type="secondary">时间: {new Date(response.timestamp).toLocaleString()}</Text>
                </Space>

                {response.error && (
                  <Alert
                    message="请求失败"
                    description="请检查网络连接和服务器状态"
                    type="error"
                    style={{ marginBottom: 16 }}
                  />
                )}

                {/* 响应内容标签页 */}
                <Tabs defaultActiveKey="body" size="small" style={{ flex: 1 }}>
                  <TabPane tab="响应体" key="body">
                    <Editor
                      height="300px"
                      defaultLanguage="json"
                      value={JSON.stringify(response.data, null, 2)}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: 'on'
                      }}
                    />
                  </TabPane>
                  <TabPane tab="响应头" key="headers">
                    <Table
                      dataSource={Object.entries(response.headers).map(([key, value]) => ({
                        key,
                        name: key,
                        value: Array.isArray(value) ? value.join(', ') : value
                      }))}
                      columns={[
                        { title: '名称', dataIndex: 'name', key: 'name', width: '30%' },
                        { title: '值', dataIndex: 'value', key: 'value' }
                      ]}
                      pagination={false}
                      size="small"
                    />
                  </TabPane>
                </Tabs>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                <PlayCircleOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <div>点击"发送请求"开始测试API</div>
              </div>
            )}
          </Card>
        </Form>
      </div>
    </Modal>
  );
};

export default ApiTester;
