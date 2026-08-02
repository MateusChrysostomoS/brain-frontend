# CHECKPOINT — Portal de cobrança do PreCheck + port de /metrics e /users

Data: 2026-08-01. Estado: **frontend CONCLUÍDO** para as duas frentes abaixo, implementado
exatamente contra o contrato de brain-api combinado para esta rodada (três endpoints novos
`/billing/precheck/*`). O backend estava sendo construído em paralelo e não chegou a ficar
disponível para testar ao vivo — `tsc`/`build`/`npm test` estão todos verdes, mas ainda falta
um passe e2e contra um backend real (a mesma ressalva que todo `CHECKPOINT_*`/
`VERIFICATION_*` deste repositório carrega pra sua própria rodada). Se o contrato deployado
divergir do que está documentado abaixo (nome de campo, código de erro), só a nova seção de
`lib/manage-api.ts` e `PrecheckBillingSection.tsx` precisam mudar — nada mais referencia o
formato da resposta diretamente.

Duas frentes independentes entraram juntas nesta rodada:

1. **Seção de cobrança do PreCheck em `/app/billing`** + **planos PreCheck compráveis no
   `/cadastro`** — o PreCheck deixou de ser um plano único e virou duas faixas
   (`precheck_basic` / `precheck_advanced`), cada uma com sua própria cota mensal de
   pré-consultas, mais compra avulsa de pré-consultas (preço POR UNIDADE, quantidade
   escolhida na UI do BRAIN, mínimo 5 por compra).
2. **Port de `/metrics` e `/users`** do frontend irmão do PreCheck
   (`C:\TECH\BRAIN\PreCheck\frontend`) para a área `(SignIn)` do brain-frontend, e o
   `DashNav` passou a ser sensível a papel/área em vez de admin-only.

## O que mudou

### Frente A — Cobrança do PreCheck

- **`lib/manage-api.ts`**:
  - `CatalogPlanId` ganhou `precheck_basic` / `precheck_advanced`; o id legado
    `"precheck"` foi MANTIDO na união (brain-api ainda resolve ele no backend para
    assinaturas existentes/links antigos), mesmo que nada novo deva enviá-lo.
  - Nova seção: tipo `PrecheckBillingUsage` (espelha `GET /billing/precheck/usage`
    exatamente — `plan`, `plan_name`, `precheck_enabled`, `enforced`, `quota`, `used`,
    `remaining`, `topup_credits`, `topup_expires_at`, `window_start`, `window_end`,
    `spend: {topup_cents, topup_count, currency}`), `getPrecheckBillingUsage(session)`
    (sempre 200 pelo contrato, mas resolve `null` em QUALQUER falha — mesmo idioma
    "optional fetch resolves null" de `getCheckoutConfig`, então um problema aqui nunca
    quebra o resto de `/app/billing`), `createPrecheckTopupSession(session, quantity)`
    (POST `.../topup` com corpo `{quantity}` — o preço do avulso é por unidade, então a
    quantidade É a compra; lança `ManageApiError` 503/409 e 422
    `quantity_below_minimum`/`quantity_above_maximum`), `upgradePrecheckPlan(session,
    "precheck_advanced")` (POST `.../upgrade`, lança `ManageApiError` 409
    `already_on_plan`/`no_active_subscription`, 422). As três cobertas em
    `lib/__tests__/manage-api.test.ts` (+11 testes: formato de sucesso, os dois casos de
    resolve-null, e cada branch de erro documentado).
- **`lib/currency.ts`** (novo) — `formatBRLFromCents(cents)`: formatador de BRL pt-BR via
  `Intl.NumberFormat`, normalizando o ESPAÇO NÃO-QUEBRÁVEL (char code 160) que o Node/ICU
  às vezes insere entre "R$" e os dígitos para um espaço comum, e limitando entrada
  não-finita/negativa a zero. Alimenta a linha "Compras avulsas: R$ XX,XX". Testado em
  `lib/__tests__/currency.test.ts` (7 testes, incluindo o caso de normalização do NBSP,
  verificado contra a saída real do `Intl.NumberFormat` deste ambiente antes de escrever
  as asserções).
