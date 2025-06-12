import React, { useState } from 'react';
import { 
  Typography, 
  Tag, 
  Card, 
  Descriptions, 
  Tabs, 
  Table, 
  Space, 
  Alert,
  Divider
} from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  LinkOutlined,
  SendOutlined,
  ArrowDownOutlined,
  ApiOutlined
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import WebhookEventCard from './WebhookEventCard';
import { 
  formatTime, 
  formatJson, 
  parseHeaders, 
  parseQueryParams, 
  getMatchedStubInfo, 
  getWebhookEvents,
  getStatusColor,
  getTableColumns,
  getParamTableColumns
} from './requestUtils';

const { Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const RequestDetail = ({ request }) => {
  const [activeTab, setActiveTab] = useState('request');

  if (!request) return null;

  const matchedStub = getMatchedStubInfo(request);
  const webhookEvents = getWebhookEvents(request);

  // 渲染概览信息
  const renderOverview = () => (
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
          <Tag color={getStatusColor(request.response?.status || request.responseDefinition?.status)}>
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
  );

  // 渲染请求详情
  const renderRequestDetails = () => (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {/* 查询参数 */}
      {request.request?.queryParams && Object.keys(request.request.queryParams).length > 0 && (
        <Card title="查询参数" size="small">
          <Table
            dataSource={parseQueryParams(request.request.queryParams)}
            columns={getParamTableColumns()}
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
            columns={getTableColumns()}
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
  );

  // 渲染响应详情
  const renderResponseDetails = () => (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {/* 响应头 */}
      {request.response?.headers && (
        <Card title="响应头" size="small">
          <Table
            dataSource={parseHeaders(request.response.headers)}
            columns={getTableColumns()}
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
  );

  // 渲染Webhook事件
  const renderWebhookEvents = () => (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {webhookEvents.map((event, index) => (
        <WebhookEventCard
          key={index}
          event={event}
          index={index}
        />
      ))}
    </Space>
  );

  return (
    <div style={{ padding: '16px 0' }}>
      {/* 概览信息 */}
      {renderOverview()}

      {/* 详细信息标签页 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* 请求详情 */}
          <TabPane tab={<Space><SendOutlined />请求详情</Space>} key="request">
            {renderRequestDetails()}
          </TabPane>

          {/* 响应详情 */}
          <TabPane tab={<Space><ArrowDownOutlined />响应详情</Space>} key="response">
            {renderResponseDetails()}
          </TabPane>

          {/* Webhook事件 */}
          {webhookEvents.length > 0 && (
            <TabPane tab={<Space><LinkOutlined />Webhook事件 ({webhookEvents.length})</Space>} key="webhooks">
              {renderWebhookEvents()}
            </TabPane>
          )}
        </Tabs>
      </Card>
    </div>
  );
};

export default RequestDetail;
