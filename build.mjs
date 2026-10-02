import { copyFile, mkdir } from 'node:fs/promises';

const output = new URL('./dist/', import.meta.url);
const publicFiles = [
  'index.html', 'admin.html', 'pedido.html', 'privacidade.html',
  'sites-prontos.html', 'modelo.html',
  'styles.css', 'portal.css', 'modelo.css',
  'config.js', 'home.js', 'portal.js', 'app.js',
  'lead-form.js', 'admin.js', 'modelo.js',
];

await mkdir(new URL('assets/', output), { recursive: true });
await Promise.all(publicFiles.map(file =>
  copyFile(new URL(file, import.meta.url), new URL(file, output))
));
await copyFile(new URL('./pryme-logo.png', import.meta.url), new URL('assets/pryme-logo.png', output));
console.info('Site gerado em dist/.');
