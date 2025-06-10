import React from 'react';
import { Card, Form, Input, Switch, Button, Row, Col, Space } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';

const StartRecordingCard = ({ form, onStartRecording, isRecording, loading }) => {
  return (
    <Card 
      title={
        <Space>
          <PlayCircleOutlined />
          开始录制
        </Space>
      }
      className="content-card"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onStartRecording}
        disabled={isRecording}
      >
        <Form.Item
          label="目标 URL"
          name="targetUrl"
          rules={[{ required: true, message: '请输入目标 URL' }]}
          extra="要录制的真实 API 服务地址"
        >
          <Input placeholder="https://api.example.com" />
        </Form.Item>

        <Form.Item
          label="URL 模式"
          name="urlPattern"
          extra="正则表达式，用于过滤要录制的 URL"
        >
          <Input placeholder=".*" />
        </Form.Item>

        <Form.Item
          label="HTTP 方法"
          name="method"
        >
          <Input placeholder="ANY" />
        </Form.Item>

        <Form.Item
          label="请求体模式"
          name="requestBodyPattern"
          extra="用于匹配请求体的模式"
        >
          <Input placeholder="可选" />
        </Form.Item>

        <Form.Item
          label="转换器"
          name="transformers"
          extra="逗号分隔的转换器列表"
        >
          <Input placeholder="response-template,modify-response-header" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="捕获请求头"
              name="captureHeaders"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="持久化映射"
              name="persist"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="重复请求作为场景"
          name="repeatsAsScenarios"
          valuePropName="checked"
          extra="将重复的请求转换为场景"
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<PlayCircleOutlined />}
            loading={loading}
            disabled={isRecording}
            block
          >
            开始录制
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default StartRecordingCard;
