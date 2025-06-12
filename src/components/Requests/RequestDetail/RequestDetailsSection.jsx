import React from 'react';
import { Space, Card, Table } from 'antd';
import Editor from '@monaco-editor/react';
import { formatJson, parseHeaders, parseQueryParams, getTableColumns, getParamTableColumns } from '../requestUtils';

const RequestDetailsSection = ({ request }) => {
  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {/* 查询参数 */}
      {request.request?.queryParams && Object.keys(request.request.queryParams).length > 0 && (
        <Card title="查询参数" size="small">
          <Table
            dataSource={parseQueryParams(request.request.queryParams)}
            columns={getParamTableColumns()}
            pagination={false}
            size="small"
          />
        </Card>
      )}

      {/* 请求头 */}
      {request.request?.headers && (
        <Card title="请求头" size="small">
          <Table
            dataSource={parseHeaders(request.request.headers)}
            columns={getTableColumns()}
            pagination={false}
            size="small"
          />
        </Card>
      )}

      {/* 请求体 */}
      {request.request?.body && (
        <Card title="请求体" size="small">
          <Editor
            height="200px"
            defaultLanguage="json"
            value={formatJson(request.request.body)}
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

export default RequestDetailsSection;
