# Avaliação da estrutura atual — Pryme Consultoria

Data: 4 de outubro de 2026. Projeto examinado: `Pryme Ultimate para GitHub`.

## 1. Resumo do diagnóstico

**A Pryme tem uma base adequada de vitrine comercial, mas ainda precisa de correções pontuais e de conteúdo que comprove sua capacidade de entrega. Não há evidência que justifique refazer todo o layout.** A oferta está descrita, há caminhos de contato e a página explica benefícios, serviços, processo e dúvidas. O principal problema técnico encontrado está justamente na apresentação inicial: a estrutura HTML da demonstração ficou incorreta na alteração anterior.

O texto de abertura informa que a Pryme ajuda **empresas e profissionais a criar ou modernizar sites**. Isso responde ao que oferece e para quem trabalha. O título “Seu trabalho merece um site à altura” é mais conceitual, mas o parágrafo logo abaixo esclarece a proposta. A página não promete vendas garantidas nem publica preços ou prazos inventados.

A identidade está definida no código: preto, branco e amarelo, fontes Space Grotesk, Manrope e DM Mono, cartões, elementos geométricos e logo própria. O material comercial ainda é genérico em pontos importantes: não mostra quem realiza o trabalho, projetos reais autorizados, depoimentos ou diferenciais comprováveis da Pryme.

### Base e limites desta avaliação

- Examinei [index.html](index.html), [pryme-ultimate.css](pryme-ultimate.css), [pryme-ultimate.js](pryme-ultimate.js), logo, scripts de build/servidor, configurações de hospedagem, README e documento de estratégia.
- Há **uma página pública confirmada**, `index.html`, com 11 seções, além do cabeçalho e rodapé. `dist/index.html` é uma cópia para publicação, não outra página. Não encontrei páginas completas dos modelos, portfólio detalhado, painel ou formulário de proposta independente nesta pasta.
- Comparei os arquivos principais com suas cópias em `dist`: HTML, CSS e JavaScript são idênticos. Portanto, não há divergência local entre essas duas versões que explique, por si só, a falta de mudanças percebidas.
- Conferi as âncoras internas: todos os destinos `href="#..."` encontrados existem no HTML. Isso confirma os destinos, não a qualidade visual da navegação.
- Consegui visualizar o arquivo da logo. **Não consegui visualizar o site atual em navegador, em computador ou em celular.** As duas ferramentas de visualização falharam ao iniciar o ambiente, com “O sistema não pode encontrar o caminho especificado”. As observações de layout abaixo são baseadas no HTML/CSS e não em capturas atuais da página renderizada.
- Não confirmei o domínio publicado, o deploy em produção, a titularidade dos contatos, o funcionamento das contas externas ou métricas de conversão/desempenho. O documento de estratégia foi tratado como contexto, e não como prova de que cada recomendação foi implementada corretamente.
- Esta etapa gerou somente este relatório. Nenhum arquivo do site foi corrigido, nenhum novo build foi executado e nenhuma mensagem foi enviada.

## 2. O que funciona bem

1. **Proposta de valor compreensível.** A abertura nomeia criação e modernização de sites, empresas e profissionais. A ideia de apresentar melhor o negócio e facilitar contatos é útil e não depende de promessas exageradas. Manter essa clareza.
2. **Serviços separados por necessidade.** Em `#solucoes`, criação, modernização e consultoria/continuidade têm descrições, benefícios e chamadas próprias. A pessoa consegue reconhecer seu ponto de partida.
3. **Orientação antes da contratação.** O diagnóstico tem três perguntas relevantes: tipo de negócio, situação atual e prioridade. A lógica do JavaScript combina situação e prioridade na recomendação; o segmento aparece no texto e na mensagem de contato. O resultado é explicitamente inicial, não uma análise técnica completa.
4. **Próximo passo explicado.** O resultado informa que o WhatsApp abre com um rascunho e que o visitante decide se envia. O código monta a mensagem com as respostas e não contém envio automático delas a um servidor ou armazenamento persistente.
5. **Canais com funções distintas.** Em `#canais`, WhatsApp Business e Instagram têm cartões, explicações, ícones SVG e chamadas próprias. Os estilos atuais usam fundo escuro e traços amarelos. Há acesso pelo menu “Canais digitais”, além de links no encerramento e rodapé.
6. **Processo e FAQ presentes.** `#como-funciona` apresenta quatro etapas, da conversa à revisão antes da publicação. `#faq-title` organiza cinco perguntas sobre modernização, canais, integrações, preço/prazo e materiais. Esses elementos já existem e devem ser aproveitados.
7. **Base de acessibilidade e adaptação.** Há idioma definido, link para pular ao conteúdo, botões nativos, grupos de perguntas com `fieldset`/`legend`, rótulos, anúncio de progresso, estados de seleção e FAQ com `details`/`summary`. O CSS prevê quebras em 1080, 800 e 560 px, além de redução de movimento. São boas escolhas, embora não equivalham a uma validação completa.
8. **Honestidade nos exemplos e escopo.** As miniaturas são identificadas como estudos conceituais. Integrações, manutenção, hospedagem e domínio são condicionados ao escopo. Essa distinção deve permanecer.

