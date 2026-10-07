# Revisão do site Pryme — 6 de outubro de 2026

As alterações foram aplicadas aos arquivos locais e à saída `dist/`. A identidade preta, branca e amarela e a logo original foram preservadas. O site mantém os três serviços, exemplos conceituais, diagnóstico de três perguntas, recomendações, dois tipos de mensagem para WhatsApp, FAQ e contatos.

A revisão funcional no navegador foi concluída: **43 verificações passaram, sem falhas**, além dos nove testes locais de código. Foram conferidos visualmente 320 px (celular) e 1440 px (desktop). O build de `dist/` está atualizado. Não foi feito deploy nem alterado o site publicado.

## Análise e implementação por área

| Área | Problema encontrado | Impacto no visitante | Melhoria proposta e implementada | Prioridade | Forma de validar e estado |
|---|---|---|---|---|---|
| Estrutura e navegação | O topo tinha um `.browser-card` duplicado e contêiner aberto; o menu omitia processo, dúvidas e contato. Os exemplos pareciam abrir demonstrações, mas preenchiam uma resposta. Havia uma seção inteira repetindo o aviso sobre exemplos conceituais. | Composição imprevisível, caminhos pouco claros e rolagem sem conteúdo novo. | HTML corrigido; menu com Soluções, Exemplos, Como funciona, Redes Sociais, Dúvidas e contato; processo antes do diagnóstico; ação dos exemplos explícita; aviso mantido junto aos exemplos; contato direto no topo. A âncora antiga `#canais` continua válida. | Alta | Tags, IDs e destinos internos verificados automaticamente. Menu, âncoras, cartões de exemplo e ações dos serviços passaram em navegador. |
| Fontes e tipografia | Três famílias externas e muitos textos informativos entre 9 e 13 px; hierarquia muito variável. | Leitura difícil, especialmente no celular, e custo adicional de fontes. | Duas famílias: Space Grotesk para títulos e Manrope para texto. Textos principais de 15–17 px; controles e descrições em escala coerente; notas de pelo menos 13 px. Fontes com `display=swap` e alternativas locais. Tamanhos menores ficaram restritos a rótulos curtos e miniaturas decorativas. | Alta | Duas famílias e configuração de carregamento verificadas. Pares principais de cores superam 4,5:1. A página e o texto ampliado a 200% passaram no navegador. |
| Layout e composição | Prévia e resumo estavam encaixados incorretamente; seções claras tinham conteúdo junto às bordas; espaçamentos e larguras variavam. | Desalinhamento, densidade desigual e espaço mal utilizado. | Abertura com texto e uma prévia independente; conteúdo redundante removido; contêiner de até 1200 px; espaçamento de seção compartilhado; fundos de largura completa com conteúdo alinhado; grades adaptativas. | Alta | Rolagem horizontal verificada no navegador em sete larguras entre 320 e 1440 px. Aparência de 320 e 1440 px revisada visualmente. |
| Modernização da interface | Botões, contornos, tamanhos de cards e destaques inconsistentes; chamada amarela sobre fundo amarelo no encerramento. | Ações importantes perdiam destaque e a página parecia composta de padrões diferentes. | Tokens de cor, borda, raio e espaçamento; botões com altura mínima de 48 px; cards com contornos consistentes; CTA escuro no encerramento; efeitos discretos em controles; preferência por movimento reduzido respeitada no CSS e na seleção de exemplos. | Média | Pares de cores verificados por cálculo; cartões e botões conferidos no celular e no desktop. |
| Redes Sociais | “Canais digitais” misturava apresentação de serviços com acesso aos perfis. | O visitante precisava interpretar o texto para encontrar os contatos reais. | Aba **Redes Sociais** em menu e rodapé, seção `#redes-sociais`, cartões de Instagram e WhatsApp com ícones SVG, nome, identificação, descrição e botão. Links externos seguros; aviso acessível de nova aba nos cartões. | Alta | Cartões vistos em celular e desktop. URLs comparadas aos contatos originais. A consulta externa não confirmou disponibilidade das contas; nenhum perfil fictício foi criado. |
| Responsividade e acessibilidade | Foco amarelo em superfícies claras; menu escondido sem JavaScript; Escape sem devolver foco; rolagem animada forçada no JS; rótulos pequenos. | Perda de orientação por teclado, dificuldade de leitura e navegação móvel indisponível quando o script falhava. | Foco escuro em superfícies claras e amarelo em áreas escuras; menu progressivo, com Escape e retorno de foco; fechamento ao sair do cabeçalho; ajuste de foco ao mudar de largura; radios nativos visíveis, rótulos e grupos mantidos; prévias decorativas fora da leitura assistiva; link para pular ao conteúdo; âncora de retorno ao topo corrigida. | Alta | Campos e ARIA verificados. Menu e Escape conferidos; layout nas sete larguras, texto ampliado a 200% e versão sem JavaScript passaram no navegador. Auditoria por leitor de tela e dispositivo físico não realizada. |
| Estrutura técnica e desempenho | `npm test` apontava para pasta ausente; havia uma regra de hospedagem para `/admin.html` inexistente; estilos e mapa de perfis repetidos. | Manutenção confusa e ausência de verificações reproduzíveis. | Script de testes corrigido; lógica das recomendações isolada em `diagnostic-model.js`; mapa de perfis único; CSS consolidado; regra obsoleta removida; build vinculado à raiz real do projeto; servidor local serve a saída com caminhos verificados; nenhuma dependência adicionada ao site. Logo original mantida, rodapé com carregamento tardio. | Média | Sintaxe, build, nove testes locais, entrega HTTP dos recursos e respostas 404 passaram. Não foi medido Lighthouse, Core Web Vitals nem tempo de carregamento em produção. |

