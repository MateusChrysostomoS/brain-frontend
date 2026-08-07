# CHECKPOINT — Admin: abas PreCheck (Anamneses/Métricas/Inbound) + taxonomia de papéis (Role)

Date: 2026-08-07. State: **frontend IMPLEMENTADO + validado** (`.\node_modules\.bin\tsc.cmd
--noEmit` limpo repo-wide; `npm run build` verde, 36/36 rotas estáticas; `npm test` 92/92;
navegação manual nas 4 abas novas/reformadas conferida em dev server contra uma brain-api
local rodando o contrato novo). **NÃO deployado** — mudanças estão no working tree
(uncommitted), e o brain-api correspondente (rotas `/admin/anamneses`, `/admin/anamneses/{id}`,
`/admin/metrics`, claims `is_owner`/`is_manager`, migração `0012_role_taxonomy`) também está
uncommitted no repo `brain-api` local. Este checkpoint documenta o estado do **working tree**,
não um estado deployado.

Round scope: duas peças relacionadas landaram juntas nesta sessão:

1. **Reforma do painel admin** — 4 abas novas/reformadas dentro de `/admin`, portando telas do
   PreCheck para o design system da Brain (Anamneses, Métricas, Inbound) + o formulário de
   Usuários virou painel inline.
2. **Taxonomia de papéis (`Role`)** — contrato novo com o brain-api: `admin | doctor | manager`
   substitui `admin | tenant_owner | tenant_staff`; `Session` ganha `isOwner`/`isManager`
   (claims `is_owner`/`is_manager`); guards e gates em todo o app foram atualizados para aceitar
   os dois vocabulários durante a transição.

## A) Painel admin — 4 abas

Nav final em `app/(site)/admin/layout.tsx` (`ADMIN_NAV`): **Dashboard · Tenants · Anamneses ·
Métricas · Inbound · Usuários**. "Demo Requests" não existe mais como item próprio — a tela
renasceu com outro nome/layout em Inbound (ver abaixo).

### `app/(site)/admin/anamneses/page.tsx` (NOVA)
Clone do padrão `doctor/anamneses` (lista + detalhe via `?id=`, `StructuredSummary`
genérico), mas **cross-tenant**: cada linha carrega seu próprio `tenant_id`/`clinic_id` (o
backend não deriva tenant do JWT nesta rota — ela é admin-only e vê todas as clínicas), e a
lista ganha uma coluna "Tenant" com o UUID truncado (`shortTenantId`, tooltip com o UUID
completo via `title`). Guard: `usePortalGuard(["admin"])`. Estado stub quando o PreCheck não
está configurado no ambiente (`page.stub`).
- Client novo em `lib/manage-api.ts`: `adminListAnamneses(session, skip, limit)` ->
  `GET /admin/anamneses`, `adminGetAnamnesis(session, id)` -> `GET /admin/anamneses/{id}`.
  Tipos: `AdminAnamnesis`, `AdminAnamnesisList`, `AdminAnamnesisDetail`.

### `app/(site)/admin/metrics/page.tsx` (NOVA)
Porta a tela `/metrics` do PreCheck para o design system da Brain: `stat-grid` de KPIs
(PreChecks, Pacientes, Atendidos, Aguardando, Rejeitados, Satisfação média, Tempo até
triagem), barras de distribuição de satisfação (`SCORE_LABELS`, 5→1), tabela "Atendimentos
por médico", bar-chart inline de "PreChecks por dia" (últimos 30 pontos com atividade), e uma
tabela "Por clínica" **sempre visível** (é a visão cross-clinic da plataforma — ao contrário
da tela de origem no PreCheck, que é escopada a superadmin de uma clínica). Filtro de período
(`PeriodKey`: `7 | 30 | 90 | all`) via `portal-filter-pill`s. Estado stub idêntico ao das
outras telas PreCheck-backed.
- Client novo: `adminGetMetrics(session, {days?, all?})` -> `GET /admin/metrics?days=` ou
  `?all=true` (mutuamente exclusivos). Tipos: `AdminMetrics`, `AdminMetricsTotals`,
  `AdminMetricsDoctor`, `AdminMetricsSatisfaction`, `AdminMetricsTimelinePoint`,
  `AdminMetricsClinic`.
- **Fix pós-navegação manual**: `scored` (usado no bloco de satisfação) foi trocado de
  `data && ...` para `data?.satisfaction ? ... : 0` — o payload `stub` (`{stub: true}`) não
  tem o bloco `satisfaction`, e essa linha roda antes do branch condicional em `stub` no JSX,
  então o acesso direto quebrava a tela em ambientes sem PreCheck configurado.

