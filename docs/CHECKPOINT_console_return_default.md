# Retorno ao console após compra — correção da TASK B

## Estado

Correção validada em 2026-09-29 após QA de produção da TASK-012. Merge/push autorizado no contexto da entrega. Publicação do novo build em produção ainda precisa ser confirmada; nenhuma configuração do painel consultada ou alterada.

## Causa e mudança

O build Docker tinha `NEXT_PUBLIC_BRAIN_MESSAGE_URL` vazio por padrão. A rota `/checkout/sucesso/?origem=console&produto=precheck` seguia o fallback previsto, permanecendo em Pagamento recebido. A origem real do console foi verificada pelo agent-browser em produção: `https://precheckv2-brain-message-frontend.cpux9k.easypanel.host`.

Dockerfile e `lib/console-return.ts::BRAIN_MESSAGE_URL` passam a usar essa origem por padrão. Override de build personalizado permanece permitido. Override explicitamente vazio ainda desliga o retorno; se o operador estiver enviando um build-arg vazio, precisa removê-lo para usar o padrão. Alterar variável apenas no ambiente de execução não muda o export estático: é necessário novo build/deploy.

O destino continua fixo: `/anamneses/` para produto=precheck, `/` nos demais casos. Sem origem=console, o fluxo original permanece. Valores do query não viram origem ou caminho arbitrários. Nenhuma mudança em billing/backend.

## Validação

- RED: dois testes reproduziram retorno `stay` com variável ausente e com default Docker.
- GREEN: suíte completa 234 testes; TypeScript e build estático aprovados.
- Revisão independente READY, nenhum finding.
- agent-browser com export estático real servido localmente: origem=console&produto=precheck navegou à origem verificada + `/anamneses/`; produto hostil navegou apenas à raiz fixa; ausência de origem permaneceu na rota original.
- Respostas dos dois destinos do console foram interceptadas apenas no navegador de teste com fixtures, para observar o URL de navegação sem consultar dados de produção. Nenhum pagamento efetuado.
- `git diff --check` aprovado. Graphify previamente INVALID, não usado como evidência primária para esta correção pontual.

## Publicação

Somente brain-frontend exige rebuild/deploy desta correção. A política da workspace proíbe mutação automatizada de serviços do painel. Após publicação, repetir em produção a abertura direta da página de sucesso; essa prova valida a navegação, não um pagamento ou ativação de assinatura.