- **`app/(site)/app/billing/_components/PrecheckBillingSection.tsx`** (novo) — o
  `sub-block` "Pré-consultas (PreCheck)", renderizado em `/app/billing` entre "Limites do
  plano" e "Gerenciar assinatura" (`billing/page.tsx` só adiciona
  `{session && <PrecheckBillingSection session={session} />}` — nenhum estado novo na
  própria página). Tem seu próprio fetch/render/estado de erro: renderiza `null` enquanto
  carrega, se o fetch falhar, ou quando `precheck_enabled` é falso. Conteúdo: plano + cota
  mensal, uma barra de progresso fina em CSS (`used`/`quota`, âmbar acima de 100%), o
  destaque de créditos avulsos (só quando `topup_credits > 0`, com "expiram em <data>"
  quando existir), "Total restante", e a linha de gasto
  (`formatBRLFromCents(spend.topup_cents)` + contagem de compras) — deixando explícito que
  a mensalidade é cobrada via a assinatura logo abaixo, SEM NUNCA inventar um preço base no
  cliente. Duas ações, cada uma com seu próprio estado de pending/erro (espelha
  `../../reativar/_components/RestartButton.tsx`): "Comprar mais pré-consultas" — um campo
  numérico de quantidade (`TOPUP_MIN_QUANTITY = 5`, espelhando o
  `PRECHECK_TOPUP_MIN_QUANTITY` do brain-api; o campo volta pro mínimo no blur, o CTA fica
  desabilitado enquanto o valor for inválido, e o 422 do servidor continua sendo a
  aplicação real da regra) ao lado do CTA que faz o top-up -> redirect de página inteira
  pro Stripe, já com a quantidade fixada (sem `adjustable_quantity`, então a página do
  Stripe nunca pergunta de novo; o total só aparece lá, porque o preço unitário não é
  inventado no cliente) — e "Fazer upgrade para Advanced" (só quando
  `plan === "precheck_basic"`; um painel de confirmação inline em dois passos, não
  `window.confirm()`, pra manter o design system) -> em caso de sucesso troca o payload de
  uso pelo mais recente + mostra um aviso. As duas ações usam
  `isSessionExpired`/`clearSession` de `../../../_components/usePortalGuard` pra mandar
  pro `/login` num 401, igual `reativar/page.tsx`.
- **`app/(site)/app/billing/billing.css`** — novas classes `.pc-*` (linhas de uso, barra
  de progresso/legenda, destaque de créditos, linha de gasto, linha de ações, campo de
  quantidade do avulso + sua legenda, painel de confirmação, aviso de sucesso),
  reaproveitando tokens/receitas existentes (mecânica de
  `.cad-progress-track`, receita de destaque tingido de `.cad-testwindow-highlight`,
  `.portal-alert` reaproveitado como está pro texto de erro).
- **`app/(site)/app/billing/page.tsx`** — `PLAN_LABELS` ganhou `precheck_basic`/
  `precheck_advanced`; a entrada antiga `precheck: "PreCheck"` foi mantida como fallback
  legado.
- **`app/(site)/cadastro/lib/plans.ts`** — a entrada `precheck` de `PURCHASABLE_PLANS` foi
  trocada por `precheck_basic`/`precheck_advanced` (taglines pt-BR: cota mensal vs. cota
  maior). `resolvePlan` mapeia um `?plan=precheck` recebido para `precheck_basic`
  (compatibilidade com links antigos) antes do lookup. Novo `isPrecheckPlan(plan)`
  exportado (`planId.startsWith("precheck")`) compartilhado por `CadastroWizard` e
  `SummaryStep`, então o predicado existe num lugar só.
- **`app/(site)/cadastro/_components/CadastroWizard.tsx`** — o case `"contact"` de
  `nextStepId` agora retorna `"summary"` direto para `isPrecheckPlan(plan)`, pulando
  usage/dedicated_number/prior_api/fb_page/page_creation/addons/test_window inteiramente
  (essas telas existem só pra checar a elegibilidade de WhatsApp Coexistence da
  secretarIA). A tabela de transição do `secretaria_basico` ficou byte-idêntica.
