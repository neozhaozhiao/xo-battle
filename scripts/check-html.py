#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
import sys

def check_html_file(filepath):
    print(f"🔍 检查文件: {filepath}\n")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 检查1: 基本标签
    checks = {
        'DOCTYPE': '<!DOCTYPE html>' in content,
        'html开始': '<html' in content,
        'html结束': '</html>' in content,
        'head': '<head>' in content,
        'head结束': '</head>' in content,
        'body': '<body>' in content,
        'body结束': '</body>' in content,
        'script': '<script>' in content,
        'script结束': '</script>' in content,
        'mainMenu': 'id="mainMenu"' in content,
        'gameUI': 'id="gameUI"' in content,
        '开始按钮': 'onclick="testAndStartGame()"' in content or 'onclick="startGame()"' in content,
    }

    print("📋 基本结构检查:")
    for name, result in checks.items():
        status = "✅" if result else "❌"
        print(f"  {status} {name}: {'通过' if result else '未找到'}")

    # 检查2: 标签匹配
    print("\n🔗 标签匹配检查:")
    tags = ['html', 'head', 'body', 'script', 'div']
    for tag in tags:
        open_count = len(re.findall(f'<{tag}[^>]*>', content, re.IGNORECASE))
        close_count = len(re.findall(f'</{tag}>', content, re.IGNORECASE))
        status = "✅" if open_count == close_count else "⚠️"
        print(f"  {status} <{tag}>: {open_count} 个开始, {close_count} 个结束")

    # 检查3: JavaScript函数
    print("\n📝 JavaScript函数检查:")
    functions = ['startGame', 'testAndStartGame', 'init', 'gameLoop']
    for func in functions:
        found = f'function {func}' in content or f'{func} = function' in content or f'const {func}' in content
        status = "✅" if found else "❌"
        print(f"  {status} {func}: {'找到' if found else '未找到'}")

    # 检查4: 查找可能的错误
    print("\n⚠️ 可能的问题:")
    if 'onclick="startGame()"' in content and 'function startGame' not in content:
        print("  ❌ 警告: 按钮调用了 startGame 但函数未定义")

    # 显示文件大小
    print(f"\n📊 文件大小: {len(content)} 字符")
    print(f"   行数: {len(content.splitlines())}")

if __name__ == '__main__':
    check_html_file('tower-final.html')
