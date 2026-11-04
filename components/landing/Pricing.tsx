// Pricing for the home page (#planos). Amounts, units and bullets come from
// app/(site)/_lib/pricing.ts — the one place they live, shared with /cadastro —
// and every buy button is still PlanCheckoutCta, so checkout, the add-product
// dialog and the secretarIA launch gate behave exactly as before.

import type { ReactNode } from "react";
import Link from "next/link";
import { PORTAL_LOGIN_HREF } from "@/lib/portal-login";
import { BrandIcon } from "@/app/(site)/_components/BrandIcon";
import { PlanCheckoutCta } from "@/app/(site)/_components/PlanCheckoutCta";
import { isPurchaseGated } from "@/app/(site)/_lib/launch";
import { PRICING, type PricingPlan } from "@/app/(site)/_lib/pricing";
import { PreCheckMark, SecretariaMark, SectionLabel, StatusTag } from "./brand";

function Plan({
  plan,
  name,
  badge,
  cta,
}: {
  plan: PricingPlan;
  name?: ReactNode;
  badge?: ReactNode;
  cta: ReactNode;
}) {
  return (
    <div className="mk-plan">
      <h4 className="mk-plan__name">
        {name ?? plan.name}
        {badge}
      </h4>
      <p className="mk-plan__tagline">{plan.tagline}</p>
      <p className={"mk-plan__price" + (plan.amount.startsWith("R$") ? "" : " mk-plan__price--text")}>
        <span className="mk-plan__amount">{plan.amount}</span>
        <span className="mk-plan__unit">{plan.unit}</span>
      </p>
      <ul className="mk-plan__feats">
        {plan.features.map((f) => (
          <li key={f}>
            <BrandIcon name="check" />
            {f}
          </li>
        ))}
      </ul>
      {cta}
    </div>
  );
}

const tier = (name: string) => name.replace(/^PreCheck\s+/, "");

export function Pricing() {
  // While secretarIA is behind the launch gate its button opens the waitlist,
  // so say that on the button. Flipping PRODUCT_LAUNCHED restores the label.
  const secretariaIds = PRICING.secretaria.catalogIds ?? [];
  const secretariaGated = isPurchaseGated(["secretaria_basico", ...secretariaIds]);

  return (
    <section id="planos" className="mk-section" aria-labelledby="planos-t">
      <div className="mk-wrap">
        <div className="mk-head">
          <SectionLabel>Planos</SectionLabel>
          <h2 id="planos-t" className="mk-h2">
            Preço claro, por produto.
          </h2>
          <p className="mk-lead">
            O PreCheck tem três faixas, pelo volume de pré-consultas do mês, e pode ser contratado
            aqui mesmo. A secretarIA é cobrada pelo uso e está em piloto.
          </p>
        </div>

        <div className="mk-pricing">
          <div>
            <div className="mk-plan-group__head">
              <h3 className="mk-plan-group__title">
                <PreCheckMark />
              </h3>
              <span className="mk-plan-group__hint">Mensal, por volume de pré-consultas</span>
            </div>
            <div className="mk-plans">
              <Plan
                plan={PRICING.precheckStart}
                name={tier(PRICING.precheckStart.name)}
                cta={
                  <PlanCheckoutCta
                    plan="precheck_start"
                    catalogIds={PRICING.precheckStart.catalogIds ?? []}
                    label="Contratar Start"
                  />
                }
              />
              <Plan
                plan={PRICING.precheck}
                name={tier(PRICING.precheck.name)}
                cta={
                  <PlanCheckoutCta
                    plan="precheck_basic"
                    catalogIds={PRICING.precheck.catalogIds ?? []}
                    label="Contratar Basic"
                  />
                }
              />
              <Plan
                plan={PRICING.precheckAdvanced}
                name={tier(PRICING.precheckAdvanced.name)}
                cta={
                  <PlanCheckoutCta
                    plan="precheck_advanced"
                    catalogIds={PRICING.precheckAdvanced.catalogIds ?? []}
                    label="Contratar Advanced"
                  />
                }
              />
            </div>
          </div>

          <div>
            <div className="mk-plan-group__head">
              <h3 className="mk-plan-group__title" style={{ fontSize: 18, fontWeight: 650 }}>
                secretarIA e pacote completo
              </h3>
            </div>
            <div className="mk-plans mk-plans--2">
              <Plan
                plan={PRICING.secretaria}
                name={<SecretariaMark />}
                badge={<StatusTag status="pilot" />}
                cta={
                  <PlanCheckoutCta
                    plan="secretaria_basico"
                    catalogIds={secretariaIds}
                    label={secretariaGated ? "Entrar na lista de espera" : "Contratar secretarIA"}
                  />
                }
              />
              <Plan
                plan={PRICING.combo}
                cta={
                  // No self-service checkout for the combo (catalogIds: null):
                  // it has always gone to the contact form.
                  <a href="#contato" className="mk-btn mk-btn--secondary mk-btn--block">
                    Falar com um consultor
                  </a>
                }
              />
            </div>
          </div>

          <div className="mk-pricing__foot">
            <span>
              Prefere conversar antes de contratar?{" "}
              <a href="#contato" className="mk-inline-link">
                Agende uma demonstração
              </a>
              .
            </span>
            <span>
              Já é cliente?{" "}
              <Link href={PORTAL_LOGIN_HREF} className="mk-inline-link">
                Entrar
              </Link>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
