import { beforeEach, describe, expect, it, vi } from "vitest";
import * as React from "react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { CtaDecision } from "../add-product";

const hydrated = vi.hoisted(() => ({ decision: { kind: "checkout" } as CtaDecision, calls: 0 }));
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    // Supply the entitlement decision after the mount read; render the actual component.
    // Other state slots keep their initial values, so this tests JSX wiring, not API mocks.
    useState: (initial: unknown) => [hydrated.calls++ === 0 ? hydrated.decision : initial, () => {}],
  };
});
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {} }) }));
vi.mock("../../app/(site)/_components/CheckoutTrialNotice", () => ({ CheckoutTrialNotice: () => null }));
vi.mock("../../app/(site)/_components/LaunchWaitlistModal", () => ({ LaunchWaitlistModal: () => null }));
vi.mock("../../app/(site)/_lib/launch", () => ({ isPurchaseGated: () => false }));

import { PlanCheckoutCta } from "../../app/(site)/_components/PlanCheckoutCta";

function markup() {
  return renderToStaticMarkup(createElement(PlanCheckoutCta, {
    plan: "precheck_basic", catalogIds: ["precheck_basic"], label: "Contratar PreCheck",
  }));
}

beforeEach(() => { vi.stubGlobal("React", React); hydrated.calls = 0; hydrated.decision = { kind: "checkout" }; });

describe("PlanCheckoutCta rendered label", () => {
  it("uses the hydrated add-product decision in the visible button", () => {
    hydrated.decision = { kind: "add-product", product: "precheck" };
    const rendered = markup();
    expect(rendered).toContain("Adicionar à minha assinatura</button>");
    expect(rendered).not.toContain("Contratar PreCheck</button>");
  });
  it("keeps the card label for the ordinary checkout", () => {
    expect(markup()).toContain("Contratar PreCheck</button>");
  });
});
