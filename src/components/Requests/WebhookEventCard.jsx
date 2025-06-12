import React from 'react';
import { 
  Typography, 
  Tag, 
  Card, 
  Descriptions, 
  Table, 
  Space, 
  Collapse
} from 'antd';
import { 
  SendOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { 
  formatTime, 
  formatJson, 
  parseHeaders, 
  parseQueryParams, 
  getTableColumns, 
  getParamTableColumns,
  getStatusColor 
} from './requestUtils';

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

const WebhookEventCard = ({ event, index }) => {
  return (
    <Card 
      key={index}
      title={
        <Space>
          {event.type === 'WEBHOOK_REQUEST' ? <SendOutlined /> : <ArrowDownOutlined />}
          {event.type === 'WEBHOOK_REQUEST' ? 'Webhook请求' : 'Webhook响应'}
          <Text type="secondary">
            {formatTime(event.data?.loggedDate, event.data?.loggedDateString)}
          </Text>
          {event.timeOffsetNanos !== undefined && (
            <Tag color="cyan">偏移: {event.timeOffsetNanos}ns</Tag>
          )}
        </Space>
      }
      size="small"
    >
      {event.type === 'WEBHOOK_REQUEST' ? (
        <Space direction="vertical" style={{ width: '100%' }}>
          {/* 基本信息 */}
          <Descriptions size="small" column={2}>
            <Descriptions.Item label="目标URL">
              <Paragraph copyable style={{ margin: 0 }}>
                <Text code>{event.data?.absoluteUrl}</Text>
              </Paragraph>
            </Descriptions.Item>
            <Descriptions.Item label="请求方法">
              <Tag color="green">{event.data?.method}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="协议">
              <Text>{event.data?.scheme?.toUpperCase()}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="主机端口">
              <Text code>{event.data?.host}:{event.data?.port}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="路径">
              <Text code>{event.data?.url}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="代理请求">
              <Tag color={event.data?.browserProxyRequest ? 'orange' : 'blue'}>
                {event.data?.browserProxyRequest ? '是' : '否'}
              </Tag>
            </Descriptions.Item>
            {/* 新增关键信息 */}
            {event.data?.clientIp && (
              <Descriptions.Item label="客户端IP">
                <Text code>{event.data.clientIp}</Text>
              </Descriptions.Item>
            )}
            {event.data?.userAgent && (
              <Descriptions.Item label="用户代理">
                <Text ellipsis={{ tooltip: event.data.userAgent }} style={{ maxWidth: 200 }}>
                  {event.data.userAgent}
                </Text>
              </Descriptions.Item>
            )}
          </Descriptions>

          {/* 详细信息折叠面板 */}
          <Collapse size="small" ghost>
            {/* 请求头 */}
            {event.data?.headers && Object.keys(event.data.headers).length > 0 && (
              <Panel header={`请求头 (${Object.keys(event.data.headers).length})`} key="headers">
                <Table
                  dataSource={parseHeaders(event.data.headers)}
                  columns={getTableColumns()}
                  pagination={false}
                  size="small"
                />
              </Panel>
            )}

            {/* 查询参数 */}
            {event.data?.queryParams && Object.keys(event.data.queryParams).length > 0 && (
              <Panel header={`查询参数 (${Object.keys(event.data.queryParams).length})`} key="query">
                <Table
                  dataSource={parseQueryParams(event.data.queryParams)}
                  columns={getParamTableColumns()}
                  pagination={false}
                  size="small"
                />
              </Panel>
            )}

            {/* 表单参数 */}
            {event.data?.formParams && Object.keys(event.data.formParams).length > 0 && (
              <Panel header={`表单参数 (${Object.keys(event.data.formParams).length})`} key="form">
                <Table
                  dataSource={parseQueryParams(event.data.formParams)}
                  columns={getParamTableColumns()}
                  pagination={false}
                  size="small"
                />
              </Panel>
            )}

            {/* Cookies */}
            {event.data?.cookies && Object.keys(event.data.cookies).length > 0 && (
              <Panel header={`Cookies (${Object.keys(event.data.cookies).length})`} key="cookies">
                <Table
                  dataSource={parseQueryParams(event.data.cookies)}
                  columns={getParamTableColumns()}
                  pagination={false}
                  size="small"
                />
              </Panel>
            )}

            {/* 请求体 */}
            {event.data?.body && (
              <Panel header="请求体" key="body">
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
              </Panel>
            )}

            {/* 请求体Base64 */}
            {event.data?.bodyAsBase64 && (
              <Panel header="请求体 (Base64)" key="bodyBase64">
                <Text code style={{ wordBreak: 'break-all', fontSize: '11px' }}>
                  {event.data.bodyAsBase64}
                </Text>
              </Panel>
            )}
          </Collapse>
        </Space>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }}>
          {/* 响应基本信息 */}
          <Descriptions size="small" column={2}>
            <Descriptions.Item label="状态码">
              <Tag color={getStatusColor(event.data?.status)}>
                {event.data?.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="响应时间">
              <Text type="secondary">
                {formatTime(event.data?.loggedDate, event.data?.loggedDateString)}
              </Text>
            </Descriptions.Item>
            {/* 新增响应信息 */}
            {event.data?.statusMessage && (
              <Descriptions.Item label="状态消息">
                <Text>{event.data.statusMessage}</Text>
              </Descriptions.Item>
            )}
            {event.data?.fault && (
              <Descriptions.Item label="故障类型">
                <Tag color="red">{event.data.fault}</Tag>
              </Descriptions.Item>
            )}
          </Descriptions>

          {/* 响应详细信息折叠面板 */}
          <Collapse size="small" ghost>
            {/* 响应头 */}
            {event.data?.headers && Object.keys(event.data.headers).length > 0 && (
              <Panel header={`响应头 (${Object.keys(event.data.headers).length})`} key="headers">
                <Table
                  dataSource={parseHeaders(event.data.headers)}
                  columns={getTableColumns()}
                  pagination={false}
                  size="small"
                />
              </Panel>
            )}

            {/* 响应体 */}
            {event.data?.body && (
              <Panel header="响应体" key="body">
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
              </Panel>
            )}

            {/* 响应体Base64 */}
            {event.data?.bodyAsBase64 && (
              <Panel header="响应体 (Base64)" key="bodyBase64">
                <Text code style={{ wordBreak: 'break-all', fontSize: '11px' }}>
                  {event.data.bodyAsBase64}
                </Text>
              </Panel>
            )}

            {/* 错误信息 */}
            {event.data?.error && (
              <Panel header="错误信息" key="error">
                <Text type="danger">{event.data.error}</Text>
              </Panel>
            )}
          </Collapse>
        </Space>
      )}
    </Card>
  );
};

export default WebhookEventCard;
