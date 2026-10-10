const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const PORT = process.env.PORT || 3000;
if (!process.env.SITE_URL) {
  process.env.SITE_URL = `http://localhost:${PORT}`;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer(async (req, res) => {
  // Enhance res with helper methods used by Vercel serverless functions
  res.status = function (code) {
    this.statusCode = code;
    return this;
  };
  res.json = function (data) {
    this.setHeader('Content-Type', 'application/json; charset=utf-8');
    this.end(JSON.stringify(data));
  };

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // API routing
  if (pathname.startsWith('/api/')) {
    const route = pathname.replace(/^\/api\//, '').replace(/\.js$/, '');
    const apiFile = path.join(__dirname, 'api', `${route}.js`);

    if (fs.existsSync(apiFile)) {
      // Collect request body
      let bodyData = '';
      req.on('data', chunk => {
        bodyData += chunk;
      });
      req.on('end', async () => {
        try {
          if (bodyData && (req.headers['content-type'] || '').includes('application/json')) {
            req.body = JSON.parse(bodyData);
          } else {
            req.body = bodyData ? bodyData : {};
          }
        } catch {
          req.body = {};
        }

        try {
          // Clear require cache for fast dev updates
          delete require.cache[require.resolve(apiFile)];
          const handler = require(apiFile);
          await handler(req, res);
        } catch (err) {
          console.error(`[API Error] ${pathname}:`, err);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error', details: err.message });
          }
        }
      });
      return;
    } else {
      res.status(404).json({ error: 'API route not found' });
      return;
    }
  }

  // Static file serving
  let relPath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  let filePath = path.join(__dirname, relPath);

  // Security check to avoid directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.status(403).end('Forbidden');
    return;
  }

  // Handle clean URLs / direct file access
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const headers = { 'Content-Type': contentType };
    if (ext === '.pdf') {
      const fileName = path.basename(filePath);
      headers['Content-Disposition'] = `attachment; filename="${fileName}"`;
    }
    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  } else {
    // Fallback to index.html for SPA hash navigation
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(indexPath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }
});

server.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  AnshGroup is running locally!`);
  console.log(`  Local URL:   http://localhost:${PORT}`);
  console.log(`  Seller CV:   http://localhost:${PORT}/cv/Harjit-Singh-CV.pdf`);
  console.log(`  API Base:    http://localhost:${PORT}/api/`);
  console.log(`========================================\n`);
});
