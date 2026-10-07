# Auditoria de estrutura, host local e mobile — 7/10/2026

## Alcance e evidências

Esta revisão examinou os arquivos atuais, a saída `dist`, o servidor HTTP local e cálculos reproduzíveis. Não alterou HTML, CSS ou JavaScript de produção.

- Opera GX instalado e com processos ativos foi identificado.
- O controle nativo da janela retornou duas vezes `Computer Use native pipe is unavailable` (erro 2). Não foi possível ler a aba aberta.
- Uma tentativa isolada de captura headless com o executável do Opera falhou com `Acesso negado (0x5)` na criação de IPC/Crashpad. Nenhuma captura foi produzida. Não há comprovação visual de renderização no Opera nesta revisão.
- A prévia em `http://127.0.0.1:4174/` respondeu HTTP 200 para HTML, CSS e os dois módulos JS, com os tipos de conteúdo corretos e conteúdo igual a `dist`.
- `npm run check` e `npm test`: 12 testes aprovados. Isso não prova ausência dos problemas descritos abaixo, que esses testes não cobrem.
- Evidências reproduzíveis: `node review/audit-2026-10-07.mjs`, com resultados em `review/audit-2026-10-07.json`. O servidor `node tests/review-server.mjs` deve estar ativo para a etapa HTTP.

## Achados confirmados no código

### 1. Prioridade alta: contraste insuficiente no título e no botão Fitness

Locais: `index.html:130`, `index.html:195`, `pryme-ultimate.css:72`, `pryme-ultimate.css:277`, `pryme-ultimate.css:741`.

A seção Fitness usa fundo `#f5f5f1`. O destaque do título herda amarelo `#ffd619`, produzindo contraste de **1,29:1**. O botão “Conversar pelo WhatsApp” usa `.button-quiet`, que define texto branco sobre fundo transparente: **1,09:1** contra esse fundo claro. O hover também usa amarelo sobre claro. A seção de resultados já tem uma regra de destaque escuro, mas a seção Fitness não recebeu a mesma adaptação.

Consequência: texto e botão têm pouco contraste; a chamada de contato pode ser difícil de perceber. O título grande precisaria de pelo menos 3:1, e o texto normal do botão de 4,5:1 segundo o critério AA. [Referência W3C](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum).

Correção indicada: destaque em dourado escuro e variante de botão com texto/borda escuros sobre fundo claro, incluindo hover e foco.

### 2. Prioridade média: resultado arredondado da calculadora contradiz a receita

Local: `pryme-ultimate.js`, função `updateRevenue`, especialmente o uso de `maximumFractionDigits:1` para clientes.

Reprodução: **1 visita × 4% × 25% = 0,01 cliente estimado**. Com valor mensal de R$ 250, a receita esperada é **R$ 2,50**. A interface arredonda 0,01 para **“0”**, exibindo zero clientes junto de receita positiva. A multiplicação está correta; a apresentação perde informação.

Correção indicada: mostrar “menos de 0,1 cliente estimado” ou mais casas decimais para pequenas estimativas e explicar que frações representam expectativa matemática, não pessoas fracionadas.

### 3. Prioridade média: barras do funil não representam zero corretamente

Locais: `pryme-ultimate.css:1023`, `index.html:354`, `pryme-ultimate.js`, função `updateRevenue`.

As barras têm `min-width:2px`; portanto uma taxa zero continua desenhando uma barra. A barra de visitas tem largura fixa de 100%, mesmo com zero visitas. Contatos e clientes usam proporções das taxas, mesmo quando a quantidade de visitas é zero.

Consequência: números zerados podem coexistir com barras visíveis, sugerindo atividade inexistente.

Correção indicada: zerar ou ocultar as barras quando as quantidades forem zero e deixar explícito que a escala é proporcional às visitas informadas.

### 4. Prioridade média: calculadora sem fallback local quando o script não carrega

Local: `index.html:334` e bloco de resultados na linha 348.

Os quatro campos e o resultado com traços aparecem no HTML, mas não há aviso ou alternativa junto à calculadora caso JavaScript esteja desativado ou o módulo falhe. O aviso `noscript` existente está em outro componente, no diagnóstico.

Consequência: o visitante pode preencher a calculadora sem receber resultado ou explicação. Para a prévia funcional, deve ser usado o endereço HTTP local; abrir apenas o arquivo HTML não equivale a servir os módulos pelo host.

Correção indicada: exibir a fórmula e um aviso sem JavaScript, e ativar o resultado dinâmico somente após inicialização.

