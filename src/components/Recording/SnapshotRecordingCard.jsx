import React from 'react';
import { Card, Form, Input, Switch, Button, Row, Col, Space, Typography } from 'antd';
import { CameraOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

const SnapshotRecordingCard = ({ onSnapshot, loading }) => {
  return (
    <Card 
      title={
        <Space>
          <CameraOutlined />
          快照录制
        </Space>
      }
      className="content-card"
    >
      <Paragraph>
        快照录制可以立即捕获指定 API 的当前状态，生成对应的 stub 映射。
      </Paragraph>

      <Form
        layout="vertical"
        onFinish={onSnapshot}
      >
        <Form.Item
          label="目标 URL"
          name="snapshotUrl"
          rules={[{ required: true, message: '请输入目标 URL' }]}
        >
          <Input placeholder="https://api.example.com" />
        </Form.Item>

        <Form.Item
          label="URL 模式"
          name="snapshotUrlPattern"
        >
          <Input placeholder=".*" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="捕获请求头"
              name="snapshotCaptureHeaders"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="持久化映射"
              name="snapshotPersist"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<CameraOutlined />}
            loading={loading}
            block
          >
            创建快照
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SnapshotRecordingCard;
