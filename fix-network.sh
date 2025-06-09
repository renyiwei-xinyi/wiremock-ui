#!/bin/bash

# 修复网络访问问题的脚本
# 使用方法: ./fix-network.sh

set -e

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

# 检查防火墙状态
check_firewall() {
    log_info "检查防火墙状态..."
    
    # 检查 iptables
    if command -v iptables &> /dev/null; then
        log_info "检查 iptables 规则..."
        iptables -L INPUT | grep -q "$PORT" && log_success "iptables 端口 $PORT 已开放" || log_warning "iptables 端口 $PORT 可能未开放"
    fi
    
    # 检查 firewalld
    if command -v firewall-cmd &> /dev/null; then
        if systemctl is-active --quiet firewalld; then
            log_info "检查 firewalld 规则..."
            firewall-cmd --list-ports | grep -q "$PORT" && log_success "firewalld 端口 $PORT 已开放" || log_warning "firewalld 端口 $PORT 可能未开放"
        fi
    fi
    
    # 检查 ufw
    if command -v ufw &> /dev/null; then
        if ufw status | grep -q "Status: active"; then
            log_info "检查 ufw 规则..."
            ufw status | grep -q "$PORT" && log_success "ufw 端口 $PORT 已开放" || log_warning "ufw 端口 $PORT 可能未开放"
        fi
    fi
}

# 开放防火墙端口
open_firewall() {
    log_info "尝试开放防火墙端口 $PORT..."
    
    # 尝试 firewalld
    if command -v firewall-cmd &> /dev/null && systemctl is-active --quiet firewalld; then
        log_info "使用 firewalld 开放端口..."
        firewall-cmd --permanent --add-port=$PORT/tcp
        firewall-cmd --reload
        log_success "firewalld 端口开放完成"
        return 0
    fi
    
    # 尝试 ufw
    if command -v ufw &> /dev/null; then
        log_info "使用 ufw 开放端口..."
        ufw allow $PORT/tcp
        log_success "ufw 端口开放完成"
        return 0
    fi
    
    # 尝试 iptables
    if command -v iptables &> /dev/null; then
        log_info "使用 iptables 开放端口..."
        iptables -I INPUT -p tcp --dport $PORT -j ACCEPT
        # 尝试保存规则
        if command -v iptables-save &> /dev/null; then
            iptables-save > /etc/iptables/rules.v4 2>/dev/null || true
        fi
        log_success "iptables 端口开放完成"
        return 0
    fi
    
    log_warning "未找到防火墙管理工具，请手动开放端口 $PORT"
}

# 检查容器端口绑定
check_container() {
    log_info "检查容器端口绑定..."
    
    if docker ps | grep -q $CONTAINER_NAME; then
        log_info "容器正在运行，检查端口绑定..."
        docker port $CONTAINER_NAME
        
        # 检查是否绑定到所有接口
        if docker port $CONTAINER_NAME | grep -q "0.0.0.0:$PORT"; then
            log_success "容器端口已正确绑定到所有接口"
        else
            log_warning "容器端口可能只绑定到 localhost"
            log_info "需要重启容器以修复端口绑定"
            return 1
        fi
    else
        log_error "容器未运行"
        return 1
    fi
}

# 重启容器以修复端口绑定
restart_container() {
    log_info "重启容器以修复端口绑定..."
    
    # 停止容器
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    
    # 重新启动容器，确保绑定到所有接口
    docker run -d \
        --name $CONTAINER_NAME \
        -p 0.0.0.0:$PORT:5173 \
        -v $(pwd):/app \
        -w /app \
        --restart unless-stopped \
        node:18-alpine \
        sh -c "npm config set registry https://registry.npmmirror.com && npm install --legacy-peer-deps && npm run dev -- --host 0.0.0.0 --port 5173"
    
    log_success "容器已重启"
}

# 测试网络连接
test_connection() {
    log_info "测试网络连接..."
    
    # 获取本机 IP
    LOCAL_IP=$(hostname -I | awk '{print $1}')
    log_info "本机 IP: $LOCAL_IP"
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 15
    
    # 测试 localhost
    if curl -f -s http://localhost:$PORT/ > /dev/null; then
        log_success "localhost:$PORT 连接成功"
    else
        log_warning "localhost:$PORT 连接失败"
    fi
    
    # 测试本机 IP
    if curl -f -s http://$LOCAL_IP:$PORT/ > /dev/null; then
        log_success "$LOCAL_IP:$PORT 连接成功"
    else
        log_warning "$LOCAL_IP:$PORT 连接失败"
    fi
    
    # 显示访问信息
    echo ""
    log_info "访问地址:"
    echo "  - http://localhost:$PORT"
    echo "  - http://$LOCAL_IP:$PORT"
    echo ""
}

# 显示网络诊断信息
show_network_info() {
    log_info "网络诊断信息:"
    
    echo "=== 网络接口 ==="
    ip addr show | grep -E "inet.*scope global" || ifconfig | grep -E "inet.*broadcast" || true
    
    echo ""
    echo "=== 端口监听 ==="
    netstat -tlnp | grep ":$PORT " || ss -tlnp | grep ":$PORT " || true
    
    echo ""
    echo "=== Docker 端口映射 ==="
    docker ps --format "table {{.Names}}\t{{.Ports}}" | grep $CONTAINER_NAME || true
    
    echo ""
    echo "=== 防火墙状态 ==="
    # firewalld
    if command -v firewall-cmd &> /dev/null && systemctl is-active --quiet firewalld; then
        echo "firewalld: 活跃"
        firewall-cmd --list-ports | grep $PORT && echo "端口 $PORT: 已开放" || echo "端口 $PORT: 未开放"
    fi
    
    # ufw
    if command -v ufw &> /dev/null && ufw status | grep -q "Status: active"; then
        echo "ufw: 活跃"
        ufw status | grep $PORT && echo "端口 $PORT: 已开放" || echo "端口 $PORT: 未开放"
    fi
}

# 主函数
main() {
    log_info "开始修复网络访问问题..."
    
    # 检查防火墙
    check_firewall
    
    # 检查容器
    if ! check_container; then
        log_info "重启容器以修复问题..."
        restart_container
    fi
    
    # 开放防火墙端口
    open_firewall
    
    # 测试连接
    test_connection
    
    # 显示诊断信息
    show_network_info
    
    log_success "网络修复完成！"
    log_info "如果仍无法访问，请检查云服务器安全组设置"
}

# 执行主函数
main "$@"
