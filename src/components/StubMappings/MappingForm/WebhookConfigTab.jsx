import React from 'react';
import { Form, Input, Select, Card, Button, Space, InputNumber } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import KeyValueEditor from '../KeyValueEditor';

const { TextArea } = Input;
const { Option } = Select;

const WebhookConfigTab = () => {
  return (
    <Form.List name="postServeActions">
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => (
            <Card
              key={key}
              title={`Webhook ${name + 1}`}
              extra={
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => remove(name)}
                />
              }
              style={{ marginBottom: 16 }}
            >
              <Form.Item
                {...restField}
                label="URL"
                name={[name, 'webhook', 'url']}
                rules={[{ required: true, message: '请输入Webhook URL' }]}
              >
                <Input placeholder="{{jsonPath request.body '$.data.callbackUrl'}}" />
              </Form.Item>

              <Form.Item
                {...restField}
                label="HTTP方法"
                name={[name, 'webhook', 'method']}
              >
                <Select>
                  <Option value="GET">GET</Option>
                  <Option value="POST">POST</Option>
                  <Option value="PUT">PUT</Option>
                  <Option value="DELETE">DELETE</Option>
                </Select>
              </Form.Item>

              <Form.Item
                {...restField}
                label="请求头"
                name={[name, 'webhook', 'headers']}
              >
                <KeyValueEditor placeholder="请求头" />
              </Form.Item>

              <Form.Item
                {...restField}
                label="请求体"
                name={[name, 'webhook', 'body']}
              >
                <TextArea rows={4} placeholder="请求体内容..." />
              </Form.Item>

              <Form.Item
                {...restField}
                label="延时(ms)"
                name={[name, 'webhook', 'fixedDelayMilliseconds']}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Card>
          ))}
          <Button
            type="dashed"
            onClick={() => add()}
            block
            icon={<PlusOutlined />}
          >
            添加 Webhook
          </Button>
        </>
      )}
    </Form.List>
  );
};

export default WebhookConfigTab;
