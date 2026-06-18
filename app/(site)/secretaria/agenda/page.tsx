"use client";
// ===== secretarIA — Agenda page (route entry) =====
// Ported from _design-source/app.jsx.
// This is the App shell: owns all state (theme, view, appts, blocks, selection,
// modal, toast) and the full set of CRUD / status handlers.
// Sub-components (Toolbar, Toast) live here; the calendar views, drawer, and
// modals are imported from sibling files.

// CSS tokens required by this screen — must be first imports
import "../../product-tokens.css";
import "../../app-shell.css";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { CSSProperties } from "react";

import { Header }       from "../_shared/Header";
import type { Theme }   from "../_shared/Header";
import {
  Icon,
  Btn,
  Segmented,
  IconBtn,
} from "../_shared/ui";
import type { IconName } from "../_shared/ui";
import {
  WEEK_DAYS,
  MONTH_LABEL,
  PERIOD_LABEL,
  STATUS_META,
  SEED_APPTS,
  SEED_BLOCKS,
  dayFull,
  firstName,
} from "../_shared/data";
import type { Appt, ApptStatus } from "../_shared/data";

import { WeekView, DayView, MonthView } from "./calendar";
import { Drawer }                        from "./drawer";
import {
  NewApptModal,
  EditApptModal,
  RescheduleModal,
  CancelModal,
  BlockModal,
} from "./modals";

// ---------------------------------------------------------------------------
// Local types
// ---------------------------------------------------------------------------

type ViewMode = "semana" | "dia" | "mes";

type ModalState =
  | { type: "new" }
  | { type: "block" }
  | { type: "edit";   appt: Appt }
  | { type: "resched"; appt: Appt }
  | { type: "cancel"; appt: Appt }
  | null;

type ToastState = { msg: string; icon?: IconName } | null;

// ---------------------------------------------------------------------------
// Toast — transient notification bar at the bottom of the screen
// ---------------------------------------------------------------------------

/**
 * Floating toast notification displayed after user actions (create, edit, cancel…).
 * Animated in via the product-tokens `popIn` keyframe.
 * Returns null when no toast is active.
 */
function Toast({ toast }: { toast: ToastState }) {
  if (!toast) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 80,
        animation: "popIn .25s var(--ease)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: "13px 20px",
          borderRadius: 14,
          background: "#0e564d",
          color: "#eafff4",
          boxShadow: "var(--shadow-lg)",
          fontSize: 14,
          fontWeight: 500,
          maxWidth: 460,
        }}
      >
        {/* icon bubble */}
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 99,
            background: "rgba(255,255,255,.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name={toast.icon ?? "check"} size={15} />
        </span>
        {toast.msg}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toolbar — view switcher, navigation, and primary action buttons
// ---------------------------------------------------------------------------

/**
 * Top bar below the Header.
 * Contains: prev/next chevrons, "Hoje" button, current period label,
 * view segmented control, "Bloquear" and "Nova consulta" action buttons.
 */
function Toolbar({
  view,
  setView,
  onNew,
  onBlock,
  day,
  onToday,
}: {
  view: ViewMode;
  setView: (v: ViewMode) => void;
  onNew: () => void;
  onBlock: () => void;
  day: number;
  onToday: () => void;
}) {
  // Label depends on the active view
  const periodLabel =
    view === "dia"    ? dayFull(day)   :
    view === "mes"    ? MONTH_LABEL    :
    PERIOD_LABEL;

  // Secondary sub-label shown only in week view
  const sub = view === "semana" ? "Junho de 2026" : "";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "14px 26px",
        borderBottom: "1px solid var(--line)",
        flexShrink: 0,
        flexWrap: "wrap",
        rowGap: 12,
      }}
    >
      {/* left cluster: navigation + period label */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", gap: 4 }}>
          <IconBtn icon="chevL" title="Anterior" />
          <IconBtn icon="chevR" title="Próximo" />
        </div>
        <Btn
          variant="outline"
          size="sm"
          onClick={onToday}
          style={{ borderRadius: 11 }}
        >
          Hoje
        </Btn>
        <div>
          <div
            style={{
              fontSize: 19,
              fontWeight: 600,
              fontFamily: "var(--font-serif)",
              color: "var(--ink)",
              lineHeight: 1.15,
            }}
          >
            {periodLabel}
          </div>
          {sub && (
            <div
              style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: -1 }}
            >
              {sub}
            </div>
          )}
        </div>
      </div>

      {/* flexible spacer */}
      <div style={{ flex: 1 }} />

      {/* right cluster: view toggle + action buttons */}
      <Segmented<ViewMode>
        value={view}
        onChange={setView}
        size="sm"
        options={[
          { value: "dia",    label: "Dia" },
          { value: "semana", label: "Semana" },
          { value: "mes",    label: "Mês" },
        ]}
      />
      <Btn
        variant="outline"
        size="sm"
        icon="ban"
        onClick={onBlock}
        style={{ borderRadius: 11 }}
      >
        Bloquear
      </Btn>
      <Btn
        variant="primary"
        size="sm"
        icon="plus"
        onClick={onNew}
        style={{ borderRadius: 11 }}
      >
        Nova consulta
      </Btn>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AgendaPage — route entry / App shell
