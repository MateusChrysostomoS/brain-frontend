"use client";
// HubNotice — small inline banner shown above the page content whenever the
// secretarIA hub data path is NOT active: no session (demo/showcase mode) or
// the tenant lacks the secretarIA entitlement. Renders nothing once hubReady
// (or before the entitlement check has settled, to avoid a flash).

import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "./ui";
import type { Session } from "@/lib/manage-api";

type HubNoticeProps = {
  session: Session | null;
  notEntitled: boolean;
  ready: boolean;
};

const baseStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  margin: "0 28px 16px",
  padding: "10px 14px",
  borderRadius: 11,
  fontSize: 13,
  lineHeight: 1.5,
};

// Renders the "you're in demo mode" or "not entitled" banner, or null.
export function HubNotice({ session, notEntitled, ready }: HubNoticeProps) {
  if (!ready) return null;

  if (!session) {
    return (
      <div
        style={{
          ...baseStyle,
          background: "var(--surface-2)",
          border: "1px solid var(--line)",
          color: "var(--ink-soft)",
        }}
      >
        <Icon name="user" size={15} style={{ flexShrink: 0 }} />
        <span>
          Você está vendo dados de demonstração.{" "}
          <Link href="/login" style={{ color: "var(--brand)", fontWeight: 600 }}>
            Entre para conectar sua agenda real.
          </Link>
        </span>
      </div>
    );
  }

  if (notEntitled) {
    return (
      <div
        style={{
          ...baseStyle,
          background: "var(--st-miss-bg, #fdecea)",
          border: "1px solid var(--st-miss-bd, #f5c6c0)",
          color: "var(--st-miss-ink, #c0392b)",
        }}
      >
        <Icon name="ban" size={15} style={{ flexShrink: 0 }} />
        <span>
          Sua clínica não tem a secretarIA habilitada. Exibindo dados de demonstração.
        </span>
      </div>
    );
  }

  return null;
}
