# CHECKPOINT — Fontes self-hosted via `next/font/google` (LGPD)

**Estado:** BUILT e VERIFICADO em 2026-08-31 num Chrome real, contra o `out/` deste build
servido localmente. Gates verdes: `tsc --noEmit` limpo, **154 testes** (7 arquivos),
`npm run build` OK. **NÃO commitado, NÃO deployado.**

Prompt de origem: `z_prompts/PROMPT_AUDIT_FRONTEND_FONTES_LGPD_BRAIN_FRONTEND.md`. Gêmeo da
mesma correção já feita no `secretarIA-frontend`
(`secretarIA-frontend/docs/CHECKPOINT_fontes_self_hosted.md`, prompt
`PROMPT_AUDIT_FRONTEND_FONTES_LGPD.md`), que foi clonado deste repo em 2026-08-14 e levou o
`<link>` junto.

A tabela de diferenças do prompt foi conferida contra o código e está correta, com **um
ajuste**: os 20 tokens vivem em **9** arquivos de `app/`, não 10. O décimo arquivo com
definição literal é `_design-source/assets/brand-ds.css`, que não é buildado (ver seção 2).

---

## 1. O que estava errado

`app/layout.tsx` carregava um stylesheet de terceiro no layout **raiz** — o único do App
Router, que engloba **todos** os route groups deste repo: `(SignIn)`, `(SignOut)`, `(site)`
e `precheck/`.

```tsx
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
<link href={FONTS_HREF} rel="stylesheet" />   // 7 famílias, display=swap
```

Dois efeitos, e o segundo é o que pesa:

1. **Render-blocking.** Um `<link rel="stylesheet">` de terceiro bloqueia a renderização de
   toda página, atrás de DNS + TLS + HTTP para `fonts.googleapis.com` e depois de novo para
   `fonts.gstatic.com`.
2. **O IP do visitante ia para o Google em toda visita**, sem nenhum gate de consentimento
   antes do `<link>` — inclusive na `/` e na `/precheck` públicas, antes de qualquer login.
   Num produto de saúde o visitante pode ser paciente. É o raciocínio que já gerou multas
   sob GDPR na Europa por Google Fonts hospedado no Google.

Medido no build pré-correção, em contexto limpo: as 4 rotas testadas (`/`, `/login/`,
`/precheck/`, `/dashboard/`) fazem a requisição a `fonts.googleapis.com`. As duas primeiras
são públicas.

## 2. Onde este repo difere do `secretarIA-frontend`

| | secretarIA-frontend | brain-frontend (aqui) |
| --- | --- | --- |
| Tokens de fonte | 6 definições, 3 arquivos | **20 definições, 9 arquivos** |
| JetBrains Mono | peso morto — removida | **usada de verdade — mantida** |
| Route groups | `(auth)`, `(site)` | `(SignIn)`, `(SignOut)`, `(site)`, `precheck/`, + `app/landing.css` na raiz |
| Next | 15.5.24 | **15.1.6** |
| CSP no `nginx.conf` | libera as 2 origens do Google | **não tem CSP nenhuma** — nada a limpar |

Três consequências que valem registrar:

- **JetBrains Mono está viva aqui.** `--font-mono` existe em `summary.css` e `landing.css`,
  e é usada em `.sec-num`, `.antro-row .k`, `.feat-summary-row .tag` e `.footer-bottom .cnpj`.
  Confirmado em runtime: a `/precheck/` realmente baixa o arquivo. Removê-la, como foi certo
  fazer no repo irmão, seria regressão aqui.
- **O mesmo nome de token mapeia famílias diferentes por route group.** `--font-serif` é
  Instrument Serif em `(SignIn)`/`(SignOut)`/landing e **Newsreader** em `(site)`. Por isso
  as variáveis novas são nomeadas **por família** (`--font-instrument-serif`,
  `--font-newsreader`), nunca por papel.
- **`_design-source/assets/brand-ds.css` tem mais 2 definições literais** e foi deixado
  intacto de propósito: é material de referência, não é importado por nada em `app/` e não
  entra no `out/`. Um grep no repo inteiro acha 22 definições; as que importam são 20.

## 3. A correção

`next/font/google` baixa as fontes **no build** e as emite em `_next/static/media/`
(32 arquivos `.woff2`, cerca de 1,1 MB), servidas pelo mesmo nginx. Zero requisição a
terceiro em runtime, zero IP vazado. Funciona com `output: "export"`.

As 7 famílias são declaradas em `app/layout.tsx`, uma variável por família, e as classes vão
no **`<html>`** — não no `<body>`: dois dos blocos de token (`app/globals.css` e
`app/(site)/brand-ds.css`) vivem em `:root`, que **é** o `<html>`, e não enxergariam uma
variável declarada um nível abaixo. Os outros sete blocos são wrappers de rota
(`.dash-route`, `.inbound-route`, `.metrics-route`, `.patient-route`, `.users-route`,
`main.login-page`, `#landing-view`) e herdam normalmente.

