import React, { useState, useEffect } from 'react';
import { Button, Typography, Form, notification, Row, Col } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { recordingApi } from '../services/wiremockApi';
import RecordingStatusCard from './Recording/RecordingStatusCard';
import StartRecordingCard from './Recording/StartRecordingCard';
import SnapshotRecordingCard from './Recording/SnapshotRecordingCard';
import RecordingInstructions from './Recording/RecordingInstructions';

const { Title, Text } = Typography;

const Recording = () => {
  const [recordingStatus, setRecordingStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 获取录制状态
  const fetchRecordingStatus = async () => {
    try {
      const response = await recordingApi.getStatus();
      setRecordingStatus(response.data);
    } catch (error) {
      // 如果获取状态失败，可能是因为没有正在录制
      setRecordingStatus({ status: 'Stopped' });
    }
  };

  useEffect(() => {
    fetchRecordingStatus();
  }, []);

  // 开始录制
  const handleStartRecording = async (values) => {
    setLoading(true);
    try {
      const config = {
        targetBaseUrl: values.targetUrl,
        filters: {
          urlPattern: values.urlPattern || '.*',
          method: values.method || 'ANY',
        },
        captureHeaders: values.captureHeaders !== false,
        requestBodyPattern: values.requestBodyPattern,
        persist: values.persist !== false,
        repeatsAsScenarios: values.repeatsAsScenarios === true,
        transformers: values.transformers ? values.transformers.split(',').map(t => t.trim()) : [],
      };

      await recordingApi.start(config);
      notification.success({
        message: '录制已开始',
        description: '正在录制 API 请求和响应',
      });
      fetchRecordingStatus();
    } catch (error) {
      notification.error({
        message: '开始录制失败',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // 停止录制
  const handleStopRecording = async () => {
    setLoading(true);
    try {
      await recordingApi.stop();
      notification.success({
        message: '录制已停止',
        description: '录制的映射已保存',
      });
      fetchRecordingStatus();
    } catch (error) {
      notification.error({
        message: '停止录制失败',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // 快照录制
  const handleSnapshot = async (values) => {
    setLoading(true);
    try {
      const config = {
        targetBaseUrl: values.snapshotUrl,
        filters: {
          urlPattern: values.snapshotUrlPattern || '.*',
        },
        captureHeaders: values.snapshotCaptureHeaders !== false,
        persist: values.snapshotPersist !== false,
      };

      await recordingApi.snapshot(config);
      notification.success({
        message: '快照录制完成',
        description: '已生成当前状态的映射快照',
      });
    } catch (error) {
      notification.error({
        message: '快照录制失败',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const isRecording = recordingStatus?.status === 'Recording';

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              录制回放
            </Title>
            <Text type="secondary">录制真实 API 响应并生成 stub 映射</Text>
          </div>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchRecordingStatus}
          >
            刷新状态
          </Button>
        </div>
      </div>

      <RecordingStatusCard
        recordingStatus={recordingStatus}
        isRecording={isRecording}
        onStopRecording={handleStopRecording}
        loading={loading}
      />

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <StartRecordingCard
            form={form}
            onStartRecording={handleStartRecording}
            isRecording={isRecording}
            loading={loading}
          />
        </Col>

        <Col xs={24} lg={12}>
          <SnapshotRecordingCard
            onSnapshot={handleSnapshot}
            loading={loading}
          />
        </Col>
      </Row>

      <RecordingInstructions />
    </div>
  );
};

export default Recording;
