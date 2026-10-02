import {resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('./Pryme-Digital-Primeira-Versao/',import.meta.url)));
await import(pathToFileURL(resolve('dev.mjs')));