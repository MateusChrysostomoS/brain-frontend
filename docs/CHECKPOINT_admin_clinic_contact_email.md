# CHECKPOINT: card "E-mail da clínica" em `/admin/tenants?id=…`

Contrato HTTP (brain-api, construído em paralelo por outra sessão; a secretarIA guarda o valor):

- `GET   /admin/tenants/{tenant_id}/contact-email` → `{"tenant_id", "contact_email": string|null}`
- `PATCH /admin/tenants/{tenant_id}/contact-email`, corpo `{"contact_email": string|null}` (`null`
  limpa) → mesma forma.
- Erros: 404 `secretaria_tenant_not_found` (clínica sem registro na secretarIA, ex.: só PreCheck),
  404 `Tenant not found`, 422 `invalid_contact_email`, 502 `secretaria_unavailable`; 401/403 pela
  infraestrutura de auth já existente.

**Estado (2026-11-04): LOCAL, sem commit, sem push, não deployado.** Provado no navegador só contra um
mock do contrato (o brain-api real ainda não tem a rota). **Ordem de deploy: secretarIA → brain-api →
este frontend.** Com o brain-api antigo, o card mostra o erro genérico de carga com "Tentar de novo".

## O que entrou

- `lib/manage-api.ts`: `getTenantContactEmail(session, tenantId)`, `patchTenantContactEmail(session,
  tenantId, email | null)` e o tipo `TenantContactEmail`. Mesmo padrão dos vizinhos (`manageFetch` com o
  bearer da sessão; `ManageApiError.message` = `detail` do servidor). O corpo do PATCH é exatamente
  `{contact_email}`; `null` vai como JSON `null`, nunca omitido.
- `app/(site)/admin/tenants/lib/contact-email.ts`: lógica pura (o vitest daqui roda em `node`, sem
  jsdom). `parseContactEmailInput` (trim + minúsculas; vazio = limpar; forma de e-mail, até 254
  caracteres), `contactEmailChanged` (habilita/desabilita "Salvar e-mail"; rascunho inválido conta como
  alterado para o erro aparecer no envio), `describeCurrentContactEmail`, `describeContactEmailSaved`
  ("E-mail salvo" / "E-mail removido"), `isSecretariaRecordMissing`, `describeContactEmailError` e
  `describeContactEmailLoadError`. O servidor continua sendo a autoridade (422 para o que o cliente deixar
  passar).
- `app/(site)/admin/tenants/page.tsx`: `ContactEmailCard`, abaixo do card "Profissionais", só com
  classes que já existiam (`card`, `h-card`, `pfield`, `btn--primary/--outline/--sm`, `portal-error`,
  `card-soft`, `Notice`). Recarrega quando a secretarIA é ligada/desligada, como o card de profissionais.

## Comportamento

- Mostra o valor atual, ou "Nenhum e-mail cadastrado — a clínica não recebe avisos por e-mail".
- "Salvar e-mail" fica desabilitado enquanto o campo equivale ao valor salvo. Campo vazio + salvar
  limpa (aparece uma dica explicando); há também o botão separado "Remover e-mail".
- Validação antes de enviar: e-mail inválido mostra o erro no cartão e **não** chama a API.
- 404 `secretaria_tenant_not_found` (na carga ou no salvar): troca o formulário por uma explicação
  calma. 422 / 502 / 404 genérico / 403: mensagem própria em linguagem simples, dentro do cartão
  (`role="alert"`). Falha na carga: erro + "Tentar de novo".
- Acessibilidade: `label` ligado ao campo, `aria-invalid` + `aria-describedby` (erro e dica),
  confirmação em `Notice` (`role="status"`, `aria-live="polite"`) logo abaixo do valor, foco visível
  herdado de `.pfield`. Sem rolagem horizontal em 390 px.

## Testes

- `app/(site)/admin/tenants/lib/__tests__/contact-email.test.ts` (17 testes, escritos antes da lógica).
- `lib/__tests__/manage-api.test.ts`, bloco "tenant contact e-mail (admin)" (4 testes: GET, PATCH com
  e-mail, PATCH `null`, códigos de erro 404/404/422/502).
- Gates: `npm test`, `.\node_modules\.bin\tsc.cmd --noEmit`, `npm run build`. `npm run lint` NÃO foi
  rodado (ESLint não instalado; trava em prompt).

## Prova no navegador (agent-browser, dev server em :3199 contra mock em :8099)

Mock fora do repo (scratchpad da sessão), `NEXT_PUBLIC_MANAGE_API_BASE_URL` passado só na linha de
comando (nenhum `.env` escrito). Cenários: estado vazio; e-mail inválido (erro, nenhum PATCH);
`  Contato@Aurora.COM.br ` salvo como `contato@aurora.com.br` e mantido após recarregar; limpar com campo
vazio; botão "Remover e-mail"; 422; 502 ao salvar; 404 `secretaria_tenant_not_found`; falha de carga +
"Tentar de novo"; viewport 390×844. Capturas na pasta `brain-frontend-mock/` do scratchpad da sessão.

## Pendências

- Provar contra o brain-api real depois que a rota for deployada (a regra de e-mail do servidor pode
  recusar algo que o cliente aceita, ou o contrário).
- Esta sessão não commitou nem deployou nada.