### 5. Prioridade média de apresentação mobile: margens internas em dois níveis

Locais: `pryme-ultimate.css:775`, regras de `.fitness-audiences` abaixo de 640 px.

Na largura de **320 px**, `.shell` tem 280 px; o contêiner `.fitness-audiences` perde 36 px de padding; cada cartão perde outros 56 px de padding e 2 px de borda. Sobram aproximadamente **186 px de largura de texto** nos cartões de academias e personal trainers.

Consequência provável: mais quebras de linha e cartões mais altos do que o necessário. Essa é uma avaliação da geometria CSS; não foi observada numa captura de tela.

Correção indicada: retirar o padding do contêiner de grade e concentrar o espaçamento dentro de cada cartão, ajustando-o para telas estreitas.

### 6. Prioridade baixa de manutenção: regras responsivas duplicadas

Locais: `pryme-ultimate.css:1905` e `:1923`; `:2071` e `:2104`.

Os blocos de Fitness foram repetidos nas media queries de 960 px e 640 px. Em 960 px, `.revenue-result` recebe primeiro `.8fr 1.2fr` e depois `1fr 1fr`; a segunda regra prevalece.

Consequência: editar a primeira regra pode não produzir efeito porque outra, mais abaixo, a substitui. Duplicação de CSS não significa que o padding seja somado; as margens duplas do achado anterior vêm de elementos pai e filho distintos.

Correção indicada: consolidar cada componente em uma única regra por breakpoint.

### 7. Prioridade baixa de navegação: texto do botão não corresponde ao destino

Local: `index.html:194`.

“Conhecer as soluções” aponta para `#diagnostico`, embora exista `#solucoes`. O link funciona, mas o destino é um questionário.

Correção indicada: usar “Fazer diagnóstico inicial” ou apontar o botão para a seção de soluções.

### 8. Prioridade baixa de conteúdo: repetição e texto provisório

Locais: `index.html:191` e `:369`; bloco `PROJETOS E DEPOIMENTOS` na linha 364.

O parágrafo da pesquisa brasileira aparece integralmente duas vezes. O bloco de projetos explica como um caso deveria ser publicado, mas não mostra um projeto ou depoimento. Isso aumenta a rolagem, principalmente em celular, e oferece pouca informação nova ao visitante.

Correção indicada: manter a referência brasileira uma vez; reservar os casos no código sem apresentar texto editorial provisório ao público, até haver material autorizado.

### 9. Prioridade baixa: limite numérico da calculadora

Local: `diagnostic-model.js`, função `estimateRevenue`.

Os campos aceitam números finitos muito grandes. Com `visits=1e308` e taxas de 100%, a multiplicação intermediária produz `Infinity`, sem validação do resultado. É um caso extremo e não afeta valores comerciais usuais.

Correção indicada: calcular com as taxas já divididas por 100, adotar limites de entrada razoáveis e verificar se os resultados finais são finitos.

## Falha identificada na própria verificação de navegador

Local: `tests/in-browser-check.js`, laço de `[data-intent]`.

O teste clica em “site novo”, depois em “modernização” e depois em “consultoria”. O site corretamente preserva a opção de modernização quando se clica em consultoria. Porém o teste espera `undefined` para consultoria. Essa sequência produz um falso erro. Deve comparar com o valor anterior ao clique e verificar separadamente o caso inicialmente vazio.

Além disso, o teste local cujo nome menciona consultoria só verifica cartões, metadados e Google Fonts; não exercita o clique. Os 12 testes aprovados não validam esse comportamento de interface.

## O que está correto nesta revisão

- Estrutura HTML básica balanceada, IDs únicos e destinos internos existentes.
- Gráficos e calculadora são a seção imediatamente seguinte ao diagnóstico no HTML.
- Isso não os torna o segundo bloco a partir do topo: antes do diagnóstico ainda há apresentação, benefícios, soluções, Fitness, exemplos e processo.
- Build e fontes coincidem; configurações de Netlify e Vercel apontam para `dist`.
- Fórmula da simulação funciona para o exemplo de 500 visitas, 4% de contato, 25% de contratação e R$ 250: 5 clientes estimados e R$ 1.250 brutos.

## Limite da conclusão

Não foi possível confirmar visualmente no Opera menu, teclado, zoom, rolagem, fontes efetivamente carregadas, altura total da página ou comportamento num aparelho real. A inspeção em larguras de celular não deve ser declarada concluída com base apenas no CSS e nos testes locais. A URL da aba do Opera também não foi obtida; esta auditoria é da cópia local, não de uma hospedagem pública.
