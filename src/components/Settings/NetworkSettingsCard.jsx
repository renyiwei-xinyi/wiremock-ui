import React from 'react';
import { Card, Form, Input, InputNumber, Switch } from 'antd';

const NetworkSettingsCard = () => {
  return (
    <Card title="网络设置" className="content-card">
      <Form.Item
        label="代理超时 (毫秒)"
        name="proxyTimeout"
        extra="代理请求的超时时间"
      >
        <InputNumber 
          min={1000} 
          max={300000} 
          placeholder="30000" 
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        label="代理 Via 头"
        name="proxyVia"
        extra="代理请求时添加的 Via 头信息"
      >
        <Input placeholder="WireMock" />
      </Form.Item>

      <Form.Item
        label="禁用横幅"
        name="disableBanner"
        valuePropName="checked"
        extra="禁用启动时的横幅信息"
      >
        <Switch />
      </Form.Item>
    </Card>
  );
};

export default NetworkSettingsCard;
