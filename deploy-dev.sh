#!/bin/bash

# WireMock UI 开发服务器部署脚本 - 最简单方案
# 使用方法: ./deploy-dev.sh [start|stop|restart|logs|status]

set -e

PROJECT_NAME="wiremock-ui"
CONTAINER_NAME="wiremock-ui-dev"
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
}

# 启动开发服务器
start_service() {
    log_info "启动 WireMock UI 开发服务器..."
    
    # 停止现有容器
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    
    # 使用 Node.js 镜像直接运行开发服务器
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT:5173 \
        -v $(pwd):/app \
        -w /app \
        --restart unless-stopped \
        node:18-alpine \
        sh -c "npm config set registry https://registry.npmmirror.com && npm install --legacy-peer-deps && npm run dev -- --host 0.0.0.0"
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 15
    
    # 检查服务状态
    if docker ps | grep -q $CONTAINER_NAME; then
        log_success "WireMock UI 开发服务器启动成功"
        log_info "访问地址: http://localhost:$PORT"
        log_info "注意: 这是开发模式，支持热重载"
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

# 显示状态
show_status() {
    log_info "服务状态:"
    docker ps | grep $CONTAINER_NAME || echo "容器未运行"
    
    echo ""
    log_info "端口信息:"
    if docker ps | grep -q $CONTAINER_NAME; then
        echo "✅ 服务运行在端口 $PORT"
        echo "🌐 访问地址: http://localhost:$PORT"
    else
        echo "❌ 服务未运行"
    fi
}

# 清理资源
clean_resources() {
    log_warning "这将删除容器，是否继续? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        log_info "清理资源..."
        
        # 停止并删除容器
        docker stop $CONTAINER_NAME 2>/dev/null || true
        docker rm $CONTAINER_NAME 2>/dev/null || true
        
        log_success "清理完成"
    else
        log_info "取消清理操作"
    fi
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
            log_warning "HTTP 健康检查失败，服务可能还在启动中"
        fi
    else
        log_error "容器未运行"
    fi
}

# 显示帮助信息
show_help() {
    echo "WireMock UI 开发服务器部署脚本"
    echo ""
    echo "使用方法:"
    echo "  $0 [命令]"
    echo ""
    echo "可用命令:"
    echo "  start     启动开发服务器"
    echo "  stop      停止服务"
    echo "  restart   重启服务"
    echo "  logs      查看日志"
    echo "  status    显示状态"
    echo "  health    健康检查"
    echo "  clean     清理资源"
    echo "  help      显示帮助信息"
    echo ""
    echo "特点:"
    echo "  - 无需构建，直接运行开发服务器"
    echo "  - 支持热重载，修改代码自动刷新"
    echo "  - 启动快速，适合内部使用"
    echo ""
    echo "示例:"
    echo "  $0 start      # 启动服务"
    echo "  $0 logs       # 查看实时日志"
    echo "  $0 health     # 执行健康检查"
}

# 主函数
main() {
    check_docker
    
    case "${1:-help}" in
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
