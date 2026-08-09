# CHECKPOINT — Header unificada + lockup de produto + renomeações de nomenclatura

Date: 2026-08-08. State: **frontend DONE e validado localmente** (`tsc --noEmit` limpo,
`npm run build` verde, verificação visual em light + dark + largura 502px no dev server).
**NÃO commitado, NÃO deployado.** Mudança 100% brain-frontend — nenhuma alteração em
brain-api (os textos "Anamneses (PreCheck)" que existem lá são docstrings/summaries de
OpenAPI, não copy de tela).

Round scope: quatro mudanças visuais pedidas juntas, todas na chrome das telas de médico.

## 1. Transição Modo médico ⇄ Admin agora é simétrica (botão, não faixa)

Antes: entrar no Modo médico era um **botão** no header do admin; sair era uma **faixa
azul (`.portal-banner`)** atravessando o topo de toda tela `/doctor/*`. Agora as duas
direções são o mesmo botão outline com o mesmo ícone (`swap`), na mesma posição (ao lado
do nome da conta).

- **Novo** `app/(site)/_components/useImpersonation.ts` — lê o marker de impersonation
  (`brain.impersonation`, CONTRACTS §11.4) depois do mount e expõe `exitToAdmin()`.
  Substitui o `useEffect`/`exitDoctorMode` que estava inline no `DoctorLayout`.
- **Novo** `app/(site)/_components/BackToAdminButton.tsx` — renderiza `null` quando não há
  impersonation, então qualquer header de médico pode montá-lo sem condicional. O contexto
  que a faixa explicava ("você está vendo a clínica X como administrador") virou o `title`
  do botão — o nome da clínica já aparece como nome da conta no header.
- `doctor/layout.tsx`: `banner={impersonationBanner}` → `headerActions={<BackToAdminButton />}`.
- `.portal-banner` **continua existindo** e continua em uso pelo `AdminLayout` (`errorBanner`).
  Só deixou de ser usado para estado persistente.
- Ambos os botões tiveram o label envolvido em `<span className="portal-header-btn-label">`,
  que some em `≤700px` (o botão fica icon-only; o `title` mantém o significado). Sem isso o
  header estourava horizontalmente em tela estreita dentro do Modo médico.

## 2. "Anamneses (PreCheck)" → "Anamneses"

- `doctor/layout.tsx` — `DOCTOR_NAV` label + o comentário do bloco.
- `doctor/dashboard/page.tsx` — `QuickLink title`.
- `doctor/anamneses/page.tsx` — subtítulo perdeu o parêntese "(PreCheck)"; a procedência
  agora é comunicada pelo lockup de produto no header (item 4).