### `app/(site)/admin/inbound/page.tsx` (REFORMADA — não é mais um proxy PreCheck)
A página antiga fazia proxy `brain-api GET /admin/inbound -> precheck /api/v1/admin/inbound`
(leads do formulário do site do PreCheck). Essa rota de proxy foi **removida do brain-api**
(confirmado: nenhuma rota `/admin/inbound` existe mais em
`brain-api/src/brain_api/api/admin.py` no working tree local do brain-api) e **não foi
substituída por uma rota de inbound nova** — em vez disso, `app/(site)/admin/demo-requests/`
(a tela antiga de "Demo Requests", fonte `brain-api GET /admin/demo_requests`) foi **apagada**
e seu conteúdo renasceu dentro de `admin/inbound/page.tsx`, com o layout `LeadCard` do
PreCheck: trio de stats (Novos/Contatados/Convertidos), pills de filtro por status com
contagem embutida, cards com avatar (inicial do nome), meta (clínica/perfil/interesse/
recebido em `<dl>`), `blockquote` para a mensagem, e os botões de transição por status
(`NEXT_ACTIONS`: `new -> contacted|converted|dismissed`, `contacted -> converted|dismissed`).
As transições/contrato (`adminListDemoRequests`, `adminPatchDemoRequest`, status machine) são
**inalteradas** — só o nome da rota (`/admin/demo-requests` -> `/admin/inbound`) e o layout
mudaram. `adminGetInbound` e os tipos `PrecheckInbound`/`PrecheckInboundList` foram removidos
de `lib/manage-api.ts` (nada mais os referencia).

### `app/(site)/admin/users/page.tsx`
Modal (`Modal` de `_components/Modal.tsx`) -> painel inline sempre visível
(`CreateUserPanel`, um `<section className="card">` acima da tabela, grid de `.pfield`,
mensagem de sucesso `formOk` além do `formError` existente), portado do layout do PreCheck
(painel inline, não modal). Reflete a taxonomia nova (ver seção B): select de Papel agora
oferece `Médico | Gestor | Admin da plataforma` (era `Proprietário (tenant_owner) | Equipe
(tenant_staff) | Admin`); checkbox "Também é gestor" aparece só quando `role === "doctor"`
(seta `is_manager` no payload; `role === "manager"` força `is_manager: true` implicitamente,
`role === "admin"` não envia a chave); tabela ganha um badge secundário "+ Gestor"
(`pbadge--sm`, tone `amber`) ao lado do badge de papel quando `u.is_manager && u.role !==
"manager"`, e um hint discreto `(dono)` ao lado do e-mail quando `u.is_owner`.

## B) Taxonomia de papéis (contrato com o brain-api)

`Role` (em `lib/manage-api.ts`): `"admin" | "doctor" | "manager"` — antes
`"admin" | "tenant_owner" | "tenant_staff"`. Doctor e manager são ambos papéis de portal
tenant-scoped ("gestor" tem tudo que "médico" tem + poderes de gestão da clínica); "dono da
clínica" e "também é gestor" viraram flags **ortogonais** ao papel, não papéis em si:

- `Session.isOwner` (claim `is_owner`) — o dono da clínica (quem comprou a assinatura). Gates
  billing/pause/self-bind/invites.
- `Session.isManager` (claim `is_manager`) — "também é gestor": um `doctor` com poderes extras
  de gestão em cima do acesso normal.

Ambas as claims são decodificadas do JWT via `readBoolClaim(claims, name)` (nova função
privada em `lib/manage-api.ts`, mesmo idioma de `readProfessionalIdClaim` — ausente/não-boolean
= `false`) em **todo** call site que monta um `Session` a partir de um access token fresco:
`login`, `doRefresh`, `registerSignup`, `exchangeOnboardingToken`, `exchangeInviteToken`, e
`fetchImpersonationDoctor` (o handoff "Modo médico" — este último não tinha decodificação de
JWT antes; ganhou um `decodeJwtPayload(data.access_token)` extra porque os outros campos de
identidade dessa resposta vêm prontos no corpo, mas `is_owner`/`is_manager` só existem como
claims do JWT).

`AdminUser` (lista de usuários do admin) ganhou `is_manager?`/`is_owner?` opcionais;
`AdminUserCreate` ganhou `is_manager?` (só significativo para `role: "doctor"`).

### Gates atualizados para o vocabulário novo (com fallback legado)

