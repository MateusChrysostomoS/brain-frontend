"use client";

// PrecheckBillingSection — the "Pré-consultas (PreCheck)" sub-block on
// /app/billing. Owns its own fetch of GET /billing/precheck/usage
// (getPrecheckBillingUsage never throws — it resolves null on ANY failure, see
// lib/manage-api.ts), so a hiccup here can NEVER break the rest of the billing
// page: this component simply renders nothing while loading, on fetch failure,
// or when the resolved payload reports precheck_enabled: false (the tenant's
// plan isn't a PreCheck plan at all).
//
// Two actions live here, each owning its own pending/error state (mirrors
// ../../reativar/_components/RestartButton.tsx):
//   - "Comprar mais pré-consultas" -> a quantity field + POST
//     /billing/precheck/topup -> full-page redirect to the returned Stripe
//     Checkout URL. Avulso pré-consultas are priced PER UNIT, so HOW MANY is
//     picked right here and the Checkout Session is created with that quantity
//     fixed — Stripe's hosted page never re-asks for it.
//   - "Fazer upgrade para Advanced" (precheck_basic only) -> an inline confirm
//     step -> POST /billing/precheck/upgrade -> swaps the fresh usage payload
//     into state and shows a success notice.
// Never invents a base subscription price client-side — the monthly fee is
// only ever described as "cobrada via assinatura, veja em Gerenciar
// assinatura", pointing at the Stripe-sourced portal below this section.

import { useCallback, useEffect, useState } from "react";
import {
  createPrecheckTopupSession,
  getPrecheckBillingUsage,
  upgradePrecheckPlan,
  ManageApiError,
  type PrecheckBillingUsage,
  type Session,
} from "@/lib/manage-api";
import { formatBRLFromCents } from "@/lib/currency";
import { clearSession, isSessionExpired } from "../../../_components/usePortalGuard";
import { BrandIcon } from "../../../_components/BrandIcon";
import { pluralize } from "../../_components/format";

type PrecheckBillingSectionProps = {
  session: Session;
};

// Smallest avulso purchase the backend accepts — mirrors brain-api's
// PRECHECK_TOPUP_MIN_QUANTITY (services/billing.py::
// create_precheck_topup_checkout_session answers 422 `quantity_below_minimum`
// under it). Duplicated as a plain constant on purpose: the server is the
// enforcement point, this only keeps the field from ever OFFERING less. The
// ceiling is deliberately NOT mirrored — it is a typo guard, not a number worth
// showing, so an over-the-top quantity is simply reported back from the 422.
const TOPUP_MIN_QUANTITY = 5;

