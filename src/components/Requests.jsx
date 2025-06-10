import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Typography,
  Input,
  Card,
  Drawer,
  notification,
  Popconfirm,
  Select,
} from 'antd';
import {
  ReloadOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { requestsApi } from '../services/wiremockApi';
import { createColumns } from './Requests/tableColumns.jsx';
import { filterRequests } from './Requests/filterUtils';
import RequestDetail from './Requests/RequestDetail';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // 获取所有请求记录
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await requestsApi.getAll();
      // 处理不同的响应数据结构
      const requestsData = response.data.requests || response.data || [];
      setRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (error) {
      console.error('获取请求记录失败:', error);
      notification.error({
        message: '获取请求记录失败',
        description: error.response?.data?.message || error.message || '网络连接错误',
      });
      setRequests([]); // 确保在错误时设置为空数组
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 查看请求详情
  const handleView = (record) => {
    setSelectedRequest(record);
    setDrawerVisible(true);
  };

  // 清空所有请求记录
  const handleClearAll = async () => {
    try {
      await requestsApi.deleteAll();
      notification.success({
        message: '清空成功',
        description: '所有请求记录已被删除',
      });
      fetchRequests();
    } catch (error) {
      notification.error({
        message: '清空失败',
        description: error.message,
      });
    }
  };

  // 创建表格列配置
  const columns = createColumns(handleView);

  // 过滤请求
  const filteredRequests = filterRequests(requests, searchText, methodFilter, statusFilter);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              请求记录
            </Title>
            <Text type="secondary">查看和分析所有传入的 HTTP 请求</Text>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <Space>
          <Search
            placeholder="搜索请求..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="方法"
            allowClear
            value={methodFilter}
            onChange={setMethodFilter}
            style={{ width: 120 }}
          >
            <Option value="GET">GET</Option>
            <Option value="POST">POST</Option>
            <Option value="PUT">PUT</Option>
            <Option value="DELETE">DELETE</Option>
            <Option value="PATCH">PATCH</Option>
          </Select>
          <Select
            placeholder="状态码"
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
          >
            <Option value="2xx">2xx</Option>
            <Option value="3xx">3xx</Option>
            <Option value="4xx">4xx</Option>
            <Option value="5xx">5xx</Option>
          </Select>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchRequests} loading={loading}>
            刷新
          </Button>
          <Popconfirm
            title="确定要清空所有请求记录吗？此操作不可恢复！"
            onConfirm={handleClearAll}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />}>
              清空记录
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Card className="content-card">
        <Table
          columns={columns}
          dataSource={filteredRequests}
          rowKey={(record) => record.id || record.uuid || `${record.loggedDate}-${Math.random()}`}
          loading={loading}
          pagination={{
            total: filteredRequests.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 查看请求详情抽屉 */}
      <Drawer
        title="请求详情"
        placement="right"
        width={800}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        <RequestDetail request={selectedRequest} />
      </Drawer>
    </div>
  );
};

export default Requests;
