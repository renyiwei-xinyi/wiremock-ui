import React from 'react';
import { Form, Input, Row, Col, InputNumber } from 'antd';

const { TextArea } = Input;

const BasicInfoTab = () => {
  return (
    <>
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
      
      <Form.Item label="备注" name={['metadata', 'wmui', 'description']}>
        <TextArea rows={3} placeholder="输入映射的详细说明..." />
      </Form.Item>
    </>
  );
};

export default BasicInfoTab;