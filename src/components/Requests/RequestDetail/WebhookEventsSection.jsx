import React from 'react';
import { Space } from 'antd';
import WebhookEventCard from '../WebhookEventCard';

const WebhookEventsSection = ({ webhookEvents }) => {
  return (
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
};

export default WebhookEventsSection;
