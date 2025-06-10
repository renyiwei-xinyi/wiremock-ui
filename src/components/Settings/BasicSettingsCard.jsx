import React from 'react';
import { Card, Form, InputNumber, Select, Switch } from 'antd';

const { Option } = Select;

const BasicSettingsCard = () => {
  return (
    <Card title="基本设置" className="content-card">
      <Form.Item
        label="固定延迟 (毫秒)"
        name="fixedDelay"
        extra="为所有响应添加固定延迟时间"
      >
        <InputNumber 
          min={0} 
          max={60000} 
          placeholder="0" 
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        label="随机延迟分布"
        name="delayDistribution"
        extra="响应延迟的分布类型"
      >
        <Select placeholder="选择分布类型">
          <Option value="uniform">均匀分布</Option>
          <Option value="lognormal">对数正态分布</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="启用请求日志"
        name="requestJournalDisabled"
        valuePropName="checked"
        extra="是否记录所有传入的请求"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label="最大请求日志条数"
        name="maxRequestJournalEntries"
        extra="请求日志的最大保存数量"
      >
        <InputNumber 
          min={0} 
          max={10000} 
          placeholder="1000" 
          style={{ width: '100%' }}
        />
      </Form.Item>
    </Card>
  );
};

export default BasicSettingsCard;
