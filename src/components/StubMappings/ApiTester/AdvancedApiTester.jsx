import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  Tabs,
  Alert,
  Typography,
  Row,
  Col,
  Switch,
  Tag,
  notification,
} from 'antd';
import {
  SendOutlined,
  CopyOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';

const { Option } = Select;
const { Text } = Typography;
const { TabPane } = Tabs;

// HTTP方法选项
const HTTP_METHODS = [
  'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'
];

const AdvancedApiTester = ({ mapping, mockServiceUrl }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [activeTab, setActiveTab] = useState('headers');

  // 初始化表单
  useEffect(() => {
    if (mapping) {
      const request = mapping.request || {};
      const initialValues = {
        method: request.method || 'GET',
        url: request.urlPath || request.urlPathPattern || request.url || '/',
        headers: request.headers ? Object.entries(request.headers).map(([key, value], index) => ({
          id: index,
          key: key,
          value: typeof value === 'object' ? JSON.stringify(value) : value,
          enabled: true,
        })) : [],
        params: request.queryParameters ? Object.entries(request.queryParameters).map(([key, value], index) => ({
          id: index,
          key: key,
          value: typeof value === 'object' ? JSON.stringify(value) : value,
          enabled: true,
        })) : [],
        body: request.bodyPatterns ? JSON.stringify(request.bodyPatterns[0], null, 2) : '',
        bodyType: 'json',
      };
      form.setFieldsValue(initialValues);
    }
  }, [mapping, form]);

  // 发送请求的函数（优化的CORS处理）
  const sendRequest = async (requestConfig) => {
    const { method, url, headers, data } = requestConfig;
    
    // 使用最简单的fetch配置来避免CORS预检
    const fetchOptions = {
      method: method,
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-cache',
    };

    // 只添加必要的请求头
    const cleanHeaders = {};
    Object.entries(headers).forEach(([key, value]) => {
      // 避免添加可能触发预检的请求头
      const lowerKey = key.toLowerCase();
      if (!['access-control-request-method', 'access-control-request-headers'].includes(lowerKey)) {
        cleanHeaders[key] = value;
      }
    });

    if (Object.keys(cleanHeaders).length > 0) {
      fetchOptions.headers = cleanHeaders;
    }

    // 只在有数据时添加body
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      fetchOptions.body = typeof data === 'string' ? data : JSON.stringify(data);
    }

    console.log('=== 发送请求 ===');
    console.log('URL:', url);
    console.log('方法:', method);
    console.log('配置:', fetchOptions);
    console.log('================');

    const response = await fetch(url, fetchOptions);
    
    // 读取响应数据
    let responseData;
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
    } catch (e) {
      responseData = await response.text();
    }

    // 构建响应头对象
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data: responseData,
      ok: response.ok,
    };
  };

  // 处理发送请求
  const handleSendRequest = async () => {
    try {
      setLoading(true);
      setResponse(null);

      const values = await form.validateFields();
      
      // 构建完整URL
      const fullUrl = `${mockServiceUrl}${values.url.startsWith('/') ? values.url : '/' + values.url}`;
      
      // 构建请求头
      const headers = {};
      if (values.headers) {
        values.headers.forEach(header => {
          if (header.enabled && header.key && header.value) {
            headers[header.key] = header.value;
          }
        });
      }

      // 添加查询参数
      const url = new URL(fullUrl);
      if (values.params) {
        values.params.forEach(param => {
          if (param.enabled && param.key && param.value) {
            url.searchParams.append(param.key, param.value);
          }
        });
      }

      // 构建请求体
      let data = null;
      if (values.body && ['POST', 'PUT', 'PATCH'].includes(values.method)) {
        if (values.bodyType === 'json') {
          try {
            data = JSON.parse(values.body);
            if (!headers['Content-Type']) {
              headers['Content-Type'] = 'application/json';
            }
          } catch (e) {
            throw new Error('JSON格式错误: ' + e.message);
          }
        } else {
          data = values.body;
          if (!headers['Content-Type']) {
            headers['Content-Type'] = 'text/plain';
          }
        }
      }

      const requestConfig = {
        method: values.method,
        url: url.toString(),
        headers,
        data,
      };

      const startTime = Date.now();
      const result = await sendRequest(requestConfig);
      const endTime = Date.now();
      const duration = endTime - startTime;

      const responseData = {
        ...result,
        duration,
        size: JSON.stringify(result.data).length,
        timestamp: new Date().toISOString(),
        request: requestConfig,
      };

      setResponse(responseData);

      if (result.ok) {
        notification.success({
          message: '请求成功',
          description: `状态码: ${result.status}, 耗时: ${duration}ms`,
        });
      } else {
        notification.warning({
          message: '请求完成',
          description: `状态码: ${result.status} ${result.statusText}, 耗时: ${duration}ms`,
        });
      }

    } catch (error) {
      console.error('请求失败:', error);
      
      const errorResponse = {
        status: 0,
        statusText: 'Error',
        headers: {},
        data: { error: error.message },
        duration: 0,
        size: 0,
        timestamp: new Date().toISOString(),
        error: true,
      };

      setResponse(errorResponse);

      notification.error({
        message: '请求失败',
        description: error.message,
        duration: 8,
      });
    } finally {
      setLoading(false);
    }
  };

  // 复制响应
  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
      notification.success({ message: '响应已复制到剪贴板' });
    }
  };

  // 复制为cURL
  const copyAsCurl = () => {
    if (response && response.request) {
      const { method, url, headers, data } = response.request;
      let curl = `curl -X ${method} '${url}'`;
      
      Object.entries(headers).forEach(([key, value]) => {
        curl += ` -H '${key}: ${value}'`;
      });
      
      if (data) {
        curl += ` -d '${typeof data === 'string' ? data : JSON.stringify(data)}'`;
      }
      
      navigator.clipboard.writeText(curl);
      notification.success({ message: 'cURL命令已复制到剪贴板' });
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 提示信息 */}
      <Alert
        message="高级API测试工具"
        description="内置CORS优化技术，支持完整的HTTP请求测试功能"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form form={form} layout="vertical" style={{ flex: 1 }}>
        {/* 请求配置 */}
        <Card size="small" title="请求配置" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={4}>
              <Form.Item name="method" label="方法" initialValue="GET">
                <Select>
                  {HTTP_METHODS.map(method => (
                    <Option key={method} value={method}>{method}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="url" label="URL" rules={[{ required: true, message: '请输入URL' }]}>
                <Input 
                  placeholder="/api/path" 
                  addonBefore={mockServiceUrl}
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label=" ">
                <Button 
                  type="primary" 
                  icon={<SendOutlined />} 
                  onClick={handleSendRequest}
                  loading={loading}
                  block
                >
                  发送
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 请求参数 */}
        <Card size="small" title="请求参数" style={{ marginBottom: 16 }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="请求头" key="headers">
              <Form.List name="headers">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={key} gutter={8} align="middle">
                        <Col span={1}>
                          <Form.Item {...restField} name={[name, 'enabled']} valuePropName="checked" initialValue={true}>
                            <Switch size="small" />
                          </Form.Item>
                        </Col>
                        <Col span={10}>
                          <Form.Item {...restField} name={[name, 'key']}>
                            <Input placeholder="Header名称" />
                          </Form.Item>
                        </Col>
                        <Col span={10}>
                          <Form.Item {...restField} name={[name, 'value']}>
                            <Input placeholder="Header值" />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          <Button 
                            type="text" 
                            icon={<MinusCircleOutlined />} 
                            onClick={() => remove(name)}
                            danger
                          />
                        </Col>
                      </Row>
                    ))}
                    <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                      添加请求头
                    </Button>
                  </>
                )}
              </Form.List>
            </TabPane>
            
            <TabPane tab="查询参数" key="params">
              <Form.List name="params">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={key} gutter={8} align="middle">
                        <Col span={1}>
                          <Form.Item {...restField} name={[name, 'enabled']} valuePropName="checked" initialValue={true}>
                            <Switch size="small" />
                          </Form.Item>
                        </Col>
                        <Col span={10}>
                          <Form.Item {...restField} name={[name, 'key']}>
                            <Input placeholder="参数名" />
                          </Form.Item>
                        </Col>
                        <Col span={10}>
                          <Form.Item {...restField} name={[name, 'value']}>
                            <Input placeholder="参数值" />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          <Button 
                            type="text" 
                            icon={<MinusCircleOutlined />} 
                            onClick={() => remove(name)}
                            danger
                          />
                        </Col>
                      </Row>
                    ))}
                    <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                      添加查询参数
                    </Button>
                  </>
                )}
              </Form.List>
            </TabPane>
            
            <TabPane tab="请求体" key="body">
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item name="bodyType" label="类型" initialValue="json">
                    <Select>
                      <Option value="json">JSON</Option>
                      <Option value="text">纯文本</Option>
                      <Option value="xml">XML</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="body">
                <Editor
                  height="200px"
                  defaultLanguage="json"
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    formatOnPaste: true,
                    formatOnType: true,
                  }}
                />
              </Form.Item>
            </TabPane>
          </Tabs>
        </Card>

        {/* 响应区域 */}
        {response && (
          <Card 
            size="small" 
            title={
              <Space>
                <span>响应结果</span>
                <Tag color={response.ok ? 'green' : 'red'}>
                  {response.status} {response.statusText}
                </Tag>
                <Tag>{response.duration}ms</Tag>
                <Tag>{response.size} bytes</Tag>
              </Space>
            }
            extra={
              <Space>
                <Button size="small" icon={<CopyOutlined />} onClick={copyResponse}>
                  复制响应
                </Button>
                <Button size="small" onClick={copyAsCurl}>
                  复制cURL
                </Button>
              </Space>
            }
            style={{ flex: 1 }}
          >
            <Tabs defaultActiveKey="body">
              <TabPane tab="响应体" key="body">
                <Editor
                  height="300px"
                  defaultLanguage="json"
                  value={typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                  }}
                />
              </TabPane>
              <TabPane tab="响应头" key="headers">
                <Editor
                  height="300px"
                  defaultLanguage="json"
                  value={JSON.stringify(response.headers, null, 2)}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                  }}
                />
              </TabPane>
            </Tabs>
          </Card>
        )}
      </Form>
    </div>
  );
};

export default AdvancedApiTester;
