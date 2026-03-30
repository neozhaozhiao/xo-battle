# 塔防游戏日志系统

## 功能说明

这个系统包含：
1. **本地Node.js日志服务器** - 接收并存储游戏日志
2. **完整日志拦截的塔防游戏** - 自动拦截所有console输出和错误
3. **按Session ID分文件存储** - 每次游戏运行创建新的日志文件

## 快速启动

### 方法1: 使用启动脚本（推荐）

```bash
cd /Users/neo/CodeBuddy/XO大作战
./start-server.sh
```

### 方法2: 直接启动

```bash
cd /Users/neo/CodeBuddy/XO大作战
node log-server.js
```

## 使用说明

1. **启动日志服务**
   ```bash
   ./start-server.sh
   ```

2. **打开游戏**
   - 在浏览器中访问: `http://localhost:3000`
   - 或者直接打开 `tower-final.html`

3. **查看日志**
   - 日志文件保存在: `.codebuddy/logs/` 目录
   - 文件命名格式: `game_日期_会话ID.log`
   - 例如: `game_2026-03-16_abc123def456.log`

## API端点

日志服务器提供以下API:

- `GET /session` - 创建新会话，返回session ID
- `POST /log` - 上报单条日志
- `POST /logs/batch` - 批量上报日志
- `GET /sessions` - 获取所有会话列表
- `GET /session/:id` - 获取指定会话的日志内容
- `GET /` - 返回游戏页面

## 日志拦截功能

游戏页面会自动拦截：

### Console方法
- `console.log()` → INFO级别
- `console.error()` → ERROR级别
- `console.warn()` → WARN级别
- `console.info()` → INFO级别

### 全局错误
- `window.onerror` → JavaScript运行时错误
- `unhandledrejection` → 未捕获的Promise拒绝
- 资源加载错误 → 图片/脚本加载失败

### 游戏事件
- 游戏初始化
- 画布点击
- 塔建造
- 敌人生成
- 波数开始/完成
- 敌人击杀
- 游戏结束

## 日志格式

每条日志包含：
```
[2026-03-16T10:30:45.123Z] [INFO] 游戏初始化开始...
[2026-03-16T10:30:45.456Z] [INFO] 日志会话创建成功: abc123...
[2026-03-16T10:30:46.789Z] [INFO] 🖱️ 画布点击: { x: 500, y: 300 }
```

## 文件结构

```
XO大作战/
├── log-server.js          # 日志服务器
├── start-server.sh        # 启动脚本
├── tower-final.html       # 完整日志拦截的游戏
├── tower-defense-clean.html # 简化版游戏
└── .codebuddy/
    └── logs/             # 日志存储目录
        ├── game_2026-03-16_abc123.log
        ├── game_2026-03-16_def456.log
        └── ...
```

## 注意事项

1. **端口占用**: 默认使用3000端口，如需修改请编辑 `log-server.js` 中的 `PORT` 变量
2. **Node.js依赖**: 需要安装Node.js (v14+)
3. **日志轮转**: 每次游戏运行都会创建新文件，建议定期清理旧日志
4. **批量上报**: 每5秒批量上报一次，页面关闭时会立即上报剩余日志

## 停止服务

在运行终端按 `Ctrl+C` 即可停止服务器

## 故障排查

如果日志服务无法启动：

1. 检查端口是否被占用:
   ```bash
   lsof -i :3000
   ```

2. 查看错误日志: 终端会显示详细错误信息

3. 检查Node.js是否安装:
   ```bash
   node --version
   ```

## 许可

本项目仅供学习和测试使用。
