"use client";

// AddProductDialog — "Adicionar à minha assinatura" (TASK C, spec 2026-09-29 §5.10). Opens on
// the plan card of the product a clinic LACKS while it owns the other one. Flow: preview
// (POST /billing/add-product, confirm:false — the exact Stripe numbers) -> the customer reads
// them -> Confirmar (confirm:true + a fresh Idempotency-Key). Nothing is charged before the
// click, and the click never opens a second checkout. The state machine is pure and tested
// (lib/add-product.ts); this file is only chrome: overlay, portal, Esc, focus.
//
// A native modal dialog lives in the browser top layer: showModal makes the page inert,
// contains keyboard focus, and restores the opener. Native Esc/backdrop closing is guarded
// while requests are pending. The portal keeps the component outside transformed price cards.

import { useCallback, useEffect, useId, useReducer, useRef, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import "./AddProductDialog.css";
import {
  addProductReducer,
  describeCharge,
  type AddProductState,
  type ProductFamily,
} from "@/lib/add-product";
import {
  addProductToSubscription,
  createPortalSession,
  ManageApiError,
  type Session,
  type AddProductCharge,
} from "@/lib/manage-api";

export type AddProductDialogProps = {
  open: boolean;
  product: ProductFamily;
  // The catalog plan on the card (a PreCheck tier, or secretaria_basico).
  plan: string;
  addons?: string[];
  session: Session;
  returnTo?: "console";
  returnFocusTo?: HTMLElement | null;
  onClose: () => void;
  // The backend said `no_active_subscription` (a courtesy clinic): continue with the normal
  // checkout instead.
  onFallbackToCheckout: () => void;
  // "Voltar ao painel" after success.
  onDone: (returnQuery: string | null) => void;
};

const cardStyle: CSSProperties = {
  width: "calc(100% - 40px)",
  padding: 24,
  border: 0,
  maxWidth: 440,
  boxShadow: "var(--shadow-xl)",
  maxHeight: "calc(100vh - 40px)",
  overflowY: "auto",
  position: "relative",
};

const productName = (product: ProductFamily) => (product === "precheck" ? "PreCheck" : "secretarIA");

function failureParts(e: unknown): { status: number; detail: string } {
  return e instanceof ManageApiError ? { status: e.status, detail: e.message } : { status: 0, detail: "" };
}

export function AddProductDialog({
  open,
  product,
  plan,
  addons,
  session,
  returnTo,
  returnFocusTo,
  onClose,
  onFallbackToCheckout,
  onDone,
}: AddProductDialogProps) {
  const [state, dispatch] = useReducer(addProductReducer, { step: "idle" } as AddProductState);
  const busy = state.step === "loading-preview" || state.step === "executing";
  const cardRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  // Bumped on every (re)open and on close: a late response of an abandoned attempt is ignored.
  const runRef = useRef(0);
  const returnQueryRef = useRef<string | null>(null);
  const quoteTokenRef = useRef<string | null>(null);
  const latest = useRef({ onClose, onFallbackToCheckout });
  latest.current = { onClose, onFallbackToCheckout };

  const requestBody = useCallback(
    (confirm: boolean, expectedCharge?: AddProductCharge) => ({
      product,
      ...(product === "precheck" ? { plan } : {}),
      ...(addons && addons.length ? { addons } : {}),
      confirm,
      ...(returnTo ? { return_to: returnTo } : {}),
      ...(confirm && expectedCharge ? { expected_charge: expectedCharge } : {}),
      ...(confirm && quoteTokenRef.current ? { quote_token: quoteTokenRef.current } : {}),
    }),
    [product, plan, addons, returnTo],
  );

  const loadPreview = useCallback(async () => {
    const run = ++runRef.current;
    quoteTokenRef.current = null;
    returnQueryRef.current = null;
    dispatch({ type: "open" });
    try {
      const res = await addProductToSubscription(session, requestBody(false));
      if (run !== runRef.current) return;
      if (res.status === "already_present") {
        returnQueryRef.current = res.return_query ?? null;
        dispatch({ type: "preview-already-present" });
        return;
      }
      if (!res.charge) throw new ManageApiError(502, "preview_unavailable");
      if (!res.quote_token) throw new ManageApiError(409, "preview_quote_required");
      quoteTokenRef.current = res.quote_token;
      dispatch({ type: "preview-ok", charge: res.charge, key: crypto.randomUUID() });
    } catch (e) {
      if (run !== runRef.current) return;
      dispatch({ type: "preview-fail", ...failureParts(e) });
    }
  }, [session, requestBody]);

  const execute = useCallback(
    async (key: string, expectedCharge: AddProductCharge) => {
      const run = runRef.current;
      try {
        const res = await addProductToSubscription(session, requestBody(true, expectedCharge), key);
        if (run !== runRef.current) return;
        returnQueryRef.current = res.return_query ?? null;
        dispatch({ type: "exec-ok", alreadyPresent: res.status === "already_present" });
      } catch (e) {
        if (run !== runRef.current) return;
        dispatch({ type: "exec-fail", ...failureParts(e) });
      }
    },
    [session, requestBody],
  );

  // Open -> fetch the preview; close -> drop everything (and ignore any late answer).
  useEffect(() => {
    if (open) {
      void loadPreview();
      // The initiating CTA may have been disabled during an awaited entitlement read.
      // Its explicit element wins over the browser activeElement, which may now be body.
      const opener = returnFocusTo ?? document.activeElement;
      const previousOverflow = document.body.style.overflow;
      const dialog = cardRef.current;
      document.body.style.overflow = "hidden";
      // showModal puts the dialog in the top layer and makes the rest of the page inert.
      // The browser supplies Tab containment and native focus restoration.
      if (dialog && !dialog.open) dialog.showModal();
      dialog?.focus();
      return () => {
        runRef.current += 1;
        quoteTokenRef.current = null;
        returnQueryRef.current = null;
        dialog?.close();
        document.body.style.overflow = previousOverflow;
        if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
      };
    }
    runRef.current += 1;
    quoteTokenRef.current = null;
    returnQueryRef.current = null;
    dispatch({ type: "close" });
    return undefined;
    // `loadPreview` is intentionally NOT a dependency: re-running on every render of the parent
    // would refetch the preview and rotate the idempotency key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // A courtesy clinic has no subscription to add to: hand over to the normal checkout.
  useEffect(() => {
    if (state.step === "error" && state.fallbackToCheckout) {
      runRef.current += 1;
      latest.current.onFallbackToCheckout();
    }
  }, [state]);

  useEffect(() => {
    // Disabled buttons cease to be focus targets. Keep focus on the modal itself while busy.
    if (open && busy) cardRef.current?.focus();
  }, [open, busy]);

  async function openPortal() {
    try {
      window.location.assign(await createPortalSession(session));
    } catch {
      // Stays on the error text; the customer can retry from the billing page.
    }
  }

  if (!open || typeof document === "undefined") return null;

  const name = productName(product);

  const body = (() => {
    switch (state.step) {
      case "idle":
      case "loading-preview":
        return <p className="muted">Calculando o valor…</p>;
      case "confirm":
      case "executing":
        return (
          <>
            {describeCharge(product, state.charge).map((line) => (
              <p key={line} style={{ margin: "0 0 10px" }}>
                {line}
              </p>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button
                type="button"
                className="btn btn--primary"
                disabled={state.step === "executing"}
                onClick={() => {
                  dispatch({ type: "confirm" });
                  void execute(state.key, state.charge);
                }}
              >
                {state.step === "executing" ? "Adicionando…" : "Confirmar"}
              </button>
              <button type="button" className="btn btn--outline" disabled={busy} onClick={onClose}>
                Cancelar
              </button>
            </div>
          </>
        );
      case "done":
        return (
          <>
            <p style={{ margin: "0 0 16px" }}>
              {state.alreadyPresent
                ? `O ${name} já estava na sua assinatura.`
                : `O ${name} foi adicionado à sua assinatura.`}
            </p>
            <button type="button" className="btn btn--primary" onClick={() => onDone(returnQueryRef.current)}>
              Voltar ao painel
            </button>
          </>
        );
      case "error":
        return (
          <>
            <p role="alert" style={{ margin: "0 0 16px", color: "var(--danger, #c0392b)" }}>
              {state.message}
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {state.portal && (
                <button type="button" className="btn btn--primary" onClick={() => void openPortal()}>
                  Abrir portal de cobrança
                </button>
              )}
              {!state.portal && (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => {
                    if (state.retryKey !== null && state.charge !== null) {
                      dispatch({ type: "retry" });
                      void execute(state.retryKey, state.charge);
                    } else {
                      void loadPreview();
                    }
                  }}
                >
                  Tentar novamente
                </button>
              )}
              <button type="button" className="btn btn--outline" onClick={onClose}>
                Fechar
              </button>
            </div>
          </>
        );
    }
  })();

  return createPortal(
    <dialog
      ref={cardRef}
      className="add-product-dialog card"
      style={cardStyle}
      aria-labelledby={titleId}
      tabIndex={-1}
      onKeyDown={(event) => {
        if (busy && event.key === "Tab") {
          event.preventDefault();
          event.currentTarget.focus();
        }
      }}
      onCancel={(event) => {
        // Native Esc must never dismiss an operation whose outcome is still pending.
        event.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget || busy) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}
    >
      <h2 id={titleId} style={{ margin: "0 0 12px", fontSize: 20 }}>
        Adicionar {name} à minha assinatura
      </h2>
      {body}
    </dialog>,
    document.body,
  );
}
