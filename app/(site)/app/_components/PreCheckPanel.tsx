"use client";

// PreCheckPanel — full PreCheck section of the /app dashboard: head (title + real
// tiles + SSO handoff button), search, filters, anamnesis rows, pagination. Owns its
// own fetch of GET /doctor/anamneses (listAnamneses) — every number/row/filter here
// comes from that response; there is no mock data left in this file.

import { useEffect, useMemo, useState } from "react";
import { BrandIcon } from "../../_components/BrandIcon";
import { describeApiError } from "../../_components/usePortalGuard";
import { listAnamneses, type Anamnesis, type Session } from "@/lib/manage-api";
import { formatDateTimePtBR, isTodayLocal, isWithinLastDays, matchesSearch, pluralize } from "./format";
import { PanelMessage, PanelSkeleton } from "./PanelStates";

// Anamnesis.status -> pt-BR badge copy/class. Unrecognized values fall back to the
// raw status string and the neutral "wait" badge rather than crashing.
const STATUS_LABEL: Record<string, string> = {
  draft: "Em revisão",
  approved: "Aprovada",
  rejected: "Rejeitada",
};
const STATUS_BADGE: Record<string, string> = {
  draft: "badge--wait",
  approved: "badge--done",
  rejected: "badge--red",
};
function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status;
}
function statusBadgeClass(status: string): string {
  return STATUS_BADGE[status] ?? "badge--wait";
}

// PreCheckRow — single real anamnesis card (patient name, formatted date, status
// badge, summary preview). No fabricated severity indicator — the API has none.
function PreCheckRow({ a }: { a: Anamnesis }) {
  return (
    <div className="row-card">
      <div className="row-main">
        <div className="row-name">{a.patient_name}</div>
        <div className="row-meta">{formatDateTimePtBR(a.created_at)}</div>
        {a.summary_preview ? (
          <div className="row-desc">{a.summary_preview}</div>
        ) : (
          <div className="row-desc empty">Sem resumo registrado.</div>
        )}
      </div>
      <div className="row-right">
        <span className={`badge ${statusBadgeClass(a.status)}`}>
          <span className="d" />
          {statusLabel(a.status)}
        </span>
      </div>
    </div>
  );
}

const PAGE_SIZE = 100;

type DateFilter = "all" | "today" | "7d" | "30d";
type StatusFilter = "all" | "draft" | "approved" | "rejected";

type PreCheckPanelProps = {
  session: Session;
  // "Abrir painel completo" SSO handoff — owned by the parent page (it navigates
  // away from /app entirely), this panel only renders the button/error it's given.
  onOpen: () => void;
  ssoPending: boolean;
  ssoError: string | null;
};

