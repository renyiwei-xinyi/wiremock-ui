import React from 'react';
import { Descriptions, Divider, Typography } from 'antd';
import Editor from '@monaco-editor/react';

const { Title } = Typography;

const MappingDetail = ({ mapping }) => {
  if (!mapping) return null;

  // 格式化响应体，处理转义字符
  const formatResponseBody = (body) => {
    if (!body) return undefined;
    
    if (typeof body === 'string') {
      try {
        // 先尝试解析JSON
        return JSON.parse(body);
      } catch {
        // 如果不是JSON，处理转义字符
        return body
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\r/g, '\r')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
      }
    }
    return body;
  };

  return (
    <div>
      <Descriptions title="基本信息" bordered column={2}>
        <Descriptions.Item label="名称">
          {mapping.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="优先级">
          {mapping.priority || 5}
        </Descriptions.Item>
        <Descriptions.Item label="场景">
          {mapping.scenarioName || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          {mapping.requiredScenarioState || '-'} → {mapping.newScenarioState || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="备注" span={2}>
          {mapping.metadata?.wmui?.description || '-'}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <Title level={4}>请求配置</Title>
      <Editor
        height="200px"
        language="json"
        value={JSON.stringify(mapping.request, null, 2)}
        options={{ readOnly: true, minimap: { enabled: false } }}
      />

      <Divider />

      <Title level={4}>响应配置</Title>
      <Editor
        height="200px"
        language="json"
        value={JSON.stringify({
          ...mapping.response,
          body: formatResponseBody(mapping.response?.body)
        }, null, 2)}
        options={{ readOnly: true, minimap: { enabled: false } }}
      />

      {mapping.postServeActions && mapping.postServeActions.length > 0 && (
        <>
          <Divider />
          <Title level={4}>Webhook配置</Title>
          <Editor
            height="200px"
            language="json"
            value={JSON.stringify(mapping.postServeActions, null, 2)}
            options={{ readOnly: true, minimap: { enabled: false } }}
          />
        </>
      )}
    </div>
  );
};

export default MappingDetail;