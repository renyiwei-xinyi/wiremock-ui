@echo off
echo WireMock UI 启动脚本
echo.

REM 检查 Node.js 是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM 检查 npm 是否安装
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到 npm
    echo npm 通常随 Node.js 一起安装
    echo.
    pause
    exit /b 1
)

echo 检测到 Node.js 和 npm
echo.

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo 正在安装依赖...
    npm install
    if %errorlevel% neq 0 (
        echo 依赖安装失败
        pause
        exit /b 1
    )
    echo 依赖安装完成
    echo.
)

echo 启动开发服务器...
echo 应用将在 http://localhost:3000 启动
echo 请确保 WireMock 服务运行在 http://localhost:8080
echo.
echo 按 Ctrl+C 停止服务器
echo.

npm run dev

pause
