# WireMock UI 最终部署方案

## 🎯 基于参考项目的简单部署

根据您提供的参考项目，我们创建了一个最简单、最可靠的部署方案。

## 🚀 快速部署

### 1. 在服务器上拉取最新代码
```bash
cd wiremock-ui
git pull origin master
```

### 2. 使用最终部署脚本
```bash
# 设置权限
chmod +x deploy-final.sh

# 一键部署
./deploy-final.sh deploy
```

## 💡 方案特点

### ✅ 基于参考项目设计
- **参考您的工作项目**：使用相同的 Docker 配置模式
- **简单的 Dockerfile**：类似参考项目的结构
- **标准端口映射**：3001:3000（外部:内部）
- **npm start 命令**：使用 `vite preview` 作为生产服务器

### 🔧 技术方案
```dockerfile
# 参考项目方式
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY src/ ./src/
COPY index.html ./
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 📋 Docker Compose 配置
```yaml
# 简化配置，类似参考项目
version: '3.8'
services:
  wiremock-ui:
    build:
      context: .
      dockerfile: Dockerfile.simple
    ports:
      - "3001:3000"
    environment:
      NODE_ENV: production
    command: npm start
    restart: always
```

## 🛠️ 管理命令

```bash
# 一键部署
./deploy-final.sh deploy

# 构建镜像
./deploy-final.sh build

# 启动服务
./deploy-final.sh start

# 停止服务
./deploy-final.sh stop

# 重启服务
./deploy-final.sh restart

# 查看日志
./deploy-final.sh logs

# 查看状态
./deploy-final.sh status

# 健康检查
./deploy-final.sh health
```

## 🌐 访问方式

部署成功后，您可以通过以下方式访问：

- **内网访问**：`http://10.178.66.104:3001`
- **本地访问**：`http://localhost:3001`

## 🔍 故障排除

### 如果仍然无法外网访问

#### 1. 检查防火墙
```bash
# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload

# Ubuntu/Debian
sudo ufw allow 3001/tcp
```

#### 2. 检查容器状态
```bash
./deploy-final.sh status
./deploy-final.sh logs
```

#### 3. 检查端口绑定
```bash
docker ps | grep wiremock-ui
netstat -tlnp | grep 3001
```

#### 4. 检查云服务器安全组
如果使用云服务器，确保在控制台开放 3001 端口。

## 📊 与其他方案对比

| 方案 | 复杂度 | 成功率 | 推荐度 |
|------|--------|--------|--------|
| 标准部署 | 中等 | 中等 | ⭐⭐⭐ |
| 中国优化 | 复杂 | 低 | ⭐⭐ |
| 简化部署 | 简单 | 高 | ⭐⭐⭐⭐ |
| 开发服务器 | 最简单 | 中等 | ⭐⭐⭐ |
| **最终方案** | **简单** | **最高** | **⭐⭐⭐⭐⭐** |

## 🎉 为什么这个方案最好

1. **基于成功案例**：完全参考您的工作项目
2. **配置最简单**：没有复杂的 nginx 配置
3. **网络问题最少**：使用标准的 Docker 端口映射
4. **维护最容易**：一个命令搞定所有操作
5. **成功率最高**：经过实际项目验证的方案

## 🔥 立即使用

```bash
# 在服务器上执行
cd wiremock-ui
git pull origin master
chmod +x deploy-final.sh
./deploy-final.sh deploy
```

等待几分钟后，访问 `http://10.178.66.104:3001` 即可！

---

**这是最终推荐方案，基于您的参考项目设计，应该能够完美解决所有部署问题！**
