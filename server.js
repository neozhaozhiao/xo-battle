const http = require('http');
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '.codebuddy', 'logs');
const logFile = path.join(logDir, `game_log_${new Date().toISOString().split('T')[0]}.log`);

// 确保日志目录存在
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// 创建今天的日志文件
if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, `=== Game Log - ${new Date().toISOString()} ===\n\n`);
}

const server = http.createServer((req, res) => {
    // 处理日志上报
    if (req.method === 'POST' && req.url === '/log') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const logEntry = JSON.parse(body);
                const timestamp = new Date().toISOString();
                const logMessage = `[${timestamp}] ${logEntry.level}: ${logEntry.message}\n`;
                
                fs.appendFile(logFile, logMessage, (err) => {
                    if (err) {
                        console.error('Error writing log:', err);
                    }
                });
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (error) {
                console.error('Error parsing log:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });
        return;
    }

    // 处理静态文件
    if (req.url === '/' || req.url === '/tower-defense.html') {
        const filePath = path.join(__dirname, 'tower-defense.html');
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading page');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(content);
        });
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Game server running at http://localhost:${PORT}`);
    console.log(`Log file: ${logFile}`);
});