// ---------------------------------------------------------------------------

/**
 * secretarIA Agenda screen.
 * Owns: theme, calendar view, appointments, blocks, selection, modal, and toast state.
 * Renders Header → Toolbar → calendar view → optional Drawer → optional modal → Toast.
 */
export default function AgendaPage() {
  // --- Theme ---
  // Initialised to "light" on the server to avoid hydration mismatch.
  // On mount we read the attribute the root script already set.
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    setTheme(
      (document.documentElement.getAttribute("data-theme") as Theme) || "light"
    );
  }, []);

  const onToggleTheme = () =>
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("precheck_theme", next); } catch {}
      return next;
    });

  // --- Calendar state ---
  const [view, setView]     = useState<ViewMode>("semana");
  const [day, setDay]       = useState(1);           // index into WEEK_DAYS
  const [appts, setAppts]   = useState<Appt[]>(() => [...SEED_APPTS]);
  const [blocks, setBlocks] = useState<Appt[]>(() => [...SEED_BLOCKS]);
  const [selected, setSelected] = useState<Appt | null>(null);
  const [modal, setModal]   = useState<ModalState>(null);
  const [toast, setToast]   = useState<ToastState>(null);

  // Ref used to hold the auto-dismiss timer for the toast
  const toastRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ---------------------------------------------------------------------------
  // flash — shows a toast then auto-dismisses after 3.4 s
  // ---------------------------------------------------------------------------

  const flash = useCallback((msg: string, icon?: IconName) => {
    setToast({ msg, icon });
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3400);
  }, []);

  // Combined list used by all three calendar views
  const items = useMemo(() => [...appts, ...blocks], [appts, blocks]);

  // Keep the drawer in sync when the underlying appointment is mutated
  const liveSelected = selected
    ? items.find((i) => i.id === selected.id) ?? null
    : null;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  /** Update the status of an existing appointment (Confirmou / Compareceu / Faltou). */
  const setStatus = (appt: Appt, status: ApptStatus) => {
    setAppts((p) => p.map((a) => (a.id === appt.id ? { ...a, status } : a)));
    flash(
      `${firstName(appt.patient)} marcado como "${STATUS_META[status].label}".`,
      STATUS_META[status].tone === "miss" ? "xCircle" : "check"
    );
  };

  /** Persist a newly created appointment and optionally show a WhatsApp flash. */
  const createAppt = (data: Omit<Appt, "id">, message: string | null) => {
    const a: Appt = { ...data, id: "a" + Date.now(), notes: data.notes ?? "" };
    setAppts((p) => [...p, a]);
    setModal(null);
    if (message) {
      flash(
        `Consulta criada — confirmação enviada a ${firstName(a.patient)} no WhatsApp.`,
        "whatsapp"
      );
    } else {
      flash(`Consulta de ${firstName(a.patient)} agendada.`, "check");
    }
  };

  /** Patch mutable fields on an existing appointment (no patient notification). */
  const saveEdit = (appt: Appt, patch: Partial<Appt>) => {
    setAppts((p) => p.map((a) => (a.id === appt.id ? { ...a, ...patch } : a)));
    setModal(null);
    flash(`Detalhes de ${firstName(appt.patient)} atualizados.`, "check");
  };

  /** Reschedule to a new day/time and notify the patient via WhatsApp. */
  const doReschedule = (
    appt: Appt,
    slot: { day: number; start: number },
    _message: string
  ) => {
    setAppts((p) =>
      p.map((a) =>
        a.id === appt.id ? { ...a, ...slot, status: "agendado" } : a
      )
    );
    setModal(null);
    setSelected(null);
    flash(
      `Consulta remarcada — aviso enviado a ${firstName(appt.patient)} no WhatsApp.`,
      "whatsapp"
    );
  };

  /** Cancel an appointment and notify the patient via WhatsApp. */
  const doCancel = (appt: Appt, _reason: string, _message: string) => {
    setAppts((p) =>
      p.map((a) => (a.id === appt.id ? { ...a, status: "cancelado" } : a))
    );
    setModal(null);
    setSelected(null);
    flash(
      `Consulta cancelada — aviso enviado a ${firstName(appt.patient)} no WhatsApp.`,
      "whatsapp"
    );
  };

  /** Add a new time block to the calendar. */
  const createBlock = (data: {
    day: number;
    start: number;
    dur: number;
    reason: string;
  }) => {
    setBlocks((p) => [
      ...p,
      { ...data, id: "b" + Date.now(), status: "bloqueio" },
    ]);
    setModal(null);
    flash(`Horário bloqueado: ${data.reason}.`, "ban");
  };

  /** Remove an existing time block. */
  const removeBlock = (b: Appt) => {
    setBlocks((p) => p.filter((x) => x.id !== b.id));
    setSelected(null);
    flash("Bloqueio removido.", "check");
  };

  /** Navigate to DayView for a specific day index. */
  const goDay = (d: number) => {
    setDay(d);
    setView("dia");
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--page)",
      }}
    >
      <Header theme={theme} onToggleTheme={onToggleTheme} />

      <main
        style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
      >
        <Toolbar
          view={view}
          setView={setView}
          day={day}
          onNew={() => setModal({ type: "new" })}
          onBlock={() => setModal({ type: "block" })}
          onToday={() => {
            setDay(1);
            // From month view, jump back to week instead of staying in month
            if (view === "mes") setView("semana");
          }}
        />

        {view === "semana" && (
          <WeekView items={items} onSelect={setSelected} onDayClick={goDay} />
        )}
        {view === "dia" && (
          <DayView dayIdx={day} items={items} onSelect={setSelected} />
        )}
        {view === "mes" && (
          <MonthView items={items} onDayClick={goDay} />
        )}
      </main>

      {/* Detail drawer — shows only when an item is selected */}
      {liveSelected && (
        <Drawer
          appt={liveSelected}
          onClose={() => setSelected(null)}
          onSetStatus={setStatus}
          onCancel={(a) => setModal({ type: "cancel", appt: a })}
          onReschedule={(a) => setModal({ type: "resched", appt: a })}
          onEdit={(a) => setModal({ type: "edit", appt: a })}
          onRemoveBlock={removeBlock}
        />
      )}

      {/* Modals — one rendered at a time based on modal.type */}
      {modal?.type === "new" && (
        <NewApptModal
          presetDay={view === "dia" ? day : undefined}
          onClose={() => setModal(null)}
          onCreate={createAppt}
        />
      )}
      {modal?.type === "block" && (
        <BlockModal
          presetDay={view === "dia" ? day : undefined}
          onClose={() => setModal(null)}
          onCreate={createBlock}
        />
      )}
      {modal?.type === "edit" && (
        <EditApptModal
          appt={modal.appt}
          onClose={() => setModal(null)}
          onSave={saveEdit}
        />
      )}
      {modal?.type === "resched" && (
        <RescheduleModal
          appt={modal.appt}
          onClose={() => setModal(null)}
          onConfirm={doReschedule}
        />
      )}
      {modal?.type === "cancel" && (
        <CancelModal
          appt={modal.appt}
          onClose={() => setModal(null)}
          onConfirm={doCancel}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}
