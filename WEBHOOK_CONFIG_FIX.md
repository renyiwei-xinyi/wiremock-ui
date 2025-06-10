# Webhook配置显示问题修复总结

## 问题描述

用户反馈：【Stub 映射管理】【编辑映射】【Webhook配置】存量配置无法正确展示已配置数据

## 实际数据结构分析

通过用户提供的真实数据，发现WireMock的`postServeActions`使用的是以下结构：

```json
"postServeActions": [
  {
    "name": "webhook",
    "parameters": {
      "method": "POST",
      "url": "http://sea.t.hopegoo.com/sea_order_center/shelvesPay/callback",
      "headers": {
        "Content-Type": "text/plain"
      },
      "body": "..."
    }
  }
]
```

这与之前假设的数据结构完全不同，需要重新设计数据映射逻辑。

## 修复方案

### 修复1: 重新设计数据读取映射逻辑

**文件：** `src/components/StubMappings/hooks/useFormInitialization.js`

**核心修复：**
```javascript
postServeActions: (record.postServeActions || []).map(action => {
  // 处理WireMock实际的postServeActions数据结构
  if (action.name === 'webhook' && action.parameters) {
    // WireMock标准的webhook结构: { name: "webhook", parameters: {...} }
    return {
      webhook: {
        url: action.parameters.url || '',
        method: action.parameters.method || 'POST',
        headers: action.parameters.headers || {},
        body: action.parameters.body || '',
        fixedDelayMilliseconds: action.parameters.fixedDelayMilliseconds || 0
      }
    };
  } else if (action.webhook) {
    // 嵌套的webhook结构: { webhook: {...} }
    return {
      webhook: {
        url: action.webhook.url || '',
        method: action.webhook.method || 'POST',
        headers: action.webhook.headers || {},
        body: action.webhook.body || '',
        fixedDelayMilliseconds: action.webhook.fixedDelayMilliseconds || 0
      }
    };
  } else if (action.type === 'webhook' || action.webhookUrl) {
    // 扁平化结构
    return {
      webhook: {
        url: action.webhookUrl || action.url || '',
        method: action.method || 'POST',
        headers: action.headers || {},
        body: action.body || '',
        fixedDelayMilliseconds: action.fixedDelayMilliseconds || 0
      }
    };
  } else {
    // 兜底处理，确保有基本结构
    return {
      webhook: {
        url: '',
        method: 'POST',
        headers: {},
        body: '',
        fixedDelayMilliseconds: 0
      }
    };
  }
})
```

**额外改进：**
- 支持从`metadata.wmui.description`读取注释信息
- 支持`urlPattern`字段映射到`urlPathPattern`

### 修复2: 重新设计数据保存映射逻辑

**文件：** `src/components/StubMappings/hooks/useMappingOperations.js`

**核心修复：**
```javascript
postServeActions: values.postServeActions?.length > 0 ? 
  values.postServeActions.map(action => {
    // 将表单数据转换回WireMock期望的格式
    if (action.webhook) {
      return {
        name: 'webhook',
        parameters: {
          url: action.webhook.url || '',
          method: action.webhook.method || 'POST',
          headers: Object.keys(action.webhook.headers || {}).length > 0 
            ? action.webhook.headers : undefined,
          body: action.webhook.body || undefined,
          fixedDelayMilliseconds: action.webhook.fixedDelayMilliseconds > 0 
            ? action.webhook.fixedDelayMilliseconds : undefined
        }
      };
    }
    return action;
  }).filter(action => action.name === 'webhook' && action.parameters?.url) : undefined
```

**保存逻辑优化：**
- 确保只保存有效的webhook配置（必须有URL）
- 清理空值，避免发送不必要的数据
- 保持与WireMock API的完全兼容

### 修复3: 优化Webhook配置组件

**文件：** `src/components/StubMappings/MappingForm/WebhookConfigTab.jsx`

