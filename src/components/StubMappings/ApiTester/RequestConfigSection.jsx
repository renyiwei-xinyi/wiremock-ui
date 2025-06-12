import React from 'react';
import { Form, Input, Select, Space, Button } from 'antd';
import { SendOutlined, CloseOutlined } from '@ant-design/icons';

const { Option } = Select;

const RequestConfigSection = ({ form, onSendRequest, loading, mockServiceUrl }) => {
  // 动态表单项组件
  const DynamicFormList = ({ name, placeholder }) => (
    <Form.List name={name}>
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name: fieldName, ...restField }) => (
            <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
              <Form.Item
                {...restField}
                name={[fieldName, 'name']}
                style={{ margin: 0, width: 150 }}
              >
                <Input placeholder="名称" />
              </Form.Item>
              <Form.Item
                {...restField}
                name={[fieldName, 'value']}
                style={{ margin: 0, flex: 1 }}
              >
                <Input placeholder="值" />
              </Form.Item>
              <Button type="text" danger onClick={() => remove(fieldName)} icon={<CloseOutlined />} />
            </Space>
          ))}
          <Button type="dashed" onClick={() => add()} block>
            添加{placeholder}
          </Button>
        </>
      )}
    </Form.List>
  );

  return (
    <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
      <Form.Item name="method" style={{ margin: 0 }}>
        <Select style={{ width: 100 }}>
          <Option value="GET">GET</Option>
          <Option value="POST">POST</Option>
          <Option value="PUT">PUT</Option>
          <Option value="DELETE">DELETE</Option>
          <Option value="PATCH">PATCH</Option>
          <Option value="HEAD">HEAD</Option>
          <Option value="OPTIONS">OPTIONS</Option>
        </Select>
      </Form.Item>
      <Form.Item name="url" style={{ margin: 0, flex: 1 }}>
        <Input 
          placeholder="/api/example" 
          addonBefore={<span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{mockServiceUrl}</span>}
        />
      </Form.Item>
      <Button 
        type="primary" 
        icon={<SendOutlined />} 
        onClick={onSendRequest}
        loading={loading}
      >
        发送请求
      </Button>
    </Space.Compact>
  );
};

export { DynamicFormList };
export default RequestConfigSection;
