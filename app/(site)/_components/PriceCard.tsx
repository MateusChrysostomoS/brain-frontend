// PriceCard — a single pricing tier card matching the .price-card markup in brain.html.
// Featured cards get the brand border + tinted background; CTA button style differs too.

import { BrandIcon } from "./BrandIcon";

export type PriceCardProps = {
  name: string;
  tagline: string;
  amount: string;
  unit?: string;
  note?: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
  flag?: string;
};

// Pure server component — no interactivity needed.
export function PriceCard(p: PriceCardProps) {
  return (
    <div className={"price-card" + (p.featured ? " featured" : "")}>
      {/* Optional "Melhor valor" / "Mais comum" badge */}
      {p.flag && <span className="price-flag">{p.flag}</span>}

      <div className="price-name">{p.name}</div>
      <p className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>
        {p.tagline}
      </p>

      <div className="price-amt">
        <span className="v">{p.amount}</span>
        {p.unit && <span className="u">{p.unit}</span>}
      </div>

      {p.note && <div className="price-note">{p.note}</div>}

      {/* Feature list — each item gets a check icon */}
      <ul className="tick-list price-feats">
        {p.features.map((feat, i) => (
          <li key={i} className="ok">
            <BrandIcon name="check" />
            {feat}
          </li>
        ))}
      </ul>

      {/* CTA: primary for featured, outline otherwise — as per the design */}
      <a
        className={
          "btn btn--block" +
          (p.featured ? " btn--primary" : " btn--outline")
        }
        href={p.ctaHref}
      >
        {p.ctaLabel}
      </a>
    </div>
  );
}