// Formats an ISO date string as a Brazilian date (DD/MM/AAAA); the raw string
// if it fails to parse — mirrors reativar/page.tsx's own formatDate helper.
function formatDatePtBR(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function PrecheckBillingSection({ session }: PrecheckBillingSectionProps) {
  // --- Usage fetch state ---
  const [usage, setUsage] = useState<PrecheckBillingUsage | null>(null);
  const [loading, setLoading] = useState(true);

  // --- "Comprar mais pré-consultas" (Stripe Checkout top-up) ---
  // Held as a STRING so the field can be momentarily empty while being retyped
  // (a number-typed state would coerce that to 0 and fight the user); parsed and
  // bounds-checked on submit, and snapped back to the minimum on blur.
  const [quantity, setQuantity] = useState(String(TOPUP_MIN_QUANTITY));
  const [topupPending, setTopupPending] = useState(false);
  const [topupError, setTopupError] = useState<string | null>(null);
  const parsedQuantity = Number.parseInt(quantity, 10);
  const quantityValid = Number.isFinite(parsedQuantity) && parsedQuantity >= TOPUP_MIN_QUANTITY;

  // --- "Fazer upgrade para Advanced" (two-step: confirm, then submit) ---
  const [upgradeConfirming, setUpgradeConfirming] = useState(false);
  const [upgradePending, setUpgradePending] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [upgradeNotice, setUpgradeNotice] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getPrecheckBillingUsage(session).then((data) => {
      setUsage(data);
      setLoading(false);
    });
  }, [session]);

  useEffect(() => {
    load();
    // Refetch only if the token identity actually changes (mirrors PreCheckPanel).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.token]);

  // Shared 401 handling for both actions below — an expired/invalid session
  // means the whole portal session is dead, not just this optional section.
  function handleSessionExpiry(e: unknown): boolean {
    if (!isSessionExpired(e)) return false;
    clearSession();
    window.location.assign("/login");
    return true;
  }

  async function handleTopup() {
    setTopupError(null);
    if (!quantityValid) {
      setTopupError(`A compra mínima é de ${TOPUP_MIN_QUANTITY} pré-consultas.`);
      return;
    }
    setTopupPending(true);
    try {
      const url = await createPrecheckTopupSession(session, parsedQuantity);
      window.location.assign(url);
      // Leave `topupPending` true — the browser is navigating away to Stripe.
    } catch (e) {
      if (handleSessionExpiry(e)) return;
      const status = e instanceof ManageApiError ? e.status : 0;
      const detail = e instanceof ManageApiError ? e.message : "";
      setTopupError(
        status === 503
          ? "Cobrança ainda não configurada. Fale com a Brain."
          : status === 409
            ? "Seu plano atual não permite comprar pré-consultas avulsas."
            : status === 422 && detail === "quantity_below_minimum"
              ? `A compra mínima é de ${TOPUP_MIN_QUANTITY} pré-consultas.`
              : status === 422
                ? "Quantidade acima do máximo por compra. Reduza e tente novamente."
                : "Não foi possível iniciar a compra agora. Tente novamente.",
      );
      setTopupPending(false);
    }
  }

  async function handleUpgrade() {
    setUpgradeError(null);
    setUpgradeNotice(false);
    setUpgradePending(true);
    try {
      const fresh = await upgradePrecheckPlan(session, "precheck_advanced");
      setUsage(fresh);
      setUpgradeConfirming(false);
      setUpgradeNotice(true);
    } catch (e) {
      if (handleSessionExpiry(e)) return;
      const status = e instanceof ManageApiError ? e.status : 0;
      const detail = e instanceof ManageApiError ? e.message : "";
      if (status === 409 && detail === "already_on_plan") {
        setUpgradeError("Sua clínica já está no plano Advanced.");
      } else if (status === 409 && detail === "no_active_subscription") {
        setUpgradeError("Sua clínica não tem uma assinatura ativa para fazer upgrade.");
      } else if (status === 422) {
        setUpgradeError("Não foi possível processar o upgrade. Tente novamente.");
      } else {
        setUpgradeError("Não foi possível concluir o upgrade agora. Tente novamente.");
      }
    } finally {
      setUpgradePending(false);
    }
  }

  // Nothing to show yet, the fetch failed, or this tenant's plan isn't a
  // PreCheck plan at all — the rest of /app/billing renders normally either way.
  if (loading) return null;
  if (!usage || !usage.precheck_enabled) return null;

  const pct = usage.quota > 0 ? Math.min(100, Math.round((usage.used / usage.quota) * 100)) : 0;
  const spendLabel = formatBRLFromCents(usage.spend.topup_cents);

  return (
    <div className="sub-block">
      <h2 className="sub-block-title">Pré-consultas (PreCheck)</h2>

      <div className="pc-usage-row">
        <span className="pc-usage-label">Plano</span>
        <span className="pc-usage-value">{usage.plan_name}</span>
      </div>
      <div className="pc-usage-row">
        <span className="pc-usage-label">Cota mensal</span>
        <span className="pc-usage-value">{usage.quota}</span>
      </div>

      <div className="pc-progress-wrap">
        <div
          className="pc-progress-track"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Pré-consultas usadas neste período"
        >
          <div
            className={`pc-progress-fill${pct >= 100 ? " pc-progress-full" : ""}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="pc-progress-caption">
          <span>
            {usage.used} de {usage.quota} usadas neste período
          </span>
          <span>{pct}%</span>
        </div>
      </div>

      {usage.topup_credits > 0 && (
        <div className="pc-credits">
          {usage.topup_credits}{" "}
          {usage.topup_credits === 1 ? "crédito avulso ativo" : "créditos avulsos ativos"}
          {usage.topup_expires_at && <> · expiram em {formatDatePtBR(usage.topup_expires_at)}</>}
        </div>
      )}

      <div className="pc-usage-row" style={{ marginTop: 10 }}>
        <span className="pc-usage-label">Total restante</span>
        <span className="pc-usage-value">{usage.remaining}</span>
      </div>

      <div className="pc-spend">
        Compras avulsas: {spendLabel} ({usage.spend.topup_count}{" "}
        {pluralize(usage.spend.topup_count, "compra")})
        <br />
        A mensalidade é cobrada via assinatura — veja em Gerenciar assinatura, abaixo.
      </div>

      <div className="pc-actions">
        <div className="pc-qty">
          <label className="pc-qty-label" htmlFor="pc-topup-quantity">
            Quantas pré-consultas?
          </label>
          <input
            id="pc-topup-quantity"
            className="pc-qty-input"
            type="number"
            inputMode="numeric"
            min={TOPUP_MIN_QUANTITY}
            step={1}
            value={quantity}
            disabled={topupPending}
            aria-describedby="pc-topup-quantity-hint"
            onChange={(e) => {
              setQuantity(e.target.value);
              setTopupError(null);
            }}
            // Snap an empty/below-minimum field back to the minimum when the
            // user leaves it, so the CTA is never blocked by a stale value they
            // have already looked away from.
            onBlur={() => {
              const parsed = Number.parseInt(quantity, 10);
              if (!Number.isFinite(parsed) || parsed < TOPUP_MIN_QUANTITY) {
                setQuantity(String(TOPUP_MIN_QUANTITY));
                setTopupError(null);
              }
            }}
          />
        </div>

        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={handleTopup}
          disabled={topupPending || !quantityValid}
        >
          <BrandIcon name="plus" />
          {topupPending ? "Abrindo…" : "Comprar mais pré-consultas"}
        </button>

        {usage.plan === "precheck_basic" && !upgradeConfirming && (
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => setUpgradeConfirming(true)}
            disabled={upgradePending}
          >
            <BrandIcon name="arrowR" />
            Fazer upgrade para Advanced
          </button>
        )}
      </div>

      <p id="pc-topup-quantity-hint" className="pc-qty-hint">
        Mínimo de {TOPUP_MIN_QUANTITY} pré-consultas por compra. Elas valem até o fim do
        período atual e o valor total aparece na tela de pagamento.
      </p>

      {topupError && (
        <p role="alert" className="portal-alert">
          {topupError}
        </p>
      )}

      {upgradeConfirming && (
        <div className="pc-confirm">
          <p style={{ margin: 0 }}>
            Confirma o upgrade para o plano PreCheck Advanced? A cota mensal de
            pré-consultas aumenta imediatamente e a diferença de valor é
            ajustada de forma proporcional na sua assinatura.
          </p>
          <div className="pc-confirm-actions">
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={handleUpgrade}
              disabled={upgradePending}
            >
              {upgradePending ? "Confirmando…" : "Confirmar upgrade"}
            </button>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => setUpgradeConfirming(false)}
              disabled={upgradePending}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {upgradeError && (
        <p role="alert" className="portal-alert">
          {upgradeError}
        </p>
      )}
      {upgradeNotice && (
        <p role="status" className="pc-notice">
          Upgrade concluído — seu plano agora é {usage.plan_name}.
        </p>
      )}
    </div>
  );
}
