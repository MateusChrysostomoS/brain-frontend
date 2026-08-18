# CHECKPOINT — papel `secretary` no portal (frontend)

**Rodada:** 2026-08-14 · **Estado:** BUILT + validado (`tsc.cmd --noEmit` limpo, 116 vitest
verdes, `npm run build` limpo) · **NÃO commitado, NÃO deployado.**

Contrato de backend completo (gates, endpoints, migração, exclusões): ver
`brain-api/docs/CHECKPOINT_secretary_role.md` e `brain-api/CONTRACTS.md` §12/§16.3. Este
doc cobre só o lado do portal.

---

## O papel, em uma frase de frontend

`secretary` é a **secretária humana** da clínica: entra no mesmo portal operacional que
médico/gestor (`/doctor/*`, `/secretaria/*`, `/app/*`), com **duas exceções** que o portal
precisa respeitar — nunca vê anamneses (dado clínico do PreCheck) e nunca vira profissional.
Nunca tem `professionalId`.

## O que mudou

### `lib/manage-api.ts`
- `Role` agora é `"admin" | "doctor" | "manager" | "secretary"`.
- Novos: `DoctorSecretary`, `getDoctorSecretaries(session)` (`GET /doctor/secretaries`,
  desembrulha `{items}` com a mesma defesa de `getDoctorProfessionals`),
  `SecretaryInvitePayload`/`SecretaryInviteResult`, `createSecretaryInvite(session, {name,
  email})` (`POST /doctor/secretaries/invites`).
- Comentários obsoletos corrigidos: `createProfessionalInvite`/`createSelfProfessional`
  diziam "owner-only" desde antes da rodada de correções de 2026-07-22.

### `usePortalGuard`
`secretary` adicionado em **6** call sites: `doctor/layout.tsx`, `doctor/dashboard`,
`doctor/pacientes`, `doctor/perfil`, `app/onboarding`, `app/reativar`.

> **`doctor/anamneses` ficou de fora DE PROPÓSITO** — é a superfície clínica. Há um
> comentário no arquivo dizendo isso, porque a lista lá fica visivelmente "desalinhada" das
> outras e a tentação de uniformizar é real. Alinhar não daria acesso: o brain-api responde
> `403 secretary_precheck_not_allowed` de qualquer jeito — só trocaria um redirect limpo por
> uma página quebrada.

### Convite de equipe
`InviteProfessionalModal.tsx` foi **renomeado** para `InviteTeamMemberModal.tsx` (o arquivo
antigo foi removido; nada mais o importava). Um modal, prop `kind: "professional" |
"secretary"` — sem toggle interno, porque o botão que abriu já escolheu:

- `professional` → nome/e-mail/especialidade → `createProfessionalInvite`
- `secretary` → nome/e-mail (sem especialidade) + um parágrafo explicando o alcance do papel
  ("acessa a agenda de todos os profissionais, a configuração da secretarIA e a assinatura
  da clínica — mas não atende pacientes e não vê anamneses") → `createSecretaryInvite`

Copy por variante fica num único mapa `COPY` pros dois fluxos não divergirem.

### `ProfessionalsSection.tsx` (Seção 05 de `/secretaria/configuracao`)
- Dois botões: "Convidar profissional" e "Convidar secretária".
- Lista nova "SECRETÁRIAS (RECEPÇÃO)" com `SecretaryRow` — deliberadamente mais enxuta que
  `ProfessionalRow`: não há agenda pra conectar, nem serviços/horários pra completar, nem
  nada pra selecionar (uma secretária nunca é o sujeito dos editores de Serviços/Horários
  acima).
- **As secretárias são buscadas aqui, não no `page.tsx`.** Desvio consciente do padrão
  "pai busca, filho renderiza": a lista é local do brain-api, não passa pelo hub da
  secretarIA — então não precisa do gate `hubReady` que o pai usa pro roster — e não
  alimenta a máquina de estado do profissional selecionado. Buscar no pai só adicionaria
  duas props numa página de ~600 linhas.
- O prompt de auto-vínculo ("Você também atende pacientes?") agora checa
  `session?.role !== "secretary"` explicitamente — backstop pro caso de uma secretária
  criada com `is_owner` via tooling admin ver um botão que o backend recusaria com
  `403 secretary_cannot_be_professional`.

### Rótulos
`secretary: "Secretária"` (tom `blue`) em `admin/users/page.tsx` e `doctor/perfil/page.tsx`;
`<option value="secretary">Secretária — recepção, só secretarIA (sem dado clínico)</option>`
no formulário de criação de usuário do admin.

## O que NÃO precisou mudar

**Billing.** `/app/billing` só exige sessão — não tem `usePortalGuard` com lista de papéis
nem checagem de `is_owner` escondendo o botão "Gerenciar assinatura". O backend também já
liberava (`require_tenant` só checa `tenant_id`), então billing funciona pra secretary sem
uma linha de mudança nos dois lados.

**`DashNav.tsx`.** `canClinical = role === "admin" || role === "doctor"` já exclui
`secretary` por construção — nada a fazer.

**Roteamento pós-login.** `login/page.tsx` manda todo mundo que não é admin pra
`/doctor/dashboard`; `usePortalGuard` faz o mesmo no bounce. Correto pra secretary.

## Testes

4 casos novos em `lib/__tests__/manage-api.test.ts` (112 → 116): `getDoctorSecretaries`
(desembrulha `{items}`; tolera array puro e corpo malformado sem devolver não-array pro
render) e `createSecretaryInvite` (manda só `name`+`email`, resolve o link; 409 vira
`ManageApiError`).

## Pendências

- [ ] Commit + push + deploy (nada foi commitado).
- [ ] Teste no browser com uma sessão `secretary` real, depois que o brain-api subir.
- [ ] `secretarIA-frontend` ainda está vazio (só `.gitignore` + commit inicial) — quando
      `PROMPT_FABLE_secretarIA-frontend.md` rodar, o clone de `configuracao/*` leva a UI de
      convite junto; o `usePortalGuard` de lá já espera `secretary`.
