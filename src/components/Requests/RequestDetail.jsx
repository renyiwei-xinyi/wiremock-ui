import React from 'react';
import { Typography, Tag } from 'antd';
import Editor from '@monaco-editor/react';
import dayjs from 'dayjs';

const { Title } = Typography;

const RequestDetail = ({ request }) => {
  if (!request) return null;

  // 格式化响应体，处理转义字符和移除bodyAsBase64
  const formatResponse = (response) => {
    if (!response) return null;

    const formattedResponse = { ...response };
    
    // 处理body字段
    if (formattedResponse.body && typeof formattedResponse.body === 'string') {
      try {
        formattedResponse.body = JSON.parse(formattedResponse.body);
      } catch {
        // 如果不是JSON，保持原样
      }
    }
    
    // 移除bodyAsBase64字段
    delete formattedResponse.bodyAsBase64;
    
    return formattedResponse;
  };

  return (
    <div>
      <Title level={4}>基本信息</Title>
      <p><strong>请求ID:</strong> {request.id}</p>
      <p><strong>时间:</strong> {dayjs(request.loggedDate).format('YYYY-MM-DD HH:mm:ss')}</p>
      <p><strong>匹配状态:</strong> 
        <Tag color={request.wasMatched ? 'green' : 'red'} style={{ marginLeft: 8 }}>
          {request.wasMatched ? '已匹配' : '未匹配'}
        </Tag>
      </p>
      {request.responseTime && (
        <p><strong>响应时间:</strong> {request.responseTime}ms</p>
      )}
      
      <Title level={4} style={{ marginTop: 24 }}>请求信息</Title>
      <div className="json-editor">
        <Editor
          height="300px"
          defaultLanguage="json"
          value={JSON.stringify(request.request, null, 2)}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
        />
      </div>
      
      {request.response && (
        <>
          <Title level={4} style={{ marginTop: 24 }}>响应信息</Title>
          <div className="json-editor">
            <Editor
              height="300px"
              defaultLanguage="json"
              value={JSON.stringify(formatResponse(request.response), null, 2)}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </>
      )}
      
      {request.postServeActions && request.postServeActions.length > 0 && (
        <>
          <Title level={4} style={{ marginTop: 24 }}>Webhook 回调</Title>
          <div className="json-editor">
            <Editor
              height="200px"
              defaultLanguage="json"
              value={JSON.stringify(request.postServeActions, null, 2)}
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
  );
};

export default RequestDetail;
