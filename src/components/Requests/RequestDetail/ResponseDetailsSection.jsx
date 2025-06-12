import React from 'react';
import { Space, Card, Table } from 'antd';
import Editor from '@monaco-editor/react';
import { formatJson, parseHeaders, getTableColumns } from '../requestUtils';

const ResponseDetailsSection = ({ request }) => {
  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {/* 响应头 */}
      {request.response?.headers && (
        <Card title="响应头" size="small">
          <Table
            dataSource={parseHeaders(request.response.headers)}
            columns={getTableColumns()}
            pagination={false}
            size="small"
          />
        </Card>
      )}

      {/* 响应体 */}
      {(request.response?.body || request.responseDefinition?.body) && (
        <Card title="响应体" size="small">
          <Editor
            height="400px"
            defaultLanguage="json"
            value={formatJson(request.response?.body || request.responseDefinition?.body)}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on'
            }}
          />
        </Card>
      )}
    </Space>
  );
};

export default ResponseDetailsSection;
