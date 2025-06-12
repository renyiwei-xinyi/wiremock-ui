import React, { useState } from 'react';
import { 
  Card, 
  Tabs, 
  Button, 
  Space, 
  Tag, 
  Typography, 
  Descriptions, 
  List, 
  Empty,
  Tooltip,
  Dropdown,
  Menu
} from 'antd';
import { 
  CopyOutlined, 
  DownloadOutlined, 
  HistoryOutlined,
  RedoOutlined,
  DeleteOutlined,
  CodeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';

const { TabPane } = Tabs;
const { Text, Paragraph } = Typography;

const ResponseSection = ({ 
  response, 
  loading, 
  onCopyResponse, 
  requestHistory = [], 
  onCopyAsCurl, 
  onResendFromHistory, 
  onClearHistory 
}) => {
  const [activeTab, setActiveTab] = useState('response');

  // 格式化响应数据
  const formatResponseData = (data) => {
    if (typeof data === 'string') return data;
    return JSON.stringify(data, null, 2);
  };

  // 格式化文件大小
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  // 获取状态码颜色
  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 300 && status < 400) return 'warning';
    if (status >= 400) return 'error';
    return 'default';
  };

  // 历史记录操作菜单
  const getHistoryMenu = (item) => (
    <Menu>
      <Menu.Item 
        key="resend" 
        icon={<RedoOutlined />}
        onClick={() => onResendFromHistory(item)}
      >
        重新发送
      </Menu.Item>
      <Menu.Item 
        key="copy-curl" 
        icon={<CodeOutlined />}
        onClick={() => {
          const req = item.request;
          let curl = `curl -X ${req.method} '${req.url}'`;
          
          if (req.headers && Object.keys(req.headers).length > 0) {
            Object.entries(req.headers).forEach(([key, value]) => {
              curl += ` -H '${key}: ${value}'`;
            });
          }
          
          if (req.data) {
            curl += ` -d '${typeof req.data === 'string' ? req.data : JSON.stringify(req.data)}'`;
          }
          
          navigator.clipboard.writeText(curl);
        }}
      >
        复制为cURL
      </Menu.Item>
    </Menu>
  );

  return (
    <Card 
      title="响应结果" 
      size="small" 
      style={{ flex: 1, minHeight: 0 }}
      bodyStyle={{ height: '100%', padding: 0 }}
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab} 
        size="small"
        tabBarExtraContent={
          <Space>
            {response && (
              <>
                <Button 
                  size="small" 
                  icon={<CopyOutlined />} 
                  onClick={onCopyResponse}
                >
                  复制响应
                </Button>
                {onCopyAsCurl && (
                  <Button 
                    size="small" 
                    icon={<CodeOutlined />} 
                    onClick={onCopyAsCurl}
                  >
                    复制cURL
                  </Button>
                )}
              </>
            )}
          </Space>
        }
      >
        {/* 响应数据 */}
        <TabPane tab="响应数据" key="response">
          <div style={{ height: '300px', padding: '8px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Text>发送请求中...</Text>
              </div>
            ) : response ? (
              <div style={{ height: '100%' }}>
                {/* 响应概览 */}
                <div style={{ marginBottom: '12px' }}>
                  <Space wrap>
                    <Tag color={getStatusColor(response.status)} style={{ fontSize: '14px', padding: '4px 8px' }}>
                      {response.status} {response.statusText}
                    </Tag>
                    <Text type="secondary">
                      <ClockCircleOutlined /> {response.duration}ms
                    </Text>
                    <Text type="secondary">
                      <DownloadOutlined /> {formatSize(response.size)}
                    </Text>
                    {response.error && (
                      <Tag color="error" icon={<ExclamationCircleOutlined />}>
                        请求失败
                      </Tag>
                    )}
                  </Space>
                </div>

                {/* 响应内容 */}
                <div style={{ height: 'calc(100% - 50px)' }}>
                  <Editor
                    value={formatResponseData(response.data)}
                    language="json"
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      fontSize: 12,
                    }}
                  />
                </div>
              </div>
            ) : (
              <Empty 
                description="暂无响应数据" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ marginTop: '50px' }}
              />
            )}
          </div>
        </TabPane>

        {/* 响应头 */}
        {response && (
          <TabPane tab="响应头" key="headers">
            <div style={{ height: '300px', padding: '8px', overflow: 'auto' }}>
              {response.headers && Object.keys(response.headers).length > 0 ? (
                <Descriptions column={1} size="small" bordered>
                  {Object.entries(response.headers).map(([key, value]) => (
                    <Descriptions.Item key={key} label={key}>
                      <Text copyable={{ text: value }} style={{ fontSize: '12px' }}>
                        {value}
                      </Text>
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              ) : (
                <Empty description="无响应头信息" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>
          </TabPane>
        )}

        {/* 请求历史 */}
        <TabPane 
          tab={
            <Space>
              <HistoryOutlined />
              <span>请求历史</span>
              {requestHistory.length > 0 && (
                <Tag size="small">{requestHistory.length}</Tag>
              )}
            </Space>
          } 
          key="history"
        >
          <div style={{ height: '300px', padding: '8px' }}>
            <div style={{ marginBottom: '8px', textAlign: 'right' }}>
              {requestHistory.length > 0 && (
                <Button 
                  size="small" 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={onClearHistory}
                >
                  清空历史
                </Button>
              )}
            </div>
            
            {requestHistory.length > 0 ? (
              <List
                size="small"
                dataSource={requestHistory}
                style={{ height: 'calc(100% - 40px)', overflow: 'auto' }}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Dropdown 
                        overlay={getHistoryMenu(item)} 
                        trigger={['click']}
                        key="actions"
                      >
                        <Button size="small" type="text">
                          操作
                        </Button>
                      </Dropdown>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        item.success ? (
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        ) : (
                          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                        )
                      }
                      title={
                        <Space>
                          <Tag size="small">{item.request.method}</Tag>
                          <Text style={{ fontSize: '12px' }}>
                            {item.request.url}
                          </Text>
                          {item.response.status && (
                            <Tag 
                              size="small" 
                              color={getStatusColor(item.response.status)}
                            >
                              {item.response.status}
                            </Tag>
                          )}
                        </Space>
                      }
                      description={
                        <div>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {formatTime(item.request.timestamp)}
                          </Text>
                          {item.error && (
                            <div>
                              <Text type="danger" style={{ fontSize: '11px' }}>
                                {item.error}
                              </Text>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty 
                description="暂无请求历史" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ marginTop: '50px' }}
              />
            )}
          </div>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default ResponseSection;
