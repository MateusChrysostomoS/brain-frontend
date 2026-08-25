# CHECKPOINT — Novo glifo Brain + desmarcação PreCheck do login

**Data:** 2026-08-24, glifo revisto em 2026-08-25 · **Estado:** BUILT e validado localmente

O grosso foi commitado em `09ca730`; a troca do desenho pela logo vetorizada em `54c81c9` e o
favicon em `d60b559`. Este doc estava descrevendo o desenho antigo — foi atualizado junto com a
correção do glifo preto descrita na seção 2.

Gates verdes: `tsc --noEmit`, `npm test` (5 arquivos / 130 testes), `npm run build`.
Verificação visual no build estático servido localmente (`/login` e `/dashboard`), tema escuro.

---

## 1. O glifo é a logo real

`app/(site)/_components/BrandGlyph.tsx` serve **a logo da marca**, vetorizada do arquivo original
(`brand-src/brain-logo-original.png`, versionado junto). O que existia antes era uma reconstrução à
mão — arcos escritos um a um tentando lembrar a forma, porque o arquivo não estava disponível. Não
saía a logo: a silhueta, os sulcos e o rabo do balão eram outros. Mesmo `viewBox 32×32` e mesma prop
`size`, então os **13 call sites deste repo não mudaram**. Arquivo idêntico ao do
`secretarIA-frontend`.

A arte ocupa **94%** da caixa (o desenho antigo ocupava 78): a logo real tem traço cheio e, na mesma
fração, lia como menor que o wordmark ao lado. `fillRule="evenodd"` não é decorativo — são 10
contornos, e os vazios entre os sulcos só ficam vazados por causa dele.

**Como regerar:** traçar o PNG com potrace, com três cuidados anotados no componente — máscara pela
*distância ao branco* (o arquivo vem com fundo branco OPACO, o alpha é 255 inteiro); máscara
**invertida** (no `potracer` `False` é tinta, então passar direta vetoriza o fundo e devolve a logo em
negativo); e um blur gaussiano ~3 antes de traçar, sem o qual o potrace segue cada degrau da serrilha
e o path vai a ~70 KB em vez de 8, sem ganho visual.

**Cor:** a logo é uma forma só, então as três classes que dividiam o desenho antigo (`.gs` stroke,
`.gt` cauda, `.gf` nós) deram lugar a `.gl`. E ela **deixa de seguir o `--brand`/`--teal`** do design
system: a marca tem verde próprio, `#45965d`, com `#5cb87a` no escuro — o verde cheio tem contraste
~3:1 sobre o fundo e some quando o glifo cai para 20px.

## 2. Os grupos legados `(SignOut)` e `(SignIn)`

Os dois rodam no CSS portado do PreCheck e **não carregam `brand-ds.css`** — que é de onde a cor do
glifo vem, já que essa folha só é importada por `(site)/layout.tsx`. Por isso existe
`app/brand-lockup.css`: além do layout do lockup, ele **repete o `fill` de `.gl`** nos mesmos dois
tons de `brand-ds.css`, escopado sob `.brain-lockup` para não alcançar uma tela `(site)` nem que o
chunk fosse compartilhado. É importado por `(SignOut)/_shared/AuthShell.tsx` e por
`components/DashNav.tsx`.

> **Regressão de 2026-08-25, corrigida no mesmo dia.** Ao trocar o desenho pela logo vetorizada, o
> commit `54c81c9` removeu daqui os overrides de cor com a justificativa de que a marca tem verde
> próprio em `brand-ds.css` — verdadeira, mas essa folha não chega nestes dois grupos. Um `<path>`
> sem nenhum `fill` pintado **não fica sem cor: fica PRETO**, e como o tema padrão de `(SignOut)` e
> `(SignIn)` é o escuro (`lib/theme.ts` cai em `dark`), a marca virou um borrão preto no navy do
> `/login` e do DashNav — sem erro no console e sem quebrar build nenhum. A lição é geral: quando o
> único lugar que pinta um elemento é uma folha *route-scoped*, tirar o override "redundante" de fora
> dela não cai num default seguro.

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
