import React from 'react';
import { Card, Form, Switch, InputNumber } from 'antd';

const MatchingSettingsCard = () => {
  return (
    <Card title="匹配设置" className="content-card">
      <Form.Item
        label="启用存根 CORS"
        name="stubCorsEnabled"
        valuePropName="checked"
        extra="为存根响应启用 CORS 支持"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label="异步响应启用"
        name="asynchronousResponseEnabled"
        valuePropName="checked"
        extra="启用异步响应处理"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label="异步响应线程数"
        name="asynchronousResponseThreads"
        extra="处理异步响应的线程池大小"
      >
        <InputNumber 
          min={1} 
          max={100} 
          placeholder="10" 
          style={{ width: '100%' }}
        />
      </Form.Item>
    </Card>
  );
};

export default MatchingSettingsCard;
