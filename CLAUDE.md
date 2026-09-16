# brain-frontend

## Documentação

`docs/` é a fonte de verdade deste repo. Regra geral de quando/como atualizar (CHECKPOINT,
âncoras estáveis) em `AI_WORKFLOW.md` — aqui só o que diverge, se houver.

## Prompts prontos para rodar

Prompts de feature já roteirizados ficam em `TECH/BRAIN/z_prompts/` — convenção
compartilhada entre os repos da Brain, não uma pasta deste repo. Cole o conteúdo inteiro
numa sessão nova quando for a hora de executar:

- (nenhum pendente para este repo hoje)

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
