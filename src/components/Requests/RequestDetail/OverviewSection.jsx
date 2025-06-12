import React from 'react';
import { Card, Descriptions, Space, Tag, Alert, Divider, Typography } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, ApiOutlined } from '@ant-design/icons';
import { formatTime, getMatchedStubInfo, getStatusColor } from '../requestUtils';

const { Text, Paragraph } = Typography;

const OverviewSection = ({ request }) => {
  const matchedStub = getMatchedStubInfo(request);

  return (
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
};

export default OverviewSection;
