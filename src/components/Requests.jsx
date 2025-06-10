import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Typography,
  Input,
  Card,
  Tag,
  Drawer,
  notification,
  Popconfirm,
  DatePicker,
  Select,
} from 'antd';
import {
  HistoryOutlined,
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { requestsApi } from '../services/wiremockApi';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;
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
      setRequests(response.data.requests || []);
    } catch (error) {
      notification.error({
        message: '获取请求记录失败',
        description: error.message,
      });
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

  // 获取方法标签样式
  const getMethodTag = (method) => {
    const colors = {
      GET: 'blue',
      POST: 'green',
      PUT: 'orange',
      DELETE: 'red',
      PATCH: 'purple',
      HEAD: 'cyan',
      OPTIONS: 'magenta',
    };
    return (
      <Tag color={colors[method] || 'default'} className={`method-${method?.toLowerCase()}`}>
        {method}
      </Tag>
    );
  };

  // 获取状态码标签样式
  const getStatusTag = (status) => {
    let color = 'default';
    if (status >= 200 && status < 300) color = 'green';
    else if (status >= 300 && status < 400) color = 'blue';
    else if (status >= 400 && status < 500) color = 'orange';
    else if (status >= 500) color = 'red';

    return <Tag color={color}>{status}</Tag>;
  };

  // 过滤请求
  const filteredRequests = requests.filter((request) => {
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const matchesSearch = 
        request.request?.url?.toLowerCase().includes(searchLower) ||
        request.request?.method?.toLowerCase().includes(searchLower) ||
        request.request?.headers?.some(h => 
          h.key?.toLowerCase().includes(searchLower) || 
          h.values?.some(v => v.toLowerCase().includes(searchLower))
        );
      if (!matchesSearch) return false;
    }

    if (methodFilter && request.request?.method !== methodFilter) {
      return false;
    }

    if (statusFilter) {
      const status = request.response?.status;
      if (statusFilter === '2xx' && !(status >= 200 && status < 300)) return false;
      if (statusFilter === '3xx' && !(status >= 300 && status < 400)) return false;
      if (statusFilter === '4xx' && !(status >= 400 && status < 500)) return false;
      if (statusFilter === '5xx' && !(status >= 500)) return false;
    }

    return true;
  });

  const columns = [
    {
      title: '时间',
      dataIndex: 'loggedDate',
      key: 'loggedDate',
      width: 180,
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => new Date(a.loggedDate) - new Date(b.loggedDate),
      defaultSortOrder: 'descend',
    },
    {
      title: '方法',
      dataIndex: ['request', 'method'],
      key: 'method',
      width: 80,
      render: (method) => getMethodTag(method),
    },
    {
      title: 'URL',
      dataIndex: ['request', 'url'],
      key: 'url',
      render: (url) => <Text code>{url}</Text>,
    },
    {
      title: '状态码',
      dataIndex: ['response', 'status'],
      key: 'status',
      width: 80,
      render: (status) => getStatusTag(status),
    },
    {
      title: '匹配状态',
      dataIndex: 'wasMatched',
      key: 'wasMatched',
      width: 100,
      render: (matched) => (
        <Tag color={matched ? 'green' : 'red'}>
          {matched ? '已匹配' : '未匹配'}
        </Tag>
      ),
    },
    {
      title: '响应时间',
      dataIndex: 'responseTime',
      key: 'responseTime',
      width: 100,
      render: (time) => time ? `${time}ms` : '-',
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
          title="查看详情"
        />
      ),
    },
  ];

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
          rowKey="id"
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
        {selectedRequest && (
          <div>
            <Title level={4}>基本信息</Title>
            <p><strong>请求ID:</strong> {selectedRequest.id}</p>
            <p><strong>时间:</strong> {dayjs(selectedRequest.loggedDate).format('YYYY-MM-DD HH:mm:ss')}</p>
            <p><strong>匹配状态:</strong> 
              <Tag color={selectedRequest.wasMatched ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                {selectedRequest.wasMatched ? '已匹配' : '未匹配'}
              </Tag>
            </p>
            {selectedRequest.responseTime && (
              <p><strong>响应时间:</strong> {selectedRequest.responseTime}ms</p>
            )}
            
            <Title level={4} style={{ marginTop: 24 }}>请求信息</Title>
            <div className="json-editor">
              <Editor
                height="300px"
                defaultLanguage="json"
                value={JSON.stringify(selectedRequest.request, null, 2)}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
            
            {selectedRequest.response && (
              <>
                <Title level={4} style={{ marginTop: 24 }}>响应信息</Title>
                <div className="json-editor">
                  <Editor
                    height="300px"
                    defaultLanguage="json"
                    value={JSON.stringify({
                      ...selectedRequest.response,
                      // 格式化body字段，去除转义
                      body: selectedRequest.response.body ? 
                        (typeof selectedRequest.response.body === 'string' ? 
                          (() => {
                            try {
                              return JSON.parse(selectedRequest.response.body);
                            } catch {
                              return selectedRequest.response.body;
                            }
                          })() : selectedRequest.response.body
                        ) : undefined,
                      // 移除bodyAsBase64字段
                      bodyAsBase64: undefined
                    }, null, 2)}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
              </>
            )}
            
            {selectedRequest.postServeActions && selectedRequest.postServeActions.length > 0 && (
              <>
                <Title level={4} style={{ marginTop: 24 }}>Webhook 回调</Title>
                <div className="json-editor">
                  <Editor
                    height="200px"
                    defaultLanguage="json"
                    value={JSON.stringify(selectedRequest.postServeActions, null, 2)}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Requests;
