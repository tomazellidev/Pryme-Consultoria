import test from 'node:test';
import assert from 'node:assert/strict';
import api from '../netlify/functions/api.mjs';
import {validateLead} from '../server/core.mjs';
const originalFetch=globalThis.fetch;
const env={SUPABASE_URL:'https://test.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-server-key',SUPABASE_ANON_KEY:'test-public-key',ADMIN_USER_ID:'admin-id',TURNSTILE_SITE_KEY:'test-site-key',TURNSTILE_SECRET_KEY:'test-secret',SITE_ORIGIN:'https://pryme.test'};
Object.assign(process.env,env);
const sample=()=>({id:'b8bf7a92-b882-4e34-ae23-d7260c8af4dd',name:'Pessoa Teste',business:'Studio Teste',phone:'5548999999999',email:'',segment:'Estúdio',model:'personal',need:'Um site de apresentação',consent:true,files:[],token:'test-token'});
const request=(route,method='GET',body,headers={})=>new Request('https://pryme.test/.netlify/functions/api?route='+route,{method,headers:{origin:env.SITE_ORIGIN,...headers},body:body?JSON.stringify(body):undefined});
const response=(d,status=200,headers={})=>new Response(JSON.stringify(d),{status,headers});
const verified=()=>response({success:true,action:'pedido',hostname:'pryme.test'});
test.afterEach(()=>{globalThis.fetch=originalFetch;Object.assign(process.env,env);});
test('sem configuração não aceita pedidos nem anuncia envio ativo',async()=>{delete process.env.SUPABASE_URL;assert.equal((await (await api(request('config'))).json()).ready,false);assert.equal((await api(request('lead','POST',sample()))).status,503);});
test('bloqueia consulta sem sessão antes de acessar o banco',async()=>{let called=false;globalThis.fetch=async()=>{called=true;throw Error();};assert.equal((await api(request('leads'))).status,401);assert.equal(called,false);});
test('usuário autenticado que não é administrador não lê pedidos',async()=>{globalThis.fetch=async()=>response({id:'outro-usuario',email_confirmed_at:'2026-09-25'});assert.equal((await api(request('leads','GET',null,{cookie:'__Host-pryme_admin=abc'}))).status,403);});
test('bloqueia alterações de origem externa',async()=>{assert.equal((await api(request('lead-update','PATCH',{}, {origin:'https://outro.test'}))).status,403);});
test('ignora preço e status adulterados pelo visitante',()=>{const {lead}=validateLead({...sample(),quote_price:1,status:'concluido'});assert.equal(lead.quote_price,690);assert.equal(lead.status,'novo');});
test('rejeita consentimento ausente, telefone inválido, imagem falsa e excesso',()=>{
 assert.throws(()=>validateLead({...sample(),consent:false}));assert.throws(()=>validateLead({...sample(),phone:'123'}));
 assert.throws(()=>validateLead({...sample(),files:[{name:'logo.png',type:'image/png',data:Buffer.from('<script>alert(1)</script>').toString('base64')}]}));
 assert.throws(()=>validateLead({...sample(),files:Array(4).fill({})}));
 assert.throws(()=>validateLead({...sample(),files:[{name:'logo.png',type:'image/png',data:Buffer.alloc(1048577).toString('base64')}]}));
});
test('verificação inválida nunca grava dados',async()=>{let calls=0;globalThis.fetch=async()=>{calls++;return response({success:false});};assert.equal((await api(request('lead','POST',sample()))).status,400);assert.equal(calls,1);});
test('token de outro hostname é rejeitado',async()=>{globalThis.fetch=async()=>response({success:true,action:'pedido',hostname:'outro.test'});assert.equal((await api(request('lead','POST',sample()))).status,400);});
test('grava e confirma uma única vez; repetição não duplica pedido',async()=>{
 let saved=null,writes=0;globalThis.fetch=async(url,options={})=>{if(url.includes('siteverify'))return verified();if(options.method==='POST'){writes++;saved=JSON.parse(options.body);return response(null);}return response(saved?[saved]:[]);};
 assert.equal((await api(request('lead','POST',sample()))).status,201);assert.equal((await api(request('lead','POST',sample()))).status,200);assert.equal(writes,1);
 const changed=await api(request('lead','POST',{...sample(),need:'Conteúdo diferente'}));assert.equal(changed.status,409);
});
test('falha ao salvar remove imagens que já foram enviadas e não confirma sucesso',async()=>{
 let deleted=false;const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
 globalThis.fetch=async(url,options={})=>{if(url.includes('siteverify'))return verified();if(url.includes('/storage/')){if(options.method==='DELETE')deleted=true;return response({});}if(options.method==='POST')return response({error:'db'},500);return response([]);};
 const r=await api(request('lead','POST',{...sample(),files:[{name:'logo.png',type:'image/png',data:png.toString('base64')}]}));assert.equal(r.status,502);assert.equal(deleted,true);assert.equal((await r.json()).saved,undefined);
});
test('login autorizado cria cookie protegido sem devolver token ao JavaScript',async()=>{
 globalThis.fetch=async url=>url.includes('siteverify')?response({success:true,action:'login',hostname:'pryme.test'}):response({access_token:'secret-token',expires_in:3600,user:{id:'admin-id',email_confirmed_at:'2026-09-25'}});
 const r=await api(request('login','POST',{email:'admin@example.test',password:'fake-password',token:'test'}));assert.equal(r.status,200);assert.match(r.headers.get('set-cookie'),/HttpOnly; Secure; SameSite=Strict/);assert.deepEqual(await r.json(),{ok:true});
});
test('sessão admin é validada no provedor e edição concorrente dá conflito',async()=>{
 let requests=0;globalThis.fetch=async url=>{requests++;return url.includes('/auth/')?response({id:'admin-id',email_confirmed_at:'2026-09-25'}):response([]);};
 const r=await api(request('lead-update','PATCH',{id:sample().id,status:'conversa',notes:'Teste',updated_at:'2026-09-25T12:00:00Z'},{cookie:'__Host-pryme_admin=valid-token'}));assert.equal(r.status,409);assert.equal(requests,2);
});
test('resposta perdida após commit preserva as imagens do pedido salvo',async()=>{
 let saved=null,deleted=false;const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
 globalThis.fetch=async(url,options={})=>{if(url.includes('siteverify'))return verified();if(url.includes('/storage/')){if(options.method==='DELETE')deleted=true;return response({});}if(options.method==='POST'){saved=JSON.parse(options.body);throw new Error('Resposta perdida');}return response(saved?[saved]:[]);};
 const r=await api(request('lead','POST',{...sample(),files:[{name:'logo.png',type:'image/png',data:png}]}));assert.equal(r.status,200);assert.equal((await r.json()).saved,true);assert.equal(deleted,false);
});
