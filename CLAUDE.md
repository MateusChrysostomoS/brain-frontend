# brain-frontend

## Documentação

`docs/` é a fonte de verdade deste repo. Regra geral de quando/como atualizar (CHECKPOINT,
âncoras estáveis) em `AI_WORKFLOW.md` — aqui só o que diverge, se houver.

`/login?next=` (só caminho relativo da mesma origem, `lib/safe-next.ts`) e `PlanCheckoutCta` ciente de
conta existente vinda do console (`?origem=console`, `lib/checkout-cta.ts`) — TASK B, 2026-09-29; detalhes
em `Brain-Message-Frontend/docs/CHECKPOINT_brain_message_link_compra.md`.

Correção pós-QA do retorno ao console: default de produção verificado no Docker/build,
override vazio preservado; validação e publicação em `docs/CHECKPOINT_console_return_default.md`.
TASK C: add-product CTA/dialog, console return and dual-plan labels; local state and validation in `docs/CHECKPOINT_add_product_ui.md`.

Clinic operational portal retired (2026-10-05): only Meu Perfil remains under `/doctor`;
`/app` forwards to billing and checkout enters Brain-Message. Scope and validation:
`docs/CHECKPOINT_clinic_portal_retirement.md`.

Billing Portuguese copy and shared clinic sidebar (Meu Perfil, Cobrança):
`docs/CHECKPOINT_billing_copy_navigation.md` (2026-10-05).

## Prompts prontos para rodar

Prompts de feature já roteirizados ficam em `TECH/BRAIN/z_prompts/` — convenção
compartilhada entre os repos da Brain, não uma pasta deste repo. Cole o conteúdo inteiro
numa sessão nova quando for a hora de executar:

- `PROMPT_BRAIN_ADMIN_TEST_TENANT_2_BRAIN_FRONTEND.md` (gerado 2026-09-24 via
  `/prompt-generator`) — parte 2/2: UI "Criar clínica de teste" em `/admin/tenants` (nome +
  dono/gestor + checkboxes de produto secretaria/precheck), consumindo o endpoint novo
  `POST /admin/tenants` que a parte 1 (`..._1_BRAIN_API.md`, no `brain-api`) constrói — sem
  Stripe. **EXECUTADO em 2026-09-25**: commitado, não deployado; provado no Chrome
  só contra um stub do contrato. Deploy só depois do brain-api da parte 1. Ver
  `docs/CHECKPOINT_admin_test_tenant.md`. **Temporário: sai antes do lançamento real.**
- `PLANO_CONSOLIDACAO_PORTAL_BRAIN_MESSAGE.md` (gerado 2026-09-23, via `/prompt-generator`, a
  partir de um bug cross-tenant investigado numa sessão que virou brainstorm de arquitetura) —
  este repo vira só gerenciador de tenants/pagamento/login; Brain-Message vira o portal
  operacional único. Peças deste repo: `PROMPT_BRAIN_MESSAGE_LOGIN_HANDOFF_2_BRAIN_FRONTEND.md`
  (Onda B, troca os 2 links de `SecretariaPanel.tsx` por um handoff assinado pro Brain-Message —
  depende de `..._1_BRAIN_API.md`, no `brain-api`, deployado antes) e
  `PROMPT_BRAIN_FRONTEND_REDIRECT_POS_PAGAMENTO.md` (Onda C, `/checkout/sucesso` passa a
  redirecionar pro módulo `contexto` do Brain-Message em vez do destino morto atual — depende da
  Onda A e do handoff). **NÃO EXECUTADOS ainda.**
- `PROMPT_TOGGLE_RESPONSIVIDADE_SECRETARIA_PRECHECK.md` (gerado 2026-09-19/20 via
  `/prompt-generator`) — o toggle secretarIA/Precheck (`.prod-tabs`/`.prod-tab` em
  `app/(site)/app/page.tsx:157-199` e `app/(site)/app/dashboard-shell.css:10-15`) não tem
  nenhuma regra para telas estreitas; o único `@media (max-width:720px)` do arquivo (linha 96)
  esconde `.uname` mas não toca o toggle. Decisão fechada com o dono em 2026-09-20: vira
  ícone-only abaixo de ~480px, sem quebra de linha nem dropdown. **NÃO EXECUTADO.**

`PROMPT_AUDIT_FRONTEND_FONTES_LGPD_BRAIN_FRONTEND.md` foi **executado em 2026-08-31** — ver
`docs/CHECKPOINT_fontes_self_hosted.md`. As 7 famílias do Google saíram do `<link>` no layout
raiz e passaram a ser self-hosted por `next/font/google`. A tabela de diferenças do prompt em
relação ao repo irmão foi conferida e está correta, com um ajuste: são **9** arquivos com
definição de token em `app/` (20 definições), não 10 — o décimo é `_design-source/`, que não
é buildado. O checkpoint registra a única mudança visual do app (JetBrains Mono em peso 600)
e por que o grep de `fonts.googleapis.com` no `out/` NÃO volta vazio neste repo.

`PROMPT_FEAT_42_PROFESSIONAL_CONFIG_GAP_BANNER_FRONTENDS.md` foi **executado em 2026-08-29**
— ver `docs/CHECKPOINT_config_gap_banner.md`, que também registra duas premissas ERRADAS do
prompt, para ninguém reconstruir a partir dele: (1) o sinal de completude vive em
`GET /tenants/me/professionals`, não em `GET /config`, e o checkpoint do FEAT 41 proíbe
movê-lo; (2) este repo nunca ficou sem cliente da secretarIA — `getDoctorProfessionals()`
(`lib/manage-api.ts`, sobre `GET /doctor/professionals` do brain-api) já servia o sinal, então
a "decisão de arquitetura em aberto" do §3.2 não existia: nada de backend foi escrito.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
