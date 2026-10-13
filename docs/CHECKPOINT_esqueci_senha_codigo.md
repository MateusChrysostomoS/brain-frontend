# CHECKPOINT — esqueci a senha por código (TASK-056)

**Data:** 2026-10-13 · **Estado:** implementado, revisado e integrado à `main` local; **não publicado**.
Fonte de verdade da tarefa inteira (contrato, regras, ordem de publicação, pendências):
`brain-api/docs/CHECKPOINT_emails_autenticacao.md`.

- Telas: `/esqueci_senha` → `/esqueci_senha/codigo` → `/esqueci_senha/atualizar_senha` (a rota `/token` foi apagada; o passe não vai mais na URL).
- Arquivos: `lib/password-reset-memory.ts` (memória de módulo; o passe é esquecido ao montar login, passo 1 e passo 2), `lib/manage-api.ts::verifyResetCode`.
- Segurança: e-mail e passe só em variáveis de módulo — nada em localStorage, sessionStorage,
  cookie ou URL; F5 recomeça do e-mail. Provado no navegador contra brain-api local.
- Publicar só depois do brain-api (SMTP configurado + migração `0030` + deploy).
