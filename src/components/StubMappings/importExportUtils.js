import { notification } from 'antd';
import { stubMappingsApi } from '../../services/wiremockApi';

// 导出映射
export const handleExport = (mappings, selectedRowKeys) => {
  try {
    let exportMappings = mappings;
    let fileName = 'wiremock-mappings-all';
    
    if (selectedRowKeys.length > 0) {
      exportMappings = mappings.filter(mapping => selectedRowKeys.includes(mapping.id));
      fileName = 'wiremock-mappings-selected';
    }
    
    const dataStr = JSON.stringify({ mappings: exportMappings }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    notification.success({
      message: '导出成功',
      description: `已导出 ${exportMappings.length} 个映射配置`,
    });
  } catch (error) {
    notification.error({
      message: '导出失败',
      description: error.message,
    });
  }
};

// 导入映射
export const handleImport = (file, fetchMappings) => {
  // 验证文件类型
  if (!file.type.includes('json') && !file.name.endsWith('.json')) {
    notification.error({
      message: '文件类型错误',
      description: '请选择 JSON 格式的文件',
    });
    return false;
  }

  // 验证文件大小 (限制为 10MB)
  if (file.size > 10 * 1024 * 1024) {
    notification.error({
      message: '文件过大',
      description: '文件大小不能超过 10MB',
    });
    return false;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const importData = JSON.parse(e.target.result);
      
      // 验证数据结构
      if (!importData || (typeof importData !== 'object')) {
        throw new Error('无效的文件格式');
      }

      const importMappings = importData.mappings || (Array.isArray(importData) ? importData : [importData]);
      
      if (!Array.isArray(importMappings) || importMappings.length === 0) {
        throw new Error('文件中没有找到有效的映射数据');
      }

      let successCount = 0;
      let errorCount = 0;
      
      for (const mapping of importMappings) {
        try {
          // 清理映射数据
          const cleanMapping = { ...mapping };
          delete cleanMapping.id;
          delete cleanMapping.uuid;
          
          // 验证必要字段
          if (!cleanMapping.request || !cleanMapping.response) {
            throw new Error('映射缺少必要的 request 或 response 字段');
          }

          await stubMappingsApi.create(cleanMapping);
          successCount++;
        } catch (mappingError) {
          console.error('导入单个映射失败:', mappingError);
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        notification.success({
          message: '导入完成',
          description: `成功导入 ${successCount} 个映射${errorCount > 0 ? `，失败 ${errorCount} 个` : ''}`,
        });
        fetchMappings();
      } else {
        notification.error({
          message: '导入失败',
          description: '所有映射都导入失败，请检查文件格式',
        });
      }
    } catch (error) {
      console.error('导入文件解析失败:', error);
      notification.error({
        message: '导入失败',
        description: error.message || '文件格式错误或导入过程中出现问题',
      });
    }
  };

  reader.onerror = () => {
    notification.error({
      message: '文件读取失败',
      description: '无法读取选择的文件',
    });
  };

  reader.readAsText(file);
  return false;
};

// 过滤映射
export const filterMappings = (mappings, searchText) => {
  if (!searchText) return mappings;
  
  const searchLower = searchText.toLowerCase();
  return mappings.filter((mapping) => (
    mapping.request?.urlPath?.toLowerCase().includes(searchLower) ||
    mapping.request?.urlPathPattern?.toLowerCase().includes(searchLower) ||
    mapping.request?.urlPattern?.toLowerCase().includes(searchLower) ||
    mapping.request?.url?.toLowerCase().includes(searchLower) ||
    mapping.request?.urlEqualTo?.toLowerCase().includes(searchLower) ||
    mapping.request?.method?.toLowerCase().includes(searchLower) ||
    mapping.name?.toLowerCase().includes(searchLower) ||
    mapping.comment?.toLowerCase().includes(searchLower)
  ));
};