## 3. O que merece atenção

### A. A demonstração inicial tem um erro de estrutura confirmado

**Local:** `index.html:54`, `index.html:55`, `index.html:56` e encerramento da seção em `index.html:83`.

Há dois elementos `.browser-card` abertos consecutivamente. O resumo `.hero-product-card` fica dentro do primeiro deles, em vez de ser irmão da prévia no grid `.hero-showcase`. Também sobra o contêiner `.hero-art` aberto quando aparece `</section>`.

Isso explica, pelo código, por que a intenção de colocar informações ao lado da demonstração não ficou corretamente implementada. O grid não recebe os dois blocos independentes esperados. O navegador precisa recuperar a marcação incorreta; o resultado exato de espaço, corte ou posicionamento ainda precisa ser visto em tela.

O contêiner externo tem `role="img"`, mas inclui agora um resumo e um link reais. Essa composição também precisa ser revista: conteúdo navegável não deve ficar encapsulado como parte de uma imagem. O build existente apenas copia os arquivos e, por isso, sua conclusão com sucesso não verificou esse problema.

### B. A leitura de informações importantes está pequena

**Local:** `.hero-product-card`, `.channel-footnote`, `.faq-list details p` e regras móveis no CSS.

O resumo ao lado da prévia usa parágrafo de 10 px e lista de 9 px no computador; no celular esses textos chegam a 11 px. Notas dos canais usam 10 px, e respostas da FAQ ficam em 11 px no celular. Para informações que ajudam a decidir sobre um serviço, são tamanhos que merecem aumento e conferência com zoom.

As letras de 5–8 px dentro das miniaturas podem funcionar como textura de uma demonstração, desde que toda informação importante esteja legível fora delas. Não devem ser o único lugar onde o visitante descobre um benefício ou ação.

### C. Há espaçamento e contornos que precisam de ajuste localizado

**Local:** `.section`, `.value-section`, `.formats-section`, `.process-section` e `.faq-section`.

O espaçamento vertical geral chega a 140 px em cada extremidade da seção. A seção de benefícios foi reduzida para até 86 px, mas isso não compactou as demais. Nas seções claras que usam `.shell` no próprio elemento, a largura é limitada, porém não há preenchimento horizontal interno próprio; o fundo claro e o conteúdo podem começar na mesma borda. Convém criar respiro interno consistente e revisar cada seção pela quantidade de informação que contém.

Nos benefícios, os cartões já têm borda e fundo branco. Porém, abaixo de 560 px, a regra `.value-item + .value-item` remove a borda superior dos cartões seguintes. Se a intenção é manter cartões totalmente contornados, essa regra é contraditória. Não é necessário trocar o estilo da página para resolver esses pontos.

### D. Os exemplos parecem demonstrações navegáveis, mas selecionam uma resposta

**Local:** `#formatos`; manipuladores de `[data-segment-choice]` em `pryme-ultimate.js`.

Ao clicar em uma miniatura, o código seleciona o segmento, rola até o diagnóstico e foca a pergunta seguinte. Não abre um site demonstrativo. O cartão não explica claramente essa consequência antes do clique, o que pode frustrar quem espera explorar o modelo.

