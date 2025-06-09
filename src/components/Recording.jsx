import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Form,
  Input,
  Switch,
  notification,
  Alert,
  Divider,
  Row,
  Col,
  Tag,
} from 'antd';
import {
  PlayCircleOutlined,
  StopOutlined,
  CameraOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { recordingApi } from '../services/wiremockApi';

const { Title, Text, Paragraph } = Typography;

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

      {/* 录制状态 */}
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
              onClick={handleStopRecording}
              loading={loading}
            >
              停止录制
            </Button>
          )}
        </div>
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          {/* 开始录制 */}
          <Card 
            title={
              <Space>
                <PlayCircleOutlined />
                开始录制
              </Space>
            }
            className="content-card"
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleStartRecording}
              disabled={isRecording}
            >
              <Form.Item
                label="目标 URL"
                name="targetUrl"
                rules={[{ required: true, message: '请输入目标 URL' }]}
                extra="要录制的真实 API 服务地址"
              >
                <Input placeholder="https://api.example.com" />
              </Form.Item>

              <Form.Item
                label="URL 模式"
                name="urlPattern"
                extra="正则表达式，用于过滤要录制的 URL"
              >
                <Input placeholder=".*" />
              </Form.Item>

              <Form.Item
                label="HTTP 方法"
                name="method"
              >
                <Input placeholder="ANY" />
              </Form.Item>

              <Form.Item
                label="请求体模式"
                name="requestBodyPattern"
                extra="用于匹配请求体的模式"
              >
                <Input placeholder="可选" />
              </Form.Item>

              <Form.Item
                label="转换器"
                name="transformers"
                extra="逗号分隔的转换器列表"
              >
                <Input placeholder="response-template,modify-response-header" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="捕获请求头"
                    name="captureHeaders"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="持久化映射"
                    name="persist"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="重复请求作为场景"
                name="repeatsAsScenarios"
                valuePropName="checked"
                extra="将重复的请求转换为场景"
              >
                <Switch />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<PlayCircleOutlined />}
                  loading={loading}
                  disabled={isRecording}
                  block
                >
                  开始录制
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          {/* 快照录制 */}
          <Card 
            title={
              <Space>
                <CameraOutlined />
                快照录制
              </Space>
            }
            className="content-card"
          >
            <Paragraph>
              快照录制可以立即捕获指定 API 的当前状态，生成对应的 stub 映射。
            </Paragraph>

            <Form
              layout="vertical"
              onFinish={handleSnapshot}
            >
              <Form.Item
                label="目标 URL"
                name="snapshotUrl"
                rules={[{ required: true, message: '请输入目标 URL' }]}
              >
                <Input placeholder="https://api.example.com" />
              </Form.Item>

              <Form.Item
                label="URL 模式"
                name="snapshotUrlPattern"
              >
                <Input placeholder=".*" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="捕获请求头"
                    name="snapshotCaptureHeaders"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="持久化映射"
                    name="snapshotPersist"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<CameraOutlined />}
                  loading={loading}
                  block
                >
                  创建快照
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* 使用说明 */}
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
    </div>
  );
};

export default Recording;
