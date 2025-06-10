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
      notification.error({
        message: '删除失败',
        description: error.message,
      });
    }
  };

  // 保存映射
  const handleSave = async (values, selectedMapping) => {
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
      
      fetchMappings();
      return true; // 表示操作成功
    } catch (error) {
      notification.error({
        message: selectedMapping ? '更新失败' : '创建失败',
        description: error.message,
      });
      return false; // 表示操作失败
    }
  };

  return {
    handleDelete,
    handleSave,
  };
};
