# CHECKPOINT — "Esqueci a senha" agora fala com a brain-api

**Rodada:** 2026-08-14 · **Estado:** BUILT + validado (`tsc --noEmit` limpo, 124 testes
vitest verdes) · **NÃO commitado, NÃO deployado.**

Contrato do backend (endpoints, mecânica do token, anti-enumeração, política de senha):
`brain-api/CONTRACTS.md` §2.6 e `brain-api/docs/CHECKPOINT_password_reset.md`. Este doc
cobre só o lado do portal.

---

## O bug

As 3 telas `app/(SignOut)/esqueci_senha/*` importavam de **`lib/api.ts`**, que é o cliente
da **API do PreCheck** (`NEXT_PUBLIC_API_URL`) — enquanto o `/login` logo acima delas
autentica contra a **brain-api**. Duas identidades diferentes, na mesma tela.

Como a brain-api não tinha nenhum endpoint de reset, e o PreCheck (corretamente) responde
sucesso genérico para e-mail que não existe no banco dele, qualquer clínica nascida de
`/cadastro` — que só existe na brain-api — recebia "enviamos o e-mail" e **nada era
enviado**. Silenciosamente, sem erro em lugar nenhum.

## O que mudou

### `lib/manage-api.ts`
Três funções novas, **CALL SITEs #9-#11**, todas sem token de sessão (endpoints públicos):

- `requestPasswordReset(email)` → `POST /auth/password-reset/request`
- `verifyResetToken(token)` → `POST /auth/password-reset/verify`
- `confirmPasswordReset(token, newPassword)` → `POST /auth/password-reset/confirm`
  (corpo em snake_case: `new_password`)

Nomes **iguais aos que `lib/api.ts` já exportava**, de propósito: assim as telas mudam só
o import. Erros sobem como `ManageApiError` com `.status`, pelo `parseManageResponse`
compartilhado. O ramo de refresh do `manageFetch` é inalcançável aqui (é condicionado a
`token && !NO_REFRESH_PATHS.has(path)`, e estas chamadas nunca passam token), então não
precisou de entrada nova em `NO_REFRESH_PATHS`.

### As 3 telas
Trocaram o import de `@/lib/api` para `@/lib/manage-api`. **Uma mudança a mais foi
necessária**, e ela consertou um bug latente:

> As telas detectavam 429 por `msg.toLowerCase().includes("rate limit")` — o texto do
> SlowAPI, que é o rate limiter do **PreCheck**. A brain-api responde
> `"Too many attempts. Try again in a minute."`, então a checagem simplesmente pararia de
> casar em silêncio; na tela de token, a string em inglês vazaria direto para a UI em
> português. Agora as três usam `err instanceof ManageApiError ? err.status : 0` e
> comparam `status === 429` — idioma já padrão no repo (`PlanCheckoutCta`,
> `convite/page.tsx`, `billing/page.tsx`, `CadastroWizard`).

O ramo de 400 continua igual: a brain-api devolve literalmente
`"Token inválido ou expirado"`, que casa com os fallbacks existentes.

### `lib/api.ts` — **NÃO foi apagado**
Continua sendo usado por `(SignIn)/{dashboard,inbound,users,metrics,summary}` e por
`components/landing/ContactForm.tsx`. Só parou de rotear reset de senha. Verificado após
a mudança: todos os outros consumidores intactos.

### Testes
8 casos novos em `lib/__tests__/manage-api.test.ts` (116 → 124): método/path/corpo de cada
chamada (incluindo o `new_password` snake_case), `Authorization` ausente nas três, 429 no
request, 400 no verify/confirm com a mensagem real do backend, e 422 no confirm com
`detail` no formato de lista do Pydantic.

## Pendências

- [ ] Commit + push + deploy (nada foi commitado).
- [ ] Depende da migração `0014_password_reset` rodar em produção na brain-api — até lá os
      endpoints existem no código mas as colunas não existem no banco.
- [ ] **Decidir para onde `FRONTEND_BASE_URL` da brain-api aponta.** O link do e-mail é
      montado com a mesma env var do link de convite, e o `secretarIA-frontend` também
      serve `/esqueci_senha` agora. Onde ela apontar é onde todo mundo que pede reset cai.
      Mesma decisão já rastreada em `CHECKPOINT_secretary_role.md`.
- [ ] Teste com SMTP real depois do deploy — local só verifica que o e-mail foi disparado
      com o template certo, não que chega.
