# CHECKPOINT — escolha de plano no /cadastro

> 2026-09-02, `c7fc940`. Origem: o Lucas testando o funil — "atualmente tá indo pro plano
> base automaticamente, sem escolha". **Commitado e validado; NÃO deployado ainda.**

## 1. O que estava acontecendo

O wizard tratava o plano do link como **decidido**. Quem chegava pela vitrine do PreCheck
assinava o Basic sem nunca saber que existia outra faixa: `checkoutHref` em
`PreCheck/frontend/app/(SignOut)/comecar/page.tsx` monta **todo** link com
`plan=precheck_basic` fixo, para as 30 especialidades.

O Advanced existe, é comprável, tem preço e Stripe Price — e só era alcançável por quem
entrasse pelo `/#planos` do Brain e clicasse no card certo. Ou seja: o caminho de aquisição
principal do produto nunca mostrava metade do catálogo.

## 2. O que entrou

Um passo `plan`, **primeiro card do wizard**, com as duas faixas lado a lado (nome, preço,
tagline e bullets) e a do link já marcada.

| Arquivo | O quê |
|---|---|
| `cadastro/_components/PlanStep.tsx` | novo — os cartões de rádio |
| `cadastro/lib/plans.ts` | `planChoices()`, `PlanChoice`, `PLAN_FAMILIES` |
| `cadastro/lib/types.ts` | `"plan"` no `StepId` |
| `cadastro/_components/CadastroWizard.tsx` | plano vira **estado**; passo inicial condicional; progresso 0..9 |
| `cadastro/_components/ContactStep.tsx` | `onBack` opcional |
| `cadastro/cadastro.css` | `.cad-plan-*` |
| `_lib/pricing.ts` + `page.tsx` | `features` sai do JSX e passa a viver no pricing |

## 3. As três decisões que não são estéticas

**Por que ANTES do ContactStep.** O plano viaja no POST que **cria a conta**
(`POST /public/signup-intents`), e `PATCH /public/signup-intents/{id}` recusa trocá-lo com
`plan_change_not_allowed` (brain-api `services/signup.py::update_intent_catalog` — add-on é
mutável, plano não). Este é o **último instante** em que a escolha é reversível sem apagar a
conta. Não é preferência de UX: depois do primeiro card não existe caminho de troca.

**Por que o "Voltar" do ContactStep some depois do registro.** `onBack` chega `undefined`
quando `intentId` está setado. Um "Voltar" que reabrisse a escolha ofereceria uma decisão
que o backend recusaria — o erro apareceria só lá na frente, sem explicação.

**Por que o passo se apaga sozinho.** `planChoices` devolve `[]` para família desconhecida ou
de uma faixa só (secretarIA tem um plano comprável), e o wizard abre direto no `ContactStep`.
Uma lista de um item não é uma decisão, é um obstáculo.

Detalhe que o teste trava: um add-on vindo no `?catalog=` é **herdado** por toda alternativa
em vez de descartado na troca de faixa — seria uma cobrança a menos que ninguém veria.
Nenhuma família com escolha oferece add-on hoje; o teste existe para o dia em que oferecer.

## 4. ⚠️ Divergência de quota — NÃO resolvida aqui

Os bullets dizem **50** (Basic) e **150** (Advanced) pré-consultas por mês. O que a produção
**realmente concede** hoje, medido no container em 2026-09-02:

```
PRECHECK_BASIC_CONSULTATIONS_PER_MONTH=100
PRECHECK_ADVANCED_CONSULTATIONS_PER_MONTH=300
```

**O dobro do anunciado, nas duas faixas.** O comentário em `_lib/pricing.ts` já previa
exatamente isso ("a card promising 50 while the backend grants 100 is a silent giveaway") —
o que faltava era alguém medir o env deployado.

Esta rodada **não mexeu em nenhum dos dois lados**: qual número é o certo é decisão comercial
do Lucas, não do código. O passo de plano lê os bullets de `_lib/pricing.ts`, então **um
único edit ali acerta a vitrine e o wizard juntos** — e, se a resposta for o contrário, o
ajuste é no env do serviço `secretaria_brain-api` no EasyPanel.

Enquanto não se decide, vitrine e wizard mentem **a mesma coisa** — o que é ruim, mas não é
uma inconsistência nova entre telas.

## 5. Validação

`npx tsc --noEmit` limpo · `npm test` **157 passed** (9 novos em
`cadastro/lib/__tests__/plans.test.ts`) · `npm run build` ok.

Ao vivo em `localhost:3100` com o link real da vitrine
(`/cadastro/?plan=precheck_basic&precheck_template_slug=cardiologia`): o passo abre com o
Basic marcado; escolher Advanced e continuar leva a tag do card seguinte para "PreCheck
Advanced · Cota mensal maior…" mesmo com `plan=precheck_basic` na URL; o "Voltar" preserva a
escolha.

⚠️ Como no resto do wizard, **nada disto aparece em `curl`**: o export estático pré-renderiza
só o fallback do Suspense, e o passo depende de `useSearchParams`. Conferir no navegador.

## 6. Pendências

- **Deploy.** Commitado, não deployado — ver §4 antes de subir, porque o deploy publica os
  números 50/150 num segundo lugar.
- A vitrine do PreCheck (`/comecar`) segue mandando `plan=precheck_basic` em todo link. Isso
  agora é só **pré-seleção**, e está certo assim — mas se um dia ela passar a mostrar preço,
  os dois lados têm de contar a mesma história.
