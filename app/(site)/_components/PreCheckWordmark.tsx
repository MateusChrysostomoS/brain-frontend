// PreCheckWordmark — the PreCheck product mark: the PreCheck logo bitmap plus
// "Pre" + an italic, brand-coloured "Check". Mirrors PreCheck's own `.dash-brand`
// lockup (PreCheck/frontend/components/DashNav.tsx + app/dash-nav.css) so the two
// products look like the same brand family.
//
// The bitmap is served from /brand/precheck-logo.png — copied from
// PreCheck/frontend/public/brand/ into this project's public/ so the static export
// ships it. A plain <img> is used on purpose: next/image is already unoptimized
// under `output: "export"`, so it would only add markup.

import "./PreCheckWordmark.css";

type PreCheckWordmarkProps = {
  // Font size in px. Omit to inherit the surrounding text size.
  size?: number;
};

export function PreCheckWordmark({ size }: PreCheckWordmarkProps) {
  return (
    <span className="precheck-wordmark" style={size ? { fontSize: size } : undefined}>
      {/* alt="" on purpose: the "PreCheck" text right next to it IS the name. */}
      <img src="/brand/precheck-logo.png" alt="" className="precheck-wordmark-logo" />
      Pre<em>Check</em>
    </span>
  );
}
