import React from 'react';
import { Card, Form, Input, Switch } from 'antd';

const AdvancedSettingsCard = () => {
  return (
    <Card title="高级设置" className="content-card">
      <Form.Item
        label="全局响应模板"
        name="globalResponseTemplating"
        valuePropName="checked"
        extra="启用全局响应模板功能"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label="本地响应模板"
        name="localResponseTemplating"
        valuePropName="checked"
        extra="启用本地响应模板功能"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label="扩展设置"
        name="extensions"
        extra="扩展配置的 JSON 对象"
      >
        <Input.TextArea 
          rows={4} 
          placeholder='{"key": "value"}'
        />
      </Form.Item>

      <Form.Item
        label="启用浏览器代理"
        name="browserProxyingEnabled"
        valuePropName="checked"
        extra="允许作为浏览器代理使用"
      >
        <Switch />
      </Form.Item>
    </Card>
  );
};

export default AdvancedSettingsCard;
