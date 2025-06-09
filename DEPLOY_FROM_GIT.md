# 从 Git 仓库部署 WireMock UI

## 🚀 快速部署指南

### 1. 在 Linux 服务器上克隆项目
```bash
# 克隆项目到服务器
git clone http://git.17usoft.com/overseas-test/wiremock-ui.git
cd wiremock-ui

# 设置脚本执行权限
chmod +x deploy.sh
```

### 2. 一键部署

#### 方案A：标准部署（国外网络环境）
```bash
# 构建并启动服务
./deploy.sh build
./deploy.sh start

# 验证部署
./deploy.sh health
```

#### 方案B：中国网络环境优化部署（推荐）
```bash
# 设置权限
chmod +x deploy-china.sh

# 配置 Docker 镜像加速器
./deploy-china.sh mirror

# 构建并启动服务
./deploy-china.sh build
./deploy-china.sh start

# 验证部署
./deploy-china.sh health
```

### 3. 访问应用
- **访问地址**: `http://your-server:3001`
- **健康检查**: `http://your-server:3001/health`

## 🔧 配置说明

### 端口配置
- **默认端口**: 3001
- **后端服务**: `http://os.wiremock.server.qa.17u.cn`

### 防火墙配置
```bash
# Ubuntu/Debian
sudo ufw allow 3001/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

## 📊 管理命令

```bash
# 查看服务状态
./deploy.sh status

# 查看日志
./deploy.sh logs

# 重启服务
./deploy.sh restart

# 停止服务
./deploy.sh stop

# 清理资源
./deploy.sh clean
```

## 🔄 更新部署

```bash
# 拉取最新代码
git pull origin master

# 重新构建并部署
./deploy.sh stop
./deploy.sh build
./deploy.sh start
```

## 🐛 故障排除

### Docker 构建失败
如果遇到镜像拉取或构建错误：
```bash
# 使用修复脚本
chmod +x fix-docker.sh
./fix-docker.sh

# 然后重新部署
./deploy.sh start
```

### 脚本权限问题
如果遇到 "bad interpreter" 错误：
```bash
# 方法1：重新设置权限
chmod 755 deploy.sh

# 方法2：直接用 bash 执行
bash deploy.sh build
bash deploy.sh start
```

### 端口被占用
如果 3001 端口被占用，修改 `docker-compose.yml`：
```yaml
ports:
  - "3002:80"  # 改为其他端口
```

### 查看详细日志
```bash
# 查看容器日志
docker-compose logs -f

# 查看构建日志
docker build --no-cache -t wiremock-ui:latest .
```

## 📝 部署检查清单

- [ ] Git 仓库克隆成功
- [ ] 脚本权限设置正确
- [ ] Docker 和 Docker Compose 已安装
- [ ] 防火墙端口已开放
- [ ] 容器成功启动
- [ ] 健康检查通过
- [ ] 前端页面可正常访问

完成以上步骤后，您的 WireMock UI 就可以正常使用了！

---

**Git 仓库地址**: http://git.17usoft.com/overseas-test/wiremock-ui.git
