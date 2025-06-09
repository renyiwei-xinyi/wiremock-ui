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
  Divider,
  Row,
  Col,
  InputNumber,
  Select,
  Alert,
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { settingsApi } from '../services/wiremockApi';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 获取全局设置
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await settingsApi.getGlobal();
      const settingsData = response.data;
      setSettings(settingsData);
      form.setFieldsValue(settingsData);
    } catch (error) {
      notification.error({
        message: '获取设置失败',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // 保存设置
  const handleSave = async (values) => {
    setLoading(true);
    try {
      await settingsApi.updateGlobal(values);
      notification.success({
        message: '设置已保存',
        description: '全局设置已成功更新',
      });
      fetchSettings();
    } catch (error) {
      notification.error({
        message: '保存设置失败',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // 重置设置
  const handleReset = async () => {
    try {
      await settingsApi.reset();
      notification.success({
        message: '设置已重置',
        description: '所有设置已恢复到默认值',
      });
      fetchSettings();
    } catch (error) {
      notification.error({
        message: '重置设置失败',
        description: error.message,
      });
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              系统设置
            </Title>
            <Text type="secondary">配置 WireMock 服务参数</Text>
          </div>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchSettings}
              loading={loading}
            >
              刷新
            </Button>
            <Button 
              icon={<UndoOutlined />} 
              onClick={handleReset}
            >
              重置为默认
            </Button>
          </Space>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
      >
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card title="基本设置" className="content-card">
              <Form.Item
                label="固定延迟 (毫秒)"
                name="fixedDelay"
                extra="为所有响应添加固定延迟时间"
              >
                <InputNumber 
                  min={0} 
                  max={60000} 
                  placeholder="0" 
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                label="随机延迟分布"
                name="delayDistribution"
                extra="响应延迟的分布类型"
              >
                <Select placeholder="选择分布类型">
                  <Option value="uniform">均匀分布</Option>
                  <Option value="lognormal">对数正态分布</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="启用请求日志"
                name="requestJournalDisabled"
                valuePropName="checked"
                extra="是否记录所有传入的请求"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="最大请求日志条数"
                name="maxRequestJournalEntries"
                extra="请求日志的最大保存数量"
              >
                <InputNumber 
                  min={0} 
                  max={10000} 
                  placeholder="1000" 
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="高级设置" className="content-card">
              <Form.Item
                label="全局响应模板"
                name="globalResponseTemplating"
                valuePropName="checked"
                extra="启用全局响应模板功能"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="本地响应模板"
                name="localResponseTemplating"
                valuePropName="checked"
                extra="启用本地响应模板功能"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="扩展设置"
                name="extensions"
                extra="扩展配置的 JSON 对象"
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder='{"key": "value"}'
                />
              </Form.Item>

              <Form.Item
                label="启用浏览器代理"
                name="browserProxyingEnabled"
                valuePropName="checked"
                extra="允许作为浏览器代理使用"
              >
                <Switch />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card title="匹配设置" className="content-card">
              <Form.Item
                label="启用存根 CORS"
                name="stubCorsEnabled"
                valuePropName="checked"
                extra="为存根响应启用 CORS 支持"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="异步响应启用"
                name="asynchronousResponseEnabled"
                valuePropName="checked"
                extra="启用异步响应处理"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="异步响应线程数"
                name="asynchronousResponseThreads"
                extra="处理异步响应的线程池大小"
              >
                <InputNumber 
                  min={1} 
                  max={100} 
                  placeholder="10" 
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="网络设置" className="content-card">
              <Form.Item
                label="代理超时 (毫秒)"
                name="proxyTimeout"
                extra="代理请求的超时时间"
              >
                <InputNumber 
                  min={1000} 
                  max={300000} 
                  placeholder="30000" 
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                label="代理 Via 头"
                name="proxyVia"
                extra="代理请求时添加的 Via 头信息"
              >
                <Input placeholder="WireMock" />
              </Form.Item>

              <Form.Item
                label="禁用横幅"
                name="disableBanner"
                valuePropName="checked"
                extra="禁用启动时的横幅信息"
              >
                <Switch />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Card className="content-card">
          <div style={{ textAlign: 'center' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              size="large"
              loading={loading}
            >
              保存设置
            </Button>
          </div>
        </Card>
      </Form>

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
    </div>
  );
};

export default Settings;
