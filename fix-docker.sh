#!/bin/bash

# Docker 镜像构建修复脚本

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 清理 Docker 缓存和损坏的镜像
cleanup_docker() {
    log_info "清理 Docker 缓存和损坏的镜像..."
    
    # 停止所有容器
    docker stop $(docker ps -aq) 2>/dev/null || true
    
    # 删除所有容器
    docker rm $(docker ps -aq) 2>/dev/null || true
    
    # 删除悬空镜像
    docker rmi $(docker images -f "dangling=true" -q) 2>/dev/null || true
    
    # 清理系统
    docker system prune -af
    
    # 清理构建缓存
    docker builder prune -af
    
    log_success "Docker 清理完成"
}

# 预拉取基础镜像
pull_base_images() {
    log_info "预拉取基础镜像..."
    
    # 拉取 Node.js 镜像
    log_info "拉取 node:18-alpine 镜像..."
    docker pull node:18-alpine
    
    # 拉取 Nginx 镜像
    log_info "拉取 nginx:alpine 镜像..."
    docker pull nginx:alpine
    
    log_success "基础镜像拉取完成"
}

# 验证镜像
verify_images() {
    log_info "验证镜像完整性..."
    
    if docker images | grep -q "node.*18-alpine"; then
        log_success "node:18-alpine 镜像验证通过"
    else
        log_error "node:18-alpine 镜像验证失败"
        return 1
    fi
    
    if docker images | grep -q "nginx.*alpine"; then
        log_success "nginx:alpine 镜像验证通过"
    else
        log_error "nginx:alpine 镜像验证失败"
        return 1
    fi
}

# 重新构建项目镜像
rebuild_project() {
    log_info "重新构建项目镜像..."
    
    # 删除旧的项目镜像
    docker rmi wiremock-ui:latest 2>/dev/null || true
    
    # 使用 --no-cache 重新构建
    docker build --no-cache --pull -t wiremock-ui:latest .
    
    log_success "项目镜像构建完成"
}

# 主函数
main() {
    log_info "开始修复 Docker 构建问题..."
    
    cleanup_docker
    pull_base_images
    verify_images
    rebuild_project
    
    log_success "Docker 修复完成！现在可以运行 ./deploy.sh start"
}

# 执行主函数
main "$@"