Todo guard/gate que antes checava `role === "tenant_owner"` ou listava
`["tenant_owner", "tenant_staff"]` foi migrado para o padrão **"aceita os dois durante a
transição"**:

- **Guards de portal** (`usePortalGuard`) — `["doctor", "manager", "tenant_owner",
  "tenant_staff"]`, em: `app/(site)/doctor/layout.tsx`, `doctor/dashboard/page.tsx`,
  `doctor/pacientes/page.tsx`, `doctor/anamneses/page.tsx`, `doctor/perfil/page.tsx`,
  `app/onboarding/page.tsx`, `app/reativar/page.tsx`. `usePortalGuard` em si (
  `_components/usePortalGuard.ts`) não mudou — a lista de papéis aceitos é responsabilidade de
  cada chamador, não do hook.
- **Gates de "é o dono" (não é checagem de papel, é uma flag)** — viram
  `session.isOwner || session.role === "tenant_owner"` (a claim nova primeiro, o valor legado
  do papel como fallback): `app/onboarding/page.tsx` (toggles de pausa, owner-only),
  `doctor/perfil/SecretariaConfigSection.tsx` (prompt de self-bind), `secretaria/configuracao/
  page.tsx` (prop `isOwner` passada a `ProfessionalsSection`, e o auto-select do profissional
  do próprio usuário não-dono ao carregar o roster).
- **Labels de exibição** (`ROLE_LABEL`/`ROLE_TONE`) — em `admin/users/page.tsx`,
  `doctor/perfil/page.tsx`, `secretaria/_shared/Header.tsx`: ganharam entradas
  `doctor`/`manager` e mantiveram `tenant_owner`/`tenant_staff` como fallback de exibição para
  linhas/tokens legados (comentado explicitamente como "até a migração de backfill rodar").
- **Roteamento pós-login** (`app/(SignOut)/login/page.tsx`) — inalterado no código
  (`role === "admin" ? admin : doctor`), só o comentário foi atualizado para descrever o
  vocabulário novo + legado.

### Componentes de apoio
- `_components/StatusBadge.tsx` — `StatusBadge` ganhou prop opcional `className` (aditiva,
  todo call site existente não afetado) para permitir empilhar um modificador de tamanho em
  cima do tone.
- `_components/PortalShell.css` — nova classe `.pbadge--sm` (padding/font-size reduzidos),
  usada pelo badge "+ Gestor" em `admin/users/page.tsx`.

## Contrato com o brain-api

Confirmado por leitura do working tree local de `brain-api` (também uncommitted lá —
`git status` mostra `admin.py`, `auth.py`, `core/security.py`, `models/user.py`,
`schemas/admin.py`, `schemas/auth.py` modificados + `migrations/versions/0012_role_taxonomy.py`
novo/untracked):

