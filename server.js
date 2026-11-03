const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  
  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIp();
  console.log(`\n========================================================`);
  console.log(`   PayShield - Multi-Role Live Server Running on :${PORT}`);
  console.log(`========================================================`);
  console.log(`\n[💻] Admin Panel (Laptop / SOC):\n    http://localhost:${PORT}/admin.html`);
  console.log(`\n[📱] Member App (Customer Checkout):\n    http://localhost:${PORT}/member.html`);
  console.log(`\n[🛡️] Guardian App (Companion Protection):\n    http://localhost:${PORT}/guardian.html`);
  console.log(`\n[👶] Child App (Allowance & Safe Cap):\n    http://localhost:${PORT}/child.html`);
  console.log(`\n[🏟️] Live Multi-Screen Arena Hub:\n    http://localhost:${PORT}`);
  console.log(`\n--------------------------------------------------------`);
  console.log(`[📱 Real Phone Network Links]:`);
  console.log(`    Member:   http://${localIp}:${PORT}/member.html`);
  console.log(`    Guardian: http://${localIp}:${PORT}/guardian.html`);
  console.log(`    Child:    http://${localIp}:${PORT}/child.html`);
  console.log(`========================================================\n`);
});

