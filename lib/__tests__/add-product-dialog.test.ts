import { beforeEach, describe, expect, it, vi } from "vitest";
import * as React from "react";
import type { ReactElement } from "react";
import type { AddProductState } from "../add-product";
import type { Session } from "../manage-api";

const harness = vi.hoisted(() => ({ state: { step: "idle" } as AddProductState, effects: [] as Array<() => unknown>, refs: [] as Array<{ current: unknown }>, refIndex: 0, api: vi.fn(), dispatch: vi.fn() }));
vi.mock("react", async (importOriginal) => ({
  ...await importOriginal<typeof import("react")>(),
  useReducer: () => [harness.state, harness.dispatch],
  useRef: (value: unknown) => { const index = harness.refIndex++; return harness.refs[index] ?? (harness.refs[index] = { current: value }); },
  useId: () => "add-product-title",
  useEffect: (fn: () => unknown) => { harness.effects.push(fn); },
  useCallback: (fn: unknown) => fn,
}));
vi.mock("react-dom", () => ({ createPortal: (child: unknown) => child }));
vi.mock("../manage-api", async (importOriginal) => ({ ...await importOriginal<typeof import("../manage-api")>(), addProductToSubscription: harness.api }));
import { AddProductDialog } from "../../app/(site)/_components/AddProductDialog";

const charge = { currency: "brl", amount_due_now_cents: 4500, next_invoice_cents: null, next_invoice_date: "2026-10-15" };
const session = { token: "synthetic", role: "manager", tenantId: "clinic" } as Session;
function render(returnFocusTo?: HTMLElement) {
  harness.refIndex = 0;
  return AddProductDialog({ open: true, product: "precheck", plan: "precheck_basic", session, returnTo: "console", returnFocusTo, onClose: vi.fn(), onDone: vi.fn(), onFallbackToCheckout: vi.fn() }) as unknown as ReactElement<any>;
}
function find(element: any, predicate: (node: any) => boolean): any {
  if (!element || typeof element !== "object") return undefined;
  if (predicate(element)) return element;
  const children = React.Children.toArray(element.props?.children);
  for (const child of children) { const result = find(child, predicate); if (result) return result; }
}

beforeEach(() => {
  vi.stubGlobal("React", React);
  vi.stubGlobal("document", { body: { style: { overflow: "" } }, activeElement: null, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  harness.refs = []; harness.refIndex = 0;
  vi.stubGlobal("crypto", { randomUUID: () => "new-key" });
  harness.effects = []; harness.api.mockReset(); harness.dispatch.mockClear(); harness.state = { step: "idle" };
  harness.api.mockResolvedValue({ status: "already_present", return_query: "origem=console&produto=precheck", charge: null });
});

describe("AddProductDialog integration", () => {
  it("sends the allowlisted return context on preview too", async () => {
    render();
    harness.effects[0]();
    await Promise.resolve();
    expect(harness.api.mock.calls[0][1]).toMatchObject({ confirm: false, return_to: "console" });
  });
  it("confirms the charge actually displayed, with its original key", async () => {
    harness.state = { step: "confirm", charge, key: "original-key" };
    const dialog = render();
    const button = find(dialog, (node) => node.type === "button" && node.props.children === "Confirmar");
    button.props.onClick();
    await Promise.resolve();
    expect(harness.api.mock.calls[0]).toEqual([session, expect.objectContaining({ confirm: true, return_to: "console", expected_charge: charge }), "original-key"]);
  });
  it("uses native modal dialog semantics", () => {
    expect(render().type).toBe("dialog");
  });
  it("prevents native Escape cancellation while executing", () => {
    harness.state = { step: "executing", charge, key: "original-key" };
    const dialog = render();
    const preventDefault = vi.fn();
    dialog.props.onCancel({ preventDefault });
    expect(preventDefault).toHaveBeenCalledOnce();
  });
  it("keeps the exact signed quote and key across an uncertain confirmation retry", async () => {
    harness.api.mockResolvedValueOnce({ status: "preview", charge, quote_token: "signed-quote-a" });
    render(); harness.effects[0](); await Promise.resolve();
    harness.state = { step: "confirm", charge, key: "original-key" };
    find(render(), (node) => node.type === "button" && node.props.children === "Confirmar").props.onClick();
    await Promise.resolve();
    harness.state = { step: "error", charge, retryKey: "original-key", portal: false, fallbackToCheckout: false, message: "network" };
    find(render(), (node) => node.type === "button" && node.props.children === "Tentar novamente").props.onClick();
    await Promise.resolve();
    for (const call of harness.api.mock.calls.slice(1)) {
      expect(call[1]).toMatchObject({ quote_token: "signed-quote-a", expected_charge: charge, confirm: true });
      expect(call[2]).toBe("original-key");
    }
  });
  it("replaces the signed quote after a fresh preview", async () => {
    harness.api.mockResolvedValueOnce({ status: "preview", charge, quote_token: "signed-quote-a" });
    render(); harness.effects[0](); await Promise.resolve();
    harness.effects = [];
    harness.api.mockResolvedValueOnce({ status: "preview", charge, quote_token: "signed-quote-b" });
    render(); harness.effects[0](); await Promise.resolve();
    harness.state = { step: "confirm", charge, key: "new-key" };
    find(render(), (node) => node.type === "button" && node.props.children === "Confirmar").props.onClick();
    expect(harness.api.mock.calls[2][1]).toMatchObject({ quote_token: "signed-quote-b" });
  });
  it("accepts already-present preview without needing a signed charge quote", async () => {
    render(); harness.effects[0](); await Promise.resolve();
    expect(harness.dispatch).toHaveBeenCalledWith({ type: "preview-already-present" });
  });

  it("keeps keyboard focus on the dialog while all action buttons are disabled", () => {
    harness.state = { step: "executing", charge, key: "original-key" };
    const dialog = render();
    const preventDefault = vi.fn();
    const focus = vi.fn();
    dialog.props.onKeyDown({ key: "Tab", preventDefault, currentTarget: { focus } });
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(focus).toHaveBeenCalledOnce();
  });

  it("restores the explicit initiating CTA after async loading moved focus to body", () => {
    const focus = vi.fn();
    class FocusTarget { isConnected = true; focus = focus; }
    vi.stubGlobal("HTMLElement", FocusTarget);
    const trigger = new FocusTarget() as unknown as HTMLElement;
    (document as any).activeElement = document.body;
    render(trigger);
    const cleanup = harness.effects[0]() as () => void;
    cleanup();
    expect(focus).toHaveBeenCalledOnce();
  });

});
