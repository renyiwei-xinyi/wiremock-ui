# Dashboard和API测试功能增强

## 功能概述

本次更新实现了两个重要的新功能：
1. 在仪表板中展示Mock服务域名
2. 在Stub映射管理模块中增加API测试功能（类似Postman）

## 功能详情

### 1. Dashboard Mock服务域名展示

#### 新增功能：
- **Mock服务地址卡片**：在仪表板顶部显著位置展示Mock服务域名
- **一键复制功能**：点击复制按钮可快速复制服务地址到剪贴板
- **视觉优化**：使用专门的卡片样式和图标，突出显示服务地址

#### 实现细节：
```javascript
// Mock服务域名配置
const mockServiceUrl = 'http://os.wiremock.server.qa.17u.cn';

// 复制功能
const handleCopyUrl = () => {
  navigator.clipboard.writeText(mockServiceUrl).then(() => {
    message.success('Mock服务地址已复制到剪贴板');
  }).catch(() => {
    message.error('复制失败，请手动复制');
  });
};
```

#### 界面特点：
- 使用蓝色主题色突出显示服务地址
- 提供复制按钮，方便用户快速获取地址
- 在使用说明中也同步显示服务地址
- 响应式设计，适配不同屏幕尺寸

### 2. API测试工具（类似Postman功能）

#### 核心功能：
- **完整的HTTP请求测试**：支持GET、POST、PUT、DELETE、PATCH、HEAD、OPTIONS等方法
- **智能参数填充**：自动从选中的映射配置中提取请求参数
- **多种参数类型支持**：请求头、查询参数、请求体
- **实时响应展示**：显示响应状态、耗时、大小等详细信息
- **响应数据格式化**：JSON格式化显示，支持语法高亮
- **一键复制响应**：可快速复制响应数据

#### 组件架构：

**ApiTester.jsx** - 主要测试组件
- 模态框形式展示，不影响主界面
- 分为请求配置区域和响应展示区域
- 使用标签页组织不同类型的参数

**功能特点：**
1. **智能表单填充**：
   - 自动解析映射配置中的请求方法、URL、请求头等
   - 支持复杂的WireMock匹配规则解析
   - 动态表单项，可添加/删除参数

2. **完整的请求构建**：
   - URL自动拼接Mock服务域名
   - 支持查询参数和请求体
   - 智能处理JSON格式数据

3. **详细的响应分析**：
   - 状态码颜色区分（成功/警告/错误）
   - 响应时间和数据大小统计
   - 响应头和响应体分别展示
   - 错误处理和友好提示

#### 集成方式：
- 在表格操作列中添加"测试API"按钮
- 绿色图标突出显示，易于识别
- 点击后打开测试工具，自动填充当前映射的配置

### 3. 技术实现

#### 文件结构：
```
src/components/
├── Dashboard.jsx (已更新)
├── StubMappings.jsx (已更新)
└── StubMappings/
    ├── ApiTester.jsx (新增)
    └── tableColumns.jsx (已更新)
```

#### 关键技术点：

**1. 参数解析算法：**
```javascript
const getDefaultValues = () => {
  const request = mapping.request || {};
  return {
    method: request.method || 'GET',
    url: request.urlPath || request.urlPathPattern || request.url || '/',
    headers: request.headers ? Object.entries(request.headers).map(([key, value]) => ({
      key: Math.random().toString(36).substr(2, 9),
      name: key,
      value: typeof value === 'object' ? value.equalTo || value.matches || JSON.stringify(value) : value
    })) : [],
    // ... 其他参数解析
  };
};
```

**2. HTTP请求处理：**
```javascript
const axiosResponse = await axios({
  method: values.method.toLowerCase(),
  url: fullUrl,
  headers,
  params,
  data,
  timeout: 30000,
  validateStatus: () => true, // 接受所有状态码
});
```

**3. 动态表单组件：**
- 使用Ant Design的Form.List实现动态添加/删除
- 支持键值对形式的参数输入
- 实时验证和错误提示

### 4. 用户体验优化

#### 界面设计：
- **直观的操作流程**：从映射列表直接点击测试，无需手动配置
- **清晰的信息层次**：请求配置和响应结果分区显示
- **实时反馈**：加载状态、成功/失败提示、耗时统计
- **便捷操作**：一键复制、参数自动填充、智能默认值

#### 功能完整性：
- **支持所有HTTP方法**：覆盖常见的API测试场景
- **完整的参数支持**：请求头、查询参数、请求体全覆盖
- **详细的响应信息**：状态码、响应头、响应体、性能指标
- **错误处理**：网络错误、超时、服务器错误等场景

### 5. 配置说明

#### Mock服务域名配置：
- 当前配置：`http://os.wiremock.server.qa.17u.cn`
- 可在Dashboard.jsx和ApiTester.jsx中统一修改
- 建议后续可考虑从配置文件或环境变量读取

#### 扩展性考虑：
- API测试工具支持自定义域名
- 可扩展支持认证、代理等高级功能
- 响应数据支持多种格式（JSON、XML、HTML等）

## 使用指南

### Dashboard使用：
1. 打开仪表板页面
2. 查看顶部的"Mock服务地址"卡片
3. 点击"复制地址"按钮获取服务URL
4. 在其他工具中使用该地址进行API调用

### API测试工具使用：
1. 进入"Stub映射管理"页面
2. 找到要测试的映射配置
3. 点击绿色的"测试API"按钮
4. 在弹出的测试工具中：
   - 检查自动填充的请求参数
   - 根据需要修改或添加参数
   - 点击"发送请求"按钮
   - 查看响应结果和性能数据
5. 可复制响应数据用于其他用途

## 后续优化建议

1. **历史记录功能**：保存测试历史，方便重复测试
2. **批量测试**：支持选择多个映射进行批量测试
3. **测试脚本**：支持简单的测试断言和脚本
4. **导出功能**：将测试配置导出为Postman集合
5. **性能监控**：添加响应时间趋势图和性能分析

## 总结

本次更新显著提升了WireMock UI的实用性：
- Dashboard的服务地址展示让用户更容易获取和使用Mock服务
- API测试工具提供了完整的接口测试能力，减少了对外部工具的依赖
- 两个功能都注重用户体验，操作简单直观
- 代码结构清晰，便于后续维护和扩展

这些功能让WireMock UI从单纯的配置管理工具升级为完整的API Mock和测试平台。
