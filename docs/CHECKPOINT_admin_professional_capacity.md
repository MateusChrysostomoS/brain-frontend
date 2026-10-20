# CHECKPOINT — card "Profissionais" no detalhe da clínica (TASK-063)

Estado: **implementado e commitado só na branch `task/TASK-063-capacidade-profissionais`
(worktree `BRAIN-worktrees/TASK-063/brain-frontend`). Não mesclado, não pushado, não
deployado.** Deploy só depois do brain-api da mesma tarefa.

Contrato, regras e decisões do servidor: `brain-api/docs/CHECKPOINT_admin_professional_capacity.md`.

## O que entrou

- `/admin/tenants?id=<uuid>` ganhou o card **Profissionais** abaixo dos produtos
  (`app/(site)/admin/tenants/page.tsx::ProfessionalCapacityCard`): mostra "N ativos de M
  permitidos", um campo numérico e "Salvar limite".
- Bloqueado com explicação quando a clínica tem assinatura Stripe ou está sem secretarIA. O
  card recarrega ao ligar/desligar a secretarIA na mesma tela.
- Lógica pura e textos em `app/(site)/admin/tenants/lib/professional-capacity.ts` (validação
  espelho do servidor, frases das recusas), testada em vitest sem DOM.
- `lib/manage-api.ts`: tipo `ProfessionalCapacity` e `adminGetProfessionalCapacity` /
  `adminSetProfessionalCapacity`. O PUT envia só `{max_professionals}` (o servidor recusa
  qualquer campo a mais).

## Provas

- `tsc --noEmit` limpo; `npx vitest run`: 284 passed (6 novos); `npm run build` verde
  (`/admin/tenants` 7.37 kB). Sem lint (ESLint não instalado neste repo — não rodar).
- Chrome, `next dev` apontado para um stub local do contrato (mesmo método de
  `CHECKPOINT_admin_test_tenant.md`), sem tocar produção:
  - "2 ativos de 2 permitidos"; digitar 1 → recusa local "A clínica já tem 2 profissionais
    ativos…", nenhuma chamada ao servidor;
  - digitar 5 → o stub recebeu exatamente `{"max_professionals":5}`, a tela mostrou "2 ativos
    de 5 permitidos" e "Limite salvo: 5 profissionais.";
  - desligar a secretarIA → card recarregou e trocou o campo pelo aviso "Ative a secretarIA…".

## Pendente

- Push/deploy com autorização do dono (brain-api primeiro).
- Reconfirmar contra o brain-api real depois do deploy.
