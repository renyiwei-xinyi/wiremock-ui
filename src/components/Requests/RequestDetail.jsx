import React, { useState } from 'react';
import { Card, Tabs, Space } from 'antd';
import { 
  SendOutlined,
  ArrowDownOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { getWebhookEvents } from './requestUtils';
import OverviewSection from './RequestDetail/OverviewSection';
import RequestDetailsSection from './RequestDetail/RequestDetailsSection';
import ResponseDetailsSection from './RequestDetail/ResponseDetailsSection';
import WebhookEventsSection from './RequestDetail/WebhookEventsSection';

const { TabPane } = Tabs;

const RequestDetail = ({ request }) => {
  const [activeTab, setActiveTab] = useState('request');

  if (!request) return null;

  const webhookEvents = getWebhookEvents(request);

  return (
    <div style={{ padding: '16px 0' }}>
      {/* 概览信息 */}
      <OverviewSection request={request} />

      {/* 详细信息标签页 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* 请求详情 */}
          <TabPane tab={<Space><SendOutlined />请求详情</Space>} key="request">
            <RequestDetailsSection request={request} />
          </TabPane>

          {/* 响应详情 */}
          <TabPane tab={<Space><ArrowDownOutlined />响应详情</Space>} key="response">
            <ResponseDetailsSection request={request} />
          </TabPane>

          {/* Webhook事件 */}
          {webhookEvents.length > 0 && (
            <TabPane tab={<Space><LinkOutlined />Webhook事件 ({webhookEvents.length})</Space>} key="webhooks">
              <WebhookEventsSection webhookEvents={webhookEvents} />
            </TabPane>
          )}
        </Tabs>
      </Card>
    </div>
  );
};

export default RequestDetail;
