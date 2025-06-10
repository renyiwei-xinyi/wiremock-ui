import React, { useState, useEffect } from 'react';
import { Button, Space, Typography, Form, notification, Row, Col, Card } from 'antd';
import { ReloadOutlined, UndoOutlined, SaveOutlined } from '@ant-design/icons';
import { settingsApi } from '../services/wiremockApi';
import BasicSettingsCard from './Settings/BasicSettingsCard';
import AdvancedSettingsCard from './Settings/AdvancedSettingsCard';
import MatchingSettingsCard from './Settings/MatchingSettingsCard';
import NetworkSettingsCard from './Settings/NetworkSettingsCard';
import SettingsInstructions from './Settings/SettingsInstructions';

const { Title, Text } = Typography;

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
            <BasicSettingsCard />
          </Col>
          <Col xs={24} lg={12}>
            <AdvancedSettingsCard />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <MatchingSettingsCard />
          </Col>
          <Col xs={24} lg={12}>
            <NetworkSettingsCard />
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

      <SettingsInstructions />
    </div>
  );
};

export default Settings;
