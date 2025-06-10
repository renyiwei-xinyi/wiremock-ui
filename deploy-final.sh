#!/bin/bash

# WireMock UI 最终部署脚本 - 基于参考项目的简单方案
# 使用方法: ./deploy-final.sh [build|start|stop|restart|logs|status]

set -e

PROJECT_NAME="wiremock-ui"
CONTAINER_NAME="wiremock-ui"
PORT="3001"
COMPOSE_FILE="docker-compose.simple.yml"

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

# 检查 Docker 和 Docker Compose
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

# 构建镜像
build_image() {
    log_info "构建 WireMock UI 镜像..."
    
    # 使用简化的 docker-compose 文件构建
    docker-compose -f $COMPOSE_FILE build --no-cache
    
    if [ $? -eq 0 ]; then
        log_success "镜像构建完成"
    else
        log_error "镜像构建失败"
        exit 1
    fi
}

# 启动服务
start_service() {
    log_info "启动 WireMock UI 服务..."
    
    # 使用 docker-compose 启动服务
    docker-compose -f $COMPOSE_FILE up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 10
    
    # 检查服务状态
    if docker ps | grep -q $CONTAINER_NAME; then
        log_success "WireMock UI 服务启动成功"
        
        # 获取本机 IP
        LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
        
        log_info "访问地址:"
        echo "  - http://localhost:$PORT"
        echo "  - http://$LOCAL_IP:$PORT"
    else
        log_error "服务启动失败，请查看日志"
        docker-compose -f $COMPOSE_FILE logs
        exit 1
    fi
}

# 停止服务
stop_service() {
    log_info "停止 WireMock UI 服务..."
    docker-compose -f $COMPOSE_FILE down
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
    docker-compose -f $COMPOSE_FILE logs -f
}

# 显示状态
show_status() {
    log_info "服务状态:"
    docker-compose -f $COMPOSE_FILE ps
    
    echo ""
    log_info "端口信息:"
    if docker ps | grep -q $CONTAINER_NAME; then
        echo "✅ 服务运行在端口 $PORT"
        LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
        echo "🌐 访问地址:"
        echo "   - http://localhost:$PORT"
        echo "   - http://$LOCAL_IP:$PORT"
    else
        echo "❌ 服务未运行"
    fi
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    # 检查容器状态
    if docker ps | grep -q $CONTAINER_NAME; then
        log_success "容器运行正常"
        
        # 检查 HTTP 响应
        LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
        
        if curl -f -s http://localhost:$PORT/ > /dev/null 2>&1; then
            log_success "localhost:$PORT 连接成功"
        else
            log_warning "localhost:$PORT 连接失败"
        fi
        
        if curl -f -s http://$LOCAL_IP:$PORT/ > /dev/null 2>&1; then
            log_success "$LOCAL_IP:$PORT 连接成功"
        else
            log_warning "$LOCAL_IP:$PORT 连接失败，请检查防火墙设置"
        fi
    else
        log_error "容器未运行"
    fi
}

# 一键部署
deploy_all() {
    log_info "开始一键部署..."
    build_image
    start_service
    health_check
    log_success "部署完成！"
}

# 显示帮助信息
show_help() {
    echo "WireMock UI 最终部署脚本"
    echo ""
    echo "使用方法:"
    echo "  $0 [命令]"
    echo ""
    echo "可用命令:"
    echo "  deploy    一键部署（构建+启动）"
    echo "  build     构建镜像"
    echo "  start     启动服务"
    echo "  stop      停止服务"
    echo "  restart   重启服务"
    echo "  logs      查看日志"
    echo "  status    显示状态"
    echo "  health    健康检查"
    echo "  help      显示帮助信息"
    echo ""
    echo "特点:"
    echo "  - 基于参考项目的简单配置"
    echo "  - 使用 vite preview 作为生产服务器"
    echo "  - 端口映射 3001:3000"
    echo "  - 自动重启策略"
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
