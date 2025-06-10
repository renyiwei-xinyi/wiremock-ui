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
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const importData = JSON.parse(e.target.result);
      const importMappings = importData.mappings || [importData];
      
      for (const mapping of importMappings) {
        delete mapping.id;
        await stubMappingsApi.create(mapping);
      }
      
      notification.success({
        message: '导入成功',
        description: `成功导入 ${importMappings.length} 个映射`,
      });
      fetchMappings();
    } catch (error) {
      notification.error({
        message: '导入失败',
        description: '文件格式错误或导入过程中出现问题',
      });
    }
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
