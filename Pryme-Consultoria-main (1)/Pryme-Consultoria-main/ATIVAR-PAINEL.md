# Ativar pedidos, uploads e painel da Pryme Digital

Esta versão precisa de Netlify Functions + Supabase + Cloudflare Turnstile para receber pedidos e proteger o painel. Os arquivos já incluem a implementação; não é necessário comprar uma API de IA. Ainda assim, os serviços externos têm planos e limites próprios: confira o uso nas suas contas.

Sem a configuração abaixo, o catálogo e as prévias funcionam, o WhatsApp continua disponível e o formulário informa que o envio ainda não foi ativado. Não há senha padrão nem pedidos fictícios no painel.

## 1. Atualizar o projeto no GitHub

- Extraia o ZIP inteiro. Envie o conteúdo para o repositório da Pryme Digital, preservando as pastas `assets`, `database`, `netlify`, `server`, `scripts` e `tests`.
- O arquivo `index.html` e o arquivo `netlify.toml` devem ficar na raiz do repositório.
- Use uma branch de atualização para revisar. Depois, una à branch publicada pela Netlify.
- Não envie somente arquivos de dentro das pastas: `api.mjs` deve permanecer em `netlify/functions/api.mjs` e `core.mjs` em `server/core.mjs`.
- O antigo `app.js` não é mais usado e pode ser removido do repositório. Não o inclua manualmente no HTML.

## 2. Atualizar a publicação na Netlify

Use a integração com o GitHub. A configuração da raiz encaminha o build para Pryme-Digital-Primeira-Versao e publica as funções dessa mesma pasta.

Na configuração do projeto, use:

| Campo | Valor |
| --- | --- |
| Base directory | vazio |
| Build command | `npm run build` |
| Publish directory | Pryme-Digital-Primeira-Versao/dist |
| Functions directory | Pryme-Digital-Primeira-Versao/netlify/functions |

O `netlify.toml` já contém essas configurações. Se houver configurações antigas no painel, confira se não estão apontando para outra pasta. O build copia apenas os arquivos públicos para `dist`; não publique a raiz inteira nesta versão.

## 3. Criar o banco e o armazenamento

1. Entre em https://supabase.com/dashboard e crie um projeto dedicado à Pryme Digital.
2. No **SQL Editor**, abra uma nova consulta.
3. Copie o conteúdo de `database/setup.sql`, execute e confira se não houve erro.
4. Em **Table Editor**, deve existir a tabela `pryme_leads`.
5. Em **Storage**, deve existir o bucket privado `pryme-brand`. Mantenha-o privado. Não crie políticas públicas para ele nem para a tabela.

A tabela guarda pedidos; o bucket guarda as imagens. O SQL bloqueia o acesso direto de visitantes e usuários comuns. Somente as funções do servidor têm acesso ao banco.

## 4. Criar seu acesso de administrador

1. No Supabase, vá a **Authentication → Users**.
2. Use a opção de adicionar/criar usuário com seu e-mail e uma senha forte. Confirme o e-mail pelo fluxo do provedor ou use a opção administrativa de confirmação ao criar o próprio usuário.
3. Copie o identificador UUID desse usuário. Ele será o `ADMIN_USER_ID`.
4. O site não oferece cadastro público. O servidor só autoriza o UUID configurado, mesmo que outros usuários existam no Supabase.

Nunca coloque sua senha no código, no GitHub ou no `config.js`. Para recuperar ou alterar a senha, use os controles de Authentication do Supabase; esta versão não inclui uma tela própria de recuperação.

## 5. Ativar a proteção do formulário

1. Entre em https://dash.cloudflare.com/ e abra **Turnstile**.
2. Crie um widget para o hostname definitivo da Netlify (por exemplo, o nome do seu site terminado em `netlify.app`). Não use uma URL de exemplo: cadastre seu endereço real.
3. Escolha o modo gerenciado e copie a **site key** e a **secret key**.
4. Use as chaves reais do widget, não as chaves de teste.

O mesmo widget atende o pedido e o login. O servidor valida token, ação e hostname. Se mudar o domínio, atualize o widget e `SITE_ORIGIN`.

## 6. Configurar as variáveis na Netlify

Nas configurações do projeto, abra **Environment variables**. Adicione as variáveis abaixo com escopo que inclua **Functions** (ou todos os escopos). Não salve os valores em arquivos do repositório.

