import {api,setupChallenge,modelNames,serviceNames} from './portal.js';
function uuid(){const b=crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;const h=[...b].map(x=>x.toString(16).padStart(2,'0')).join('');return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;}
const form=document.querySelector('#order-form');
const message=document.querySelector('#order-message');const submit=form.querySelector('[type=submit]');
const model=form.elements.model;const params=new URLSearchParams(location.search);const fromURL=params.get('modelo');if(Object.hasOwn(modelNames,fromURL))model.value=fromURL;const serviceField=form.elements.service;const fromService=params.get('servico');if(Object.hasOwn(serviceNames,fromService))serviceField.value=fromService;document.querySelector('#service-label').textContent=serviceNames[serviceField.value];
const preview=document.querySelector('#file-list');let selected=[];let challenge=null;let busy=false;let requestId=uuid();let sent=false;
const warn=text=>{message.textContent=text;};
function clearPreviews(){for(const image of preview.querySelectorAll('img'))URL.revokeObjectURL(image.src);preview.replaceChildren();}
form.elements.files.addEventListener('change',()=>{
 clearPreviews();selected=[...form.elements.files.files];
 if(selected.length>3||selected.some(f=>f.size>1048576||!['image/png','image/jpeg','image/webp'].includes(f.type))){selected=[];form.elements.files.value='';warn('Escolha até 3 imagens PNG, JPG ou WebP, com até 1 MB cada.');return;}
 warn('');selected.forEach(f=>{const item=document.createElement('div');item.className='file-chip';const img=document.createElement('img');img.src=URL.createObjectURL(f);img.alt='Prévia de '+f.name;const name=document.createElement('span');name.textContent=f.name+' · '+Math.ceil(f.size/1024)+' KB';item.append(img,name);preview.append(item);});
});
function brief(){const d=new FormData(form);return ['Olá, Pryme Digital! Sou '+d.get('name')+' da '+d.get('business')+'.','Serviço: '+serviceNames[d.get('service')],'Modelo: '+modelNames[d.get('model')],'Segmento: '+d.get('segment'),'Site atual: '+(d.get('website_url')||'Ainda não tenho'),'Objetivo: '+(d.get('goal')||'A combinar'),'Prazo: '+(d.get('timeline')||'A combinar'),'O que preciso: '+d.get('need')].join(String.fromCharCode(10));}
const wa=document.querySelector('#fallback-whatsapp');wa.href='https://wa.me/'+window.PRYME_CONFIG.whatsapp;
wa.addEventListener('click',()=>{wa.href='https://wa.me/'+window.PRYME_CONFIG.whatsapp+'?text='+encodeURIComponent(brief());});
form.addEventListener('input',()=>{if(!busy)requestId=uuid();if(sent){sent=false;submit.disabled=!challenge;submit.textContent='Enviar novo pedido';}document.querySelector('#order-success').hidden=true;});
async function load(){try{challenge=await setupChallenge('#challenge','pedido');if(!challenge)throw new Error('O envio pelo formulário será disponibilizado em breve. Você já pode conversar pelo WhatsApp.');submit.disabled=false;document.querySelector('#availability').textContent='Envie seu pedido e receba um protocolo para mencionar ao conversar com a Pryme.';}catch(e){document.querySelector('#availability').textContent=e.message;submit.disabled=true;}}
const file64=f=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve({name:f.name,type:f.type,data:String(reader.result).split(',')[1]});reader.onerror=()=>reject(new Error('Não foi possível ler a imagem. Selecione novamente.'));reader.readAsDataURL(f);});
form.addEventListener('submit',async e=>{
 e.preventDefault();if(busy||sent||!challenge)return;
 if(!form.reportValidity())return;if(!challenge.token()){warn('Conclua a verificação de segurança antes de enviar.');return;}
 const values=Object.fromEntries(new FormData(form));values.phone=values.phone.replace(/\D/g,'');if(values.phone.startsWith('0055')&&[14,15].includes(values.phone.length))values.phone=values.phone.slice(2);if([10,11].includes(values.phone.length))values.phone='55'+values.phone;
 busy=true;submit.disabled=true;submit.textContent='Enviando pedido…';warn('');form.setAttribute('aria-busy','true');
 try{
  const payload={...values,id:requestId,consent:form.elements.consent.checked,token:challenge.token(),files:await Promise.all(selected.map(file64))};
  for(const field of form.querySelectorAll('input,textarea,select'))field.disabled=true;
  const result=await api('lead',{method:'POST',body:payload});
  if(!result.saved)throw new Error('Não recebemos a confirmação. Tente novamente.');sent=true;
  document.querySelector('#protocol').textContent=result.id;const success=document.querySelector('#order-success');success.hidden=false;success.focus();submit.textContent='Pedido recebido';warn('Seu pedido e os arquivos foram registrados. A Pryme entrará em contato pelo WhatsApp informado.');
 }catch(e){warn(e.name==='TimeoutError'?'A confirmação demorou. Tente novamente sem alterar o formulário para evitar duplicidade.':e.message);submit.textContent='Tentar enviar novamente';}
 finally{for(const field of form.querySelectorAll('input,textarea,select'))field.disabled=false;busy=false;form.removeAttribute('aria-busy');submit.disabled=sent;challenge.reset();}
});
load();
