import { useState } from 'react';
import { getDefaultFormValues, mapRecordToFormData } from './hooks/useFormInitialization';
import { useMappingOperations } from './hooks/useMappingOperations';

export const useMappingHandlers = (form, fetchMappings) => {
  const [selectedMapping, setSelectedMapping] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const { handleDelete, handleSave: saveMapping } = useMappingOperations(fetchMappings);

  // 创建新映射
  const handleCreate = () => {
    setSelectedMapping(null);
    form.resetFields();
    form.setFieldsValue(getDefaultFormValues());
    setModalVisible(true);
  };

  // 编辑映射
  const handleEdit = (record) => {
    setSelectedMapping(record);
    const formData = mapRecordToFormData(record);
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  // 复制映射
  const handleCopy = (record) => {
    const formData = mapRecordToFormData(record);
    formData.name = `${record.name || 'Copy'} - 副本`;
    setSelectedMapping(null);
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  // 查看映射详情
  const handleView = (record) => {
    setSelectedMapping(record);
    setDrawerVisible(true);
  };

  // 保存映射
  const handleSave = async (values) => {
    const success = await saveMapping(values, selectedMapping);
    if (success) {
      setModalVisible(false);
    }
  };

  return {
    selectedMapping,
    modalVisible,
    drawerVisible,
    setModalVisible,
    setDrawerVisible,
    handleCreate,
    handleEdit,
    handleCopy,
    handleView,
    handleDelete,
    handleSave,
  };
};
