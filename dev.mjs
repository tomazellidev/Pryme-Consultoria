import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const output=fileURLToPath(new URL('./dist/',import.meta.url));

const mime={
  '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8','.png':'image/png',
  '.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp',
  '.svg':'image/svg+xml','.ico':'image/x-icon'
};

export const createPreviewServer=()=>createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    const path=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1));
    if(path.includes('..')||path.includes('\\')) throw new Error('Invalid path');
    const absolute=resolve(output,path);
    if(!absolute.startsWith(resolve(output)+sep)) throw new Error('Invalid path');
    const body=await readFile(absolute);
    res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-store'});
    res.end(body);
  }catch{
    res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});
    res.end('Página não encontrada');
  }
});

if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  createPreviewServer().listen(Number(process.env.PORT)||4173,'127.0.0.1',()=>{
    console.log(`Pryme Ultimate disponível em http://localhost:${Number(process.env.PORT)||4173}`);
  });
}
