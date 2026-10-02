export const statusNames={novo:'Novo',conversa:'Em conversa',proposta:'Proposta enviada',producao:'Em produção',concluido:'Concluído',arquivado:'Arquivado'};
export const modelNames={personal:'Personal Essencial',studio:'Studio Presença',academia:'Academia Movimento',custom:'Projeto sob medida'};export const serviceNames={site:'Criação de site',novo:'Criar um site',melhoria:'Melhorar meu site',manutencao:'Manutenção de site',consultoria:'Consultoria digital'};
export async function api(route,{method='GET',body,query}={}){
 const url=new URL('/.netlify/functions/api',location.origin);url.searchParams.set('route',route);for(const [k,v]of Object.entries(query||{}))url.searchParams.set(k,v);
 const response=await fetch(url,{method,credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(55000)});
 let data;try{data=await response.json();}catch{throw new Error('O serviço de pedidos ainda não está disponível neste endereço.');}
 if(!response.ok){const error=new Error(data.error||'Não foi possível concluir.');error.status=response.status;throw error;}return data;
}
export async function setupChallenge(container,action){
 const config=await api('config');if(!config.ready)return null;
 if(!window.turnstile){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';s.onload=resolve;s.onerror=()=>reject(new Error('Não foi possível carregar a verificação. Recarregue a página.'));document.head.append(s);});}
 let token='';const id=window.turnstile.render(container,{sitekey:config.siteKey,theme:'dark',action,callback:t=>{token=t;},'expired-callback':()=>{token='';},'error-callback':()=>{token='';}});
 return {token:()=>token,reset:()=>{token='';window.turnstile.reset(id);}};
}
const toggle=document.querySelector('.menu-toggle');const nav=document.querySelector('#navigation');
if(toggle&&nav){toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{toggle.setAttribute('aria-expanded','false');nav.classList.remove('open');}));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.focus();}});}
for(const year of document.querySelectorAll('[data-year]'))year.textContent=new Date().getFullYear();