Além disso, os três exemplos compartilham a mesma estrutura básica: cabeçalho, título, chamada, figura e três rótulos. Mudam textos e formas decorativas; não demonstram arquiteturas substancialmente diferentes para cada ramo. Não há exemplo específico completo de personal trainer ou academia nesta versão.

O ajuste mais simples é comunicar a ação como “Usar este perfil no diagnóstico”. Demonstrações completas e diferentes podem ser um trabalho posterior, caso esse recurso seja prioritário para a venda.

### E. A seção de confiança explica uma ausência em vez de apresentar a Pryme

**Local:** `.trust-section`, `index.html:255`.

O texto informa que não são usados números ou histórias sem autorização e que projetos poderão ser mostrados no futuro. É uma postura correta, mas ocupa uma seção inteira sem apresentar uma evidência concreta sobre a consultoria.

Não encontrei nome do responsável, apresentação da equipe, trajetória confirmada, projetos reais, depoimentos ou uma explicação específica do método que diferencie a Pryme. Os benefícios “clareza”, “confiança” e “contato” também são repetidos no topo, no resumo do produto, nos benefícios e nos serviços.

Vale manter a identificação dos estudos como conceituais e substituir o texto sobre futuras provas por informações reais sobre quem atende e como trabalha, quando fornecidas. Depoimentos não são obrigatórios para começar; credibilidade também pode vir de uma apresentação verificável e de um processo bem explicado.

### F. O caminho para contato pode ser mais explícito

**Local:** cabeçalho, `.hero-actions`, serviços, diagnóstico e `#contato`.

As chamadas estão distribuídas em pontos úteis, mas “Encontrar meu próximo passo” e “Mapear meu próximo passo” não dizem imediatamente que abrirão um questionário. O primeiro contato direto por WhatsApp na sequência principal aparece apenas depois do diagnóstico, na seção de canais; há outro no encerramento.

Vale nomear o diagnóstico de maneira concreta, por exemplo “Receber uma orientação inicial”, acompanhado de “3 perguntas sobre seu negócio”, e disponibilizar uma alternativa de conversa direta já no início. Assim, o visitante pronto para conversar não precisa interpretar o formulário como requisito.

A solicitação de proposta é um rascunho no WhatsApp, não um formulário enviado à Pryme. O resultado explica isso corretamente. Na FAQ, a frase “conte no diagnóstico ou na conversa” merece precisão: o diagnóstico só tem alternativas fechadas, sem campo para escrever uma dúvida.

### G. O processo aparece depois do pedido de participação

**Local:** ordem de `#diagnostico`, `#canais`, `#como-funciona` e `.trust-section`.

A sequência oferece serviços e exemplos antes do questionário, o que faz sentido. Contudo, a pessoa chega ao diagnóstico sem ter lido o processo de contratação ou uma apresentação de quem realizará o trabalho. Antecipar essas informações pode reduzir incertezas antes de pedir respostas. O ganho é de compreensão; não há dados que permitam prometer aumento de conversão.

### H. Acessibilidade: bons fundamentos com lacunas específicas

- O foco global é amarelo `#ffd619`; sobre o fundo claro `#f5f5f1`, o contraste calculado entre essas cores é aproximadamente **1,29:1**, pouco perceptível. Conferir especialmente os controles da FAQ e adotar um foco escuro em superfícies claras. Esse cálculo avalia as cores declaradas, não certifica acessibilidade da página inteira.
- O CSS reduz animações conforme a preferência do sistema, mas o clique nos formatos chama `scrollIntoView({behavior: 'smooth'})` explicitamente. A mesma preferência precisa ser considerada também nesse caminho do JavaScript.
- O menu móvel fecha por Escape, mas o código não devolve o foco ao botão Menu. Se o foco estiver em um link que desaparece, a continuidade da navegação merece correção e verificação por teclado.
- Com JavaScript desabilitado, o menu fica oculto abaixo de 800 px e depende do script para abrir. Os links diretos inferiores e o fallback do diagnóstico permanecem no HTML; ainda assim, falta uma alternativa para a navegação principal móvel.
- O CSS prevê empilhamento no celular, botões grandes e estados de toque. Não confirmei em tela ausência de cortes, funcionamento com zoom, leitura por tecnologia assistiva ou comportamento entre as larguras de quebra. `overflow-x:hidden` no corpo não prova ausência de conteúdo fora da tela.

