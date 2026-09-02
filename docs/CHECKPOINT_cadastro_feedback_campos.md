# CHECKPOINT — feedback de campo obrigatório no /cadastro (+ `.btn:disabled` no DS)

> Correção de bug, 2026-09-01. Origem: o Lucas testando o funil de aquisição — clicou
> "Continuar" com o WhatsApp em branco, **nada aconteceu e nada avisou**, e ele concluiu
> que o campo era opcional. Só passou pro pagamento depois de inventar um número.
> **NO AR em 2026-09-02** (`6b339b5`). Conferido em produção: clicar "Continuar" com o form
> vazio devolve `Preencha "Seu nome" para continuar.` e foca o campo.
>
> Foi ao ar junto do `22c74c4` (sessão em cookie first-party, fase 3 de 3), que estava parado
> no `main`. **Ordem obrigatória, e ela quase foi invertida:** o `brain-api` (fase 1) precisa
> ir ANTES — o frontend novo manda `POST /auth/refresh` **sem corpo** e parou de ler
> `refresh_token` da resposta, então contra a API antiga (que exigia o token no body) todo
> usuário seria deslogado na primeira renovação. Deploy feito na ordem certa em 2026-09-02.
> O `secretarIA-frontend` (fase 2) é IRMÃO desta fase, não predecessor: segue na origem antiga,
> sem alteração, porque o CORS não foi tocado e a perna do corpo continua viva.

## 1. O que estava acontecendo (três coisas somadas)

| # | Causa | Onde |
|---|---|---|
| 1 | Botão "Continuar" era `disabled` enquanto faltasse qualquer campo. Botão desabilitado **não dispara evento de clique** — o clique não fazia literalmente nada. | `ContactStep.tsx`, `nextDisabled={!basicsFilled \|\| submitting}` |
| 2 | O form é `noValidate`, então o balão nativo do navegador ("preencha este campo") **nunca aparece**. Não havia nenhuma validação própria cobrindo os campos obrigatórios — só a de senha. | `ContactStep.tsx`, `<form onSubmit={handleSubmit} noValidate>` |
| 3 | **O botão desabilitado parecia ativo**: cor cheia da marca, `opacity: 1`, `cursor: pointer`. Zero sinal visual. | `brand-ds.css` — ver §3 |

Nenhum campo é marcado como obrigatório ou opcional em lugar nenhum da tela (sem asterisco,
sem "obrigatório", sem "opcional"), e **os 6 são obrigatórios**. Ou seja: o visitante clicava
num botão que parecia clicável, não acontecia nada, e nada dizia qual campo era o culpado.

## 2. O que entrou

- **`ContactStep.tsx`** — o botão ficou **sempre clicável** (`nextDisabled={submitting}`), e o
  `handleSubmit` passou a checar `input:invalid` antes da regra de senha: nomeia o campo pelo
  próprio `<label>`, mostra `Preencha "<campo>" para continuar.` no parágrafo `role="alert"` que
  já existia, e move o **foco** pra ele. Usa `validity.valueMissing` pra separar "vazio" de
  "formato errado" (e-mail malformado vira `Confira o campo "<campo>"`).
  A constante `basicsFilled` saiu — não tinha mais uso.
- **`brand-ds.css`** — ver §3.

## 3. O buraco do design system (era maior que o bug relatado)

O DS tinha **só** `.btn--danger:disabled`. Não havia `.btn:disabled` nem `.btn--primary:disabled`.
Consequência: **todo botão primário desabilitado do site inteiro** — não só o do cadastro —
renderizava com a cor cheia da marca, opacidade total e cursor de mãozinha, indistinguível de um
ativo. (`globals.css` tem `.btn-primary:disabled`, mas essa é outra classe, com hífen simples;
não se aplica aos botões `.btn .btn--primary` do DS.)

Entrou `.btn:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none;filter:none}`,
e os `:hover` das variantes (`--primary`, `--dark`, `--outline`, `--ghost`, `--danger`) ganharam
`:not(:disabled)` — convenção que o repo já usava em `globals.css`
(`.page-nav-btn:hover:not(:disabled)`). `.btn--danger:disabled` continua com a opacidade .6 dele,
que é mais específica.

## 4. Decisão pendente — o telefone continua OBRIGATÓRIO

O Lucas queria o telefone opcional. **Não entrou nesta rodada** (escolha dele: consertar só o
feedback agora). Ele é obrigatório na cadeia inteira, então afrouxar exige 3 mudanças coordenadas:

| Camada | Estado hoje | Arquivo |
|---|---|---|
| Form | `required` no input `tel` | `ContactStep.tsx` |
| API | `whatsapp_phone: str = Field(min_length=1, max_length=32)` | brain-api `schemas/signup.py` |
| Banco | coluna `NOT NULL` | brain-api `migrations/versions/0006_signup_intents.py` |

**O que o número alimenta hoje, rastreado ponta a ponta:** `SignupIntent.whatsapp_phone` →
`onboarding_sync.py` (`doctor_phone=intent.whatsapp_phone`) → PreCheck `POST /internal/provision`.
No PreCheck ele é **opcional** (`doctor_phone: str | None`), vira `clinics.doctor_phone`, os
workflows de laudo dão SELECT nele, ele viaja no `reportBody`, o backend ecoa de volta — **e
nenhum nó do n8n manda nada pra ele**. Hoje é metadado morto no pipeline.

⚠️ O comentário em `signup.py` (por que não se usa `phone_number_collection` do Stripe) diz que o
número "is where every downstream consumer reads it from anyway". Existe **um** consumidor
downstream, e ele não usa o dado. A frase está desatualizada.

## 5. Validação

`npx tsc --noEmit` limpo · `npm test` **149/149** · `npm run build` ok · conferido ao vivo em
`localhost:3000/cadastro`: com o form vazio o clique devolve `Preencha "Seu nome" para continuar.`
e foca o campo; com nome/clínica/e-mail preenchidos e o WhatsApp em branco — **o cenário exato do
relato** — devolve `Preencha "WhatsApp da clínica" para continuar.` e foca o telefone. Nenhum
submit dispara (nenhuma conta criada). O botão desabilitado agora renderiza visivelmente apagado.
