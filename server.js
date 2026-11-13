const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const ROOT_DIR = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg'
};

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Allow': 'GET, HEAD'
    });
    return res.end('405 Method Not Allowed');
  }

  let pathname;

  try {
    pathname = decodeURIComponent(
      new URL(req.url, 'http://localhost').pathname
    );
  } catch {
    res.writeHead(400);
    return res.end('400 Bad Request');
  }

  if (pathname === '/' || pathname === '/index.html') {
    pathname = '/FFX.html';
  }

  const requestedPath = path.resolve(
    ROOT_DIR,
    '.' + pathname
  );

  if (
    requestedPath !== ROOT_DIR &&
    !requestedPath.startsWith(ROOT_DIR + path.sep)
  ) {
    res.writeHead(403);
    return res.end('403 Forbidden');
  }

  fs.stat(requestedPath, (err, stats) => {
    if (err || !stats.isFile()) {
      return serve404(res);
    }

    serveFile(requestedPath, req, res);
  });
});

function serveFile(filePath, req, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType =
    MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': ext === '.html'
      ? 'no-cache'
      : 'public, max-age=3600'
  });

  if (req.method === 'HEAD') {
    return res.end();
  }

  const stream = fs.createReadStream(filePath);

  stream.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(500);
    }
    res.end('500 Internal Server Error');
  });

  stream.pipe(res);
}

function serve404(res) {
  res.writeHead(404, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.end('404 - File Not Found');
}

server.listen(PORT, '0.0.0.0', () => {
  console.log('================================');
  console.log('🔥 VIP FFX TOPUP SERVER');
  console.log('================================');
  console.log(`Server running on port ${PORT}`);
  console.log('Homepage: FFX.html');
});