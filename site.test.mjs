import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createSiteServer } from './dev.mjs';

async function withServer(run) {
  const server = createSiteServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

test('páginas e seus recursos locais carregam com sucesso', async () => {
  await withServer(async origin => {
    for (const page of ['/', '/admin.html', '/pedido.html', '/privacidade.html', '/sites-prontos.html', '/modelo.html']) {
      const response = await fetch(origin + page);
      assert.equal(response.status, 200, page);
      assert.match(response.headers.get('content-type'), /text\/html/);
      const html = await response.text();
      for (const [, reference] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
        const url = new URL(reference, origin + page);
        if (url.origin !== origin || reference.startsWith('#')) continue;
        const resource = await fetch(url);
        assert.equal(resource.status, 200, `${page}: ${reference}`);
      }
    }
    const script = await fetch(origin + '/portal.js');
    assert.match(script.headers.get('content-type'), /text\/javascript/);
    const image = await fetch(origin + '/assets/pryme-logo.png');
    assert.match(image.headers.get('content-type'), /image\/png/);
  });
});

test('servidor não expõe arquivos privados ou simula envio de pedidos', async () => {
  await withServer(async origin => {
    for (const path of ['/.env', '/setup.sql', '/api.mjs', '/package.json', '/nao-existe']) {
      assert.equal((await fetch(origin + path)).status, 404, path);
    }
    assert.equal((await fetch(origin, { method: 'POST' })).status, 405);
    const api = await fetch(origin + '/.netlify/functions/api?route=lead', { method: 'POST' });
    assert.equal(api.status, 503);
    assert.equal((await api.json()).saved, undefined);
  });
});