Para avisos de novos pedidos, configure na Netlify: RESEND_API_KEY (chave secreta do Resend), LEAD_NOTIFICATION_EMAIL (leomartomazellidev@gmail.com) e LEAD_NOTIFICATION_FROM (remetente autorizado em um domínio validado no Resend). Sem essas três variáveis, os pedidos continuam sendo salvos e consultados no painel, mas não há aviso por e-mail.

| Nome | Onde obter / valor |
| --- | --- |
| `SUPABASE_URL` | URL do projeto Supabase, sem barra no final |
| `SUPABASE_ANON_KEY` | Chave `anon` do projeto, nas chaves de API do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave `service_role` do projeto. É secreta e fica somente na Netlify |
| `ADMIN_USER_ID` | UUID do usuário administrador criado na etapa 4 |
| `TURNSTILE_SITE_KEY` | Site key do widget |
| `TURNSTILE_SECRET_KEY` | Secret key do widget. É secreta |
| `SITE_ORIGIN` | Endereço público exato, como `https://seu-site.netlify.app`, sem caminho e sem barra no final |

Faça uma nova publicação (deploy) depois de salvar. Não envie essas chaves pelo chat. `config.js` contém apenas seu WhatsApp público, já preenchido com +55 48 99109-5819.

As variáveis e o Turnstile estão ligados ao domínio de `SITE_ORIGIN`. Uma prévia de outra branch pode exibir o catálogo, mas os envios não serão aceitos em um hostname diferente. Para testar envios em outra URL, configure aquele ambiente com o seu próprio `SITE_ORIGIN`, widget e, preferencialmente, banco separado.

## 7. Conferir o funcionamento real

1. Abra `pedido.html` no domínio configurado.
2. Selecione um modelo, preencha um pedido de teste e envie uma imagem pequena.
3. Deve aparecer a confirmação com o UUID do pedido.
4. Abra `admin.html` no mesmo domínio ou use **Área administrativa** no site.
5. Entre com seu e-mail e senha do Supabase.
6. Confira o pedido, abra a imagem, altere a etapa e salve uma anotação.
7. Atualize a página e confira se a alteração persistiu.
8. Saia do painel. Os pedidos não devem continuar acessíveis sem novo login.

O cookie de login é protegido, exige HTTPS e dura no máximo uma hora. Se a sessão expirar, entre novamente. O painel usa paginação de 30 pedidos, filtros por etapa, busca por nome/negócio, notas internas e links temporários para os arquivos. Se outra janela já editou um pedido, uma alteração antiga será recusada para evitar sobrescrever dados.

## Atendimento e limites

- O painel organiza solicitações. Não é um chat em tempo real. O botão de contato abre o WhatsApp para você responder; nada é enviado automaticamente.
- Os arquivos aceitos são PNG, JPG e WebP, até 3 imagens de 1 MB cada. Arquivos SVG, PDF e outros formatos ficam fora desta primeira versão.
- A prévia é somente local até enviar. Os anexos do formulário não seguem automaticamente para o WhatsApp.
- Não há pagamento online ou criação automática de sites. Você recebe os materiais, confirma o escopo e personaliza o modelo.
- Para excluir dados a pedido de um cliente, localize o UUID em `pryme_leads`, remova as imagens da pasta de mesmo UUID em `pryme-brand` e depois a linha do pedido, usando o painel do Supabase. Arquivar no site não exclui os dados.
- Verifique periodicamente o armazenamento para remover uploads sem pedido associado caso uma indisponibilidade tenha interrompido uma gravação. O código tenta limpar uploads quando a gravação falha, mas falhas de rede podem exigir revisão manual.
- Configure RESEND_API_KEY, LEAD_NOTIFICATION_EMAIL (leomartomazellidev@gmail.com) e LEAD_NOTIFICATION_FROM na Netlify para receber aviso por e-mail de novos pedidos. Uma falha no aviso não impede o salvamento.

## Fontes técnicas utilizadas

- Netlify Functions: https://docs.netlify.com/build/functions/configuration/
- Variáveis de ambiente: https://docs.netlify.com/build/functions/environment-variables/
- Supabase Storage privado: https://supabase.com/docs/guides/storage/serving/downloads
- Controle de acesso: https://supabase.com/docs/guides/storage/security/access-control
- Cloudflare Turnstile: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
