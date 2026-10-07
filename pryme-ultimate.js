import {recommendationFor, makeWhatsAppUrl, estimateRevenue} from './diagnostic-model.js';

(() => {
  const whatsappNumber = document.body.dataset.whatsapp;
  const form = document.querySelector('#diagnostic-form');
  const recommendation = document.querySelector('#recommendation');
  const recommendationTitle = document.querySelector('#recommendation-title');
  const recommendationCopy = document.querySelector('#recommendation-copy');
  const progressText = document.querySelector('#progress-text');
  const progressFill = document.querySelector('#progress-fill');
  const whatsappButtons = [...document.querySelectorAll('[data-diagnostic-whatsapp]')];
  const year = document.querySelector('#current-year');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#menu-principal');
  const questions = ['segment', 'situation', 'priority'];
  const revenueForm = document.querySelector('#revenue-calculator');

  if (year) year.textContent = String(new Date().getFullYear());

  const mobileMenu = window.matchMedia('(max-width: 960px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const formatMap = new Map([
    ['profissional', 'Profissional autônomo'],
    ['empresa', 'Empresa de serviços'],
    ['negocio local', 'Comércio ou negócio local']
  ]);

  const closeMenu = (restoreFocus = false) => {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    if (restoreFocus) menuToggle.focus();
  };

  menuToggle?.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('is-open', !expanded);
  });

  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    closeMenu();
    const target = document.querySelector(link.hash);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus({preventScroll: true});
    }
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
      closeMenu(true);
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) {
      closeMenu(mobileMenu.matches && nav?.contains(document.activeElement));
    }
  });
  document.addEventListener('focusin', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  mobileMenu.addEventListener('change', () => {
    closeMenu(mobileMenu.matches && nav?.contains(document.activeElement));
    if (!mobileMenu.matches && document.activeElement === menuToggle) nav?.querySelector('a')?.focus();
  });
  if (menuToggle && nav) {
    menuToggle.hidden = false;
    document.documentElement.classList.add('menu-ready');
  }

  const answers = () => Object.fromEntries(questions.map(name => [
    name,
    form?.querySelector(`input[name="${name}"]:checked`)?.value ?? ''
  ]));

  const updateDiagnostic = () => {
    if (!form) return;
    const result = answers();
    document.querySelectorAll('[data-segment-choice]').forEach(card => {
      const selected = formatMap.get(card.dataset.segmentChoice) === result.segment;
      card.classList.toggle('is-selected', selected);
      if (selected) card.setAttribute('aria-current', 'step');
      else card.removeAttribute('aria-current');
    });
    const complete = questions.filter(name => result[name]).length;
    if (progressText) progressText.textContent = `${complete} de ${questions.length} respondidas`;
    if (progressFill) progressFill.style.width = `${complete / questions.length * 100}%`;

    if (complete !== questions.length) {
      recommendation.hidden = true;
      whatsappButtons.forEach(button => { button.disabled = true; });
      return;
    }

    const advice = recommendationFor(result);
    recommendationTitle.textContent = advice.title;
    recommendationCopy.textContent = advice.text;
    recommendation.hidden = false;
    whatsappButtons.forEach(button => { button.disabled = false; });
  };

  form?.addEventListener('change', updateDiagnostic);

  const updateRevenue = () => {
    if (!revenueForm) return;
    const fields=Object.fromEntries(['visits','contactRate','closeRate','monthlyValue'].map(name=>[
      name, revenueForm.elements[name].value
    ]));
    const output=document.querySelector('#revenue-result');
    const errorMessage=document.querySelector('#revenue-error');
    const clients=document.querySelector('#estimated-clients');
    const revenue=document.querySelector('#estimated-revenue');
    const contactsLabel=document.querySelector('#estimated-contacts');
    const visitsLabel=document.querySelector('#funnel-visits');
    const clientsLabel=document.querySelector('#funnel-clients');
    const contactBar=document.querySelector('#contact-flow-bar');
    const clientBar=document.querySelector('#client-flow-bar');
    try {
      const result=estimateRevenue(fields);
      clients.textContent=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1}).format(result.clients);
      revenue.textContent=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:2}).format(result.revenue);
      contactsLabel.textContent=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1}).format(result.contacts);
      visitsLabel.textContent=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0}).format(Number(fields.visits));
      clientsLabel.textContent=clients.textContent;
      contactBar.style.width=`${Math.min(100,Number(fields.contactRate))}%`;
      clientBar.style.width=`${Math.min(100,Number(fields.contactRate)*Number(fields.closeRate)/100)}%`;
      output.hidden=false;
      errorMessage.hidden=true;
    } catch(error) {
      output.hidden=true;
      errorMessage.textContent=error.message;
      errorMessage.hidden=false;
    }
  };
  revenueForm?.addEventListener('input',updateRevenue);
  updateRevenue();
  whatsappButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (button.disabled) return;
      const intent = button.dataset.diagnosticWhatsapp;
      window.location.assign(makeWhatsAppUrl(answers(), whatsappNumber, intent));
    });
  });

  const chooseSegment = (label, card) => {
    const radio = [...(form?.querySelectorAll('input[name="segment"]') ?? [])]
      .find(input => input.value === label);
    if (!radio) return;
    radio.checked = true;
    document.querySelectorAll('[data-segment-choice]').forEach(item => {
      const selected = item === card;
      item.classList.toggle('is-selected', selected);
    });
    updateDiagnostic();
  };

  document.querySelectorAll('[data-segment-choice]').forEach(card => {
    card.addEventListener('click', event => {
      event.preventDefault();
      chooseSegment(formatMap.get(card.dataset.segmentChoice), card);
      const nextQuestion = document.querySelector('input[name="situation"]:checked')
        ?? document.querySelector('input[name="situation"]');
      nextQuestion?.focus({preventScroll: true});
      nextQuestion?.closest('fieldset').scrollIntoView({
        behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center'
      });
    });
  });

  document.querySelectorAll('[data-intent]').forEach(link => {
    link.addEventListener('click', () => {
      const intent = link.dataset.intent;
      const value = intent === 'site novo'
        ? 'Ainda não tenho um site'
        : intent === 'modernização'
          ? 'Tenho um site que quero modernizar'
          : null;
      if (!value) return;
      const radio = [...document.querySelectorAll('input[name="situation"]')].find(input => input.value === value);
      if (radio) {
        radio.checked = true;
        updateDiagnostic();
      }
    });
  });

  updateDiagnostic();
})();
