export const recommendationFor = ({segment, situation, priority}) => {
  const starts = {
    'Ainda não tenho um site': {
      title: 'Comece por uma base digital clara.',
      text: 'Uma primeira estrutura pode apresentar o negócio, organizar serviços e deixar evidente como iniciar um contato.'
    },
    'Tenho um site que quero modernizar': {
      title: 'Revise a experiência antes de reconstruir.',
      text: 'Vale olhar para a hierarquia das informações, a experiência no celular e o caminho até o contato para decidir quais mudanças priorizar.'
    },
    'Tenho site, mas quero organizar melhor os canais': {
      title: 'Desenhe um percurso entre os canais.',
      text: 'O próximo passo pode ser definir o papel do site, do Instagram e do WhatsApp — e deixar claro como uma pessoa passa de um para o outro.'
    },
    'Estou começando e quero entender as prioridades': {
      title: 'Defina primeiro o que a presença precisa explicar.',
      text: 'Antes de escolher recursos, organize para quem é o negócio, quais informações essa pessoa procura e que próximo passo deve encontrar.'
    }
  };
  const priorities = {
    'Explicar melhor meus serviços': 'Na conversa, vale começar por quem você atende, quais serviços oferece e o que diferencia o seu jeito de trabalhar.',
    'Facilitar novos contatos': 'Na conversa, vale mapear os caminhos de contato e qual informação a pessoa precisa ver antes de falar com você.',
    'Apresentar meu negócio com mais confiança': 'Na conversa, vale reunir as provas que você pode mostrar: experiência, equipe, projetos autorizados ou depoimentos reais.',
    'Conectar site e redes sociais': 'Na conversa, vale decidir quais conteúdos do Instagram devem levar a quais páginas e como o WhatsApp entra no percurso.'
  };
  const answer = starts[situation] ?? starts['Estou começando e quero entender as prioridades'];
  return {
    title: answer.title,
    text: `${answer.text} ${priorities[priority] ?? ''} A melhor estrutura também considera a realidade de ${segment.toLowerCase()}; a proposta só é definida depois de entender o escopo.`
  };
};

export const makeWhatsAppUrl = (result, whatsappNumber, intent) => {
  if (!['segment','situation','priority'].every(name => typeof result[name] === 'string' && result[name].trim())) {
    throw new Error('Responda às três perguntas antes de continuar.');
  }
  if (!/^\d{10,15}$/.test(whatsappNumber)) throw new Error('Número de WhatsApp inválido.');
  const advice = recommendationFor(result);
  const request = intent === 'proposta'
    ? 'Quero entender uma proposta para esse cenário.'
    : 'Quero conversar sobre esse cenário e entender os próximos passos.';
  const message = [
    'Olá, Pryme! Fiz o mapa inicial no site.',
    `Meu negócio: ${result.segment}.`,
    `Minha presença digital hoje: ${result.situation}.`,
    `O que quero melhorar: ${result.priority}.`,
    `Ponto de partida sugerido: ${advice.title} ${advice.text}`,
    request
  ].join('\n');
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};

export const estimateRevenue = ({visits, contactRate, closeRate, monthlyValue}) => {
  if([visits,contactRate,closeRate,monthlyValue].some(value=>String(value).trim()==='')) {
    throw new Error('Preencha os quatro campos para ver a simulação.');
  }
  const values=[visits,contactRate,closeRate,monthlyValue].map(Number);
  if(values.some(value=>!Number.isFinite(value)||value<0)) {
    throw new Error('Informe números válidos e não negativos.');
  }
  if(contactRate>100||closeRate>100) {
    throw new Error('As taxas devem ficar entre 0 e 100%.');
  }
  const [monthlyVisits,contactPercent,conversionPercent,averageMonthlyValue]=values;
  const contacts=monthlyVisits*contactPercent/100;
  const clients=contacts*conversionPercent/100;
  return {contacts,clients,revenue:clients*averageMonthlyValue};
};
