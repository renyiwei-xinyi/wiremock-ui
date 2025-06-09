#!/bin/bash

# WireMock UI 简化部署脚本 - 绕过 Docker 构建问题
# 使用方法: ./deploy-simple.sh [start|stop|restart|logs|status|clean]

set -e

PROJECT_NAME="wiremock-ui"
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
}

# 检查 Node.js 是否安装
check_nodejs() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装，请先安装 npm"
        exit 1
    fi
}

# 本地构建前端项目
build_frontend() {
    log_info "本地构建前端项目..."
    
    # 设置 npm 镜像源
    npm config set registry https://registry.npmmirror.com
    
    # 安装依赖
    log_info "安装依赖..."
    npm install
    
    # 构建项目
    log_info "构建项目..."
    npm run build
    
    log_success "前端项目构建完成"
}

# 使用预构建的 nginx 镜像启动服务
start_service() {
    log_info "启动 WireMock UI 服务..."
    
    # 停止现有容器
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    
    # 检查 dist 目录是否存在
    if [ ! -d "dist" ]; then
        log_error "dist 目录不存在，请先运行构建"
        exit 1
    fi
    
    # 使用 nginx 镜像启动服务，挂载本地构建的文件
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT:80 \
        -v $(pwd)/dist:/usr/share/nginx/html:ro \
        -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
        --restart unless-stopped \
        nginx:alpine
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 5
    
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

# 显示状态
show_status() {
    log_info "服务状态:"
    docker ps | grep $CONTAINER_NAME || echo "容器未运行"
    
    echo ""
    log_info "构建文件:"
    if [ -d "dist" ]; then
        echo "✅ dist 目录存在"
        echo "文件数量: $(find dist -type f | wc -l)"
    else
        echo "❌ dist 目录不存在"
    fi
}

# 清理资源
clean_resources() {
    log_warning "这将删除容器和构建文件，是否继续? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        log_info "清理资源..."
        
        # 停止并删除容器
        docker stop $CONTAINER_NAME 2>/dev/null || true
        docker rm $CONTAINER_NAME 2>/dev/null || true
        
        # 删除构建文件
        rm -rf dist/ node_modules/
        
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
            log_warning "HTTP 健康检查失败"
        fi
    else
        log_error "容器未运行"
    fi
}

# 一键部署
deploy_all() {
    log_info "开始一键部署..."
    check_nodejs
    build_frontend
    start_service
    health_check
    log_success "部署完成！"
}

# 显示帮助信息
show_help() {
    echo "WireMock UI 简化部署脚本"
    echo ""
    echo "使用方法:"
    echo "  $0 [命令]"
    echo ""
    echo "可用命令:"
    echo "  deploy    一键部署（构建+启动）"
    echo "  build     构建前端项目"
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
    echo "  $0 deploy     # 一键部署"
    echo "  $0 logs       # 查看实时日志"
    echo "  $0 health     # 执行健康检查"
}

# 主函数
main() {
    check_docker
    
    case "${1:-help}" in
        deploy)
            deploy_all
            ;;
        build)
            check_nodejs
            build_frontend
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
