# WireMock UI 安装指南

## 环境要求

### 1. 安装 Node.js
- 访问 [Node.js 官网](https://nodejs.org/)
- 下载并安装 LTS 版本（推荐 18.x 或更高版本）
- 安装完成后，npm 会自动安装

### 2. 验证安装
打开命令行工具，运行以下命令验证安装：
```bash
node --version
npm --version
```

## 快速启动

### Windows 用户
1. 双击运行 `start.bat` 文件
2. 脚本会自动检查环境并安装依赖
3. 启动成功后访问 `http://localhost:3000`

### 手动启动
```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
```

## WireMock 服务准备

在使用 WireMock UI 之前，需要先启动 WireMock 服务：

### 方法一：使用 JAR 文件
```bash
# 下载 WireMock standalone JAR
# 从 https://github.com/wiremock/wiremock/releases 下载最新版本

# 启动服务
java -jar wiremock-standalone-3.x.x.jar --port 8080 --enable-browser-proxying --verbose
```

### 方法二：使用 Docker
```bash
docker run -it --rm -p 8080:8080 wiremock/wiremock:latest --verbose
```

### 方法三：使用 npm（如果已安装）
```bash
npm install -g wiremock
wiremock --port 8080 --verbose
```

## 验证连接

1. 启动 WireMock 服务（端口 8080）
2. 启动 WireMock UI（端口 3000）
3. 在浏览器中访问 `http://localhost:3000`
4. 查看仪表板页面，确认连接状态为"已连接"

## 常见问题

### Q: 提示"无法连接到 WireMock 服务"
**A:** 
- 确保 WireMock 服务正在运行
- 检查端口是否为 8080
- 确认防火墙没有阻止连接

### Q: npm install 失败
**A:**
- 检查网络连接
- 尝试使用国内镜像：`npm config set registry https://registry.npmmirror.com`
- 清除缓存：`npm cache clean --force`

### Q: 页面显示空白
**A:**
- 检查浏览器控制台是否有错误信息
- 确认 Node.js 版本是否符合要求
- 尝试重新安装依赖

### Q: CORS 错误
**A:**
- 启动 WireMock 时添加 `--enable-browser-proxying` 参数
- 或者在 WireMock UI 的 vite.config.js 中已配置了代理

## 生产部署

### 构建生产版本
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

### 部署到服务器
1. 将 `dist` 目录上传到 Web 服务器
2. 配置服务器代理 `/__admin` 路径到 WireMock 服务
3. 确保 WireMock 服务可访问

## 开发环境

### 推荐的开发工具
- **IDE**: Visual Studio Code
- **浏览器**: Chrome/Edge（支持开发者工具）
- **API 测试**: Postman 或 Insomnia

### 有用的 VS Code 扩展
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- Auto Rename Tag
- Bracket Pair Colorizer

## 技术支持

如果遇到问题，可以：
1. 查看 [README.md](README.md) 中的故障排除部分
2. 检查 [WireMock 官方文档](http://wiremock.org/docs/)
3. 在项目 GitHub 页面提交 Issue

## 下一步

安装完成后，建议：
1. 阅读 [README.md](README.md) 了解功能特性
2. 查看仪表板了解系统状态
3. 尝试创建第一个 Stub 映射
4. 探索录制回放功能
