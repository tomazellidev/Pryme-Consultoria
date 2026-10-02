import { randomUUID } from 'node:crypto';
export const statuses=['novo','conversa','proposta','producao','concluido','arquivado'];
export const models={personal:{name:'Personal Essencial',price:690},studio:{name:'Studio Presença',price:990},academia:{name:'Academia Movimento',price:1490},custom:{name:'Projeto sob medida',price:null}};
const serviceNames=new Set(['site','novo','melhoria','manutencao','consultoria']);
export class HttpError extends Error{constructor(status,message){super(message);this.status=status;}}
export function clean(v,max,required=true){if(typeof v!=='string'||v.length>max||(required&&!v.trim()))throw new HttpError(400,'Confira os campos do formulário.');return v.trim();}
export function validateLead(d){
 if(!d||typeof d!=='object')throw new HttpError(400,'Pedido inválido.');
 if(d.website)throw new HttpError(400,'Não foi possível enviar.');
 if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(d.id||''))throw new HttpError(400,'Identificador inválido.');
 if(!Object.hasOwn(models,d.model))throw new HttpError(400,'Escolha um modelo válido.');
 const raw=clean(d.phone,25).replace(/\D/g,'').replace(/^0055/,'55');const phone=[10,11].includes(raw.length)?'55'+raw:raw;if(!/^55\d{10,11}$/.test(phone))throw new HttpError(400,'Informe seu WhatsApp com 55 e DDD.');
 if(d.consent!==true)throw new HttpError(400,'Autorize o contato para continuar.');
 const email=clean(d.email||'',160,false);if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new HttpError(400,'Confira seu e-mail.');
 const service=clean(d.service||'site',40);if(!serviceNames.has(service))throw new HttpError(400,'Escolha um serviço válido.');
const websiteUrl=clean(d.website_url||'',500,false);if(websiteUrl){try{if(!['http:','https:'].includes(new URL(websiteUrl).protocol))throw Error();}catch{throw new HttpError(400,'Informe um endereço de site válido.');}}
const lead={id:d.id,name:clean(d.name,80),business:clean(d.business,120),phone,email,segment:clean(d.segment,80),model:d.model,service,website_url:websiteUrl,goal:clean(d.goal||'',600,false),timeline:clean(d.timeline||'',80,false),need:clean(d.need,2000),consent_at:new Date().toISOString(),quote_price:models[d.model].price,status:'novo'};
 const files=d.files??[];if(!Array.isArray(files)||files.length>3)throw new HttpError(400,'Envie até três imagens.');
 let total=0;
 const uploads=files.map(f=>{
  const name=clean(f.name,120);if(typeof f.data!=='string'||f.data.length>1400000||!/^[A-Za-z0-9+/]*={0,2}$/.test(f.data))throw new HttpError(400,'Imagem inválida.');
  const bytes=Buffer.from(f.data,'base64');if(bytes.length===0||bytes.length>1048576)throw new HttpError(400,'Cada imagem deve ter até 1 MB.');total+=bytes.length;
  const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
  const webp=bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
  const type=png?'image/png':jpg?'image/jpeg':webp?'image/webp':null;
  if(!type||f.type!==type)throw new HttpError(400,'Use imagens PNG, JPG ou WebP válidas.');
  const ext=png?'png':jpg?'jpg':'webp';return {name,type,bytes,path:`${lead.id}/${randomUUID()}.${ext}`};
 });
 if(total>3145728)throw new HttpError(400,'O total de imagens deve ser até 3 MB.');
 return {lead,uploads};
}
