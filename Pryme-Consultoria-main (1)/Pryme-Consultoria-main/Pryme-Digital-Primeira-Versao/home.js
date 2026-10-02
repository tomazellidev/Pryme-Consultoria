import './portal.js';
document.querySelector('#year').textContent=String(new Date().getFullYear());
const kinds={novo:'novo',melhoria:'melhoria',manutencao:'manutencao',consultoria:'consultoria'};document.querySelectorAll('[data-service]').forEach(b=>b.addEventListener('click',()=>location.href='pedido.html?modelo=custom&servico='+(kinds[b.dataset.service]||'site')));