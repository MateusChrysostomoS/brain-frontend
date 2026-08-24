# CHECKPOINT — Saída das telas da secretarIA do brain-frontend

Feito em 2026-08-24. **Status: NÃO COMMITADO / NÃO DEPLOYADO.**

**Gates:** `tsc --noEmit` limpo · `npm test` **130 passed** · `npm run build` verde
(33 rotas, nenhuma `/secretaria/*`).

Baseline anterior era **227 passed**. A queda de 97 é inteiramente a remoção dos
testes das telas apagadas — `configuracao/lib/__tests__` (hydration 24 + save 26 +
snapshot 28), `app-shell-viewport` (6) e `perfil/lib/__tests__/calendar-status`
(13). Nada foi perdido: essas suítes vivem no `secretarIA-frontend`, junto com o
código que testam, e lá subiram de 255 para 296.

---

## Por quê

A secretarIA virou um domínio próprio com frontend próprio em 2026-08-14, mas as
telas continuaram existindo **nos dois repositórios**. Dois bundles editando a
mesma configuração de tenant, pelo mesmo hub — que foi como divergiram.

Pedido do usuário, na íntegra:

> "pode apagar tudo da secretaria que esta em brainfrontend, portanto as abas dos
> médicos de agenda e configuracao"

## O que saiu

- `app/(site)/secretaria/` inteiro — 41 arquivos: `agenda/`, `configuracao/`,
  `_shared/` e a página índice `/secretaria`.
- As duas abas do `doctor/layout.tsx` (Agenda, Configurações secretarIA).
- `doctor/perfil/SecretariaConfigSection.tsx` + `doctor/perfil/lib/`.
- `app/(site)/app-shell.css` e `product-tokens.css` — ninguém mais importava.
- `app/(site)/__tests__/app-shell-viewport.test.ts` — o guard do FIX 33 lia os dois
  `page.tsx` apagados. **Continua existindo no `secretarIA-frontend`**, apontando
  para as telas de lá; é onde ele protege alguma coisa agora.

### A decisão que passou do pedido literal

O card "Configurações secretarIA" dentro de **Meu Perfil** também saiu. Não era uma
das duas abas citadas, e `/doctor/perfil` continua existindo com "Informações
pessoais". Mas aquele card era uma superfície de configuração da secretarIA
gravando especialidade/bio/horários/Google Calendar no hub **a partir do
brain-frontend** — exatamente a divergência que motivou o pedido — e era a última
coisa que ainda importava a árvore apagada.

Consequência prática: um médico ajusta esses campos no `/configuracao` do app da
secretarIA, onde todo membro autenticado do tenant (dono ou equipe) tem acesso de
escrita.

## O que ficou

`/doctor/pacientes` continua aqui, ainda marcado `product: "secretaria"`. Não é
uma das abas citadas e **não existe equivalente no outro app** — apagá-la perderia
a tela. `/doctor/anamneses` (PreCheck) e `/doctor/perfil` idem.

## Como se chega na secretarIA agora

`lib/secretaria-app.ts` (**novo**) é o único lugar que conhece a origem do outro
app. Todo link que ia para `/secretaria/*` virou `<a>` cross-origin — `next/link`
faz roteamento client-side e **não sai desta origem**, então um `<Link>` aqui
renderizaria um link que não faz nada.

Reescritos: `doctor/dashboard` (dois cards), `app/_components/SecretariaPanel`
(três), `app/onboarding`, `calendar/connected`, `doctor/pacientes`.

Os dois `router.replace("/secretaria/configuracao")` — convite aceito e checkout
concluído — agora vão para `/doctor/dashboard`. A sessão vive em `sessionStorage`,
que é **por origem**: mandar um usuário recém-criado direto para o outro domínio o
receberia com uma segunda tela de login, logo depois de definir a senha.

Vale dizer em voz alta, porque é uma aresta real: seguir qualquer um desses links
**pede login de novo**. A brain-api é a autoridade de identidade dos dois, então as
mesmas credenciais funcionam — mas é um segundo sign-in, não um handoff silencioso.
Nenhum texto da UI promete o contrário.

## ⚠️ Variável de build obrigatória

```
NEXT_PUBLIC_SECRETARIA_APP_BASE_URL=<origem pública do secretarIA-frontend>
```

Par `ARG`/`ENV` já está no `Dockerfile`. O default é **vazio** de propósito: sem
ela, `secretariaAppConfigured()` é falso e os controles renderizam
**desabilitados, com o motivo** — nunca apontando para uma rota que dá 404 nesta
origem.

Regra de sempre deste repo: `NEXT_PUBLIC_*` é assado no `npm run build`. Setar no
painel do EasyPanel **não tem efeito** — o build é export estático servido por
nginx.

**Enquanto essa variável não for preenchida e o app rebuildado, os links da
secretarIA no portal Brain ficam desabilitados.**

## Pendências

1. Preencher `NEXT_PUBLIC_SECRETARIA_APP_BASE_URL` e rebuildar.
2. Conferir `PORTAL_POST_OAUTH_REDIRECT` no backend: se o retorno do OAuth do
   Google ainda aponta para esta origem, o médico que iniciou a conexão pelo app
   da secretarIA cai em `/calendar/connected` **aqui** e volta por um link
   cross-origin. Funciona, mas o caminho natural é o redirect apontar para o app da
   secretarIA, que tem a mesma rota.
3. Commit dos três repositórios.
