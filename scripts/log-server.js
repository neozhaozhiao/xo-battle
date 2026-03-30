const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 配置
const PORT = 3000;
const LOG_DIR = path.join(__dirname, '.codebuddy', 'logs');

// 确保日志目录存在
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    console.log(`创建日志目录: ${LOG_DIR}`);
}

// 存储会话信息
const sessions = new Map();

// 生成随机session ID
function generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
}

// 获取日志文件路径
function getLogFilePath(sessionId) {
    const date = new Date().toISOString().split('T')[0];
    const filename = `game_${date}_${sessionId}.log`;
    return path.join(LOG_DIR, filename);
}

// 写入日志
function writeLog(sessionId, logData) {
    const filePath = getLogFilePath(sessionId);
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${logData.level}] ${logData.message}\n`;
    
    fs.appendFile(filePath, logEntry, (err) => {
        if (err) {
            console.error(`写入日志失败: ${err.message}`);
        }
    });
}

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 处理OPTIONS预检请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // 处理创建新会话
    if (req.method === 'GET' && req.url === '/session') {
        const sessionId = generateSessionId();
        const sessionInfo = {
            id: sessionId,
            createdAt: new Date().toISOString(),
            logs: []
        };
        
        sessions.set(sessionId, sessionInfo);
        
        console.log(`新会话创建: ${sessionId}`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: true, 
            sessionId: sessionId,
            message: '会话创建成功'
        }));
        return;
    }
    
    // 处理日志上报
    if (req.method === 'POST' && req.url === '/log') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const logData = JSON.parse(body);
                
                // 验证session ID
                if (!logData.sessionId) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: '缺少sessionId' }));
                    return;
                }
                
                // 写入日志
                writeLog(logData.sessionId, logData);
                
                // 更新会话信息
                const session = sessions.get(logData.sessionId);
                if (session) {
                    session.logs.push(logData);
                }
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
                
            } catch (error) {
                console.error(`解析日志失败: ${error.message}`);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: error.message 
                }));
            }
        });
        return;
    }
    
    // 处理批量日志上报
    if (req.method === 'POST' && req.url === '/logs/batch') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const logs = JSON.parse(body);
                
                // 验证session ID
                if (!logs.sessionId) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: '缺少sessionId' }));
                    return;
                }
                
                // 批量写入日志
                logs.data.forEach(logData => {
                    writeLog(logs.sessionId, logData);
                });
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    count: logs.data.length 
                }));
                
            } catch (error) {
                console.error(`解析批量日志失败: ${error.message}`);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: error.message 
                }));
            }
        });
        return;
    }
    
    // 获取会话列表
    if (req.method === 'GET' && req.url === '/sessions') {
        const sessionList = Array.from(sessions.values()).map(s => ({
            id: s.id,
            createdAt: s.createdAt,
            logCount: s.logs.length
        }));
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, sessions: sessionList }));
        return;
    }
    
    // 获取会话日志内容
    if (req.method === 'GET' && req.url.startsWith('/session/')) {
        const sessionId = req.url.split('/')[2];
        const filePath = getLogFilePath(sessionId);
        
        if (fs.existsSync(filePath)) {
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(500);
                    res.end('读取日志失败');
                    return;
                }
                
                res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(data);
            });
        } else {
            res.writeHead(404);
            res.end('日志文件不存在');
        }
        return;
    }
    
    // 处理静态文件
    if (req.url === '/' || req.url === '/tower-defense.html' || req.url === '/game.html') {
        const filePath = path.join(__dirname, 'tower-defense.html');
        
        if (fs.existsSync(filePath)) {
            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(500);
                    res.end('加载页面失败');
                    return;
                }
                
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(content);
            });
        } else {
            res.writeHead(404);
            res.end('文件不存在');
        }
        return;
    }
    
    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Not Found' }));
});

// 启动服务器
server.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('游戏日志服务已启动');
    console.log('='.repeat(50));
    console.log(`服务器地址: http://localhost:${PORT}`);
    console.log(`日志目录: ${LOG_DIR}`);
    console.log('='.repeat(50));
    console.log('API端点:');
    console.log(`  GET  /session        - 创建新会话`);
    console.log(`  POST /log            - 上报单条日志`);
    console.log(`  POST /logs/batch     - 批量上报日志`);
    console.log(`  GET  /sessions       - 获取会话列表`);
    console.log(`  GET  /session/:id     - 获取会话日志`);
    console.log(`  GET  /               - 游戏页面`);
    console.log('='.repeat(50));
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});