- **Não mexido de propósito:** `admin/anamneses/page.tsx` ("Resumos pré-consulta de todas as
  clínicas (PreCheck).") — a aba admin já se chamava só "Anamneses", e o portal admin é
  product-neutral (não tem lockup para carregar a procedência).

## 3. "Configurações" → "Configurações secretarIA" (com o IA estilizado)

- **Novo** `app/(site)/_components/SecretariaWordmark.tsx` + `.css` — `secretar` no serif da
  marca + `IA` itálico em `var(--brand)`. É a **única** fonte dessa estilização; antes ela
  estava duplicada inline dentro de `secretaria/_shared/Header.tsx`'s `Logo()`.
- Aplicado em: `DOCTOR_NAV` (nav lateral), `doctor/dashboard` (`QuickLink`),
  `secretaria/configuracao/page.tsx` (h1, era "Configuração da secretarIA"),
  `doctor/perfil/SecretariaConfigSection.tsx` (título do card, era "Configuração da
  secretaria" — repetido em 4 estados, agora extraído no componente local `CardTitle`) e o
  link "Ir para Configurações secretarIA →" do mesmo card.
- Textos planos (sem JSX possível) passaram a dizer "Configurações secretarIA":
  toasts de `secretaria/agenda/page.tsx` (Google Calendar 422) e `calendar/connected/page.tsx`
  (mensagem de erro + label do botão "Voltar para as Configurações secretarIA").
- **Deixado plano de propósito:** `secretaria/configuracao/components/SideNav.tsx` — aquele
  eyebrow é `text-transform: uppercase`, que destruiria "secretarIA". Virou só
  "Configurações" (era "Configuração"); o nome estilizado está no h1 ao lado.
- "Configuração salva." (toasts de gravação) **não** foi renomeado — descreve a ação de
  salvar, não o nome da tela.

## 4. Uma única Header em toda tela de médico + lockup do produto

O problema: `/secretaria/agenda` e `/secretaria/configuracao` ficam **fora** de
`/doctor/*` e renderizavam a sua própria `secretaria/_shared/Header` (logo secretarIA, sem
Brain, com um dropdown de usuário cujos itens "Meu perfil"/"Notificações" nunca funcionaram).
A chrome mudava visivelmente quando o médico navegava para lá.

Por que não bastou colocar as duas telas dentro do `PortalShell`: elas são um flex column
`height:100vh` com área de scroll interna própria (grid do calendário, save bar sticky).
Dentro do `.portal-body` (grid com `.portal-main { max-width: 1100px }` e scroll de
documento) o calendário e a save bar quebram.

Solução — extrair só o header:

- **Novo** `app/(site)/_components/PortalHeader.tsx` — o header saiu de `PortalShell.tsx`
  para cá; `PortalShell` agora o consome. Ganhou `product?` e `sticky?` (as telas 100vh
  passam `sticky={false}`, que aplica `.portal-header--flow`: `position: relative` +
  `flex-shrink: 0`).
- **Novo** `app/(site)/_components/ProductLockup.tsx` + `.css` — a marca do produto, depois
  da marca Brain, separada por um fio (`border-left`). A marca Brain **não muda**; o lockup
  só é adicionado. Lê-se "Brain │ secretarIA" / "Brain │ PreCheck".
- **Novo** `app/(site)/_components/PreCheckWordmark.tsx` + `.css` — espelha o `.dash-brand`
  do próprio PreCheck (`PreCheck/frontend/components/DashNav.tsx`): bitmap + `Pre` +
  `Check` itálico. O `em` usa `var(--brand)` e não o navy do PreCheck — navy não passa
  contraste no tema escuro, e o bitmap já carrega a identidade navy.
- **Novo asset** `public/brand/precheck-logo.png` (copiado de
  `PreCheck/frontend/public/brand/`). Primeiro arquivo em `public/` deste projeto — o
  `Dockerfile` faz `COPY . .` e o static export publica `out/brand/precheck-logo.png`
  (verificado).
- As duas telas secretarIA agora renderizam `PortalHeader` com `product="secretaria"` +
  `<BackToAdminButton />`. Consequência: o `theme`/`onToggleTheme` local delas virou código
  morto (o `ThemeToggle` do header cuida disso, mesma chave `precheck_theme`) e foi removido;
  o logout passou a ser o mesmo `signOut` das outras telas.
- **`app/(site)/secretaria/_shared/Header.tsx` foi DELETADO** (`git rm`) — ficou sem nenhum
  importador. Recuperável pelo histórico se preciso.

### Mapeamento tela → lockup

Derivado de `DOCTOR_NAV.product` (a nav já sabia qual produto sustenta cada rota) pela
função `productForPath` em `doctor/layout.tsx` — não existe uma segunda tabela:

| Tela | Lockup |
| --- | --- |
| `/doctor/dashboard` (não está na nav) | nenhum |
| `/doctor/perfil` (`product: null`) | nenhum |
| `/doctor/anamneses` | PreCheck |
| `/doctor/pacientes` | secretarIA |
| `/secretaria/agenda`, `/secretaria/configuracao` | secretarIA (passado direto) |
| todo `/admin/*` | nenhum (portal product-neutral) |

### Decisão de layout a confirmar com o usuário

O pedido dizia tanto "mantenha a Header igual … com a logo da Brain **como está**, apenas
**adicione** … suas respectivas logos" quanto "terá secretarIA — estilizado — **By** logo
brain 'BRAIN'". Implementado como **Brain primeiro, produto depois do fio** — a única leitura
que mantém a marca Brain intacta no canto onde já estava. A relação "by Brain" fica implícita
na ordem (e explícita no `aria-label` do lockup). Se o usuário quiser literalmente
`secretarIA by [Brain]`, é só inverter a ordem dentro de `.portal-brand-row`.

## Outros ajustes de layout

- `PortalShell.css`: `.portal-body` grid `232px → 250px`. "Configurações secretarIA" precisa
  de ~163px de largura de texto e quebrava em duas linhas com 232px.
- Nova media query `≤700px`: esconde o pill `.portal-label` (ADMIN/CLÍNICA) **antes** do
  lockup — o lockup é a identidade da tela — reduz padding do header e colapsa os labels
  dos botões de troca de modo.
- `PortalNavItem.label` e `QuickLink.title` passaram de `string` para `ReactNode` (para
  embutir o wordmark). O texto acessível do DOM continua "Configurações secretarIA", então
  não precisou de `aria-label` extra.

## Validação feita

- `.\node_modules\.bin\tsc.cmd --noEmit` limpo (lembrete: `npx tsc` é um pacote pegadinha
  nesta máquina).
- `npm run build` verde, 34 rotas exportadas, `out/brand/precheck-logo.png` presente.
- Dev server (`--port 3111`, caminho com `C:` maiúsculo — ver memória
  `brain-frontend-build-casing`) + Chrome:
  - `/secretaria/configuracao` e `/secretaria/agenda` (logged out, demo): header Brain +
    lockup secretarIA, h1 "Configurações secretarIA", layout 100vh intacto.
  - `/doctor/anamneses`, `/doctor/pacientes`, `/doctor/perfil`, `/doctor/dashboard` com
    sessão injetada via `sessionStorage` (`brain.session` + `brain.impersonation`): lockup
    correto por rota, "Voltar ao admin" no header entre o nome da conta e "Sair", **nenhum**
    `.portal-banner` no DOM, nav em uma linha (44px por item), light **e** dark.
  - `/admin/dashboard`: sem lockup, "Modo médico" intacto.
  - 502px de viewport: sem overflow horizontal (`scrollWidth == innerWidth`), pill escondido,
    botão de modo icon-only, sidebar colapsada em linha rolável.

## Pendências

1. Commitar e deployar (nada foi commitado nesta sessão).
2. Verificar as telas com dados reais: `/doctor/dashboard` (cards `QuickLink`) e o card
   "Configurações secretarIA" de `/doctor/perfil` só renderizam com `/doctor/me` e o hub
   respondendo — localmente a sessão era falsa, então caíram nos estados de erro. A
   renomeação em si é estática (typecheck + build cobrem), mas o visual dos cards não foi
   visto.
3. Confirmar com o usuário a ordem do lockup (seção "Decisão de layout" acima).