### I. A logo e a manutenção técnica merecem atenção secundária

A imagem da logo contém grandes margens pretas, observadas diretamente no arquivo. Como o cabeçalho a encaixa em uma área de 112 × 78 px com `object-fit:contain`, o símbolo e a palavra ocupam apenas parte desse espaço. Uma versão da mesma marca com enquadramento mais justo pode melhorar sua presença sem redesenhar a identidade.

O script `test` em `package.json` aponta para `Pryme-Digital-Primeira-Versao/tests/*.test.mjs`, pasta ausente nesta cópia. O Netlify ainda tem uma regra para `/admin.html`, também ausente. São resíduos de manutenção, não prova de que existe painel administrativo ou de que o site em produção está quebrado.

O site usa três famílias de fontes externas e não apresenta, nos arquivos examinados, bibliotecas pesadas de interface, vídeos ou requisições de API para gerar a recomendação. Isso favorece uma implementação simples, mas não permite afirmar que o carregamento é rápido ou que gargalos foram eliminados sem medição real.

## 4. Decisão sobre o layout

**Manter a identidade e ajustar pontualmente, com uma pequena reorganização da sequência comercial.**

A paleta, a divisão por serviços, os cartões dos canais, o diagnóstico e a FAQ têm funções claras. Refazer a página inteira adicionaria trabalho sem resolver necessariamente os problemas encontrados. A prioridade é corrigir a composição do topo, melhorar leitura e previsibilidade das ações e trocar conteúdo genérico por informações reais da Pryme.

A aparência final deve ser reavaliada após a correção estrutural: reduzir tamanhos para compensar um contêiner montado incorretamente pode produzir novos problemas. O erro atual não deve ser tratado somente com mais regras CSS.

## 5. Melhorias recomendadas por prioridade

| Prioridade | Melhoria proposta | Benefício esperado |
|---|---|---|
| Essencial | Corrigir os contêineres do topo, separar demonstração e resumo e restringir a semântica de imagem à ilustração. | Permitir que o conteúdo ocupe as colunas previstas e permaneça acessível. |
| Essencial | Aumentar os textos comerciais pequenos e ajustar foco, Escape e movimento reduzido. Conferir computador, celular, teclado e zoom após a correção. | Facilitar leitura e navegação, inclusive para quem não usa mouse. |
| Essencial | Confirmar número, perfil, localização, responsável e entregas realmente oferecidas. | Evitar contato incorreto e expectativas comerciais que a Pryme não possa cumprir. |
| Essencial | Explicitar o que acontece ao clicar nos formatos e nos botões de diagnóstico; oferecer conversa direta no início. | Reduzir cliques inesperados e facilitar o contato de quem já decidiu conversar. |
| Recomendável | Antecipar o processo e uma apresentação factual da Pryme em relação ao questionário. | Responder quem atende e como funciona antes de pedir participação. |
| Recomendável | Compactar repetições sobre benefícios, revisar espaçamentos e restaurar contornos consistentes no celular. | Fazer cada seção acrescentar informação útil e reduzir rolagem dispensável. |
| Recomendável | Substituir a seção sobre provas futuras por apresentação do responsável, método e materiais autorizados. | Construir confiança com evidências disponíveis. |
| Recomendável | Explicar limites das entregas: páginas, conteúdo, revisão, publicação, suporte e custos recorrentes, conforme aprovação comercial. | Ajudar o cliente a compreender o que contratará e o que será combinado à parte. |
| Recomendável | Preparar uma versão da logo com menos margem e alinhar scripts/documentação à pasta atual. | Melhorar a presença da marca e reduzir confusão de manutenção/publicação. |
| Opcional | Criar demonstrações completas com estruturas próprias para segmentos prioritários, incluindo personal ou academia se fizerem parte do foco comercial. | Permitir que o visitante explore uma solução próxima do seu negócio. |
| Opcional | Publicar cases e depoimentos quando existirem materiais reais autorizados; não preencher com exemplos fictícios apresentados como clientes. | Acrescentar prova de entrega. |
| Opcional | Medir carregamento e, se houver interesse, a jornada até os cliques de contato, com escopo e tratamento de dados definidos. | Orientar futuras decisões por observação real; clique não deve ser apresentado como venda. |

