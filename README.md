# Pryme Ultimate

Versão independente do site da Pryme Consultoria, preparada para publicação.

## Prévia local e verificação

Requer Node.js 22.8 ou posterior. O site não tem dependências de execução.

```sh
npm run dev
```

Abra `http://localhost:4173`. Depois de editar os arquivos, rode `npm run build` e atualize o navegador. Use o servidor local para carregar os módulos JavaScript; abrir o HTML diretamente pelo explorador de arquivos não é uma prévia equivalente.

```sh
npm run check
npm run build
npm test
```

No PowerShell, use `npm.cmd` caso a política de execução bloqueie `npm.ps1`. Os testes verificam estrutura, âncoras, recursos locais, contatos permitidos, contraste de pares principais e as 64 combinações do diagnóstico com os dois tipos de mensagem.

Para a suíte de navegador opcional, instale Playwright no ambiente de desenvolvimento (`npm install --no-save playwright` e `npx playwright install chromium`) e rode `npm run test:browser`. Ela cobre larguras de 320 a 1440 px, menu e FAQ por teclado, formulário, movimento reduzido, ampliação de texto e navegação sem JavaScript. Mensagens de WhatsApp são interceptadas, nunca enviadas. Capturas e relatório ficam em `review/`.

Se Chromium não puder iniciar no computador, `node tests/review-server.mjs` abre um painel no navegador já disponível em `http://127.0.0.1:4174/__review`. A página mede sete larguras de 320 a 1440 px e percorre menu, FAQ, serviços, exemplos, formulário e contato sem JavaScript. Registra os resultados locais em `review/in-browser-results.json`. Nada é enviado às redes; encerre o servidor com `Ctrl+C`.

Também é possível fornecer `PLAYWRIGHT_MODULE`, `TEST_BROWSER_EXECUTABLE` e `TEST_URL` para a suíte de Chromium. Ela cobre layout, navegação, formulário, calculadora de receita, FAQ e acesso sem JavaScript. Capturas e resultados só se atualizam quando a suíte é executada; confirme os contatos e faça uma auditoria com leitor de tela.

## Contatos e manutenção

- Instagram: `https://www.instagram.com/prymedigital.tl/`.
- WhatsApp: `https://wa.me/5548991095819`.
- Estes são os únicos perfis presentes no projeto original. Outros canais só devem ser publicados após o fornecimento dos links reais.
- Ao trocar o telefone, atualize tanto `data-whatsapp` no `body` quanto os links diretos de `index.html`. Os testes detectam divergências.
- `review/original/` preserva os arquivos anteriores à revisão, é ignorado pelo Git e não entra no build.

## Publicar no GitHub

Envie **o conteúdo desta pasta** para a raiz do repositório GitHub. `index.html`, `package.json`, `build.mjs`, `vercel.json` e `netlify.toml` devem ficar diretamente na raiz do repositório, e a pasta `assets` também deve ficar ali. Não envie a pasta-mãe `Pryme Consultoria` nem coloque este projeto dentro de uma subpasta do repositório.

## Atualizar o site publicado

Enviar arquivos ao GitHub não altera, por si só, o site que está no ar. No serviço de hospedagem conectado ao repositório, confirme:

- que o repositório e a branch publicados são os mesmos em que estes arquivos foram enviados;
- que o diretório raiz do projeto é a raiz do repositório (`.`), sem apontar para uma versão antiga ou subpasta;
- que o comando de build é `npm run build` e o diretório de saída é `dist`.

Depois, publique um novo deploy dessa branch e confira a URL/domínio associado ao deploy. O `vercel.json` e o `netlify.toml` já declaram build e saída para essas plataformas.

## Arquivos

- `index.html`, `pryme-ultimate.css`, `pryme-ultimate.js`: site e interações.
- `diagnostic-model.js`: recomendações e composição das mensagens de WhatsApp, sem acesso à rede ou armazenamento.
- `tests/`: testes locais e suíte opcional de navegador.
- `REVISAO-IMPLEMENTADA.md`: diagnóstico, mudanças, validação e pendências.
- `assets/pryme-ultimate-logo.png`: logo incluída nesta versão.
- `build.mjs`, `dev.mjs`, `package.json`: build e servidor local.
- `ESTRATEGIA-PRYME-ULTIMATE.md`: referências e estratégia.
- `vercel.json`, `netlify.toml`: configuração de publicação.
