# TASK-062 — Criar minha clínica sem trocar de conta

Somente local na branch `task/TASK-062-criar-clinica`, base
`24f87d0995beafe8b518b8824184770a92ade8c4`. Sem commit/publicação. Roteiro e comandos completos
em `C:/TECH/BRAIN/tasks/TASK-062/TASK.md`; contrato no checkpoint homônimo do brain-api.

## Fluxo

`intencao=nova-clinica` nos planos prevalece sobre sessão clínica anterior. `PlanCheckoutCta`
dirige ao novo `/criar-clinica`, sem comprar/adicionar produto em A/B. Fluxos comuns de quem
efetivamente administra uma clínica existente e guardas de assinatura não foram removidos.
E-mail conhecido no cadastro anônimo oferece login com destino seguro de criação, sem outra senha.

A página usa AuthShell/design existente e formulário nativo nome/WhatsApp/intake, quando aplicável.
Exige conta pessoal comprovada, inclusive sem portal ativo; não usa contexto operacional revogado.
`lib/manage-api` centraliza as chamadas #12–17. Bearer pessoal fica só em memória privada, cookie
de renovação host-only; renovar sessão clínica pessoal seleciona o User exato, não cookie legado.
Épocas/single-flight impedem respostas atrasadas de uma sessão A de sobrescrever C.
Revisão final reproduziu também corpo JSON tardio, login legado tardio e cookie trocado por
outra conta em outra aba. Há revalidação após o último await e antes de adotar sessão;
renovação de identidade diferente encerra o contexto local e **não** repete o POST como outra
pessoa. Comparação de subject serve só para recusar mudança de contexto, nunca para conceder
acesso: toda prova e autorização continua no servidor.

Operação UUID fica no endereço antes do POST: é destino não sensível, não prova. GET autenticado
retoma C após F5/cancelamento; não recria por duplo submit. Query `pagamento=recebido` só dispara
consulta; somente o webhook da API ativa produtos. Retorno ao console informa apenas `clinica`
(User.id C), requerendo sessão pessoal própria daquela origem ou novo login. Nenhum token na URL.

`lib/clinic-session` resolve `vinculo` do faturamento **antes do guard do shell**; caso contrário,
um F5 poderia cair em cookie de outra clínica ou login legado ambíguo. Link explícito de billing
também prevalece sobre intenção antiga de criar clínica em memória (reprodução RED em teste).

## Recuperação preservada

As três rotas de TASK-056 e `password-reset-memory` continuam sem modificações de protocolo:
request → verify-code → confirm, e-mail/autorização só em memória, limpeza de token ao sair.
Não há recuperação por link nem `/esqueci_senha/token` novo. A intenção guardada separadamente
contém somente rota local allowlisted, plano/catálogo/template/operação; descarta token/e-mail/next
arbitrário. Login após reset retoma criar C. F5 no reset reinicia; Voltar não devolve autorização.
Conta pessoal/quotas/challenge não mudam por criar C. Login console/site compartilham a credencial.

## Validação

- `npm test`: **289 passed** (inclui reset/manage-api, intenção, provas pessoais, sessão tardia e
  billing no guard pai). `tsc --noEmit` e build estático aprovados.
- Browser contra API real/PostgreSQL/SMTP capturado/Stripe simulado local, depois com PreCheck
  nativo: cancelamento/F5 retoma mesmo C/checkout, retorno console escolhe C, A/B revogadas,
  faturamento exato C também após reload. Senha antiga recusada e nova aceita após reset real local.
- Formulário visto a 375 px, campos com nomes acessíveis, sem overflow horizontal. A emulação de
  esquema escuro não prova tema escuro, pois o AuthShell atual mantém tema explícito.
- Sem ESLint instalado: `npm run lint` não executado. Nenhum guard de compra removido.

Publicação é decisão separada: PreCheck consumidor + DDL, API e depois frontends. Não publicar
o CTA/formulário com backend anterior. Nenhum serviço real foi utilizado nesta validação.
