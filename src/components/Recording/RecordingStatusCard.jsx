import React from 'react';
import { Card, Button, Tag, Typography } from 'antd';
import { StopOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const RecordingStatusCard = ({ recordingStatus, isRecording, onStopRecording, loading }) => {
  return (
    <Card className="content-card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            录制状态
          </Title>
          <div style={{ marginTop: 8 }}>
            <Tag color={isRecording ? 'red' : 'default'} style={{ fontSize: '14px' }}>
              {isRecording ? '正在录制' : '已停止'}
            </Tag>
            {recordingStatus?.targetBaseUrl && (
              <Text type="secondary" style={{ marginLeft: 16 }}>
                目标: {recordingStatus.targetBaseUrl}
              </Text>
            )}
          </div>
        </div>
        {isRecording && (
          <Button 
            danger 
            icon={<StopOutlined />} 
            onClick={onStopRecording}
            loading={loading}
          >
            停止录制
          </Button>
        )}
      </div>
    </Card>
  );
};

export default RecordingStatusCard;
