# Stub映射启用状态字段修复

## 问题描述

用户反馈映射管理中的启用状态应该通过 `response.fromConfiguredStub` 字段来控制，而不是之前使用的 `persistent` 字段。

## 用户提供的数据结构

```json
{
    "id": "6dd4c352-1b41-4438-81bc-62b05083be70",
    "name": "【港铁】创建订单-2份",
    "request": {
        "url": "/makeOrderGetFile",
        "method": "POST"
    },
    "response": {
        "status": 200,
        "statusMessage": "",
        "jsonBody": {...},
        "headers": {
            "Content-Type": "application/json"
        },
        "fromConfiguredStub": false  // 这个字段控制启用状态
    },
    "uuid": "6dd4c352-1b41-4438-81bc-62b05083be70",
    "persistent": true,
    "priority": 1,
    "scenarioName": "创建订单",
    "metadata": {...},
    "postServeActions": []
}
```

## 修复方案

### 修复1: 表格列配置更新

**文件：** `src/components/StubMappings/tableColumns.jsx`

**修复内容：**

1. **状态开关逻辑修改：**
```javascript
{
  title: '状态',
  key: 'enabled',
  width: 80,
  render: (_, record) => (
    <Switch
      checked={record.response?.fromConfiguredStub !== false}
      onChange={(checked) => handleToggleStatus(record, checked)}
      size="small"
      title={record.response?.fromConfiguredStub !== false ? '已启用' : '已禁用'}
    />
  ),
}
```

2. **视觉效果更新：**
```javascript
{
  title: '名称',
  dataIndex: 'name',
  key: 'name',
  render: (text, record) => (
    <div>
      <div style={{ 
        opacity: record.response?.fromConfiguredStub !== false ? 1 : 0.6,
        textDecoration: record.response?.fromConfiguredStub === false ? 'line-through' : 'none'
      }}>
        {text || `${record.request?.method} ${record.request?.urlPath || record.request?.urlPathPattern}`}
      </div>
      {record.comment && (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {record.comment}
        </Text>
      )}
    </div>
  ),
}
```

### 修复2: 状态切换逻辑更新

**文件：** `src/components/StubMappings.jsx`

**修复内容：**

```javascript
// 切换映射启用状态
const handleToggleStatus = async (record, enabled) => {
  try {
    const updatedMapping = {
      ...record,
      response: {
        ...record.response,
        fromConfiguredStub: enabled  // 更新正确的字段
      }
    };
    
    await stubMappingsApi.update(record.id, updatedMapping);
    notification.success({
      message: enabled ? '映射已启用' : '映射已禁用',
      description: `映射 "${record.name || record.request?.method + ' ' + (record.request?.urlPath || record.request?.urlPathPattern)}" 状态已更新`,
    });
    fetchMappings();
  } catch (error) {
    console.error('切换映射状态失败:', error);
    notification.error({
      message: '状态切换失败',
      description: error.response?.data?.message || error.message || '操作失败',
    });
  }
};
```

## 字段对比

### 修复前（错误）
- 使用字段：`record.persistent`
- 更新逻辑：`{ ...record, persistent: enabled }`

### 修复后（正确）
- 使用字段：`record.response.fromConfiguredStub`
- 更新逻辑：`{ ...record, response: { ...record.response, fromConfiguredStub: enabled } }`

## 修复效果

### 1. 状态显示 ✅
- 正确读取 `response.fromConfiguredStub` 字段
- 开关状态与实际数据一致
- 视觉效果正确反映启用/禁用状态

### 2. 状态切换 ✅
- 正确更新 `response.fromConfiguredStub` 字段
- 保持其他响应配置不变
- API调用格式符合WireMock规范

### 3. 用户体验 ✅
- 即时反馈的状态切换
- 清晰的视觉状态指示
- 友好的操作提示信息

## 技术细节

### 数据结构理解
- `persistent`: 控制映射是否持久化保存
- `response.fromConfiguredStub`: 控制映射是否启用/激活

### 状态判断逻辑
```javascript
// 启用状态判断
const isEnabled = record.response?.fromConfiguredStub !== false;

// 默认值处理
// 如果 fromConfiguredStub 未定义或为 true，则认为是启用状态
// 只有明确设置为 false 时，才认为是禁用状态
```

### 更新操作
```javascript
// 保持原有响应配置，只更新启用状态字段
const updatedMapping = {
  ...record,
  response: {
    ...record.response,
    fromConfiguredStub: enabled
  }
};
```

## 测试验证

### 测试场景1: 启用状态显示
1. 加载包含 `fromConfiguredStub: false` 的映射
2. 验证开关显示为关闭状态
3. 验证映射名称显示为灰色并有删除线

### 测试场景2: 状态切换操作
1. 点击禁用状态的映射开关
2. 验证API调用包含正确的 `fromConfiguredStub: true`
3. 验证界面状态立即更新

### 测试场景3: 默认值处理
1. 测试没有 `fromConfiguredStub` 字段的映射
2. 验证默认显示为启用状态
3. 验证切换操作正常工作

## 总结

通过这次修复：

1. **字段映射正确** - 使用正确的 `response.fromConfiguredStub` 字段
2. **状态显示准确** - 开关状态与实际数据一致
3. **操作逻辑正确** - 更新操作符合WireMock API规范
4. **用户体验良好** - 即时反馈和清晰的视觉指示

现在映射的启用/禁用功能完全符合WireMock的实际数据结构和业务逻辑！

**关键修复文件：**
- `src/components/StubMappings/tableColumns.jsx` - 表格列配置
- `src/components/StubMappings.jsx` - 状态切换逻辑
