import { useState } from 'react';
import { notification } from 'antd';
import { stubMappingsApi } from '../../services/wiremockApi';

export const useMappingHandlers = (form, fetchMappings) => {
  const [selectedMapping, setSelectedMapping] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // 创建新映射
  const handleCreate = () => {
    setSelectedMapping(null);
    form.resetFields();
    form.setFieldsValue({
      name: '',
      priority: 5,
      scenarioName: '',
      requiredScenarioState: '',
      newScenarioState: '',
      comment: '',
      request: {
        method: 'GET',
        urlPath: '/',
        urlPathPattern: '',
        queryParameters: {},
        headers: { 'Content-Type': 'application/json' },
        cookies: {},
        basicAuth: { username: '', password: '' },
        body: ''
      },
      response: {
        status: 200,
        statusMessage: '',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
        fixedDelayMilliseconds: 0,
        delayDistribution: { type: 'uniform', lower: 0, upper: 0 }
      },
      postServeActions: []
    });
    setModalVisible(true);
  };

  // 编辑映射
  const handleEdit = (record) => {
    setSelectedMapping(record);
    
    // 正确回写所有配置数据到表单
    const formData = {
      name: record.name || '',
      priority: record.priority || 5,
      scenarioName: record.scenarioName || '',
      requiredScenarioState: record.requiredScenarioState || '',
      newScenarioState: record.newScenarioState || '',
      comment: record.comment || '',
      request: {
        method: record.request?.method || 'GET',
        urlPath: record.request?.urlPath || record.request?.url || record.request?.urlPattern || record.request?.urlPathPattern || '/',
        urlPathPattern: record.request?.urlPathPattern || '',
        queryParameters: record.request?.queryParameters || {},
        headers: record.request?.headers || {},
        cookies: record.request?.cookies || {},
        basicAuth: record.request?.basicAuth || { username: '', password: '' },
        body: record.request?.body || ''
      },
      response: {
        status: record.response?.status || 200,
        statusMessage: record.response?.statusMessage || '',
        headers: record.response?.headers || {},
        body: record.response?.body || (record.response?.jsonBody ? JSON.stringify(record.response.jsonBody, null, 2) : '{}'),
        fixedDelayMilliseconds: record.response?.fixedDelayMilliseconds || 0,
        delayDistribution: record.response?.delayDistribution || { type: 'uniform', lower: 0, upper: 0 }
      },
      postServeActions: (record.postServeActions || []).map(action => ({
        webhook: {
          url: action.webhook?.url || '',
          method: action.webhook?.method || 'POST',
          headers: action.webhook?.headers || {},
          body: action.webhook?.body || '',
          fixedDelayMilliseconds: action.webhook?.fixedDelayMilliseconds || 0
        }
      }))
    };
    
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  // 复制映射
  const handleCopy = (record) => {
    const copiedMapping = {
      ...record,
      name: `${record.name || 'Copy'} - 副本`,
      id: undefined
    };
    setSelectedMapping(null);
    form.setFieldsValue(copiedMapping);
    setModalVisible(true);
  };

  // 查看映射详情
  const handleView = (record) => {
    setSelectedMapping(record);
    setDrawerVisible(true);
  };

  // 删除映射
  const handleDelete = async (id) => {
    try {
      await stubMappingsApi.delete(id);
      notification.success({
        message: '删除成功',
        description: '映射已成功删除',
      });
      fetchMappings();
    } catch (error) {
      notification.error({
        message: '删除失败',
        description: error.message,
      });
    }
  };

  // 保存映射
  const handleSave = async (values) => {
    try {
      const cleanedValues = {
        name: values.name || undefined,
        priority: values.priority || undefined,
        scenarioName: values.scenarioName || undefined,
        requiredScenarioState: values.requiredScenarioState || undefined,
        newScenarioState: values.newScenarioState || undefined,
        comment: values.comment || undefined,
        request: {
          method: values.request.method,
          urlPath: values.request.urlPath || undefined,
          urlPathPattern: values.request.urlPathPattern || undefined,
          queryParameters: Object.keys(values.request.queryParameters || {}).length > 0 
            ? values.request.queryParameters : undefined,
          headers: Object.keys(values.request.headers || {}).length > 0 
            ? values.request.headers : undefined,
          cookies: Object.keys(values.request.cookies || {}).length > 0 
            ? values.request.cookies : undefined,
          basicAuth: (values.request.basicAuth?.username || values.request.basicAuth?.password) 
            ? values.request.basicAuth : undefined,
          body: values.request.body || undefined
        },
        response: {
          ...values.response,
          headers: Object.keys(values.response.headers || {}).length > 0 
            ? values.response.headers : undefined,
          fixedDelayMilliseconds: values.response.fixedDelayMilliseconds > 0 
            ? values.response.fixedDelayMilliseconds : undefined,
          delayDistribution: (values.response.delayDistribution?.lower > 0 || values.response.delayDistribution?.upper > 0)
            ? values.response.delayDistribution : undefined
        },
        postServeActions: values.postServeActions?.length > 0 ? values.postServeActions : undefined
      };

      if (selectedMapping) {
        await stubMappingsApi.update(selectedMapping.id, cleanedValues);
        notification.success({
          message: '更新成功',
          description: '映射已成功更新',
        });
      } else {
        await stubMappingsApi.create(cleanedValues);
        notification.success({
          message: '创建成功',
          description: '映射已成功创建',
        });
      }
      setModalVisible(false);
      fetchMappings();
    } catch (error) {
      notification.error({
        message: selectedMapping ? '更新失败' : '创建失败',
        description: error.message,
      });
    }
  };

  return {
    selectedMapping,
    modalVisible,
    drawerVisible,
    setModalVisible,
    setDrawerVisible,
    handleCreate,
    handleEdit,
    handleCopy,
    handleView,
    handleDelete,
    handleSave,
  };
};
