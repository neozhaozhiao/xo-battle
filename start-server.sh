#!/bin/bash

# 塔防游戏日志服务启动脚本

echo "======================================"
echo "塔防游戏日志服务"
echo "======================================"
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: Node.js 未安装"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "📁 工作目录: $SCRIPT_DIR"
echo ""

# 检查日志目录
LOG_DIR="$SCRIPT_DIR/.codebuddy/logs"
if [ ! -d "$LOG_DIR" ]; then
    echo "📂 创建日志目录: $LOG_DIR"
    mkdir -p "$LOG_DIR"
else
    echo "📂 日志目录已存在: $LOG_DIR"
fi

echo ""
echo "======================================"
echo "启动日志服务..."
echo "======================================"
echo ""
echo "🌐 服务地址: http://localhost:3000"
echo "📋 日志目录: $LOG_DIR"
echo ""
echo "按 Ctrl+C 停止服务"
echo "======================================"
echo ""

# 启动服务器
node log-server.js
