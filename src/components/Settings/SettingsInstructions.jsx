import React from 'react';
import { Card, Typography, Alert } from 'antd';

const { Title } = Typography;

const SettingsInstructions = () => {
  return (
    <Card title="设置说明" className="content-card" style={{ marginTop: 16 }}>
      <Alert
        message="重要提示"
        description="某些设置更改可能需要重启 WireMock 服务才能生效。请在更改关键设置后重启服务。"
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <div>
        <Title level={4}>设置项说明</Title>
        <ul>
          <li><strong>固定延迟:</strong> 为所有响应添加固定的延迟时间，用于模拟网络延迟</li>
          <li><strong>请求日志:</strong> 控制是否记录传入的请求，以及最大记录数量</li>
          <li><strong>响应模板:</strong> 启用动态响应模板功能，支持变量替换和逻辑处理</li>
          <li><strong>CORS 支持:</strong> 为跨域请求提供支持</li>
          <li><strong>异步响应:</strong> 启用异步响应处理，提高并发性能</li>
          <li><strong>代理设置:</strong> 配置代理相关的超时和头信息</li>
        </ul>

        <Title level={4} style={{ marginTop: 24 }}>性能优化建议</Title>
        <ul>
          <li>如果不需要请求历史记录，可以禁用请求日志以提高性能</li>
          <li>合理设置最大请求日志条数，避免内存占用过多</li>
          <li>根据实际需求调整异步响应线程数</li>
          <li>在生产环境中可以禁用横幅信息</li>
        </ul>
      </div>
    </Card>
  );
};

export default SettingsInstructions;
