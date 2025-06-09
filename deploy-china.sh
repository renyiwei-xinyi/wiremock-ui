#!/bin/bash

# WireMock UI Docker 部署脚本 (中国网络环境优化版)
# 使用方法: ./deploy-china.sh [build|start|stop|restart|logs|clean]

set -e

PROJECT_NAME="wiremock-ui"
IMAGE_NAME="wiremock-ui:latest"
CONTAINER_NAME="wiremock-ui"
PORT="3001"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
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

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
}

# 配置 Docker 镜像加速器
setup_docker_mirror() {
    log_info "配置 Docker 镜像加速器..."
    
    # 创建 Docker 配置目录
    sudo mkdir -p /etc/docker
    
    # 配置镜像加速器
    cat > /tmp/daemon.json << EOF
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
EOF
    
    sudo cp /tmp/daemon.json /etc/docker/daemon.json
    
    # 重启 Docker 服务
    sudo systemctl daemon-reload
    sudo systemctl restart docker
    
    log_success "Docker 镜像加速器配置完成"
}

# 构建镜像（使用中国镜像源）
build_image() {
    log_info "开始构建 Docker 镜像（使用中国镜像源）..."
    
    # 清理旧镜像
    docker rmi $IMAGE_NAME 2>/dev/null || true
    
    # 使用中国版 Dockerfile 构建
    docker build -f Dockerfile.china -t $IMAGE_NAME .
    
    log_success "Docker 镜像构建完成"
}

# 启动服务
start_service() {
    log_info "启动 WireMock UI 服务..."
    
    # 停止现有容器
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    
    # 启动新容器
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT:80 \
        --restart unless-stopped \
        $IMAGE_NAME
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 10
    
    # 检查服务状态
    if docker ps | grep -q $CONTAINER_NAME; then
        log_success "WireMock UI 服务启动成功"
        log_info "访问地址: http://localhost:$PORT"
    else
        log_error "服务启动失败，请查看日志"
        docker logs $CONTAINER_NAME
        exit 1
    fi
}

# 停止服务
stop_service() {
    log_info "停止 WireMock UI 服务..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    log_success "服务已停止"
}

# 重启服务
restart_service() {
    log_info "重启 WireMock UI 服务..."
    stop_service
    start_service
    log_success "服务已重启"
}

# 查看日志
show_logs() {
    log_info "显示服务日志..."
    docker logs -f $CONTAINER_NAME
}

# 清理资源
clean_resources() {
    log_warning "这将删除所有相关的 Docker 资源，是否继续? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        log_info "清理 Docker 资源..."
        
        # 停止并删除容器
        docker stop $CONTAINER_NAME 2>/dev/null || true
        docker rm $CONTAINER_NAME 2>/dev/null || true
        
        # 删除镜像
        docker rmi $IMAGE_NAME 2>/dev/null || true
        
        # 清理未使用的资源
        docker system prune -f
        
        log_success "清理完成"
    else
        log_info "取消清理操作"
    fi
}

# 显示状态
show_status() {
    log_info "服务状态:"
    docker ps | grep $CONTAINER_NAME || echo "容器未运行"
    
    echo ""
    log_info "镜像信息:"
    docker images | grep $PROJECT_NAME || echo "未找到相关镜像"
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    # 检查容器状态
    if docker ps | grep -q $CONTAINER_NAME; then
        log_success "容器运行正常"
        
        # 检查 HTTP 响应
        if curl -f -s http://localhost:$PORT/ > /dev/null; then
            log_success "HTTP 健康检查通过"
        else
            log_warning "HTTP 健康检查失败"
        fi
    else
        log_error "容器未运行"
    fi
}

# 显示帮助信息
show_help() {
    echo "WireMock UI Docker 部署脚本 (中国网络环境优化版)"
    echo ""
    echo "使用方法:"
    echo "  $0 [命令]"
    echo ""
    echo "可用命令:"
    echo "  mirror    配置 Docker 镜像加速器"
    echo "  build     构建 Docker 镜像"
    echo "  start     启动服务"
    echo "  stop      停止服务"
    echo "  restart   重启服务"
    echo "  logs      查看日志"
    echo "  status    显示状态"
    echo "  health    健康检查"
    echo "  clean     清理所有资源"
    echo "  help      显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 mirror && $0 build && $0 start    # 配置镜像源、构建并启动"
    echo "  $0 logs                              # 查看实时日志"
    echo "  $0 health                            # 执行健康检查"
}

# 主函数
main() {
    check_docker
    
    case "${1:-help}" in
        mirror)
            setup_docker_mirror
            ;;
        build)
            build_image
            ;;
        start)
            start_service
            ;;
        stop)
            stop_service
            ;;
        restart)
            restart_service
            ;;
        logs)
            show_logs
            ;;
        status)
            show_status
            ;;
        health)
            health_check
            ;;
        clean)
            clean_resources
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
