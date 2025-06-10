import React from 'react';
import { Form, Tabs, Button, Space } from 'antd';
import BasicInfoTab from './MappingForm/BasicInfoTab';
import RequestConfigTab from './MappingForm/RequestConfigTab';
import ResponseConfigTab from './MappingForm/ResponseConfigTab';
import WebhookConfigTab from './MappingForm/WebhookConfigTab';

const { TabPane } = Tabs;

const MappingForm = ({ form, onFinish, selectedMapping }) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
    >
      <Tabs defaultActiveKey="basic">
        <TabPane tab="基本信息" key="basic">
          <BasicInfoTab />
        </TabPane>

        <TabPane tab="请求配置" key="request">
          <RequestConfigTab />
        </TabPane>

        <TabPane tab="响应配置" key="response">
          <ResponseConfigTab />
        </TabPane>

        <TabPane tab="Webhook配置" key="webhook">
          <WebhookConfigTab />
        </TabPane>
      </Tabs>

      <div style={{ textAlign: 'right', marginTop: 16 }}>
        <Space>
          <Button type="primary" htmlType="submit">
            {selectedMapping ? '更新' : '创建'}
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default MappingForm;
