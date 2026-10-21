"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { AuthShell } from "../_shared/AuthShell";
import { BRAIN_MESSAGE_URL, normalizeBrainMessageUrl } from "@/lib/console-return";
import {
  checkoutPersonalClinic, createPersonalClinic, ensurePersonalAccount, getPersonalClinic,
  ManageApiError, type PersonalAccount, type PersonalClinic,
} from "@/lib/manage-api";
import { clearClinicDestination, newClinicDestination, rememberClinicDestination } from "@/lib/new-clinic";
import { resolvePlan, isPrecheckPlan } from "../../(site)/cadastro/lib/plans";
import { isPurchaseGated } from "../../(site)/_lib/launch";

export default function CreateClinicPage() {
  return <Suspense fallback={<p>Carregando…</p>}><CreateClinic /></Suspense>;
}

function CreateClinic() {
  const params = useSearchParams();
  const router = useRouter();
  const initialOperation = params.get("operacao");
  const operation = useRef(initialOperation);
  const [account, setAccount] = useState<PersonalAccount | null>(null);
  const [clinic, setClinic] = useState<PersonalClinic | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [usage, setUsage] = useState("none");
  const [prior, setPrior] = useState("no");
  const [facebook, setFacebook] = useState("no");
  const inFlight = useRef(false);
  const chosen = clinic ? new URLSearchParams({ plan: clinic.catalog_ids[0], catalog: clinic.catalog_ids.join(",") }) : new URLSearchParams(params.toString());
  const plan = resolvePlan(chosen);
  const destination = newClinicDestination(`/criar-clinica?${params}`) ?? "/criar-clinica";

  useEffect(() => {
    let cancelled = false;
    rememberClinicDestination(destination);
    void (async () => {
      try {
        const personal = await ensurePersonalAccount();
        if (cancelled) return;
        if (!personal) {
          router.replace(`/login?${new URLSearchParams({ next: destination })}`);
          return;
        }
        setAccount(personal);
        if (initialOperation) {
          try {
            const restored = await getPersonalClinic(initialOperation);
            if (!cancelled) setClinic(restored);
          } catch (cause) {
            if (!(cause instanceof ManageApiError && cause.status === 404)) throw cause;
          }
        }
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) { setError("Não foi possível retomar sua conta. Recarregue para tentar novamente."); setReady(true); }
      }
    })();
    return () => { cancelled = true; };
  }, [destination, initialOperation, router]);

  // Redirect return is only a hint. Payment is complete exclusively when the API
  // observes the webhook activation; no query value can activate a product.
  useEffect(() => {
    if (!clinic || clinic.status !== "pending_payment" || params.get("pagamento") !== "recebido") return;
    let cancelled = false;
    const timer = window.setInterval(() => {
      void getPersonalClinic(clinic.operation_id).then((result) => {
        if (!cancelled) setClinic(result);
      }).catch(() => { if (!cancelled) setError("A confirmação está demorando. Tente consultar novamente."); });
    }, 2000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [clinic, params]);

  function describe(cause: unknown) {
    if (cause instanceof ManageApiError && cause.status === 401) {
      router.replace(`/login?${new URLSearchParams({ next: newClinicDestination(window.location.pathname + window.location.search) ?? destination })}`);
      return;
    }
    setError(cause instanceof ManageApiError && cause.message === "creation_operation_changed"
      ? "Esta tentativa já criou uma clínica com outros dados. Recarregue para retomar."
      : "Não foi possível concluir agora. Tente novamente para retomar a mesma clínica.");
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || !plan || isPurchaseGated(plan.catalogIds)) return;
    inFlight.current = true; setBusy(true); setError("");
    try {
      operation.current ??= crypto.randomUUID();
      const next = new URLSearchParams(params.toString());
      next.set("operacao", operation.current);
      window.history.replaceState(null, "", `/criar-clinica?${next}`);
      rememberClinicDestination(`/criar-clinica?${next}`);
      const result = await createPersonalClinic({
        operation_id: operation.current, clinic_name: name.trim(), whatsapp_phone: phone.trim(),
        catalog_ids: plan.catalogIds,
        ...(!isPrecheckPlan(plan) ? { intake: { whatsapp_usage: usage, prior_api: prior, fb_page: facebook } } : {}),
        ...(params.get("precheck_template_slug") ? { precheck_template_slug: params.get("precheck_template_slug")! } : {}),
      });
      setClinic(result);
    } catch (cause) { describe(cause); }
    finally { inFlight.current = false; setBusy(false); }
  }

  async function checkout() {
    if (!clinic || inFlight.current) return;
    inFlight.current = true; setBusy(true); setError("");
    try {
      const result = await checkoutPersonalClinic(clinic.operation_id);
      window.location.assign(result.checkout_url);
    } catch (cause) { describe(cause); inFlight.current = false; setBusy(false); }
  }

  const portal = normalizeBrainMessageUrl(BRAIN_MESSAGE_URL);
  const userId = clinic?.session.user_id;
  return <AuthShell title={<>Criar <em>minha clínica</em>.</>} subtitle="Uma nova clínica com sua conta pessoal Brain." error={error}>
    {!ready ? <p>Verificando sua conta…</p> : !account ? <Link href={`/login?${new URLSearchParams({ next: destination })}`}>Entrar novamente</Link> : clinic ? <>
      <h2>{clinic.clinic_name}</h2>
      {clinic.status === "completed" ? <>
        <p>Sua clínica está pronta. Abra o portal para configurar o atendimento.</p>
        {portal && userId && <a className="btn btn-primary login-submit" href={`${portal}/login?clinica=${encodeURIComponent(userId)}`} onClick={clearClinicDestination}>Entrar na minha clínica</a>}
      </> : <>
        <p>{clinic.status === "failed" ? "Não foi possível finalizar a contratação. Sua clínica foi preservada; tente novamente." : params.get("pagamento") === "recebido" ? "Aguardando a confirmação do pagamento…" : "Clínica criada. Escolha como continuar a contratação."}</p>
        <p>Plano: {plan?.label ?? clinic.catalog_ids[0]}</p>
        <p>Os produtos serão liberados após a confirmação. Você pode retomar esta página se cancelar.</p>
        <button className="btn btn-primary login-submit" disabled={busy} onClick={() => void checkout()}>{busy ? "Abrindo pagamento…" : "Continuar para pagamento"}</button>
      </>}
    </> : !plan || isPurchaseGated(plan.catalogIds) ? <><p>Escolha um plano disponível para sua nova clínica.</p><Link href="/?intencao=nova-clinica#planos">Ver planos</Link></> : <form className="login-form" onSubmit={create}>
      <p>Conta: {account.email}</p><p>Plano: {plan.label}</p>
      <div className="field"><label htmlFor="clinic-name">Nome da nova clínica</label><input id="clinic-name" required maxLength={255} value={name} onChange={e => setName(e.target.value)} /></div>
      <div className="field"><label htmlFor="clinic-phone">WhatsApp da nova clínica</label><input id="clinic-phone" type="tel" required maxLength={32} value={phone} onChange={e => setPhone(e.target.value)} /></div>
      {!isPrecheckPlan(plan) && <>
        <div className="field"><label htmlFor="clinic-usage">Uso do WhatsApp Business</label><select id="clinic-usage" value={usage} onChange={e => setUsage(e.target.value)}><option value="none">Ainda não uso</option><option value="business_recent">Comecei há menos de 7 dias</option><option value="business_7d_plus">Uso há pelo menos 7 dias</option></select></div>
        <div className="field"><label htmlFor="clinic-prior">Este número já usou uma API do WhatsApp?</label><select id="clinic-prior" value={prior} onChange={e => setPrior(e.target.value)}><option value="no">Não</option><option value="yes">Sim</option><option value="unknown">Não sei</option></select></div>
        <div className="field"><label htmlFor="clinic-facebook">Página da clínica no Facebook</label><select id="clinic-facebook" value={facebook} onChange={e => setFacebook(e.target.value)}><option value="no">Ainda não tenho</option><option value="yes_admin">Tenho e sou administrador</option><option value="yes_unknown_admin">Tenho, mas não sei quem administra</option></select></div>
      </>}
      <p>Você será responsável por esta nova clínica. Seus acessos às outras clínicas continuam com as permissões atuais.</p>
      <button className="btn btn-primary login-submit" disabled={busy} type="submit">{busy ? "Criando clínica…" : "Criar minha clínica"}</button>
    </form>}
  </AuthShell>;
}
