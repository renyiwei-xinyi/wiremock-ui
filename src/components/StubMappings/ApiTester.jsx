import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Space,
  Card,
  Tabs,
  Tag,
  Switch,
  Alert,
} from 'antd';
import {
  PlayCircleOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import RequestConfigSection, { DynamicFormList } from './ApiTester/RequestConfigSection';
import ResponseSection from './ApiTester/ResponseSection';
import EmbeddedApiTester from './ApiTester/EmbeddedApiTester';
import { useApiTester } from './ApiTester/hooks/useApiTester';

const { TabPane } = Tabs;

const ApiTester = ({ visible, onClose, mapping }) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('headers');
  const [useEmbeddedTool, setUseEmbeddedTool] = useState(true);

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
  useEffect(() => {
    if (visible) {
      // 重置表单
      form.resetFields();
      
      let defaultValues;
      if (mapping) {
        defaultValues = getDefaultValues(mapping);
        console.log('从mapping初始化表单:', defaultValues);
      } else {
        // 如果没有mapping，设置默认值
        defaultValues = {
          method: 'GET',
          url: '/',
          headers: [],
          queryParams: [],
          body: ''
        };
        console.log('使用默认值初始化表单:', defaultValues);
      }
      
      // 设置表单值
      form.setFieldsValue(defaultValues);
      
      // 验证表单值是否正确设置
      setTimeout(() => {
        const currentValues = form.getFieldsValue();
        console.log('表单当前值:', currentValues);
        console.log('method字段值:', currentValues.method, typeof currentValues.method);
      }, 100);
    }
  }, [visible, mapping, form, getDefaultValues]);

  // 发送请求处理
  const handleSendRequest = async () => {
    try {
      // 先获取当前表单值进行调试
      const currentValues = form.getFieldsValue();
      console.log('发送请求前的表单值:', currentValues);
      console.log('method字段详情:', {
        value: currentValues.method,
        type: typeof currentValues.method,
        isEmpty: !currentValues.method,
        isUndefined: currentValues.method === undefined,
        isNull: currentValues.method === null
      });
      
      const values = await form.validateFields();
      console.log('验证后的表单值:', values);
      
      // 确保method字段有值
      if (!values.method) {
        console.error('method字段为空，强制设置为GET');
        values.method = 'GET';
        form.setFieldValue('method', 'GET');
      }
      
      await sendRequest(values);
    } catch (error) {
      console.error('表单验证失败:', error);
      
      // 如果验证失败，尝试获取当前值并设置默认method
      const currentValues = form.getFieldsValue();
      if (!currentValues.method) {
        console.log('设置默认method为GET');
        form.setFieldValue('method', 'GET');
        // 重新尝试发送
        try {
          const retryValues = await form.validateFields();
          await sendRequest(retryValues);
        } catch (retryError) {
          console.error('重试发送失败:', retryError);
        }
      }
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
      
      console.log('从历史记录设置表单数据:', formData);
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
        {/* 工具选择器 */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space align="center">
            <ExperimentOutlined />
            <span>测试工具模式：</span>
            <Switch
              checked={useEmbeddedTool}
              onChange={setUseEmbeddedTool}
              checkedChildren={<><ThunderboltOutlined /> 专业工具</>}
              unCheckedChildren="内置工具"
            />
            {useEmbeddedTool && (
              <Tag color="green">推荐：避免CORS问题</Tag>
            )}
          </Space>
          
          {!useEmbeddedTool && (
            <Alert
              message="CORS 警告"
              description="内置工具可能遇到CORS跨域问题，建议使用专业工具模式获得更好的体验。"
              type="warning"
              showIcon
              style={{ marginTop: 12 }}
            />
          )}
        </Card>

        {useEmbeddedTool ? (
          /* 嵌入式专业工具 */
          <EmbeddedApiTester 
            mapping={mapping} 
            mockServiceUrl={mockServiceUrl}
          />
        ) : (
          /* 原有的内置工具 */
          <Form 
            form={form} 
            layout="vertical" 
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            initialValues={{
              method: 'GET',
              url: '/',
              headers: [],
              queryParams: [],
              body: ''
            }}
          >
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
        )}
      </div>
    </Modal>
  );
};

export default ApiTester;