- **`GET /admin/anamneses`** e **`GET /admin/anamneses/{id}`** (novas) — proxy verbatim para
  `precheck /api/v1/admin/anamneses{,/{id}}` (`src/brain_api/api/admin.py`, seção "PreCheck
  admin proxies (anamneses + metrics)"). Cross-tenant — o payload já vem com `tenant_id`/
  `clinic_id` por linha; brain-api não filtra por tenant nessas rotas admin.
- **`GET /admin/metrics`** (nova) — mesmo padrão, proxy verbatim para
  `precheck /api/v1/admin/metrics`, aceita `?days=` ou `?all=true`.
- **`GET /admin/inbound` foi REMOVIDA** e **não tem substituta**. A aba Inbound do frontend
  não usa mais nenhuma rota de "inbound" — ela consome `GET /admin/demo_requests` (a mesma
  rota que a tela "Demo Requests" apagada já usava) via `adminListDemoRequests`/
  `adminPatchDemoRequest`, que continuam existindo em `lib/manage-api.ts` sem mudança de
  contrato. Cuidado ao ler o nome da aba ("Inbound") — não confundir com a antiga feature de
  inbound do PreCheck, que não existe mais neste app.
- **Claims `is_owner`/`is_manager`** — `brain_api/core/security.py` (função de mint de token)
  agora sempre inclui `is_owner`/`is_manager` no JWT, default `False` (comentário no próprio
  arquivo: "ALWAYS present, defaulting false"); `brain_api/api/auth.py` popula ambas a partir
  de `user.is_owner`/`user.is_manager` no login. `Role` no wire (campo `role` no JWT e nas
  respostas de usuário) passa a mandar `"doctor"`/`"manager"` para linhas novas.
- **Migração `0012_role_taxonomy`** (untracked em `brain-api/migrations/versions/`) — presumida
  responsável pelo backfill de `tenant_owner -> doctor (is_owner=true)` e
  `tenant_staff -> doctor|manager`; não lida/auditada linha a linha nesta sessão (fora do
  escopo — este checkpoint é do frontend). Confirmar o conteúdo exato da migração antes de
  aplicar em produção.

## Dependências de deploy

- **O frontend depende do brain-api novo estar no ar** para as 3 abas PreCheck-backed
  (Anamneses/Métricas usam rotas que só existem no working tree do brain-api ainda não
  commitado/deployado; Inbound depende só de `/admin/demo_requests`, que já existe hoje em
  produção — essa aba funciona mesmo sem o deploy novo do brain-api, as outras duas não).
- **Guards toleram tokens legados por ~30min** — a lista dupla (`["doctor", "manager",
  "tenant_owner", "tenant_staff"]`) existe para que uma sessão já aberta com um token antigo
  (`role: tenant_owner/tenant_staff`, sem claims `is_owner`/`is_manager`) não seja
  deslogada no instante do deploy — ela continua funcionando até expirar/renovar. Isso só
  cobre o **frontend**; o brain-api também precisa aceitar/emitir ambos os vocabulários
  durante a mesma janela (não verificado nesta sessão — está fora do escopo de
  "só documentação no brain-frontend").
- **O painel legado `app/(SignIn)` está intocado de propósito** — nenhuma mudança de role
  taxonomy tocou esse fluxo nesta sessão; se ele também lê/decide com base em `role`, precisa
  de uma auditoria separada antes do deploy.
- Nenhuma migração de frontend é necessária (é só JS/TS estático).

## Testado

- `.\node_modules\.bin\tsc.cmd --noEmit` — limpo, repo-wide.
- `npm run build` (path `C:\...` maiúsculo) — verde, **36/36** rotas estáticas, incluindo
  `/admin/anamneses`, `/admin/metrics`, `/admin/inbound` (reformada).
- `npm test` — **92/92** passando (inclui os testes novos/ajustados em
  `lib/__tests__/manage-api.test.ts` — cobre `login`/`doRefresh` decodificando `is_owner`/
  `is_manager`, ver `it("7b. login decodes is_owner/is_manager claims when present"`).
- Navegação manual nas 4 abas (Anamneses, Métricas, Inbound, Usuários) em dev server contra
  uma brain-api local rodando o contrato novo — encontrou e corrigiu o bug do `scored`/`stub`
  em Métricas (ver acima); as demais 3 abas navegaram sem erro.
- **Não testado**: e2e contra uma brain-api **deployada** (só local); comportamento do backend
  durante a janela de transição de 30min com tokens mistos (legado + novo) coexistindo; a
  migração `0012_role_taxonomy` não foi aplicada/auditada nesta sessão.

## Pendências / follow-ups

- Remover os fallbacks legados (`tenant_owner`/`tenant_staff` em guards, `ROLE_LABEL`/
  `ROLE_TONE`, checagens `session.role === "tenant_owner"`) depois que a migração de backfill
  do brain-api rodar em produção e a janela de transição (~30min de tokens antigos vivos)
  passar. Até lá, todo gate de "dono" deve continuar checando
  `isOwner || role === "tenant_owner"` (nunca só um dos dois).
- "Manager puro" (um usuário `role: "manager"`, sem ser `doctor`) ainda não tem uma tela
  própria de métricas/gestão de tenant — hoje ele cai no mesmo portal `/doctor/*` que um
  médico comum (o guard aceita `manager` nos mesmos lugares que `doctor`), sem nada
  diferenciado na UI além do badge "Gestor". Fora do escopo desta rodada.
- `/admin/inbound` como nome de rota é uma decisão de produto que vale revisitar: não há mais
  nenhum conceito de "inbound do PreCheck" por trás dela — é 100% a mesma feature de "Demo
  Requests"/leads do site da Brain só com layout novo. Se isso confundir o time, considerar
  renomear a rota/label de volta para algo como "Leads" antes do deploy.
- Confirmar com o time do brain-api: o conteúdo exato de `migrations/versions/
  0012_role_taxonomy.py` e se as rotas `/admin/anamneses`, `/admin/anamneses/{id}`,
  `/admin/metrics` e a remoção de `/admin/inbound` já foram commitadas/deployadas antes de
  liberar este frontend em produção — hoje ambos os repos estão com essas mudanças apenas no
  working tree local.
