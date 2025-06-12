import React, { useState } from 'react';
import {
  Modal,
  Form,
  Space,
  Card,
  Tabs,
  Tag,
} from 'antd';
import {
  PlayCircleOutlined,
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import RequestConfigSection, { DynamicFormList } from './ApiTester/RequestConfigSection';
import ResponseSection from './ApiTester/ResponseSection';
import { useApiTester } from './ApiTester/hooks/useApiTester';

const { TabPane } = Tabs;

const ApiTester = ({ visible, onClose, mapping }) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('headers');

  // Mock服务域名
  const mockServiceUrl = 'http://os.wiremock.server.qa.17u.cn';

  // 使用自定义Hook
  const { loading, response, sendRequest, copyResponse, getDefaultValues } = useApiTester(mockServiceUrl);

  // 初始化表单数据
  React.useEffect(() => {
    if (visible && mapping) {
      const defaultValues = getDefaultValues(mapping);
      form.setFieldsValue(defaultValues);
    }
  }, [visible, mapping, form, getDefaultValues]);

  // 发送请求处理
  const handleSendRequest = async () => {
    try {
      const values = await form.validateFields();
      await sendRequest(values);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <PlayCircleOutlined />
          <span>API 测试工具</span>
          {mapping && (
            <Tag color="blue">
              {mapping.name || `${mapping.request?.method} ${mapping.request?.urlPath || mapping.request?.url}`}
            </Tag>
          )}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={null}
      destroyOnClose
    >
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
        <Form form={form} layout="vertical" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* 请求配置区域 */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <RequestConfigSection
              form={form}
              onSendRequest={handleSendRequest}
              loading={loading}
              mockServiceUrl={mockServiceUrl}
            />

            {/* 请求参数标签页 */}
            <Tabs activeKey={activeTab} onChange={setActiveTab} size="small">
              <TabPane tab="请求头" key="headers">
                <DynamicFormList name="headers" placeholder="请求头" />
              </TabPane>
              <TabPane tab="查询参数" key="queryParams">
                <DynamicFormList name="queryParams" placeholder="查询参数" />
              </TabPane>
              <TabPane tab="请求体" key="body">
                <Form.Item name="body">
                  <Editor
                    height="200px"
                    defaultLanguage="json"
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: 'on'
                    }}
                  />
                </Form.Item>
              </TabPane>
            </Tabs>
          </Card>

          {/* 响应区域 */}
          <ResponseSection
            response={response}
            loading={loading}
            onCopyResponse={copyResponse}
          />
        </Form>
      </div>
    </Modal>
  );
};

export default ApiTester;