## Testes executados

Comandos usados no PowerShell:

```powershell
npm.cmd run check
npm.cmd run build
npm.cmd test
```

Resultado: **9 testes aprovados, 0 falhas**.

No Opera GX, mais **43 verificações de navegador passaram, sem falhas**. Os testes cobrem sete larguras, menu, âncoras, FAQ, os serviços, os exemplos, as 64 combinações reais do diagnóstico, 128 URLs que não foram enviadas, a exibição dos resultados, o texto ampliado a 200%, o carregamento da logo e das fontes, e o site sem JavaScript. O Escape foi confirmado com a tecla do teclado; o foco voltou ao botão Menu.

1. Tags balanceadas, IDs únicos, idioma e um único `h1`.
2. Destinos de todas as âncoras e referências ARIA presentes.
3. Recursos locais existentes, contatos permitidos, proteção dos links em nova aba e imagens com alternativa e dimensões.
4. Três grupos de perguntas com quatro alternativas identificadas cada.
5. Todas as **64 combinações** geram a recomendação esperada para a situação; verificação das **128 mensagens** dos dois botões, preservando respostas, acentos e quebras de linha.
6. Respostas incompletas e número inválido não geram mensagem.
7. Duas famílias de fontes e contraste dos principais pares acima de 4,5:1. Isso é uma verificação parcial de contraste, não uma certificação de acessibilidade.
8. Conteúdo de `dist/` idêntico aos arquivos atuais de produção.
9. Servidor HTTP local entrega página, CSS, os dois módulos e logo com MIME correto; recursos ausentes e tentativas de sair da pasta pública retornam 404.

Também passou a verificação de sintaxe de `tests/browser.mjs`. A folha de estilos caiu de 36.529 para 26.688 bytes. A logo é o único bitmap do projeto, com 396.339 bytes; foi preservada sem redesenho ou perda de qualidade. As miniaturas e os ícones usam HTML/CSS/SVG, sem imagens adicionais, bibliotecas de ícones ou embeds de redes sociais.

## Limitações da validação

- As sete larguras entre 320 e 1440 px foram medidas pelo navegador; a aparência foi conferida em 320 e 1440 px. Não usei dispositivos físicos, e não realizei auditoria completa por leitor de tela.
- O Chromium isolado retornou `spawn EPERM`; os testes no Opera GX usaram a página de revisão temporária, servida somente em `127.0.0.1`. O resultado ficou em `review/in-browser-results.json`; o relatório e as cópias de comparação ficam fora do `dist/` e são ignorados pelo Git.
- O acesso externo às contas não pôde ser confirmado: Instagram falhou ao carregar e `wa.me` não é acessível pela ferramenta de consulta. Os links continuam sendo os presentes originalmente; a atividade das contas depende de confirmação da Pryme.
- Nenhuma mensagem foi enviada. As combinações e URLs foram verificadas localmente; nenhum botão de contato foi acionado para transmitir dados.

As instruções para prévia e para repetir as revisões estão no `README.md`.

## Informações que dependem da Pryme

- Confirmar se `https://www.instagram.com/prymedigital.tl/` e `https://wa.me/5548991095819` continuam oficiais e ativos.
- Fornecer links reais de quaisquer outras redes que queira incluir. Não há URLs de LinkedIn, Facebook, TikTok ou YouTube no projeto; nenhum botão vazio foi publicado.
- Enviar as normas adicionais mencionadas no primeiro pedido, caso ainda sejam aplicáveis. A revisão seguiu os sete requisitos já recebidos.
- Fornecer equipe, trajetória, cases ou depoimentos autorizados se quiser acrescentar esses conteúdos futuramente. Não foram inventados nomes, resultados, preços ou prazos.

## Arquivos e publicação

- Implementação: `index.html`, `pryme-ultimate.css`, `pryme-ultimate.js` e `diagnostic-model.js`.
- Infraestrutura local: `build.mjs`, `dev.mjs`, `package.json` e `netlify.toml`.
- Verificação: `tests/site.test.mjs`, `tests/browser.mjs` e `tests/in-browser-check.js`.
- Servidor de revisão local: `tests/review-server.mjs` e `tests/review.html`.
- Versão gerada: `dist/`.
- Cópias anteriores: `review/original/`, fora do build e ignoradas pelo Git.

O build permite publicar a versão revisada nos serviços já configurados. O domínio, o repositório e a hospedagem em produção não foram acessados ou modificados nesta tarefa.