## 6. Estrutura sugerida

A alteração útil é antecipar processo e confiança e tornar o contato direto fácil de encontrar. Não é necessário criar várias páginas ou novas seções apenas para preencher espaço.

1. **Abertura:** o que a Pryme faz, público, prévia compacta com resumo legível, orientação inicial e conversa direta.
2. **Benefícios e públicos em um bloco breve:** reaproveitar a faixa e os três benefícios, evitando repetir o resumo do topo.
3. **Serviços:** manter criação, modernização e consultoria, esclarecendo o que pode entrar em cada escopo.
4. **Exemplos:** manter os estudos identificados e explicar a ação de cada cartão; incluir links de demonstrações somente quando elas existirem.
5. **Como funciona:** aproveitar as quatro etapas já escritas.
6. **Quem faz o trabalho e evidências disponíveis:** apresentar dados aprovados da Pryme; cases e depoimentos somente quando fornecidos. Se o material ainda for curto, integrar esse conteúdo ao processo.
7. **Site + WhatsApp Business + Instagram:** conservar a seção própria e as chamadas de cada canal.
8. **Orientação em três perguntas:** manter a lógica atual, a recomendação e a explicação do envio pelo WhatsApp.
9. **Perguntas frequentes:** manter as cinco perguntas, corrigir a menção ao campo de dúvidas inexistente e complementar apenas com respostas comerciais confirmadas.
10. **Contato final e rodapé:** repetir as duas opções de próximo passo e apresentar canais e identificação confirmados.

As chamadas do topo e dos serviços continuariam levando diretamente ao diagnóstico por âncora. A mudança da posição da seção não precisa obrigar a pessoa a percorrer todo o conteúdo antes de usá-la.

## 7. Dúvidas e informações ausentes

1. O número `+55 48 99109-5819` e o perfil `@prymedigital.tl`, encontrados nos links, continuam sendo os contatos oficiais? Não confirmei titularidade ou disponibilidade.
2. São José, SC, e atendimento local/online continuam corretos? Quem é o responsável pelo atendimento e pelo desenvolvimento, e quais informações podem ser publicadas?
3. Quais públicos são prioritários: empresas de serviços em geral, profissionais autônomos, personal trainers, academias ou outros? Os três exemplos atuais são amplos.
4. Quais entregas entram em cada serviço? A Pryme oferece redação, fotos, número definido de páginas, revisões, suporte, manutenção, domínio e hospedagem? Quais itens dependem de contratação separada?
5. Como funciona a conversa inicial? Há custo, condições ou prazo de resposta aprovados para divulgação? Não devem ser anunciados como gratuitos ou garantidos sem confirmação.
6. Há projetos reais, autorização para exibi-los, depoimentos aprovados ou resultados verificáveis? Na ausência deles, que trajetória e método podem ser apresentados com precisão?
7. A conta é efetivamente WhatsApp Business? Catálogo, horários e respostas rápidas estão ativos? Há algum serviço de configuração de Instagram contratado ou integração disponível? Os arquivos confirmam links de saída, não essas configurações.
8. Qual é o domínio publicado, o serviço de hospedagem, o repositório e a branch de produção? A igualdade entre arquivos locais e `dist` não confirma o que o público está vendo. A causa da atualização não aparecer no site publicado continua sem comprovação.
9. Os formatos devem selecionar um perfil ou abrir demonstrações completas? Ambas as opções são possíveis, mas a promessa do cartão precisa corresponder à ação.
10. Qual é o procedimento de contato e tratamento das informações depois que o visitante envia a mensagem no WhatsApp? O aviso atual descreve o funcionamento local do questionário, não todo o atendimento posterior.

**Entrega desta etapa:** diagnóstico e recomendações para avaliação da Pryme. As correções propostas ainda não foram implementadas.
# Nota sobre esta avaliação

Este documento registra o diagnóstico anterior às alterações. A implementação de 6 de outubro de 2026, seus testes e limitações estão em [REVISAO-IMPLEMENTADA.md](REVISAO-IMPLEMENTADA.md).