- **`app/(site)/cadastro/_components/SummaryStep.tsx`** — para um plano PreCheck, as três
  linhas de revisão das respostas de WhatsApp (uso do WhatsApp / número usado com API /
  página no Facebook) ficam escondidas, e `attachSignupIntake()` é pulado explicitamente
  (`!isPrecheck && ...`, em cima da guarda por null que já existia e que teria pulado de
  qualquer forma já que essas respostas nunca são coletadas nesse fluxo — deixado explícito
  em vez de implícito). A linha "Complementos" e o comportamento do `secretaria_basico`
  não foram tocados.
- **`app/(site)/_lib/pricing.ts`** — `PRICING.precheck.catalogIds` -> `["precheck_basic"]`;
  `name` -> "PreCheck Basic".
- **`app/(site)/page.tsx`** (página `/` de marketing, seção `#planos`) — o
  `PlanCheckoutCta` do `PriceCard` do PreCheck agora envia `plan="precheck_basic"`; um
  `<Link href="/cadastro?plan=precheck_advanced">` secundário ("Precisa de mais volume?
  Conheça o PreCheck Advanced →") fica embaixo do botão. Optei por um card + um link em
  vez de um quarto card — `.price-grid` é uma grade fixa de 3 colunas (PreCheck / Brain
  Completo / secretarIA) e um 4º item quebraria esse layout; o `PlanCheckoutCta` do
  `secretaria/page.tsx` (plano `secretaria_basico`) é outro e não foi tocado.

### Frente B — port de `/metrics` e `/users`, `DashNav` sensível a papel

- **`lib/types.ts`** — `UserInfo.role` ampliado pra incluir `"manager"`; novo campo
  `is_manager?: boolean` (eixo ortogonal ao role — um médico/admin que TAMBÉM é gestor).
  Adicionados, portados literalmente do irmão: `MetricsTotals`, `DoctorStats`,
  `SatisfactionStats`, `TimelinePoint`, `ClinicStats`, `MetricsOverview`, `AdminUser`,
  `AdminUserListResponse`, `ClinicInfo`, `UserCreatePayload`. Nada mais neste arquivo
  (tipos de Summary/Patient/mídia) foi tocado — fora do escopo desta rodada.
- **`lib/api.ts`** — adicionado `getMetricsOverview(opts)` (`GET /metrics/overview`),
  `listClinics()` (`GET /admin/clinics?limit=100`), `listUsers(clinicId?)` (`GET
  /admin/users`), `createUser(clinicId, payload)` (`POST /admin/clinics/{id}/users`) —
  mesmo `apiFetch`/estilo de toda função já existente neste arquivo, portado literalmente
  do irmão (assinaturas idênticas).
- **`lib/useAuthGuard.ts`** (novo) — portado literalmente do irmão (`requireAuth`/
  `logout`/`handleAuthError`, só depende do `./auth` já idêntico).
- **`app/(SignIn)/metrics/page.tsx` + `metrics.css`** (novos) — dashboard do Gestor,
  portado literalmente (o page.tsx não precisou de NENHUMA mudança de import — os mesmos
  aliases `@/lib/api`, `@/lib/types`, `@/lib/useAuthGuard`, `@/components/DashNav` já
  existem identicamente neste repositório). O CSS foi portado traduzindo a ESTRUTURA, não
  os nomes dos tokens: os tokens do irmão vivem num `app/tokens.css` + `app/dash-nav.css`
  compartilhados que este repositório não tem — `metrics.css` agora declara o conjunto
  completo de tokens (`--bg/--surface/--surface-2/--ink/--ink-2/--muted/--dim/--border/
  --border-2/--navy/--teal/--teal-2/--green/--warning/--danger/--radius-lg/--font-ui/
  --font-serif/--shadow`) direto dentro de `.metrics-route`, mais seu próprio bloco
  completo de `.dash-nav`/`.dash-tabs`/`.theme-toggle`/`.dash-signout` e override de tema
  escuro, exatamente como `../dashboard/dashboard.css` e `../inbound/inbound.css` já
  duplicam esse chrome por rota (confirmado: brain-frontend não tem arquivo de
  nav/tokens compartilhado; todo CSS de rota do `(SignIn)` é autocontido). Os VALORES dos
  tokens são os mesmos do irmão (mesma paleta clara cream/teal + escura navy/cream) — a
  mecânica dos gráficos de barra (`.sat-fill` width%, `.tl-bar` height%) é CSS puro, não
  foi tocada.
- **`app/(SignIn)/users/page.tsx` + `users.css`** (novos) — gestão de usuários
  (admin-only), mesmo tratamento de port-literal + tradução de tokens que `/metrics`. O
  select de clínica no formulário de criação é condicionado a `me.clinic_id == null`
  calculado só depois do redirect por `role !== "admin"` já ter rodado — ou seja,
  exatamente "PreCheck superadmin", portado como estava.
- **`components/DashNav.tsx`** — a lógica antiga de `ADMIN_TABS` (só `role === "admin"`)
  foi trocada pelo cálculo por área do irmão: `canClinical` (admin|doctor) -> Dashboard,
  `canMetrics` (admin|manager|is_manager) -> Métricas, `role==="admin"` -> Inbound +
  Usuários; a barra de abas (`showAdminTabs`) agora só renderiza quando `tabs.length > 1`
  (um médico puro ou um gestor puro tem exatamente uma área e nunca vê barra de abas).
  Nova prop opcional `isManager?: boolean`; a implementação do toggle de tema (`lib/theme.ts`
  `getCurrentTheme`/`toggleTheme` + estado local de mounted) foi deixada exatamente como
  estava — o hook `useThemeState` do irmão NÃO foi portado, já que o mecanismo que já
  existe aqui faz o mesmo trabalho e portar um segundo seria duplicação pura sem mudança
  de comportamento.
  - `dashboard/page.tsx` e `inbound/page.tsx` — as duas já buscam `getMe()`; cada uma
    agora também rastreia `isManager` em estado (`setIsManager(!!me.is_manager)`) e passa
    `isManager={isManager}` pro `<DashNav>`.
  - `summary/components/SummaryDetail.tsx` — não foi tocado, continua renderizando
    `<DashNav onLogout={logout} />` sem role/isManager. Verificado refazendo a lógica de
    abas na mão: com `role`/`isManager` os dois `undefined`, `canClinical`/`canMetrics`
    ficam `false` e `role !== "admin"`, então `tabs = []` e a barra continua escondida —
    idêntico ao comportamento anterior.
  - Efeito líquido para `role==="admin"`: a barra de abas em `/dashboard`/`/inbound`
    agora mostra 4 abas (Dashboard, Métricas, Inbound, Usuários) em vez de 2 — uma
    expansão intencional, não uma regressão; cada aba leva a uma página cuja própria
    checagem interna bate exatamente com o gate do DashNav (verificado página por página:
    `/metrics` usa a mesma condição `canMetrics`, `/users` e `/inbound` checam
    `role === "admin"`).

### Reuso vs. duplicação

**Genuinamente compartilhado** (portado uma vez, importado em todo lugar):
`lib/useAuthGuard.ts`, `isPrecheckPlan` (uma definição só em `cadastro/lib/plans.ts`,
importada por `CadastroWizard` e `SummaryStep`), `formatBRLFromCents` (uma definição só em
`lib/currency.ts`), `isSessionExpired`/`clearSession` (o `usePortalGuard.ts` já existente,
reaproveitado pela nova seção de cobrança em vez de reimplementar o tratamento de 401).

**Deliberadamente duplicado** (segue o padrão que este repositório já estabeleceu, não é
atalho): o bloco de CSS `.dash-nav` e o conjunto de tokens claro/escuro agora existem CINCO
vezes (dashboard/inbound/o `patient-route` do summary/metrics/users) porque este
repositório não tem um `app/tokens.css`/`app/dash-nav.css` compartilhado como o irmão tem
— introduzir um agora seria um refactor maior e não pedido em arquivos fora do escopo desta
rodada (`dashboard.css`, `inbound.css`, `summary.css` teriam que mudar também). Optei por
manter a convenção existente.

## Testado

- `.\node_modules\.bin\tsc.cmd --noEmit` (a partir do caminho em CAIXA ALTA `C:\...`) —
  limpo, repositório inteiro, exit code 0.
- `npm run build` (caminho em caixa alta) — verde. **35** rotas geradas (33 páginas
  estáticas + `/_not-found` + o manifest do export), incluindo as duas novas `/metrics` e
  `/users`; confirmado `out/metrics/index.html` e `out/users/index.html` presentes depois
  do export.
- `npm test` — **87/87 passando**, 4 arquivos: `manage-api.test.ts` 68 (era 57 — +11
  novos: `getPrecheckBillingUsage`/`createPrecheckTopupSession`/`upgradePrecheckPlan`,
  incluindo o corpo `{quantity}` do top-up e seu 422 `quantity_below_minimum`),
  `currency.test.ts` 7 (arquivo novo), `secretaria-hub.test.ts` 9, `sign-out.test.ts` 3.
  Sem regressões.
- NÃO rodado: um passe e2e ao vivo contra uma build de brain-api que implemente de fato
  `/billing/precheck/usage|topup|upgrade` (não existia ainda durante esta rodada — ver a
  nota no topo deste documento), e também não foi testado contra um backend PreCheck real
  pro `/metrics`/`/users` (as duas páginas portadas só reaproveitam o MESMO caminho
  `lib/api.ts`/`NEXT_PUBLIC_API_URL` que `/dashboard` já exercita contra um backend
  PreCheck real, então o encaixe em si é o mesmo caminho já comprovado — só não
  re-verificado ao vivo nesta rodada).

## Notas para o operador

- **Nenhuma variável de ambiente `NEXT_PUBLIC_*` nova foi introduzida.** Conferido via
  grep em todo arquivo novo/alterado — as únicas menções a `NEXT_PUBLIC_*` que sobraram
  são as já existentes de `NEXT_PUBLIC_MANAGE_API_BASE_URL` no comentário de cabeçalho/
  linha de base-URL de `lib/manage-api.ts`, sem alteração. Nenhuma mudança de `ARG`/`ENV`
  no Dockerfile é necessária para esta rodada.
- `/metrics` e `/users` não precisam de nenhuma mudança no nginx — o `location /` do
  `nginx.conf` é um catch-all genérico com `try_files` (sem enumeração por rota), e o
  export estático já produziu as pastas `out/metrics/` e `out/users/` como qualquer outra
  rota.
- Antes desta rodada estar "concluída" de ponta a ponta: brain-api precisa ter
  `/billing/precheck/usage`, `/billing/precheck/topup`, `/billing/precheck/upgrade`
  deployados com exatamente o contrato acima (nome de campo importa —
  `PrecheckBillingSection` lê eles direto, sem coerção defensiva além do que a tipagem
  estrutural do TypeScript já dá de graça), e pelo menos um tenant em `precheck_basic`/
  `precheck_advanced` pra ver a seção renderizar de verdade.

## Pendências / follow-ups

- Passe e2e ao vivo assim que os endpoints `/billing/precheck/*` de brain-api forem
  deployados (ver Notas para o operador acima) — exibição de plano/cota, redirect de
  top-up pro Stripe e volta, e o fluxo de confirmação de upgrade precisam de um backend
  real pra serem exercitados de ponta a ponta.
- Ainda não existe nenhuma UI do lado admin pra configurar/ver as cotas de
  `precheck_basic` vs `precheck_advanced` por tenant (fora do escopo desta rodada — essa
  foi uma rodada voltada pro lado do tenant).
- O passo de confirmação "Fazer upgrade para Advanced" não mostra a diferença de preço
  (nenhum preço fica disponível no cliente por design — ver a regra "nunca inventar um
  preço base" em `PrecheckBillingSection.tsx`); se o produto quiser mostrar o preço novo
  antes de confirmar, isso precisa de um campo novo no backend na confirmação do upgrade,
  não de um chute no cliente.