export function PreCheckPanel({ session, onOpen, ssoPending, ssoError }: PreCheckPanelProps) {
  // --- Fetch state ---
  const [items, setItems] = useState<Anamnesis[]>([]);
  const [total, setTotal] = useState(0);
  const [stub, setStub] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // --- Filter state (all client-side, over whatever has been fetched so far) ---
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  async function fetchPage(skip: number, append: boolean) {
    if (append) setLoadingMore(true);
    else {
      setLoading(true);
      setFetchError(null);
    }
    try {
      const page = await listAnamneses(session, skip, PAGE_SIZE);
      setItems((prev) => (append ? [...prev, ...page.items] : page.items));
      setTotal(page.total);
      setStub(Boolean(page.stub));
      setFetchError(null);
    } catch (err) {
      setFetchError(describeApiError(err));
    } finally {
      if (append) setLoadingMore(false);
      else setLoading(false);
    }
  }

  useEffect(() => {
    void fetchPage(0, false);
    // Fetch once per mount (i.e. each time the PreCheck tab becomes active) —
    // session.token is stable for the component's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.token]);

  // --- Tiles: always over the FULL fetched window, independent of the filters
  // below (so "Em revisão"/"Aprovadas" describe everything loaded, not just what's
  // currently visible through search/date/status filters). ---
  const todayCount = useMemo(
    () => items.filter((a) => isTodayLocal(a.created_at)).length,
    [items],
  );
  const draftCount = useMemo(() => items.filter((a) => a.status === "draft").length, [items]);
  const approvedCount = useMemo(
    () => items.filter((a) => a.status === "approved").length,
    [items],
  );

  // --- Rows actually shown, after search + status + date filters ---
  const filteredItems = useMemo(() => {
    return items.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (dateFilter === "today" && !isTodayLocal(a.created_at)) return false;
      if (dateFilter === "7d" && !isWithinLastDays(a.created_at, 7)) return false;
      if (dateFilter === "30d" && !isWithinLastDays(a.created_at, 30)) return false;
      if (!matchesSearch(a.patient_name, search)) return false;
      return true;
    });
  }, [items, statusFilter, dateFilter, search]);

  // While loading, stubbed (no PreCheck upstream) or errored, `items` is either
  // empty or stale — the tiles must read "—" (unknown), never a silent "0" that
  // would misrepresent "we couldn't check" as "we checked and there are none".
  const dataUnavailable = loading || stub || Boolean(fetchError);

  const hasMore = items.length < total;
  // "n de total" whenever what's displayed differs from the grand total — whether
  // because more exists server-side than we've fetched, or because a filter is
  // hiding some of what we DID fetch. Equal -> just "total", no redundant "de".
  const regCountLabel =
    filteredItems.length === total
      ? `${total} ${pluralize(total, "registro")}`
      : `${filteredItems.length} de ${total} ${pluralize(total, "registro")}`;

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">Painel clínico · PreCheck</span>
          <h1 className="panel-title">
            Anamneses <span className="em">do dia</span>.
          </h1>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14 }}>
          <div className="panel-stats">
            <div>
              <div className="v">{dataUnavailable ? "—" : todayCount}</div>
              <div className="k">Hoje</div>
            </div>
            <div>
              <div className="v em">{dataUnavailable ? "—" : draftCount}</div>
              <div className="k">Em revisão</div>
            </div>
            <div>
              <div className="v">{dataUnavailable ? "—" : approvedCount}</div>
              <div className="k">Aprovadas</div>
            </div>
          </div>
          {/* SSO handoff into the ported PreCheck dashboard (/dashboard): brain-api mints
              a PreCheck-compatible token, the page stores it as `precheck_token` (same
              origin), then navigates — no second login. 403/409 surface inline. */}
          <div
            className="panel-actions"
            style={{ flexDirection: "column", alignItems: "flex-end", gap: 6 }}
          >
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={onOpen}
              disabled={ssoPending}
            >
              <BrandIcon name="arrowR" />
              {ssoPending ? "Abrindo…" : "Abrir painel completo"}
            </button>
            {ssoError && (
              <p
                role="alert"
                style={{
                  fontSize: 12.5,
                  lineHeight: 1.4,
                  color: "var(--danger, #c0392b)",
                  maxWidth: 260,
                  textAlign: "right",
                  margin: 0,
                }}
              >
                {ssoError}
              </p>
            )}
          </div>
        </div>
      </div>

      {loading && <PanelSkeleton />}

      {!loading && stub && (
        <PanelMessage
          icon="server"
          title="Integração PreCheck indisponível no momento"
          hint="Não foi possível conectar ao PreCheck agora. Tente novamente mais tarde."
        />
      )}

      {!loading && !stub && fetchError && (
        <PanelMessage
          icon="ban"
          tone="error"
          title="Não foi possível carregar as anamneses"
          hint={fetchError}
          action={
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => void fetchPage(0, false)}
            >
              Tentar novamente
            </button>
          }
        />
      )}

      {!loading && !stub && !fetchError && items.length === 0 && (
        <PanelMessage
          icon="note"
          title="Nenhuma anamnese ainda"
          hint="Assim que um paciente preencher uma anamnese pelo PreCheck, ela aparece aqui."
        />
      )}

      {!loading && !stub && !fetchError && items.length > 0 && (
        <>
          <div className="search">
            <BrandIcon name="user" />
            <input
              placeholder="Buscar por nome do paciente…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filters">
            <span className="filt-label">Data</span>
            <div className="seg" role="group" aria-label="Filtrar por data">
              <button
                className={dateFilter === "all" ? "on" : ""}
                aria-pressed={dateFilter === "all"}
                onClick={() => setDateFilter("all")}
              >
                Todas
              </button>
              <button
                className={dateFilter === "today" ? "on" : ""}
                aria-pressed={dateFilter === "today"}
                onClick={() => setDateFilter("today")}
              >
                Hoje
              </button>
              <button
                className={dateFilter === "7d" ? "on" : ""}
                aria-pressed={dateFilter === "7d"}
                onClick={() => setDateFilter("7d")}
              >
                7 dias
              </button>
              <button
                className={dateFilter === "30d" ? "on" : ""}
                aria-pressed={dateFilter === "30d"}
                onClick={() => setDateFilter("30d")}
              >
                30 dias
              </button>
            </div>
            <span className="filt-label" style={{ marginLeft: 8 }}>
              Status
            </span>
            <div className="seg" role="group" aria-label="Filtrar por status">
              <button
                className={statusFilter === "all" ? "on" : ""}
                aria-pressed={statusFilter === "all"}
                onClick={() => setStatusFilter("all")}
              >
                Todas
              </button>
              <button
                className={statusFilter === "draft" ? "on" : ""}
                aria-pressed={statusFilter === "draft"}
                onClick={() => setStatusFilter("draft")}
              >
                Em revisão
              </button>
              <button
                className={statusFilter === "approved" ? "on" : ""}
                aria-pressed={statusFilter === "approved"}
                onClick={() => setStatusFilter("approved")}
              >
                Aprovadas
              </button>
              <button
                className={statusFilter === "rejected" ? "on" : ""}
                aria-pressed={statusFilter === "rejected"}
                onClick={() => setStatusFilter("rejected")}
              >
                Rejeitadas
              </button>
            </div>
          </div>
          <div className="reg-count">{regCountLabel}</div>

          <div className="rows">
            {filteredItems.length === 0 ? (
              <div className="panel-state panel-state--inline">
                <p className="panel-state-title">Nenhum resultado para os filtros selecionados.</p>
              </div>
            ) : (
              filteredItems.map((a) => <PreCheckRow key={a.id} a={a} />)
            )}
          </div>

          <div className="pagination">
            <div>
              Por página · <b style={{ color: "var(--ink-soft)" }}>{PAGE_SIZE}</b>
            </div>
            <div className="pg">
              {hasMore ? (
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => void fetchPage(items.length, true)}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    "Carregando…"
                  ) : (
                    <>
                      Carregar mais <BrandIcon name="arrowR" />
                    </>
                  )}
                </button>
              ) : (
                <span>Todos os registros carregados</span>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
