'use strict';
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { navigation.classList.remove('open'); menuButton.setAttribute('aria-expanded','false'); }
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open)); navigation.classList.toggle('open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click',closeMenu));
document.addEventListener('keydown', event => {if(event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true'){closeMenu();menuButton.focus();}});
document.querySelector('#year').textContent = String(new Date().getFullYear());
const form = document.querySelector('#brief-form');
const result = document.querySelector('#brief-result');
const brief = document.querySelector('#brief-text');
const status = document.querySelector('#copy-status');
const whatsApp = document.querySelector('#whatsapp-link');
const labels = {novo:'Criar um site',melhoria:'Melhorar meu site',manutencao:'Manutenção',orientacao:'Entender qual solução faz sentido'};
document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => {
  const radio = form.querySelector('input[value="' + button.dataset.service + '"]');
  radio.checked = true; result.hidden = true;
  document.querySelector('#conversa').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  radio.focus({preventScroll:true});
}));
form.addEventListener('input', event => {event.target.setCustomValidity?.('');result.hidden = true;status.textContent = '';});
form.addEventListener('submit', event => {
 event.preventDefault();
 for(const field of form.querySelectorAll('input[type="text"],textarea:not([readonly])')){field.setCustomValidity(field.value.trim() ? '' : 'Preencha este campo.');}
 if(!form.reportValidity()) return;
 const data = new FormData(form);
 const name = String(data.get('nome')).trim();
 const business = String(data.get('negocio')).trim();
 const need = String(data.get('necessidade')).trim();
 if(!name || !business || !need){result.hidden=true;return;}
 brief.value = `Olá, Pryme Digital! Meu nome é ${name}.\n\nNegócio: ${business}\nSegmento: ${data.get('segmento')}\nTenho interesse em: ${labels[data.get('servico')]}\n\nO que gostaria de resolver:\n${need}\n\nGostaria de conversar sobre uma proposta.`;
 const number = String(window.PRYME_CONFIG?.whatsapp || '').replace(/\D/g,'');
 const configured = /^\d{10,15}$/.test(number);
 whatsApp.hidden = !configured;
 if(configured) whatsApp.href = 'https://wa.me/' + number + '?text=' + encodeURIComponent(brief.value);
 else whatsApp.removeAttribute('href');
 document.querySelector('#contact-status').textContent = configured ? 'O WhatsApp abrirá com o texto preparado. Você confirma o envio por lá.' : 'O contato por WhatsApp será disponibilizado em breve. Você pode copiar seu pedido; nada foi enviado.';
 status.textContent=''; result.hidden=false;brief.focus();
});
document.querySelector('#copy-brief').addEventListener('click',async()=>{
 try {if(!navigator.clipboard)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(brief.value);status.textContent='Pedido copiado. Nenhuma mensagem foi enviada automaticamente.';}
 catch {brief.focus();brief.select();status.textContent='Selecione o texto e use Copiar no seu dispositivo.';}
});
// Assistentes compatíveis podem selecionar o serviço; isso nunca envia um pedido.
if (document.modelContext?.registerTool) {
 const lifecycle = new AbortController();
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
 try {
  Promise.resolve(document.modelContext.registerTool({
   name:'selecionar_servico_pryme',title:'Selecionar serviço da Pryme',
   description:'Seleciona o serviço no formulário visível. Não preenche dados pessoais nem envia mensagens.',
   inputSchema:{type:'object',properties:{servico:{type:'string',enum:Object.keys(labels)}},required:['servico'],additionalProperties:false},
   annotations:{readOnlyHint:false},
   execute(input){
    if(!input || typeof input!=='object' || Object.keys(input).some(key=>key!=='servico') || !Object.hasOwn(labels,input.servico))throw Error('Serviço inválido');
    const radio=form.querySelector('input[value="'+input.servico+'"]');
    radio.checked=true;result.hidden=true;status.textContent='';
    document.querySelector('#conversa').scrollIntoView();radio.focus({preventScroll:true});
    return {servico:input.servico,selecionado:true,enviado:false};
   }
  },{signal:lifecycle.signal})).catch(()=>{});
 } catch { /* A navegação convencional continua disponível. */ }
}