As 20 definições passaram a apontar para as variáveis:

```css
/* antes */  --font-ui:    'Inter', system-ui, -apple-system, sans-serif;
/* depois */ --font-ui:    var(--font-inter), system-ui, -apple-system, sans-serif;
```

Substituição mecânica: nenhuma regra mudou de lugar. Arquivos tocados — `app/layout.tsx`,
`app/globals.css`, `app/landing.css`, `app/(site)/brand-ds.css`,
`app/(SignOut)/_shared/auth-shell.css` e os 5 de `(SignIn)`
(`dashboard`/`inbound`/`metrics`/`summary`/`users`).

**Um caso que não é definição de token:** `app/globals.css` `.topbar-brand` usava
`var(--font-serif, 'Instrument Serif', Georgia, serif)` — o literal estava no *fallback* do
`var()`. `--font-serif` não é definido no `:root` do `globals.css` (só nos wrappers de rota),
então esse fallback é usado de verdade em qualquer `.topbar-brand` fora de um wrapper. Ficou
`var(--font-serif, var(--font-instrument-serif), Georgia, serif)`; sem isso a marca cairia em
Georgia silenciosamente.

### Pesos, itálicos e eixos

`weight` foi deixado **sem especificar** nas famílias variáveis — vem o eixo inteiro num
arquivo por estilo, superconjunto do que a URL pedia.

| Família | URL antiga pedia | `next/font` entrega |
| --- | --- | --- |
| Space Grotesk | 400/500/600/700 | 300–700 variável |
| DM Sans | 300/400/500/600 (+`opsz` 9–40) | 100–1000 variável (+`opsz`) |
| Instrument Serif | 400, normal + itálico | 400, normal + itálico (**não é variável**) |
| Inter | 400/500/600/700 | 100–900 variável |
| JetBrains Mono | 400/500 | 100–800 variável |
| Newsreader | 400/500/600, normal + itálico (+`opsz` 6–72) | 200–800 variável, ambos (+`opsz`) |
| Hanken Grotesk | 400/500/600/700 | 100–900 variável |

`axes: ["opsz"]` foi mantido em DM Sans e Newsreader porque a URL antiga pedia `opsz`; sem
isso o corpo de texto perderia o ajuste óptico. `style: ["normal","italic"]` só em Instrument
Serif e Newsreader, exatamente as duas que a URL pedia com `ital` — e as duas têm uso real
(o itálico das duas foi observado carregando em runtime). As outras cinco não tinham arquivo
itálico antes e continuam sem: o itálico delas segue sintetizado, igual a hoje.

`display: "swap"` espelha o `&display=swap` antigo. O fallback com métricas ajustadas do
`next/font` (`Inter Fallback` etc.) fica ligado, então o `swap` não gera layout shift.

### A ÚNICA mudança visual: JetBrains Mono @ 600

O superconjunto de pesos tem uma consequência real, encontrada por auditoria de regra CSS e
confirmada em runtime nas 8 rotas varridas. Duas regras pedem **`font-weight: 600` em
JetBrains Mono**, peso que a URL antiga (`400;500`) nunca entregou:

- `.feat-summary-row .tag` (`app/landing.css`) — os selos tipo "ATIVOS" na `/precheck/`, 3 na tela
- `.patient-route .antro-row .k` (`app/(SignIn)/summary/summary.css`) — rótulos de antropometria

**Antes:** o browser caía no 500 e aplicava **negrito sintético** por cima.
**Depois:** vem o 600 de verdade, visivelmente mais leve e mais limpo que o sintético.

É a única diferença de renderização em todo o app — nas 8 rotas varridas (`/`, `/precheck/`,
`/login/`, `/cadastro/`, `/convite/`, `/checkout/sucesso/`, `/dashboard/`, `/esqueci_senha/`)
nenhum outro elemento resolve para um par (família, peso) que a URL antiga não servisse.
Foi **mantido** porque passa a renderizar o peso que o próprio CSS pede. Para voltar ao
visual sintético anterior basta pinar a família em `app/layout.tsx`:

```ts
const jetbrainsMono = JetBrains_Mono({ ..., weight: ["400", "500"] });
```

### `preload: false` é deliberado

As fontes são declaradas no layout **raiz**, então valem para toda rota. Com `preload`
ligado, toda página pré-carregaria também os arquivos dos design systems que ela **não** usa —
e aqui são dois sistemas que nunca dividem rota. Desligado, o browser busca uma família só
quando alguma regra realmente casa. Medido em Chrome, **contexto isolado**, a partir do `out/`:

| Rota | Design system | Arquivos de fonte buscados |
| --- | --- | --- |
| `/` | brand-ds (site) | **3** — Newsreader normal + itálico, Hanken Grotesk |
| `/login/` | auth shell (SignOut) | **4** — Inter, Instrument Serif normal + itálico, DM Sans |
| `/dashboard/` | PreCheck app (SignIn) | **3** — Inter, Instrument Serif normal + itálico |
| `/precheck/` | landing.css | **5** — os 4 acima + JetBrains Mono |

