import React from 'react';
import { Card, Typography, Alert } from 'antd';

const { Title } = Typography;

const RecordingInstructions = () => {
  return (
    <Card title="使用说明" className="content-card" style={{ marginTop: 16 }}>
      <div>
        <Title level={4}>录制功能</Title>
        <ul>
          <li><strong>实时录制:</strong> 启动录制后，WireMock 会代理所有匹配的请求到目标服务器，并记录请求和响应</li>
          <li><strong>自动生成映射:</strong> 录制的请求和响应会自动转换为 stub 映射</li>
          <li><strong>过滤器:</strong> 可以使用 URL 模式和 HTTP 方法过滤要录制的请求</li>
          <li><strong>场景支持:</strong> 重复的请求可以转换为有状态的场景</li>
        </ul>

        <Title level={4} style={{ marginTop: 24 }}>快照功能</Title>
        <ul>
          <li><strong>即时捕获:</strong> 立即向目标 API 发送请求并记录响应</li>
          <li><strong>批量生成:</strong> 可以一次性为多个端点创建映射</li>
          <li><strong>状态保存:</strong> 捕获 API 的当前状态作为基准</li>
        </ul>

        <Alert
          message="注意事项"
          description="录制功能需要目标 API 服务正常运行。请确保网络连接正常，并且有权限访问目标服务。"
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </div>
    </Card>
  );
};

export default RecordingInstructions;
