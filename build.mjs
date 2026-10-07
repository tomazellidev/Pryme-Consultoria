import {mkdir,rm,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';

// Compile from this project root so hosting services do not depend on the
// archived Pryme-Digital-Primeira-Versao folder being present in the checkout.
const root=fileURLToPath(new URL('.',import.meta.url));
const output=resolve(root,'dist');
if(dirname(output)!==resolve(root)) throw new Error('Diretório de saída fora do projeto');
const publicFiles=['index.html','pryme-ultimate.css','pryme-ultimate.js','diagnostic-model.js'];

await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
for(const name of publicFiles) await copyFile(resolve(root,name),resolve(output,name));
await mkdir(resolve(output,'assets'),{recursive:true});
await copyFile(resolve(root,'assets/pryme-ultimate-logo.png'),resolve(output,'assets/pryme-ultimate-logo.png'));
console.log('Pryme Ultimate compilado em dist (página independente).');