Nenhuma rota busca as 7. Space Grotesk (`--font-title`) não foi buscada em nenhuma das 4:
o token existe, mas nenhum elemento visível dessas telas o usa.

---

## 4. Como foi provado

Chrome real (headless, perfil novo por medição) carregando o `out/` servido em `127.0.0.1`:

- `performance.getEntriesByType('resource')` filtrado por origem externa volta **vazio** nas
  4 telas. A única exceção é `/dashboard/`, que chama a **própria API do PreCheck**
  (`/summaries`) — requisição de produto, depois do login, que já existia antes; nenhuma
  fonte, nenhum terceiro.
- No build **pré-correção**, as mesmas 4 telas fazem a requisição a `fonts.googleapis.com`.
  A comparação foi feita contra um `git worktree` do HEAD, com os mesmos `.env`.
- Nenhum `*.html` do `out/` cita host externo algum.
- `document.fonts` após `fonts.ready` e `getComputedStyle` dos tokens conferidos em **uma
  tela de cada design system** mais a landing. Todos resolvem, ex.:
  `--font-serif` vira `"Newsreader","Newsreader Fallback",Georgia,…` na `/`;
  `--font-mono` vira `"JetBrains Mono","JetBrains Mono Fallback",ui-monospace,…` na `/precheck/`.
- **Diff de pixel** antes x depois (viewport 1440x900, decodificado no próprio Chrome):

  | Rota | pixels diferentes | com delta > 32 |
  | --- | --- | --- |
  | `/` | 128 (0,010%) | **0** |
  | `/login/` | 3735 (0,288%) | 1477 |
  | `/dashboard/` | 3980 (0,307%) | 878 |
  | `/precheck/` | 7810 (0,603%) | 1371 |

  As regiões com diferença forte foram recortadas e olhadas lado a lado: tipo, peso, itálico,
  quebra de linha e posição são idênticos. O que sobra é rasterização de borda de glifo entre
  a instância estática e a instância variável do mesmo desenho — invisível a olho nu.

### Armadilha de medição (herdada do repo irmão, confirmada aqui)

Navegar de uma rota para outra na **mesma aba** mostra as fontes da rota anterior sendo
revalidadas, e leva à conclusão errada de que a rota carrega fonte demais. Todas as medições
acima usam um perfil de Chrome novo por rota.

### Nota sobre o grep por `fonts.googleapis.com` no `out/`

No repo irmão esse grep volta **vazio**. Aqui ele volta **2 chunks** — e isso é esperado,
não é resíduo da correção:

```
out/_next/static/chunks/6218.*.js
out/_next/static/chunks/pages/_error-*.js
```

Os dois contêm o mesmo literal, que vive em
`node_modules/next/dist/shared/lib/head.js`: é a lista de URLs do próprio Next para a
otimização de fonte legada (`__NEXT_OPTIMIZE_FONTS`), embutida no chunk do `pages/_error`.
Não é código nosso e nunca dispara — o app não renderiza `<link>` nenhum para casar. O Next
15.5.24 do repo irmão já não traz esse caminho; o **15.1.6** daqui ainda traz. **O critério
válido é o runtime** (lista de recursos externos vazia) e o HTML exportado, não esse grep.

### Guarda de regressão

`app/__tests__/no-third-party-resources.test.ts` (5 testes) afirma sobre o **fonte**: o
`app/layout.tsx` não cita host externo algum, não declara `<link>` nem `<script src>`, e
importa de `next/font/google`; e nenhum token `--font-*` em `app/**/*.css` nomeia família
literalmente. Existe porque a regressão é invisível de dentro do app: repor o `<link>` não
quebra nada, renderiza igual, e o único sinal seria a aba de rede. A guarda de host é de
propósito mais ampla que "Google" — analytics, pixel e chat widget são o mesmo problema
nestas telas públicas.

Verificado que ela **falha** contra o código pré-correção, não só que passa no atual: rodada
contra o worktree do HEAD, quebra nos 4 aspectos e acusa exatamente **20** tokens literais.

---

## 5. Pendências

- **Commit e deploy.** O build roda dentro do `Dockerfile` (`RUN npm run build`), então a
  correção só chega em produção depois de um **rebuild da imagem**.
- **O build agora precisa de rede para `fonts.gstatic.com`** — em build time, dentro do
  container, não no browser do visitante. O `npm ci` do mesmo stage já exige rede, então na
  prática não muda nada; só fica registrado que um build 100% offline passaria a falhar.
- **`nginx.conf` não foi tocado** (fora de escopo, e aqui não há CSP citando o Google —
  ao contrário do repo irmão, não sobra permissão morta). O hardening deste repo continua
  pendente: skill `static-export-nginx-hardening`.
- **Decisão em aberto para o dono do produto:** manter o JetBrains Mono 600 real (atual) ou
  pinar em `["400","500"]` para reproduzir o negrito sintético antigo. Ver a seção 3.
