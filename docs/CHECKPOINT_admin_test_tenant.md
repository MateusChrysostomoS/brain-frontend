# CHECKPOINT: "Criar clínica de teste" em `/admin/tenants` (parte 2/2)

Prompt: `z_prompts/PROMPT_BRAIN_ADMIN_TEST_TENANT_2_BRAIN_FRONTEND.md`. Contrato HTTP:
`brain-api/docs/CHECKPOINT_admin_test_tenant.md` (parte 1, `POST /admin/tenants`).

> **TEMPORÁRIO: remover antes do lançamento real** (pedido do dono, 2026-09-25). É o item 5 do
> checklist de remoção do CHECKPOINT da parte 1: formulário, selo "teste", `adminCreateTenant`
> e os tipos `AdminTenantCreate`/`AdminTenantCreated`/`is_test`.

**Estado (2026-09-25): commitado em `main`, não pushado, não deployado.** A prova no navegador foi feita
contra um **stub local** do contrato, e não contra o brain-api real, porque a parte 1 ainda não
está deployada e a migração 0025 não foi aplicada. Deploy deste repo só **depois** do brain-api:
com o brain-api antigo, o POST responde 405/404 e o formulário mostra "Algo deu errado".

## O que entrou

- `lib/manage-api.ts`: `adminCreateTenant(session, payload)` → `POST /admin/tenants`; tipos
  `AdminTenantCreate` (os seis campos planos `clinic_name`/`email`/`name`/`password`/
  `precheck`/`secretaria`, porque o servidor usa `extra="forbid"`) e `AdminTenantCreated`
  (`tenant_id`, `clinic_name`, `is_test`, `entitlements`, `owner`). `is_test?` também foi
  adicionado, como opcional, em `AdminTenant`/`AdminTenantDetail`, para não quebrar contra um
  brain-api sem a 0025.
- `app/(site)/admin/tenants/lib/create-tenant.ts`: lógica pura com validação, montagem do
  payload, mapeamento de erro e `submitCreateTenant`, que recebe o `create` injetado. Fica fora do
  componente porque o vitest daqui roda em `node`, sem jsdom (convenção do
  `vitest.config.ts`).
- `app/(site)/admin/tenants/page.tsx`: painel inline `CreateTestTenantPanel` acima da tabela,
  no mesmo padrão de `admin/users` (`card`, `pfield`, `autoComplete="new-password"`), com
  checkboxes independentes secretarIA/PreCheck. Em sucesso ele mostra um `Notice`, recarrega a
  lista (a mesma função `load` do primeiro fetch) e oferece o link "Abrir clínica criada →"
  (`?id=<tenant_id>`). A tela não navega sozinha, para que a linha nova apareça na tabela. Selo
  `TestBadge` ("teste") na tabela e no título do detalhe.

## Decisões

1. **409 em pt-BR, com mensagem própria.** O `detail` do servidor é `"Email already registered"`
   (em inglês), e o `describeApiError` genérico o repassaria cru. Por isso
   `describeCreateTenantError` responde "Este e-mail já está cadastrado.". 422 e 403 seguem o
   texto genérico.
2. **Validação da senha no cliente, espelhando o servidor**: 8 a 72 caracteres, com letra e
   dígito. Serve para mostrar uma mensagem útil em vez do 422 genérico. O brain-api continua
   sendo a autoridade.
3. **Sem teste de componente.** Adicionar jsdom/testing-library seria uma dependência nova.
   Os testes cobrem a lógica extraída, que é o que decide o payload e as mensagens.

## Provas

- `tsc --noEmit` limpo. `npm test`: **167 passed** (8 arquivos), 9 deles novos em
  `app/(site)/admin/tenants/lib/__tests__/create-tenant.test.ts`. Cobrem: campos obrigatórios, a
  regra da senha, as quatro combinações de checkbox chegando ao payload, os seis campos exatos com
  trim, sucesso, 409 em pt-BR, 422 e a garantia de que a API não é chamada com um campo
  faltando.
- `npm run build` verde, com 36/36 páginas estáticas e `/admin/tenants` com 6.3 kB.
- Chrome, com `next dev` apontado para o stub local (`NEXT_PUBLIC_MANAGE_API_BASE_URL`):
  - e-mail já existente → "Este e-mail já está cadastrado.";
  - só secretarIA marcado → o stub recebeu `"precheck":false,"secretaria":true`, a lista
    recarregou e a linha nova mostra o selo "teste", `secretaria_basico`, `active`,
    PreCheck ✗ e Secretaria ✓;
  - "Abrir clínica criada" → detalhe com PreCheck Inativo e secretarIA Ativo;
  - nenhuma tela de pagamento em nenhum momento.
  - Obs.: o `form_input` do Chrome MCP não dispara o `onChange` do React em checkbox. O
    primeiro envio saiu com `secretaria:false` por isso, e o clique real resolveu. É limitação
    da ferramenta, não bug do formulário.

## Pendente

- Push e deploy, **depois** do brain-api da parte 1 (com a 0025 aplicada).
- Reconfirmar contra o brain-api real depois do deploy.
