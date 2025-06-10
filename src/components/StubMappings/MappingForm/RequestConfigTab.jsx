import React from 'react';
import { Form, Input, Select, Row, Col, Collapse } from 'antd';
import Editor from '@monaco-editor/react';
import KeyValueEditor from '../KeyValueEditor';

const { Option } = Select;
const { Panel } = Collapse;

const RequestConfigTab = () => {
  return (
    <>
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
    </>
  );
};

export default RequestConfigTab;
