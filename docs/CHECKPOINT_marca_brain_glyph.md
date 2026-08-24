# CHECKPOINT — Novo glifo Brain + desmarcação PreCheck do login

**Data:** 2026-08-24 · **Estado:** BUILT e validado localmente · **UNCOMMITTED**

Gates verdes: `tsc --noEmit`, `npm test` (5 arquivos / 130 testes), `npm run build`.
Verificação visual no build estático servido localmente (`/login` e `/dashboard`), tema escuro.

---

## 1. Novo glifo

`app/(site)/_components/BrandGlyph.tsx` trocou de desenho: saiu o quadrado arredondado com 5 nós
ligados, entrou um **cérebro lobulado cuja base desce numa cauda sólida de balão de fala**, com
fissura central, duas dobras laterais e três nós neurais (o único motivo herdado do glifo anterior).
Mesmo export, mesmas props (`size`, `onDark`), mesmo contrato de classes — os **13 call sites deste
repo não mudaram**. Arquivo idêntico ao do `secretarIA-frontend`.

Detalhe que precisa sobreviver a edições futuras do path: a silhueta **fecha embaixo** (o arco
`A9 9` entre os dois pontos da base da cauda) e a cauda é um path **separado, preenchido**, cuja
aresta superior é esse mesmo arco traçado ao contrário. Os dois coincidem exatamente, então a emenda
não aparece. Cauda apenas contornada foi testada: lê como caule, não como balão.

`app/(site)/brand-ds.css`: `.gbg` removido (era o fundo do quadrado), `.gt` adicionado (a cauda,
`fill` **e** `stroke`, para ter o mesmo peso óptico da silhueta).

## 2. Os grupos legados `(SignOut)` e `(SignIn)`

Os dois rodam no CSS portado do PreCheck e **não carregam `brand-ds.css`**, que é de onde as cores do
glifo normalmente vêm. Por isso existe `app/brand-lockup.css` (novo): re-amarra `.gs`/`.gf`/`.gt` aos
tokens que esses grupos definem (`--teal`, `--ink`, `--border-2`, `--font-serif`), tudo escopado sob
`.brain-lockup` para não alcançar uma tela `(site)` nem que o chunk fosse compartilhado. É importado
por `(SignOut)/_shared/AuthShell.tsx` e por `components/DashNav.tsx`.

- **`(SignOut)` — `/login` e `/esqueci_senha/*`:** o wordmark era `Pre<em>Check</em>`. Este login é o
  **portal Brain unificado** (autentica no brain-api e manda pro `/app`), servindo admin, gestor e
  clínicas que só usam secretarIA — a marca do PreCheck nomeava o produto errado para todos eles.
  Agora mostra `[glifo] Brain`.
- **`(SignIn)` — painel clínico legado (`/dashboard`, `/inbound`, `/metrics`, `/summary`, `/users`):**
  esse é o painel do PreCheck, então virou o lockup **"Brain │ PreCheck"**, igual ao que o
  `PortalHeader` do `(site)` já faz. `align-items: baseline` virou `center` na regra `.dash-brand`
  dos 5 CSS de rota, porque a linha agora carrega o glifo e o filete.

## 3. Copy do login que a troca de marca deixou incoerente

Trocar o wordmark deixaria uma logo Brain em cima de "Sua clínica ainda não usa PreCheck?". Como o
`/login` é o portal Brain, o texto foi acertado junto: subtítulo, a chamada abaixo do card, e o
`<title>`/`description` de `(SignOut)/login/layout.tsx` e `(SignOut)/esqueci_senha/layout.tsx`.

## Pendências

- Commit + push + deploy (EasyPanel) — nada disto foi enviado.
- `app/(SignIn)/*` continua sendo o clone legado do painel PreCheck dentro deste repo, com 5 folhas
  de estilo quase idênticas. Não foi tocado além do alinhamento da marca.
