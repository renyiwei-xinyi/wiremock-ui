import React, { useState } from 'react';
import { 
  Typography, 
  Tag, 
  Card, 
  Descriptions, 
  Tabs, 
  Table, 
  Space, 
  Collapse,
  Alert,
  Divider
} from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  LinkOutlined,
  SendOutlined,
  ReceiveMoneyOutlined,
  ApiOutlined
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const RequestDetail = ({ request }) => {
  const [activeTab, setActiveTab] = useState('request');

  if (!request) return null;

  // 格式化时间
  const formatTime = (timestamp, dateString) => {
    if (timestamp) {
      return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss.SSS');
    }
    if (dateString) {
      return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss.SSS');
    }
    return '-';
  };

  // 格式化JSON
  const formatJson = (obj) => {
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
  const parseQueryParams = (queryParams) => {
    if (!queryParams) return [];
    return Object.entries(queryParams).map(([key, value]) => ({
      key,
      name: key,
      value: Array.isArray(value.values) ? value.values.join(', ') : value.values || value
    }));
  };

  // 解析请求头
  const parseHeaders = (headers) => {
    if (!headers) return [];
    return Object.entries(headers).map(([key, value]) => ({
      key,
      name: key,
      value: Array.isArray(value) ? value.join(', ') : value
    }));
  };

  // 获取匹配的Stub信息
  const getMatchedStubInfo = () => {
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
  const getWebhookEvents = () => {
    if (!request.subEvents) return [];
    return request.subEvents.filter(event => 
      event.type === 'WEBHOOK_REQUEST' || event.type === 'WEBHOOK_RESPONSE'
    );
  };

  const matchedStub = getMatchedStubInfo();
  const webhookEvents = getWebhookEvents();

  return (
    <div style={{ padding: '16px 0' }}>
      {/* 概览信息 */}
      <Card 
        title={
          <Space>
            <ApiOutlined />
            <span>请求概览</span>
            <Tag color={request.wasMatched ? 'green' : 'red'}>
              {request.wasMatched ? '已匹配' : '未匹配'}
            </Tag>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={2} size="small">
          <Descriptions.Item label="请求ID">
            <Text code>{request.id}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="请求时间">
            <Space>
              <ClockCircleOutlined />
              {formatTime(request.request?.loggedDate, request.request?.loggedDateString)}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="请求方法">
            <Tag color="blue">{request.request?.method}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="响应状态">
            <Tag color={
              request.response?.status >= 200 && request.response?.status < 300 ? 'green' :
              request.response?.status >= 400 ? 'red' : 'orange'
            }>
              {request.response?.status || request.responseDefinition?.status || '-'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="客户端IP">
            <Text code>{request.request?.clientIp || '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="协议">
            <Text>{request.request?.protocol || '-'}</Text>
          </Descriptions.Item>
        </Descriptions>

        {/* URL信息 */}
        <Divider orientation="left" orientationMargin="0">URL信息</Divider>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="完整URL">
            <Paragraph copyable style={{ margin: 0 }}>
              <Text code>{request.request?.absoluteUrl || request.request?.url}</Text>
            </Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label="路径">
            <Text code>{request.request?.url}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="主机">
            <Text>{request.request?.host}:{request.request?.port}</Text>
          </Descriptions.Item>
        </Descriptions>

        {/* 匹配的Stub信息 */}
        {matchedStub && (
          <>
            <Divider orientation="left" orientationMargin="0">匹配的映射</Divider>
            <Alert
              message={
                <Space>
                  <CheckCircleOutlined />
                  <strong>{matchedStub.name}</strong>
                  <Tag color="blue">优先级: {matchedStub.priority}</Tag>
                  {matchedStub.scenario && <Tag color="purple">{matchedStub.scenario}</Tag>}
                </Space>
              }
              description={matchedStub.description}
              type="success"
              showIcon={false}
            />
          </>
        )}

        {/* 性能信息 */}
        {request.timing && (
          <>
            <Divider orientation="left" orientationMargin="0">性能信息</Divider>
            <Descriptions column={3} size="small">
              <Descriptions.Item label="处理时间">
                <Text code>{request.timing.processTime || 0}ms</Text>
              </Descriptions.Item>
              <Descriptions.Item label="响应时间">
                <Text code>{request.timing.responseSendTime || 0}ms</Text>
              </Descriptions.Item>
              <Descriptions.Item label="总时间">
                <Text code>{request.timing.totalTime || 0}ms</Text>
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Card>

      {/* 详细信息标签页 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* 请求详情 */}
          <TabPane tab={<Space><SendOutlined />请求详情</Space>} key="request">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {/* 查询参数 */}
              {request.request?.queryParams && Object.keys(request.request.queryParams).length > 0 && (
                <Card title="查询参数" size="small">
                  <Table
                    dataSource={parseQueryParams(request.request.queryParams)}
                    columns={[
                      { title: '参数名', dataIndex: 'name', key: 'name', width: '30%' },
                      { title: '参数值', dataIndex: 'value', key: 'value', render: (text) => <Text code>{text}</Text> }
                    ]}
                    pagination={false}
                    size="small"
                  />
                </Card>
              )}

              {/* 请求头 */}
              {request.request?.headers && (
                <Card title="请求头" size="small">
                  <Table
                    dataSource={parseHeaders(request.request.headers)}
                    columns={[
                      { title: '头部名称', dataIndex: 'name', key: 'name', width: '30%' },
                      { title: '头部值', dataIndex: 'value', key: 'value', render: (text) => <Text code>{text}</Text> }
                    ]}
                    pagination={false}
                    size="small"
                  />
                </Card>
              )}

              {/* 请求体 */}
              {request.request?.body && (
                <Card title="请求体" size="small">
                  <Editor
                    height="200px"
                    defaultLanguage="json"
                    value={formatJson(request.request.body)}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: 'on'
                    }}
                  />
                </Card>
              )}
            </Space>
          </TabPane>

          {/* 响应详情 */}
          <TabPane tab={<Space><ReceiveMoneyOutlined />响应详情</Space>} key="response">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {/* 响应头 */}
              {request.response?.headers && (
                <Card title="响应头" size="small">
                  <Table
                    dataSource={parseHeaders(request.response.headers)}
                    columns={[
                      { title: '头部名称', dataIndex: 'name', key: 'name', width: '30%' },
                      { title: '头部值', dataIndex: 'value', key: 'value', render: (text) => <Text code>{text}</Text> }
                    ]}
                    pagination={false}
                    size="small"
                  />
                </Card>
              )}

              {/* 响应体 */}
              {(request.response?.body || request.responseDefinition?.body) && (
                <Card title="响应体" size="small">
                  <Editor
                    height="400px"
                    defaultLanguage="json"
                    value={formatJson(request.response?.body || request.responseDefinition?.body)}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: 'on'
                    }}
                  />
                </Card>
              )}
            </Space>
          </TabPane>

          {/* Webhook事件 */}
          {webhookEvents.length > 0 && (
            <TabPane tab={<Space><LinkOutlined />Webhook事件</Space>} key="webhooks">
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {webhookEvents.map((event, index) => (
                  <Card 
                    key={index}
                    title={
                      <Space>
                        {event.type === 'WEBHOOK_REQUEST' ? <SendOutlined /> : <ReceiveMoneyOutlined />}
                        {event.type === 'WEBHOOK_REQUEST' ? 'Webhook请求' : 'Webhook响应'}
                        <Text type="secondary">
                          {formatTime(event.data?.loggedDate, event.data?.loggedDateString)}
                        </Text>
                      </Space>
                    }
                    size="small"
                  >
                    {event.type === 'WEBHOOK_REQUEST' ? (
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Descriptions size="small" column={2}>
                          <Descriptions.Item label="URL">
                            <Text code>{event.data?.absoluteUrl}</Text>
                          </Descriptions.Item>
                          <Descriptions.Item label="方法">
                            <Tag color="green">{event.data?.method}</Tag>
                          </Descriptions.Item>
                        </Descriptions>
                        
                        {event.data?.body && (
                          <div>
                            <Text strong>请求体:</Text>
                            <Editor
                              height="200px"
                              defaultLanguage="json"
                              value={formatJson(event.data.body)}
                              options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                wordWrap: 'on'
                              }}
                            />
                          </div>
                        )}
                      </Space>
                    ) : (
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Descriptions size="small" column={2}>
                          <Descriptions.Item label="状态码">
                            <Tag color={event.data?.status >= 200 && event.data?.status < 300 ? 'green' : 'red'}>
                              {event.data?.status}
                            </Tag>
                          </Descriptions.Item>
                        </Descriptions>

                        {event.data?.body && (
                          <div>
                            <Text strong>响应体:</Text>
                            <Editor
                              height="200px"
                              defaultLanguage="json"
                              value={formatJson(event.data.body)}
                              options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                wordWrap: 'on'
                              }}
                            />
                          </div>
                        )}
                      </Space>
                    )}
                  </Card>
                ))}
              </Space>
            </TabPane>
          )}
        </Tabs>
      </Card>
    </div>
  );
};

export default RequestDetail;
