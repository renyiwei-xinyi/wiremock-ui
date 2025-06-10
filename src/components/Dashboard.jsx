import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Alert, Button, Space, Divider } from 'antd';
import {
  ApiOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { stubMappingsApi, requestsApi, systemApi } from '../services/wiremockApi';

const { Title, Paragraph } = Typography;

const Dashboard = ({ connectionStatus }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMappings: 0,
    totalRequests: 0,
    unmatchedRequests: 0,
    loading: true,
  });
  const [systemInfo, setSystemInfo] = useState(null);

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      
      const [mappingsRes, requestsRes, unmatchedRes, systemRes] = await Promise.allSettled([
        stubMappingsApi.getAll(),
        requestsApi.getAll(),
        requestsApi.getUnmatched(),
        systemApi.getInfo(),
      ]);

      // 处理映射数据
      let totalMappings = 0;
      if (mappingsRes.status === 'fulfilled') {
        const mappingsData = mappingsRes.value.data;
        totalMappings = mappingsData.mappings?.length || 
                      (Array.isArray(mappingsData) ? mappingsData.length : 0);
      }

      // 处理请求数据
      let totalRequests = 0;
      if (requestsRes.status === 'fulfilled') {
        const requestsData = requestsRes.value.data;
        totalRequests = requestsData.requests?.length || 
                       (Array.isArray(requestsData) ? requestsData.length : 0);
      }

      // 处理未匹配请求数据
      let unmatchedRequests = 0;
      if (unmatchedRes.status === 'fulfilled') {
        const unmatchedData = unmatchedRes.value.data;
        unmatchedRequests = unmatchedData.requests?.length || 
                           (Array.isArray(unmatchedData) ? unmatchedData.length : 0);
      }

      // 处理系统信息
      if (systemRes.status === 'fulfilled') {
        setSystemInfo(systemRes.value.data);
      }

      setStats({
        totalMappings,
        totalRequests,
        unmatchedRequests,
        loading: false,
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (connectionStatus === 'connected') {
      fetchStats();
    }
  }, [connectionStatus]);

  const handleRefresh = () => {
    fetchStats();
  };

  const getStatusAlert = () => {
    if (connectionStatus === 'connected') {
      return (
        <Alert
          message="WireMock 服务运行正常"
          description="所有功能可正常使用"
          type="success"
          icon={<CheckCircleOutlined />}
          showIcon
        />
      );
    } else {
      return (
        <Alert
          message="WireMock 服务连接失败"
          description="请确保 WireMock 服务正在运行并监听正确的端口"
          type="error"
          icon={<ExclamationCircleOutlined />}
          showIcon
          action={
            <Button size="small" danger onClick={handleRefresh}>
              重试连接
            </Button>
          }
        />
      );
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              仪表板
            </Title>
            <Paragraph style={{ margin: '8px 0 0 0', color: '#666' }}>
              WireMock 服务状态和统计信息
            </Paragraph>
          </div>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={stats.loading}
          >
            刷新数据
          </Button>
        </div>
      </div>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {getStatusAlert()}

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="content-card">
              <Statistic
                title="Stub 映射总数"
                value={stats.totalMappings}
                prefix={<ApiOutlined style={{ color: '#1890ff' }} />}
                loading={stats.loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="content-card">
              <Statistic
                title="请求记录总数"
                value={stats.totalRequests}
                prefix={<HistoryOutlined style={{ color: '#52c41a' }} />}
                loading={stats.loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="content-card">
              <Statistic
                title="未匹配请求"
                value={stats.unmatchedRequests}
                prefix={<ExclamationCircleOutlined style={{ color: '#fa8c16' }} />}
                loading={stats.loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="content-card">
              <Statistic
                title="匹配成功率"
                value={stats.totalRequests > 0 ? 
                  Math.round(((stats.totalRequests - stats.unmatchedRequests) / stats.totalRequests) * 100) : 0
                }
                suffix="%"
                prefix={<CheckCircleOutlined style={{ color: '#722ed1' }} />}
                loading={stats.loading}
              />
            </Card>
          </Col>
        </Row>

        <Card title="系统信息" className="content-card">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div>
                <strong>版本:</strong> {systemInfo?.version || 'WireMock 2.x'}
              </div>
              <Divider />
              <div>
                <strong>状态:</strong> 
                <span className={connectionStatus === 'connected' ? 'status-active' : 'status-inactive'}>
                  {connectionStatus === 'connected' ? '运行中' : '未连接'}
                </span>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div>
                <strong>管理端口:</strong> {systemInfo?.port || '8080'}
              </div>
              <Divider />
              <div>
                <strong>服务端口:</strong> {systemInfo?.port || '8080'}
              </div>
            </Col>
          </Row>
        </Card>

        <Card title="快速操作" className="content-card">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Button 
                type="primary" 
                icon={<ApiOutlined />} 
                size="large" 
                block
                onClick={() => navigate('/stub-mappings')}
              >
                管理 Stub 映射
              </Button>
            </Col>
            <Col xs={24} sm={8}>
              <Button 
                icon={<HistoryOutlined />} 
                size="large" 
                block
                onClick={() => navigate('/requests')}
              >
                查看请求记录
              </Button>
            </Col>
            <Col xs={24} sm={8}>
              <Button 
                icon={<PlayCircleOutlined />} 
                size="large" 
                block
                onClick={() => navigate('/recording')}
              >
                录制回放
              </Button>
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} sm={8}>
              <Button 
                icon={<SettingOutlined />} 
                size="large" 
                block
                onClick={() => navigate('/settings')}
              >
                系统设置
              </Button>
            </Col>
          </Row>
        </Card>

        <Card title="使用说明" className="content-card">
          <Paragraph>
            <strong>WireMock UI</strong> 是一个现代化的 WireMock 可视化管理工具，提供以下功能：
          </Paragraph>
          <ul>
            <li><strong>Stub 映射管理:</strong> 创建、编辑、删除和管理 API 模拟映射</li>
            <li><strong>请求记录:</strong> 查看和分析所有传入的 HTTP 请求</li>
            <li><strong>场景管理:</strong> 管理有状态的模拟场景</li>
            <li><strong>录制回放:</strong> 录制真实 API 响应并生成 stub 映射</li>
            <li><strong>系统设置:</strong> 配置 WireMock 服务参数</li>
          </ul>
          <Paragraph>
            确保 WireMock 服务正在运行并可通过 <code>http://localhost:8080</code> 访问。
          </Paragraph>
        </Card>
      </Space>
    </div>
  );
};

export default Dashboard;
