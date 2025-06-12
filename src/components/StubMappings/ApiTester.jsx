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
  const { 
    loading, 
    response, 
    requestHistory,
    sendRequest, 
    copyResponse, 
    copyAsCurl,
    resendFromHistory,
    clearHistory,
    getDefaultValues 
  } = useApiTester(mockServiceUrl);

  // 初始化表单数据
  React.useEffect(() => {
    if (visible && mapping) {
      const defaultValues = getDefaultValues(mapping);
      form.setFieldsValue(defaultValues);
    } else if (visible && !mapping) {
      // 如果没有mapping，设置默认值
      form.setFieldsValue({
        method: 'GET',
        url: '/',
        headers: [],
        queryParams: [],
        body: ''
      });
    }
  }, [visible, mapping, form, getDefaultValues]);

  // 发送请求处理
  const handleSendRequest = async () => {
    try {
      const values = await form.validateFields();
      console.log('表单值:', values); // 调试日志
      await sendRequest(values);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 从历史记录重新发送请求
  const handleResendFromHistory = async (historyItem) => {
    try {
      // 更新表单数据
      const formData = {
        method: historyItem.request.method,
        url: historyItem.request.url.replace(mockServiceUrl, ''),
        headers: Object.entries(historyItem.request.headers || {}).map(([name, value]) => ({
          key: Math.random().toString(36).substr(2, 9),
          name,
          value
        })),
        queryParams: Object.entries(historyItem.request.params || {}).map(([name, value]) => ({
          key: Math.random().toString(36).substr(2, 9),
          name,
          value
        })),
        body: historyItem.request.data ? 
          (typeof historyItem.request.data === 'string' ? 
            historyItem.request.data : 
            JSON.stringify(historyItem.request.data, null, 2)
          ) : ''
      };
      
      form.setFieldsValue(formData);
      
      // 发送请求
      await resendFromHistory(historyItem);
    } catch (error) {
      console.error('重新发送请求失败:', error);
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
            requestHistory={requestHistory}
            onCopyAsCurl={copyAsCurl}
            onResendFromHistory={handleResendFromHistory}
            onClearHistory={clearHistory}
          />
        </Form>
      </div>
    </Modal>
  );
};

export default ApiTester;
