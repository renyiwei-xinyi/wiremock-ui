import React from 'react';
import { Card, Space, Button, Tag, Alert, Spin, Tabs, Table, Typography } from 'antd';
import { HistoryOutlined, CopyOutlined, PlayCircleOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';

const { Text } = Typography;
const { TabPane } = Tabs;

const ResponseSection = ({ response, loading, onCopyResponse }) => {
  // 获取状态颜色
  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 300 && status < 400) return 'warning';
    if (status >= 400) return 'error';
    return 'default';
  };

  return (
    <Card 
      title={
        <Space>
          <HistoryOutlined />
          <span>响应结果</span>
          {response && (
            <Button 
              size="small" 
              icon={<CopyOutlined />} 
              onClick={onCopyResponse}
            >
              复制响应
            </Button>
          )}
        </Space>
      }
      size="small"
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>发送请求中...</div>
        </div>
      ) : response ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* 响应状态 */}
          <Space style={{ marginBottom: 16 }}>
            <Tag color={getStatusColor(response.status)} style={{ fontSize: '14px', padding: '4px 8px' }}>
              {response.status} {response.statusText}
            </Tag>
            <Text type="secondary">耗时: {response.duration}ms</Text>
            <Text type="secondary">大小: {response.size} bytes</Text>
            <Text type="secondary">时间: {new Date(response.timestamp).toLocaleString()}</Text>
          </Space>

          {response.error && (
            <Alert
              message="请求失败"
              description="请检查网络连接和服务器状态"
              type="error"
              style={{ marginBottom: 16 }}
            />
          )}

          {/* 响应内容标签页 */}
          <Tabs defaultActiveKey="body" size="small" style={{ flex: 1 }}>
            <TabPane tab="响应体" key="body">
              <Editor
                height="300px"
                defaultLanguage="json"
                value={JSON.stringify(response.data, null, 2)}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on'
                }}
              />
            </TabPane>
            <TabPane tab="响应头" key="headers">
              <Table
                dataSource={Object.entries(response.headers).map(([key, value]) => ({
                  key,
                  name: key,
                  value: Array.isArray(value) ? value.join(', ') : value
                }))}
                columns={[
                  { title: '名称', dataIndex: 'name', key: 'name', width: '30%' },
                  { title: '值', dataIndex: 'value', key: 'value' }
                ]}
                pagination={false}
                size="small"
              />
            </TabPane>
          </Tabs>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
          <PlayCircleOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
          <div>点击"发送请求"开始测试API</div>
        </div>
      )}
    </Card>
  );
};

export default ResponseSection;
