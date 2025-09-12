import { notification } from 'antd';
import { stubMappingsApi } from '../../../services/wiremockApi';

// 映射操作相关的逻辑
export const useMappingOperations = (fetchMappings) => {
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
      console.error('删除映射失败:', error);
      notification.error({
        message: '删除失败',
        description: error.response?.data?.message || error.message || '删除操作失败',
      });
    }
  };

  // 保存映射
  const handleSave = async (values, selectedMapping) => {
    try {
      // 处理metadata字段
      let metadata = values.metadata || {};
      if (values.metadata?.wmui?.description) {
        metadata = {
          ...metadata,
          wmui: {
            ...metadata.wmui,
            description: values.metadata.wmui.description
          }
        };
      }

      const cleanedValues = {
        name: values.name || undefined,
        priority: values.priority || undefined,
        scenarioName: values.scenarioName || undefined,
        requiredScenarioState: values.requiredScenarioState || undefined,
        newScenarioState: values.newScenarioState || undefined,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
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
        postServeActions: values.postServeActions?.length > 0 ? 
          values.postServeActions.map(action => {
            // 将表单数据转换回WireMock期望的格式
            if (action.webhook) {
              return {
                name: 'webhook',
                parameters: {
                  url: action.webhook.url || '',
                  method: action.webhook.method || 'POST',
                  headers: Object.keys(action.webhook.headers || {}).length > 0 
                    ? action.webhook.headers : undefined,
                  body: action.webhook.body || undefined,
                  fixedDelayMilliseconds: action.webhook.fixedDelayMilliseconds > 0 
                    ? action.webhook.fixedDelayMilliseconds : undefined
                }
              };
            }
            return action;
          }).filter(action => action.name === 'webhook' && action.parameters?.url) : undefined
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
      
      fetchMappings();
      return true; // 表示操作成功
    } catch (error) {
      console.error('保存映射失败:', error);
      notification.error({
        message: selectedMapping ? '更新失败' : '创建失败',
        description: error.response?.data?.message || error.message || '保存操作失败，请检查配置是否正确',
      });
      return false; // 表示操作失败
    }
    };

  return {
    handleDelete,
    handleSave,
  };
};