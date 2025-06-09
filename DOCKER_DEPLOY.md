# WireMock UI Docker 部署指南

本文档详细说明如何使用 Docker 部署 WireMock UI 到 Linux 服务器。

## 🐳 Docker 部署方案

### 架构说明
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   用户浏览器     │───▶│   Nginx (容器)    │───▶│  WireMock 后端服务   │
│                │    │  - 静态文件服务   │    │ os.wiremock.server. │
│                │    │  - API 代理       │    │ qa.17u.cn:/__admin  │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
```

### 技术栈
- **容器化**: Docker + Docker Compose
- **Web 服务器**: Nginx (Alpine)
- **构建工具**: Node.js 18 (Alpine)
- **前端框架**: React + Vite

## 📋 部署前准备

### 1. 服务器要求
- **操作系统**: Linux (Ubuntu 18.04+, CentOS 7+, 或其他主流发行版)
- **内存**: 最少 1GB RAM
- **存储**: 最少 2GB 可用空间
- **网络**: 能够访问外网和您的 WireMock 后端服务

### 2. 安装 Docker
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# CentOS/RHEL
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. 验证安装
```bash
docker --version
docker-compose --version
```

## 🚀 快速部署

### 方法一：使用部署脚本（推荐）

1. **上传项目文件到服务器**
```bash
# 将整个项目目录上传到服务器
scp -r wiremock-ui/ user@your-server:/opt/
```

2. **设置执行权限**
```bash
chmod +x /opt/wiremock-ui/deploy.sh
```

3. **构建并启动服务**
```bash
cd /opt/wiremock-ui
./deploy.sh build
./deploy.sh start
```

4. **验证部署**
```bash
./deploy.sh health
```

### 方法二：手动部署

1. **构建镜像**
```bash
cd /opt/wiremock-ui
docker build -t wiremock-ui:latest .
```

2. **启动服务**
```bash
docker-compose up -d
```

3. **检查状态**
```bash
docker-compose ps
docker-compose logs
```

## 🔧 配置说明

### 端口配置
- **默认端口**: 3001
- **修改端口**: 编辑 `docker-compose.yml` 中的 `ports` 配置

```yaml
ports:
  - "8080:80"  # 修改为 8080 端口
```

### 后端服务配置
后端服务地址已配置为: `http://os.wiremock.server.qa.17u.cn`

如需修改，请编辑 `nginx.conf` 文件中的代理配置：
```nginx
location /__admin/ {
    proxy_pass http://your-wiremock-server/__admin/;
    # ... 其他配置
}
```

### 环境变量
可在 `docker-compose.yml` 中添加环境变量：
```yaml
environment:
  - NODE_ENV=production
  - API_BASE_URL=http://your-custom-backend
```

## 📊 监控和维护

### 查看服务状态
```bash
./deploy.sh status
```

### 查看实时日志
```bash
./deploy.sh logs
```

### 健康检查
```bash
./deploy.sh health
# 或直接访问
curl http://localhost:3001/health
```

### 重启服务
```bash
./deploy.sh restart
```

### 更新部署
```bash
# 停止服务
./deploy.sh stop

# 重新构建
./deploy.sh build

# 启动服务
./deploy.sh start
```

## 🔒 安全配置

### 1. 防火墙设置
```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 3001/tcp
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

### 2. SSL/TLS 配置
如需 HTTPS，可以使用 Nginx 反向代理或 Traefik：

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. 访问控制
可以在 Nginx 配置中添加 IP 白名单：
```nginx
location / {
    allow 192.168.1.0/24;
    allow 10.0.0.0/8;
    deny all;
    
    try_files $uri $uri/ /index.html;
}
```

## 🐛 故障排除

### 常见问题

1. **容器启动失败**
```bash
# 查看详细日志
docker-compose logs wiremock-ui

# 检查镜像是否构建成功
docker images | grep wiremock-ui
```

2. **无法访问服务**
```bash
# 检查端口是否被占用
netstat -tlnp | grep 3001

# 检查防火墙设置
sudo ufw status
```

3. **后端连接失败**
```bash
# 测试后端连接
curl -I http://os.wiremock.server.qa.17u.cn/__admin/

# 检查 DNS 解析
nslookup os.wiremock.server.qa.17u.cn
```

4. **构建失败**
```bash
# 清理 Docker 缓存
docker system prune -a

# 重新构建
docker build --no-cache -t wiremock-ui:latest .
```

### 日志分析
```bash
# 查看 Nginx 访问日志
docker-compose exec wiremock-ui cat /var/log/nginx/access.log

# 查看 Nginx 错误日志
docker-compose exec wiremock-ui cat /var/log/nginx/error.log
```

## 📈 性能优化

### 1. 资源限制
在 `docker-compose.yml` 中添加资源限制：
```yaml
services:
  wiremock-ui:
    # ... 其他配置
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

### 2. 缓存优化
Nginx 配置已包含静态资源缓存，可根据需要调整缓存时间。

### 3. 压缩优化
Nginx 配置已启用 gzip 压缩，可根据需要调整压缩级别。

## 🔄 备份和恢复

### 备份配置
```bash
# 备份 Docker 镜像
docker save wiremock-ui:latest | gzip > wiremock-ui-backup.tar.gz

# 备份配置文件
tar -czf config-backup.tar.gz nginx.conf docker-compose.yml
```

### 恢复部署
```bash
# 恢复镜像
gunzip -c wiremock-ui-backup.tar.gz | docker load

# 恢复配置
tar -xzf config-backup.tar.gz

# 启动服务
docker-compose up -d
```

## 📞 技术支持

### 获取帮助
```bash
# 查看部署脚本帮助
./deploy.sh help

# 查看 Docker Compose 帮助
docker-compose --help
```

### 联系方式
- 查看项目文档: [README.md](README.md)
- 技术问题: 提交 GitHub Issue
- 部署问题: 查看本文档的故障排除部分

---

## 📝 部署检查清单

- [ ] 服务器满足最低要求
- [ ] Docker 和 Docker Compose 已安装
- [ ] 项目文件已上传到服务器
- [ ] 部署脚本有执行权限
- [ ] 防火墙端口已开放
- [ ] 后端服务可正常访问
- [ ] 容器成功启动
- [ ] 健康检查通过
- [ ] 前端页面可正常访问
- [ ] API 功能正常工作

完成以上检查后，您的 WireMock UI 就可以正常使用了！
