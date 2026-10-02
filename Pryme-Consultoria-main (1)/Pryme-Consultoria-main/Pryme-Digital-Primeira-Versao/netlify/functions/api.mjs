import { createHash } from 'node:crypto';
import { HttpError,clean,validateLead,statuses } from '../../server/core.mjs';
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});
const cookie=(token,age)=>`__Host-pryme_admin=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
export default async function handler(req){
 const env=process.env;
 const ready=['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_ANON_KEY','ADMIN_USER_ID','TURNSTILE_SITE_KEY','TURNSTILE_SECRET_KEY','SITE_ORIGIN'].every(k=>Boolean(env[k]));
 const route=new URL(req.url).searchParams.get('route')||'';
 const sb=async(path,options={})=>{
  const res=await fetch(env.SUPABASE_URL.replace(/\/$/,'')+path,{...options,headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,...options.headers},signal:AbortSignal.timeout(8000)});
  if(!res.ok)throw new HttpError(502,'O serviço está temporariamente indisponível. Tente novamente.');return res;
 };
 const verify=async(token,action)=>{
  if(typeof token!=='string'||token.length>2048)throw new HttpError(400,'Complete a verificação de segurança.');
  const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET_KEY,response:token}),signal:AbortSignal.timeout(10000)});
  const result=await r.json();if(!result.success||result.action!==action||result.hostname!==new URL(env.SITE_ORIGIN).hostname)throw new HttpError(400,'Refaça a verificação de segurança e tente novamente.');
 };
 const admin=async()=>{
  const token=(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('__Host-pryme_admin='))?.slice(19);
  if(!token)throw new HttpError(401,'Entre no painel para continuar.');
  const r=await fetch(env.SUPABASE_URL+'/auth/v1/user',{headers:{apikey:env.SUPABASE_ANON_KEY,Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(10000)});
  if(!r.ok)throw new HttpError(401,'Sua sessão expirou. Entre novamente.');
  const user=await r.json();if(user.id!==env.ADMIN_USER_ID||!user.email_confirmed_at)throw new HttpError(403,'Acesso não autorizado.');return user;
 };
 try{
  if(route==='config'&&req.method==='GET')return json({ready,siteKey:ready?env.TURNSTILE_SITE_KEY:null});
  if(!ready)throw new HttpError(503,'O recebimento pelo site ainda não está ativo. Fale com a Pryme pelo WhatsApp.');
  if(req.method!=='GET'&&req.headers.get('origin')!==new URL(env.SITE_ORIGIN).origin)throw new HttpError(403,'Origem não autorizada.');
  const read=async()=>{const raw=await req.text();if(Buffer.byteLength(raw)>4300000)throw new HttpError(413,'Arquivos muito grandes.');try{return JSON.parse(raw);}catch{throw new HttpError(400,'Pedido inválido.');}};
  if(route==='lead'&&req.method==='POST'){
   const d=await read();const {lead,uploads}=validateLead(d);await verify(d.token,'pedido');
   const digest=createHash('sha256').update(JSON.stringify({...lead,consent_at:undefined})+uploads.map(x=>createHash('sha256').update(x.bytes).digest('hex')).join('')).digest('hex');
   const existing=await (await sb(`/rest/v1/pryme_leads?id=eq.${lead.id}&select=id,request_hash`)).json();
   if(existing.length){if(existing[0].request_hash!==digest)throw new HttpError(409,'O pedido mudou. Atualize a página antes de reenviar.');return json({id:lead.id,saved:true});}
   const stored=[];
   try{
    const results=await Promise.allSettled(uploads.map(async f=>{await sb('/storage/v1/object/pryme-brand/'+f.path,{method:'POST',headers:{'Content-Type':f.type,'x-upsert':'false'},body:f.bytes});stored.push(f.path);}));
    const failed=results.find(r=>r.status==='rejected');if(failed)throw failed.reason;
    await sb('/rest/v1/pryme_leads',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({...lead,request_hash:digest,files:uploads.map(({name,type,path,bytes})=>({name,type,path,size:bytes.length}))})});
   }catch(e){
    // Uma resposta perdida pode ocorrer depois do commit. Confira antes de remover imagens.
    let saved;try{saved=await (await sb(`/rest/v1/pryme_leads?id=eq.${lead.id}&select=id,request_hash,files`)).json();}catch{throw e;}
    const keep=new Set((saved[0]?.files||[]).map(f=>f.path));const unused=stored.filter(path=>!keep.has(path));
    if(unused.length){try{await sb('/storage/v1/object/pryme-brand',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({prefixes:unused})});}catch{console.error('Pryme: verificar uploads órfãos no armazenamento.');}}
    if(saved[0]?.request_hash===digest)return json({id:lead.id,saved:true});throw e;
   }
   if(env.RESEND_API_KEY&&env.LEAD_NOTIFICATION_EMAIL&&env.LEAD_NOTIFICATION_FROM){try{const esc=v=>String(v).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:env.LEAD_NOTIFICATION_FROM,to:[env.LEAD_NOTIFICATION_EMAIL],subject:'Novo pedido Pryme: '+lead.business,html:'<p>Novo pedido: '+esc(lead.business)+' · '+esc(lead.name)+' · '+esc(lead.phone)+' · '+esc(lead.service)+' · '+esc(lead.id)+'</p><a href="'+esc(env.SITE_ORIGIN)+'/admin.html">Abrir painel</a>'}),signal:AbortSignal.timeout(8000)});}catch{console.error('Pryme: aviso de e-mail não enviado.');}}
   return json({id:lead.id,saved:true},201);
  }
  if(route==='login'&&req.method==='POST'){
   const d=await read();await verify(d.token,'login');const email=clean(d.email,160);const password=clean(d.password,200);
   const r=await fetch(env.SUPABASE_URL+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:env.SUPABASE_ANON_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password}),signal:AbortSignal.timeout(8000)});
   const auth=await r.json();if(!r.ok||auth.user?.id!==env.ADMIN_USER_ID||!auth.user?.email_confirmed_at)throw new HttpError(401,'Não foi possível entrar. Confira seu acesso.');
   return json({ok:true},200,{'Set-Cookie':cookie(auth.access_token,Math.min(auth.expires_in||3600,3600))});
  }
  if(route==='logout'&&req.method==='POST')return json({ok:true},200,{'Set-Cookie':cookie('',0)});
  await admin();
  if(route==='session'&&req.method==='GET')return json({ok:true});
  if(route==='leads'&&req.method==='GET'){
   const query=new URL(req.url).searchParams;const status=query.get('status');const q=(query.get('q')||'').replace(/[^\p{L}\p{N} ]/gu,'').slice(0,80);const page=Math.max(0,Math.min(10000,parseInt(query.get('page')||'0')||0));
   const params=new URLSearchParams({select:'id,name,business,phone,email,segment,model,need,status,notes,files,quote_price,created_at,updated_at',order:'created_at.desc',limit:'30',offset:String(page*30)});
   if(statuses.includes(status))params.set('status','eq.'+status);if(q)params.set('or',`(name.ilike.*${q}*,business.ilike.*${q}*)`);
   const r=await sb('/rest/v1/pryme_leads?'+params,{headers:{Prefer:'count=exact'}});return json({items:await r.json(),total:Number(r.headers.get('content-range')?.split('/')[1]||0),page});
  }
  if(route==='lead-update'&&req.method==='PATCH'){
   const d=await read();if(!/^[a-f0-9-]{36}$/i.test(d.id)||!statuses.includes(d.status))throw new HttpError(400,'Atualização inválida.');
   const notes=clean(d.notes||'',5000,false);const version=clean(d.updated_at,40);
   const p=new URLSearchParams({id:'eq.'+d.id,updated_at:'eq.'+version});
   const r=await sb('/rest/v1/pryme_leads?'+p,{method:'PATCH',headers:{'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({status:d.status,notes,next_contact_at:d.next_contact_at||null,updated_at:new Date().toISOString()})});
   const rows=await r.json();if(!rows.length)throw new HttpError(409,'Este pedido foi atualizado em outra janela. Recarregue antes de salvar.');return json({item:rows[0]});
  }
  if(route==='file'&&req.method==='POST'){
   const d=await read();if(!/^[a-f0-9-]{36}$/i.test(d.id)||!Number.isInteger(d.index))throw new HttpError(400,'Arquivo inválido.');
   const rows=await (await sb(`/rest/v1/pryme_leads?id=eq.${d.id}&select=files`)).json();const f=rows[0]?.files?.[d.index];if(!f)throw new HttpError(404,'Arquivo não encontrado.');
   const signed=await (await sb('/storage/v1/object/sign/pryme-brand/'+f.path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({expiresIn:60})})).json();
   return json({url:env.SUPABASE_URL+'/storage/v1'+signed.signedURL});
  }
  throw new HttpError(404,'Rota não encontrada.');
 }catch(e){return json({error:e instanceof HttpError?e.message:'Não foi possível concluir agora. Tente novamente.'},e instanceof HttpError?e.status:500);}
}
