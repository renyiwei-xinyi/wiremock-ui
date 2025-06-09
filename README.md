# WireMock UI - 可视化操作工具

一个现代化的 WireMock 前端可视化管理工具，提供直观的界面来管理 API 模拟映射、查看请求记录、配置系统设置等功能。

## 功能特性

### 🎯 核心功能
- **仪表板** - 实时监控 WireMock 服务状态和统计信息
- **Stub 映射管理** - 创建、编辑、删除和管理 API 模拟映射
- **请求记录** - 查看和分析所有传入的 HTTP 请求
- **场景管理** - 管理有状态的模拟场景
- **录制回放** - 录制真实 API 响应并生成 stub 映射
- **系统设置** - 配置 WireMock 服务参数

### 🎨 界面特色
- 现代化的 Material Design 风格界面
- 响应式设计，支持各种屏幕尺寸
- 直观的操作流程和用户体验
- 实时状态监控和反馈
- 代码编辑器支持语法高亮

### 🔧 技术栈
- **前端框架**: React 18
- **UI 组件库**: Ant Design 5
- **路由管理**: React Router 6
- **HTTP 客户端**: Axios
- **代码编辑器**: Monaco Editor
- **构建工具**: Vite
- **样式**: CSS3 + Flexbox/Grid

## 快速开始

### 前置要求
- Node.js 16+ 
- npm 或 yarn
- WireMock 服务运行在 `http://localhost:8080`

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## WireMock 服务配置

确保 WireMock 服务正在运行并启用了管理 API。推荐的启动命令：

```bash
java -jar wiremock-standalone-3.x.x.jar --port 8080 --enable-browser-proxying --verbose
```

或者使用 Docker：

```bash
docker run -it --rm -p 8080:8080 wiremock/wiremock:latest --verbose
```

## 主要功能说明

### 1. 仪表板
- 显示 WireMock 服务连接状态
- 统计 Stub 映射数量、请求记录数量等
- 提供快速操作入口

### 2. Stub 映射管理
- **创建映射**: 支持各种 HTTP 方法和响应配置
- **编辑映射**: 可视化编辑请求匹配条件和响应内容
- **批量操作**: 支持导入、导出、重置、清空等操作
- **搜索过滤**: 快速查找特定的映射规则

### 3. 请求记录
- **实时监控**: 查看所有传入的 HTTP 请求
- **详细信息**: 包含请求头、请求体、响应信息等
- **过滤功能**: 按方法、状态码、匹配状态等过滤
- **匹配分析**: 显示请求是否匹配到 stub 映射

### 4. 场景管理
- **状态管理**: 管理有状态的 API 模拟场景
- **状态转换**: 支持复杂的业务流程模拟
- **场景重置**: 可以重置单个或所有场景状态

### 5. 录制回放
- **实时录制**: 录制真实 API 的请求和响应
- **快照功能**: 立即捕获 API 当前状态
- **自动生成**: 将录制结果转换为 stub 映射
- **过滤配置**: 支持 URL 模式和方法过滤

### 6. 系统设置
- **性能配置**: 延迟设置、线程池配置等
- **功能开关**: 启用/禁用各种功能特性
- **网络配置**: 代理设置、超时配置等
- **日志管理**: 请求日志的记录和管理

## API 接口说明

本工具通过 WireMock 的管理 API 进行交互，主要使用以下端点：

- `GET /__admin/mappings` - 获取所有映射
- `POST /__admin/mappings` - 创建新映射
- `PUT /__admin/mappings/{id}` - 更新映射
- `DELETE /__admin/mappings/{id}` - 删除映射
- `GET /__admin/requests` - 获取请求记录
- `GET /__admin/scenarios` - 获取场景信息
- `POST /__admin/recordings/start` - 开始录制
- `GET /__admin/settings` - 获取系统设置

## 开发指南

### 项目结构
```
src/
├── components/          # React 组件
│   ├── Dashboard.jsx    # 仪表板
│   ├── StubMappings.jsx # Stub 映射管理
│   ├── Requests.jsx     # 请求记录
│   ├── Scenarios.jsx    # 场景管理
│   ├── Recording.jsx    # 录制回放
│   └── Settings.jsx     # 系统设置
├── services/            # API 服务
│   └── wiremockApi.js   # WireMock API 封装
├── App.jsx              # 主应用组件
├── main.jsx             # 应用入口
└── index.css            # 全局样式
```

### 添加新功能
1. 在 `src/services/wiremockApi.js` 中添加 API 方法
2. 创建对应的 React 组件
3. 在 `App.jsx` 中添加路由配置
4. 更新导航菜单

### 样式定制
- 全局样式在 `src/index.css` 中定义
- 使用 CSS 变量和类名进行主题定制
- 支持响应式设计和暗色主题

## 故障排除

### 常见问题

1. **无法连接到 WireMock 服务**
   - 确保 WireMock 服务正在运行
   - 检查端口配置（默认 8080）
   - 确认防火墙设置

2. **CORS 错误**
   - 在 WireMock 启动时添加 `--enable-browser-proxying` 参数
   - 或在 vite.config.js 中配置代理

3. **映射不生效**
   - 检查映射的优先级设置
   - 确认 URL 匹配模式正确
   - 查看请求记录中的匹配状态

4. **录制功能异常**
   - 确保目标 API 服务可访问
   - 检查网络连接和权限
   - 查看 WireMock 日志输出

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 相关链接

- [WireMock 官方文档](http://wiremock.org/docs/)
- [WireMock GitHub](https://github.com/wiremock/wiremock)
- [Ant Design 文档](https://ant.design/)
- [React 文档](https://reactjs.org/)
