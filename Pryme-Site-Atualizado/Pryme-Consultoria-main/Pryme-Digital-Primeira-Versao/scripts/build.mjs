import {mkdir,rm,copyFile,cp} from 'node:fs/promises';
export const publicFiles=['index.html','styles.css','portal.css','config.js','portal.js','home.js','lead-form.js','admin.js','sites-prontos.html','pedido.html','admin.html','modelo.html','modelo.js','modelo.css','privacidade.html'];
await rm('dist',{recursive:true,force:true});await mkdir('dist');
for(const name of publicFiles)await copyFile(name,'dist/'+name);
await cp('assets','dist/assets',{recursive:true});
console.log('Site compilado em dist. Código do servidor e documentação não são publicados.');
