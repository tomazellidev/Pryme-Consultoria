import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const publicFiles = new Set([
  'index.html', 'admin.html', 'pedido.html', 'privacidade.html',
  'sites-prontos.html', 'modelo.html',
  'styles.css', 'portal.css', 'modelo.css', 'config.js', 'home.js',
  'portal.js', 'app.js', 'lead-form.js', 'admin.js', 'modelo.js',
]);
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
};

export function createSiteServer() {
  return createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Cache-Control', 'no-store');
    try {
      const pathname = new URL(req.url, 'http://localhost').pathname;
      if (pathname === '/.netlify/functions/api') {
        res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'O serviço de pedidos ainda não está disponível neste endereço.' }));
        return;
      }
      if (!['GET', 'HEAD'].includes(req.method)) {
        res.writeHead(405, { Allow: 'GET, HEAD' });
        res.end();
        return;
      }
      const file = pathname === '/' ? 'index.html' : pathname.slice(1);
      const source = file === 'assets/pryme-logo.png' ? 'pryme-logo.png' : file;
      if (!publicFiles.has(file) && file !== 'assets/pryme-logo.png') {
        res.writeHead(404);
        res.end('Página não encontrada.');
        return;
      }
      const data = await readFile(new URL(source, import.meta.url));
      res.writeHead(200, { 'Content-Type': contentTypes[extname(source)], 'Content-Length': data.length });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch (error) {
      res.writeHead(error.code === 'ENOENT' ? 404 : 500);
      res.end('Não foi possível carregar este recurso.');
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || 3000);
  createSiteServer().listen(port, '0.0.0.0', () => {
    console.info(`Pryme Digital disponível na porta ${port}.`);
  });
}
