import React from 'react';
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  InputNumber,
  Collapse,
  Tabs,
  Card,
  Button,
  Space,
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import KeyValueEditor from './KeyValueEditor';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const MappingForm = ({ form, onFinish, selectedMapping }) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
    >
      <Tabs defaultActiveKey="basic">
        <TabPane tab="基本信息" key="basic">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="映射名称" name="name">
                <Input placeholder="输入映射名称" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="优先级" name="priority">
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="场景名称" name="scenarioName">
                <Input placeholder="场景名称" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="所需场景状态" name="requiredScenarioState">
                <Input placeholder="所需状态" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="新场景状态" name="newScenarioState">
                <Input placeholder="新状态" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item label="备注" name="comment">
            <TextArea rows={3} placeholder="输入映射的详细说明..." />
          </Form.Item>
        </TabPane>

        <TabPane tab="请求配置" key="request">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="HTTP方法"
                name={['request', 'method']}
                rules={[{ required: true, message: '请选择HTTP方法' }]}
              >
                <Select>
                  <Option value="GET">GET</Option>
                  <Option value="POST">POST</Option>
                  <Option value="PUT">PUT</Option>
                  <Option value="DELETE">DELETE</Option>
                  <Option value="PATCH">PATCH</Option>
                  <Option value="HEAD">HEAD</Option>
                  <Option value="OPTIONS">OPTIONS</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                label="URL路径"
                name={['request', 'urlPath']}
                rules={[{ required: true, message: '请输入URL路径' }]}
              >
                <Input placeholder="/api/example" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="URL路径模式" name={['request', 'urlPathPattern']}>
            <Input placeholder="/api/users/[0-9]+" />
          </Form.Item>

          <Collapse>
            <Panel header="查询参数" key="params">
              <Form.Item name={['request', 'queryParameters']}>
                <KeyValueEditor placeholder="查询参数" />
              </Form.Item>
            </Panel>

            <Panel header="请求头" key="headers">
              <Form.Item name={['request', 'headers']}>
                <KeyValueEditor placeholder="请求头" />
              </Form.Item>
            </Panel>

            <Panel header="Cookies" key="cookies">
              <Form.Item name={['request', 'cookies']}>
                <KeyValueEditor placeholder="Cookie" />
              </Form.Item>
            </Panel>

            <Panel header="身份验证" key="auth">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="用户名" name={['request', 'basicAuth', 'username']}>
                    <Input placeholder="用户名" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="密码" name={['request', 'basicAuth', 'password']}>
                    <Input.Password placeholder="密码" />
                  </Form.Item>
                </Col>
              </Row>
            </Panel>

            <Panel header="请求体" key="body">
              <Form.Item name={['request', 'body']}>
                <Editor
                  height="200px"
                  language="json"
                  options={{ minimap: { enabled: false } }}
                />
              </Form.Item>
            </Panel>
          </Collapse>
        </TabPane>

        <TabPane tab="响应配置" key="response">
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
        </TabPane>

        <TabPane tab="Webhook配置" key="webhook">
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
