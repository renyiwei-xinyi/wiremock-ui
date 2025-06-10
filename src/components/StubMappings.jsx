import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Typography,
  Input,
  Modal,
  Form,
  Card,
  Drawer,
  Upload,
  notification,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  DownloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { stubMappingsApi } from '../services/wiremockApi';
import { createColumns } from './StubMappings/tableColumns';
import { useMappingHandlers } from './StubMappings/useMappingHandlers';
import { handleExport, handleImport, filterMappings } from './StubMappings/importExportUtils';
import MappingForm from './StubMappings/MappingForm';
import MappingDetail from './StubMappings/MappingDetail';

const { Title, Text } = Typography;
const { Search } = Input;

const StubMappings = () => {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();

  // 获取所有映射
  const fetchMappings = async () => {
    setLoading(true);
    try {
      const response = await stubMappingsApi.getAll();
      // 处理不同的响应数据结构
      const mappingsData = response.data.mappings || response.data || [];
      setMappings(Array.isArray(mappingsData) ? mappingsData : []);
    } catch (error) {
      console.error('获取映射失败:', error);
      notification.error({
        message: '获取映射失败',
        description: error.response?.data?.message || error.message || '网络连接错误',
      });
      setMappings([]); // 确保在错误时设置为空数组
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  // 使用自定义hooks处理业务逻辑
  const {
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
  } = useMappingHandlers(form, fetchMappings);

  // 创建表格列配置
  const columns = createColumns({
    handleView,
    handleEdit,
    handleCopy,
    handleDelete,
  });

  // 过滤映射数据
  const filteredMappings = filterMappings(mappings, searchText);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Stub 映射管理
            </Title>
            <Text type="secondary">管理 API 模拟映射规则</Text>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <Space>
          <Search
            placeholder="搜索映射..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchMappings} loading={loading}>
            刷新
          </Button>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={() => handleExport(mappings, selectedRowKeys)}
          >
            导出
          </Button>
          <Upload
            accept=".json"
            showUploadList={false}
            beforeUpload={(file) => handleImport(file, fetchMappings)}
          >
            <Button icon={<UploadOutlined />}>
              导入
            </Button>
          </Upload>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建映射
          </Button>
        </Space>
      </div>

      <Card className="content-card">
        <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f6f8fa', borderRadius: 6 }}>
          <Title level={4} style={{ margin: '0 0 8px 0' }}>💡 映射配置说明</Title>
          <Text type="secondary">
            映射配置是 WireMock 的核心功能，用于定义如何匹配传入的 HTTP 请求并返回相应的响应。
            每个映射包含请求匹配条件（URL、方法、头部等）和响应配置（状态码、响应体、延时等）。
            您可以创建多个映射来模拟不同的 API 端点，支持正则表达式匹配、场景状态管理和 Webhook 回调。
          </Text>
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredMappings}
          rowKey={(record) => record.id || record.uuid || `mapping-${Math.random()}`}
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            selections: [
              Table.SELECTION_ALL,
              Table.SELECTION_INVERT,
              Table.SELECTION_NONE,
            ],
          }}
          pagination={{
            total: filteredMappings.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录${selectedRowKeys.length > 0 ? `，已选择 ${selectedRowKeys.length} 条` : ''}`,
          }}
        />
      </Card>

      {/* 创建/编辑映射模态框 */}
      <Modal
        title={selectedMapping ? '编辑映射' : '创建映射'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={1200}
        footer={null}
        destroyOnClose
      >
        <MappingForm
          form={form}
          onFinish={handleSave}
          selectedMapping={selectedMapping}
        />
      </Modal>

      {/* 查看映射详情抽屉 */}
      <Drawer
        title="映射详情"
        placement="right"
        width={800}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        <MappingDetail mapping={selectedMapping} />
      </Drawer>
    </div>
  );
};

export default StubMappings;
