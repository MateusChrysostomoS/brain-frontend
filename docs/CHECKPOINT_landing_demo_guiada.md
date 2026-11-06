# CHECKPOINT — Landing como demonstração guiada (TASK-078, 2026-11-05)

Estado: **commitado na branch `task/TASK-078-landing-demo`, não mesclado em `main`, sem push, sem deploy.**
Mesma mudança, com o mesmo módulo, em `secretarIA-frontend` e em `PreCheck/frontend`
(registro cross-repo em `BRAIN/tasks/TASK-078/TASK.md`).

## O que mudou em "/"

Um scroll em quatro atos:

1. **Hero:** uma promessa, os rótulos "PreCheck em uso" e "secretarIA em piloto" e um único CTA
   (Agendar demonstração).
2. **Ato PreCheck (fixado):** a conversa no WhatsApp aparece mensagem por mensagem e o resumo para o
   médico se monta, com o sinal de alarme em destaque e a frase "Quem avalia e decide é o médico".
   CTA: Conhecer o PreCheck (`/precheck`).
3. **Ato secretarIA (fixado):** pedido de horário no chat da clínica, horários livres, código por
   e-mail, a consulta entra na agenda da semana, lembrete por e-mail e passagem da conversa para a
   equipe. CTA: Quero participar do piloto (`#contato`).
4. **Fechamento:** como funciona (3 passos, divididos por produto), planos, segurança e LGPD,
   empresa, FAQ e contato.

Regras do dono respeitadas: preços, a seção de segurança e LGPD e a razão social **inalterados**.
Nenhum número, depoimento ou logo novo. Todo mockup tem "Ilustração com dados fictícios".

Mudanças de conteúdo que **não** são só layout:

- O cartão "Plano secretarIA" mantém o preço, mas passa a dizer "Em piloto · chat da clínica,
  WhatsApp em breve" e o botão leva a "Quero participar do piloto" em vez do checkout.
  `PRICING` (em `_lib/pricing.ts`) **não** foi alterado; o texto é sobrescrito só nesta página.
- FAQ: a resposta "Qual a diferença…" deixou de dizer que a secretarIA atende no WhatsApp, e entrou
  a pergunta "A secretarIA já funciona no WhatsApp?".