**主要改进：**
1. 添加合适的默认值
2. 改进添加按钮的初始数据结构
3. 增加PATCH方法支持
4. 优化占位符和用户提示

## WireMock数据结构兼容性

现在的修复代码支持以下所有WireMock数据结构：

### 1. 标准结构（实际使用）
```json
{
  "postServeActions": [
    {
      "name": "webhook",
      "parameters": {
        "url": "http://example.com/callback",
        "method": "POST",
        "headers": {"Content-Type": "application/json"},
        "body": "...",
        "fixedDelayMilliseconds": 1000
      }
    }
  ]
}
```

### 2. 嵌套结构（备用支持）
```json
{
  "postServeActions": [
    {
      "webhook": {
        "url": "http://example.com/callback",
        "method": "POST",
        "headers": {"Content-Type": "application/json"},
        "body": "...",
        "fixedDelayMilliseconds": 1000
      }
    }
  ]
}
```

### 3. 扁平化结构（备用支持）
```json
{
  "postServeActions": [
    {
      "type": "webhook",
      "webhookUrl": "http://example.com/callback",
      "method": "POST",
      "headers": {"Content-Type": "application/json"},
      "body": "...",
      "fixedDelayMilliseconds": 1000
    }
  ]
}
```

## 修复效果

### 1. 数据读取 ✅
- 正确解析WireMock的`{ name: "webhook", parameters: {...} }`结构
- 将URL、方法、请求头、请求体等字段正确映射到表单
- 支持多种可能的数据结构变体

### 2. 数据保存 ✅
- 将表单数据正确转换回WireMock期望的格式
- 确保保存的数据结构与WireMock API完全兼容
- 清理空值，优化数据传输

### 3. 用户体验 ✅
- 编辑时能正确回填已有Webhook数据
- 新建时有合理的默认值
- 支持完整的HTTP方法选择
- 清晰的界面提示和占位符

## 测试验证

### 测试场景1: 编辑真实Webhook配置
使用用户提供的数据结构进行测试：
1. 加载包含Webhook的映射配置
2. 验证URL、方法、请求头、请求体是否正确显示
3. 修改配置并保存
4. 验证保存后的数据格式是否正确

### 测试场景2: 新建Webhook配置
1. 创建新映射
2. 添加Webhook配置
3. 填写各项参数
4. 保存并验证数据格式

### 测试场景3: 复杂数据处理
1. 测试包含复杂JSON的请求体
2. 测试多个请求头的处理
3. 测试延时配置的保存和读取

## 技术细节

### 数据转换流程

**读取时：**
```
WireMock数据 → mapRecordToFormData → 表单数据
{name: "webhook", parameters: {...}} → {webhook: {...}}
```

**保存时：**
```
表单数据 → handleSave → WireMock数据
{webhook: {...}} → {name: "webhook", parameters: {...}}
```

### 关键改进点

1. **准确的数据结构识别** - 基于真实数据结构进行映射
2. **双向数据转换** - 读取和保存都有对应的转换逻辑
3. **多结构兼容** - 支持多种可能的数据结构
4. **数据清理** - 避免保存空值和无效数据

## 总结

通过这次基于真实数据结构的修复：

1. **解决了核心问题** - Webhook配置现在能够正确显示和保存
2. **提升了数据兼容性** - 支持WireMock的实际数据结构
3. **改善了用户体验** - 完整的编辑和新建流程
4. **增强了系统稳定性** - 更好的错误处理和数据验证

现在用户可以正常编辑已有的Webhook配置，所有字段都会正确回填显示，保存时也会生成正确的WireMock格式数据。

**关键修复文件：**
- `src/components/StubMappings/hooks/useFormInitialization.js` - 数据读取映射
- `src/components/StubMappings/hooks/useMappingOperations.js` - 数据保存映射
- `src/components/StubMappings/MappingForm/WebhookConfigTab.jsx` - 界面组件优化
