import React from 'react';
import { Form, Input, Row, Col, InputNumber, Select } from 'antd';
import Editor from '@monaco-editor/react';
import KeyValueEditor from '../KeyValueEditor';

const { Option } = Select;

const ResponseConfigTab = () => {
  return (
    <>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="状态码"
            name={['response', 'status']}
            rules={[{ required: true, message: '请输入状态码' }]}
          >
            <InputNumber min={100} max={599} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={16}>
          <Form.Item label="状态消息" name={['response', 'statusMessage']}>
            <Input placeholder="OK" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="响应头" name={['response', 'headers']}>
        <KeyValueEditor placeholder="响应头" />
      </Form.Item>

      <Form.Item label="响应体" name={['response', 'body']}>
        <Editor
          height="200px"
          language="json"
          options={{ minimap: { enabled: false } }}
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="固定延时(ms)" name={['response', 'fixedDelayMilliseconds']}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="延时分布类型" name={['response', 'delayDistribution', 'type']}>
            <Select>
              <Option value="uniform">均匀分布</Option>
              <Option value="lognormal">对数正态分布</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="延时下限(ms)" name={['response', 'delayDistribution', 'lower']}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="延时上限(ms)" name={['response', 'delayDistribution', 'upper']}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default ResponseConfigTab;
