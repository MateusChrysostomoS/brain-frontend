# brain-frontend

## Documentação — manter em dia (obrigatório)

Os arquivos em `docs/` são a **fonte de verdade pra entender o projeto** — o objetivo é que uma
sessão nova do Claude Code (ou qualquer pessoa) entenda tudo, profundamente, só lendo `docs/`.
Por isso eles **têm que refletir o estado real** do projeto.

**Quando atualizar:** ao fazer mudanças numa sessão, atualize os docs afetados — **não
necessariamente na hora de cada mudança, mas no FIM da sessão**, depois que tudo foi **validado e
verificado** (testes passando, deploy/migração confirmados). Documentar antes de validar gera doc
errado; documentar depois garante que o doc descreve o que realmente está no ar.

**Regras:**
- Feature grande/multi-camada → um `docs/CHECKPOINT_<FEATURE>.md` (estado, o que entrou onde,
  deployado/testado, pendências) + 1 linha de ponteiro nos docs relevantes.
- Cite âncoras estáveis (nome de função/componente), não números de linha frágeis, quando possível.
- Mantenha o `CHECKPOINT_*` da feature em dia até ela ser 100% concluída/encerrada; aí vira histórico.

## Prompts prontos para rodar

Prompts de feature já roteirizados ficam em `TECH/BRAIN/z_prompts/` — convenção
compartilhada entre os repos da Brain, não uma pasta deste repo. Cole o conteúdo inteiro
numa sessão nova quando for a hora de executar:

- (nenhum pendente para este repo hoje)

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
