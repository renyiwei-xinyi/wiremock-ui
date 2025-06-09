import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Menu, Typography, Badge, notification, Spin } from 'antd';
import {
  ApiOutlined,
  HistoryOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  DashboardOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import StubMappings from './components/StubMappings';
import Requests from './components/Requests';
import Settings from './components/Settings';
import Scenarios from './components/Scenarios';
import Dashboard from './components/Dashboard';
import Recording from './components/Recording';
import { systemApi } from './services/wiremockApi';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // 检查 WireMock 连接状态
  const checkConnection = async () => {
    try {
      const response = await systemApi.getInfo();
      setSystemInfo(response.data);
      setConnectionStatus('connected');
      notification.success({
        message: '连接成功',
        description: 'WireMock 服务连接正常',
        duration: 2,
      });
    } catch (error) {
      setConnectionStatus('disconnected');
      notification.error({
        message: '连接失败',
        description: '无法连接到 WireMock 服务，请确保服务正在运行',
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
    // 每30秒检查一次连接状态
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: 'stub-mappings',
      icon: <ApiOutlined />,
      label: 'Stub 映射',
    },
    {
      key: 'requests',
      icon: <HistoryOutlined />,
      label: '请求记录',
    },
    {
      key: 'scenarios',
      icon: <FileTextOutlined />,
      label: '场景管理',
    },
    {
      key: 'recording',
      icon: <PlayCircleOutlined />,
      label: '录制回放',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  const getConnectionBadge = () => {
    const statusConfig = {
      connecting: { status: 'processing', text: '连接中' },
      connected: { status: 'success', text: '已连接' },
      disconnected: { status: 'error', text: '未连接' },
    };
    return statusConfig[connectionStatus];
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <Spin size="large" tip="正在连接 WireMock 服务..." />
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Header style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ApiOutlined style={{ fontSize: '24px', color: '#fff', marginRight: '12px' }} />
            <Title level={3} style={{ color: '#fff', margin: 0 }}>
              WireMock UI
            </Title>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Badge {...getConnectionBadge()}>
              <span style={{ color: '#fff', fontSize: '14px' }}>
                {systemInfo ? `v${systemInfo.version || 'Unknown'}` : 'WireMock'}
              </span>
            </Badge>
          </div>
        </Header>

        <Layout>
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            width={250}
            theme="light"
          >
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              items={menuItems}
              style={{ height: '100%', borderRight: 0 }}
              onClick={({ key }) => setSelectedKey(key)}
            />
          </Sider>

          <Layout>
            <Content>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route 
                  path="/dashboard" 
                  element={<Dashboard systemInfo={systemInfo} connectionStatus={connectionStatus} />} 
                />
                <Route path="/stub-mappings" element={<StubMappings />} />
                <Route path="/requests" element={<Requests />} />
                <Route path="/scenarios" element={<Scenarios />} />
                <Route path="/recording" element={<Recording />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;
