import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Alert, Divider } from 'antd';
import { LinkOutlined, ReloadOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const EmbeddedApiTester = ({ mapping, mockServiceUrl }) => {
  const [iframeKey, setIframeKey] = useState(0);

  // 构建Hoppscotch URL
  const buildHoppscotchUrl = () => {
    const baseUrl = 'https://hoppscotch.io/';
    
    if (!mapping || !mapping.request) {
      return baseUrl;
    }

    const request = mapping.request;
    const method = request.method || 'GET';
    const path = request.urlPath || request.urlPathPattern || request.url || '/';
    const fullUrl = `${mockServiceUrl}${path.startsWith('/') ? path : '/' + path}`;

    // 构建Hoppscotch的URL参数
    const params = new URLSearchParams({
      method: method,
      url: fullUrl,
    });

    // 添加请求头
    if (request.headers) {
      const headers = Object.entries(request.headers).map(([key, value]) => {
        const headerValue = typeof value === 'object' ? 
          (value.equalTo || value.matches || JSON.stringify(value)) : value;
        return `${key}: ${headerValue}`;
      }).join('\n');
      
      if (headers) {
        params.append('headers', headers);
      }
    }

    // 添加请求体
    if (request.bodyPatterns && request.bodyPatterns.length > 0) {
      params.append('body', JSON.stringify(request.bodyPatterns[0], null, 2));
    }

    return `${baseUrl}?${params.toString()}`;
  };

  // 构建Postman Web URL
  const buildPostmanUrl = () => {
    return 'https://web.postman.co/';
  };

  // 构建Insomnia URL
  const buildInsomniaUrl = () => {
    return 'https://insomnia.rest/';
  };

  // 刷新iframe
  const refreshIframe = () => {
    setIframeKey(prev => prev + 1);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 工具选择区域 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>推荐的API测试工具</Text>
            <Paragraph type="secondary" style={{ margin: '8px 0' }}>
              由于浏览器CORS限制，建议使用专业的API测试工具：
            </Paragraph>
          </div>

          <Space wrap>
            <Button 
              type="primary" 
              icon={<LinkOutlined />}
              onClick={() => window.open(buildHoppscotchUrl(), '_blank')}
            >
              Hoppscotch (推荐)
            </Button>
            <Button 
              icon={<LinkOutlined />}
              onClick={() => window.open(buildPostmanUrl(), '_blank')}
            >
              Postman Web
            </Button>
            <Button 
              icon={<LinkOutlined />}
              onClick={() => window.open(buildInsomniaUrl(), '_blank')}
            >
              Insomnia
            </Button>
            <Button 
              icon={<ReloadOutlined />}
              onClick={refreshIframe}
            >
              刷新
            </Button>
          </Space>

          {mapping && (
            <>
              <Divider />
              <div>
                <Text strong>当前接口信息：</Text>
                <div style={{ marginTop: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                  <Space direction="vertical" size="small">
                    <Text code>{mapping.request?.method || 'GET'} {mockServiceUrl}{mapping.request?.urlPath || mapping.request?.url || '/'}</Text>
                    {mapping.request?.headers && (
                      <div>
                        <Text type="secondary">请求头：</Text>
                        <pre style={{ fontSize: '12px', margin: '4px 0' }}>
                          {JSON.stringify(mapping.request.headers, null, 2)}
                        </pre>
                      </div>
                    )}
                    {mapping.request?.bodyPatterns && (
                      <div>
                        <Text type="secondary">请求体：</Text>
                        <pre style={{ fontSize: '12px', margin: '4px 0' }}>
                          {JSON.stringify(mapping.request.bodyPatterns[0], null, 2)}
                        </pre>
                      </div>
                    )}
                  </Space>
                </div>
              </div>
            </>
          )}
        </Space>
      </Card>

      {/* 嵌入式工具区域 */}
      <Card 
        title="Hoppscotch API 测试工具" 
        size="small" 
        style={{ flex: 1, minHeight: 0 }}
        bodyStyle={{ height: 'calc(100% - 57px)', padding: 0 }}
        extra={
          <Button size="small" icon={<ReloadOutlined />} onClick={refreshIframe}>
            刷新
          </Button>
        }
      >
        <Alert
          message="CORS 解决方案"
          description={
            <div>
              <p>如果遇到CORS错误，请尝试以下解决方案：</p>
              <ol style={{ marginBottom: 0, paddingLeft: 20 }}>
                <li>点击上方按钮在新标签页中打开专业工具</li>
                <li>安装浏览器CORS插件（如CORS Unblock）</li>
                <li>使用Postman桌面版或其他桌面API工具</li>
                <li>配置服务器支持CORS（推荐长期方案）</li>
              </ol>
            </div>
          }
          type="info"
          showIcon
          style={{ margin: 16 }}
        />
        
        <iframe
          key={iframeKey}
          src={buildHoppscotchUrl()}
          style={{
            width: '100%',
            height: 'calc(100% - 120px)',
            border: 'none',
            borderRadius: '4px'
          }}
          title="Hoppscotch API Tester"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
        />
      </Card>
    </div>
  );
};

export default EmbeddedApiTester;