- Saíram os cartões "2 produtos / 1 plataforma" da seção Empresa (número sem informação).
- Identidade: na página, `--brand` vira **verde** (#27704a / #5cc088). PreCheck usa o trio azul
  (`--st-blue-*`) e secretarIA o trio âmbar (`--al-amber-*`) do design system.

## Onde está

`app/(site)/_components/demo/` — `PinnedAct` (fixação e animação ligada à rolagem com GSAP
ScrollTrigger), `PreCheckDemo`, `SecretariaDemo`, `SmoothScroll` (Lenis), `MotionReveal`
(motion/react-mini) e `guided-demo.css` (classes `gd-*`; só o bloco "SITE MAPPING" difere entre os
3 repos). O `Reveal.tsx` antigo saiu (ficou sem uso).

Comportamento importante:

- Sem JavaScript ou com "reduzir movimento", nada é fixado nem escondido: os atos aparecem completos
  e estáticos. A classe `is-live` só entra quando a animação é montada.
- O GSAP só é baixado e montado na primeira rolagem ou quando o ato entra na tela; o Lenis só na
  primeira roda do mouse ou tecla (no celular nunca carrega). Nenhum listener grava estado React.
- O link "Pular para o conteúdo" foi adicionado (`.gd-skip` → `main#conteudo`).

## Validação (2026-11-05)

- `tsc --noEmit` ok, `npm test` 295/295, `next build` ok (JS da rota "/" na abertura: 13,6 kB;
  antes, 8,7 kB).
- Playwright em 1440×900 e 390×844, claro e escuro, mais "reduzir movimento": os atos fixam, sem
  rolagem lateral e sem erro de script.
- Lighthouse, servidor local sem compressão: computador 96 / acessibilidade 95 / boas práticas 96 /
  SEO 100. Celular igual à versão anterior dentro da variação da máquina (nota entre 57 e 69 com a
  mudança, entre 48 e 69 antes). O tempo de carregamento de ~6,5 s no celular vem do servidor de
  teste sem gzip e acontece igual na versão anterior.

## Pendências

- Mesclar em `main` e rodar `graphify update .` depois da mescla.
- Deploy só com autorização do dono.
- A seção de segurança continua dizendo "WhatsApp Business API oficial" para os dois produtos
  (regra do dono: não mexer). Isso vale hoje só para o PreCheck.

## Rodada 2 (2026-11-06) — responsividade e conversas com a cara do Portal

Pedido do dono, a partir de prints numa tela de 1920×1080 com Windows em 125% (a página vê
~1536×729 em pixels CSS):

- **Botão do ato cortado:** a coluna de texto e a cena dos atos fixados agora medem pela ALTURA da
  tela também (título, passos e frase de valor em `clamp(... vh ...)`; a grade do ato tem uma linha
  `minmax(0, 1fr)` e a cena `min-height: 0`, então o celular/agenda encolhem em vez de passar da borda).
  Medido com Playwright: botão e cena dentro da tela em 1536×729, 1366×657, 1280×600, 1440×900 e
  1920×911. Em telas muito baixas (≤620 px) só o passo atual fica na lista.
- **Conversas iguais ao produto:** `ChatParts.tsx` desenha as bolhas como o Portal do paciente
  (Brain-Message-Frontend `MessageBubble`/`ReplyButtons`, lado do paciente): produto à esquerda com a
  marca e o brilho, botões dentro da bolha (o escolhido fica verde com ✓), "Opção escolhida" na
  resposta, hora e ✓✓ no canto, pessoa da clínica em verde ("Maria · recepção"). Os roteiros seguem o
  fluxo real (PreCheck: "✅ Concordo", Sim/Não/Voltar; secretarIA: "O que você precisa?" → "🗓️ Agendar",
  horários como botões, código mascarado "••••••"). Conteúdo continua fictício. Cores das bolhas = cores
  de produto dos sites (PreCheck azul, secretarIA âmbar, equipe verde), não o teal/amarelo do Portal.
- **Celular:** durante o ato, a barra de digitar e a barra de endereço somem para a conversa ter espaço;
  no resumo, as linhas secundárias saem para "Quem avalia e decide é o médico" aparecer sempre.
  Sem JavaScript ou com "reduzir movimento", tudo continua visível e estático.
## Rodada 3 (2026-11-06) — roteiros reais e seta para baixo

- **PreCheck em 4 etapas, como o produto funciona:** termos (LGPD) com "✅ Concordo" → perguntas padrão
  do fluxo, iguais para todos (primeira consulta, idade, remédio de uso diário, motivo da consulta) →
  perguntas aprofundadas que a IA escreve para a queixa daquele paciente → resumo para o médico (linhas
  "Queixa principal", "Aprofundamento", "Perguntas padrão"). O passo antigo "conta o motivo com as
  próprias palavras" saiu da lista (o motivo é uma das perguntas padrão). Fonte: `docs/flow_adulto_v1.json`
  e o simulador do `/comecar` do PreCheck ("aprofundaria sua queixa com perguntas geradas por IA").
  O "Como funciona" passou a dizer o mesmo.
- **secretarIA em dois celulares:** à esquerda, paciente novo na ordem real do primeiro contato no Portal
  (e-mail → nome → termos LGPD "✅ Concordo / ✏️ Mudar nome" → "O que você precisa?" "🗓️ Agendar" →
  "Essa consulta é pra você? 😊" "✅ Sim, é pra mim" → horários → código → marcado, com aviso "Na Google
  Agenda"). Convênio e profissional, que o fluxo real pergunta, foram pulados na demonstração. À direita,
  paciente que já é da clínica: endereço, a própria consulta e a anterior (histórico), o que levar; a
  pergunta de saúde não é respondida — vai para a equipe e a Maria assume. No celular, o segundo cobre o
  primeiro quando a história dele começa. A semana da agenda saiu do ato (ficou o aviso).
- **Seta "Role para ver"** no pé do topo dos três sites (`ScrollCue.tsx`); no computador fica no fim da
  primeira tela, mesmo quando o topo é um pouco mais alto que a tela.
- Sem JavaScript / reduzir movimento: conversas longas rolam dentro do celular; nada escondido.
- Validação: tsc, vitest (295 / 623 / 20) e build verdes; Playwright em 1536×729, 1366×657, 1280×600,
  1440×900 e 390×664 (botão e cena dentro da tela), reduzir movimento sem nada oculto.
- Afirmações novas a pedido do dono: a secretarIA responde endereço, preparo e a consulta atual/anterior do
  paciente. Dados (endereço, datas) são fictícios.

- **Movimento mais suave (rodada 3b):** as mensagens não animam mais a altura (o que recalculava a conversa
  inteira a cada quadro e dava solavancos). A conversa fica num trilho que desliza para cima (só
  `transform`), e cada bolha surge com fade + leve subida. Rolagem com `scrub: 1`.
- **Ainda mais suave (rodada 3c):** roda do mouse amortecida (Lenis `lerp` 0.075, passo 0.8), animação
  segue a rolagem com `scrub: 1.4`, trilho com `sine.inOut` (1.2) e bolhas em 1.1, e mais rolagem por
  mensagem (PreCheck 22, secretarIA 20 / 18 no site do PreCheck). Medido com a roda: no máximo ~10 px por
  quadro, mediana ~1 px.

- **Rodada 4 (2026-11-06) — mascotes e cabeçalho:** o site do PreCheck não tem mais o ato fixado da
  secretarIA; no lugar, uma seção curta e estática ("Da mesma empresa · secretarIA", em piloto, WhatsApp em
  breve) com a mascote do celular e o botão "Conhecer a secretarIA" → https://secretariabrainai.com.br/.
  O site da secretarIA ganhou a seção espelho para o PreCheck (mascote azul do tablet, "Conhecer o
  PreCheck" → https://precheck.com.br/, sem citar WhatsApp nessa seção). Componente compartilhado
  `ProductPromo` (sincronizado de brain-frontend; o botão usa a cor do OUTRO produto). Cabeçalho da
  secretarIA no padrão do PreCheck: "Brain │ [rosto] secretarIA" (no celular saem a palavra Brain e o
  traço). Rosto dela também no cabeçalho das conversas simuladas, na linha do ato da secretarIA (Brain e
  secretarIA) e no rodapé do site da secretarIA; mascote em pé ao lado de "Limites claros" e no notebook
  ao lado do formulário. Imagens em `public/brand/mascots/` (WebP recortado, gerado dos PNG do dono).
  Validação: tsc, vitest (295 / 623 / 20) e build verdes; Playwright claro/escuro, 1366×768 e 390×760;
  atos fixados continuam cabendo em 1366×657, 1280×600 e 390×664.

- **Rodada 5 (2026-11-06) — Agendar completo:** o celular do paciente novo agora mostra o fluxo inteiro do
  Agendar, com os textos e botões reais da secretarIA (lidos no código em 2026-11-06): convênio
  ("Particular"), profissional (linha com a especialidade), serviço + cartão de preço, dia, horário,
  resumo com "✅ Confirmar", código do e-mail, CPF (mascarado), Pix do sinal (no modo da clínica que cobra
  antes de confirmar) e "Pagamento recebido! Seu agendamento está confirmado. ✅". O sinal é opção da
  clínica (desligado por padrão); a etapa na coluna diz "Se a clínica cobra sinal…". Ato da secretarIA:
  41 passos, 16% da tela por passo. Botões ganharam uma segunda linha opcional (descrição da linha da
  lista). Logo do cabeçalho do site da secretarIA subida (espaço embaixo) para os olhos ficarem na altura
  do topo das letras. Validação: tsc, vitest (295 / 623 / 20) e build verdes; atos cabem em 1366×657,
  1280×600 e 390×664.
