#!/bin/bash

echo "🎮 XO大作战 - 快速部署到 Netlify"
echo "=================================="
echo ""

# 检查是否登录 Netlify
if ! netlify status &> /dev/null; then
    echo "📝 首次使用需要登录 Netlify..."
    echo "请按以下步骤操作:"
    echo "1. 系统会打开浏览器"
    echo "2. 在浏览器中授权 Netlify"
    echo "3. 授权完成后回到终端"
    echo ""
    netlify login
fi

echo ""
echo "🚀 开始部署..."
echo ""

# 检查 tower-final.html 是否存在
if [ ! -f "tower-final.html" ]; then
    echo "❌ 错误: 找不到 tower-final.html 文件"
    echo "请确保在正确的目录下运行此脚本"
    exit 1
fi

# 部署到 Netlify
echo "📤 上传文件到 Netlify..."
netlify deploy --prod --dir=.

echo ""
echo "✅ 部署完成!"
echo ""
echo "🎮 您的游戏已发布到:"
echo "   https://xo-battle-game.netlify.app"
echo ""
echo "📝 提示:"
echo "   - 可以修改上面的 site 名称来自定义网站地址"
echo "   - 在 Netlify 控制台可以查看更多设置"
