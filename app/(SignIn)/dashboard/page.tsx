"use client";

// Dashboard (/dashboard) — implementation of the Claude Design handoff
// (Dashboard.html). The visual layer is rewritten on top of the existing
// state machine: auth gating, paginated fetching, bulk delete, filtering,
// and the 60s refresh ticker all behave exactly as before.

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import DashNav from "@/components/DashNav";
import { listSummaries, getMe, deletePatients } from "@/lib/api";
import { clearToken, isAuthed, isAuthError } from "@/lib/auth";
import {
  DEFAULT_PAGE_SIZE,
  getStoredPageSize,
  setStoredPageSize,
  type PageSize,
} from "@/lib/pageSize";
import { getSeenIds } from "@/lib/seen";
import type { Summary } from "@/lib/types";

import DashFilters, {
  type DateFilter,
  type StatusFilter,
} from "./components/DashFilters";
import DashHeader from "./components/DashHeader";
import DashPagination from "./components/DashPagination";
import DashSearch from "./components/DashSearch";
import PatientCard from "./components/PatientCard";
import "./dashboard.css";

// An item is "new" if it was created in the last 8h and the user hasn't
// opened it yet. Pulled out of JSX so the threshold is named in one place.
const NEW_BADGE_WINDOW_MS = 8 * 3600_000;

export default function DashboardPage() {
  const router = useRouter();

  // ── Data ────────────────────────────────────────────────────────
  const [items, setItems] = useState<Summary[]>([]);
  const [clinic, setClinic] = useState("");
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ── Filters / view state ────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [filterDate, setFilterDate] = useState<DateFilter>("all");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all");
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(0);

  // ── Selection + delete ──────────────────────────────────────────
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleteMode, setDeleteMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Polling handle so we can cancel on unmount + logout.
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Auth / lifecycle ────────────────────────────────────────────
  const logout = useCallback(() => {
    if (refreshRef.current) clearInterval(refreshRef.current);
    clearToken();
    router.push("/");
  }, [router]);

  const reload = useCallback(async () => {
    try {
      const data = await listSummaries(0, 100);
      setItems(data.items || []);
    } catch (e) {
      if (isAuthError(e)) logout();
    }
  }, [logout]);

  useEffect(() => {
    if (!isAuthed()) {
      router.replace("/login");
      return;
    }
    setSeenIds(getSeenIds());
    setPageSize(getStoredPageSize());
    let cancelled = false;

    async function load() {
      try {
        const data = await listSummaries(0, 100);
        if (cancelled) return;
        setItems(data.items || []);
        setLoading(false);
        try {
          const me = await getMe();
          if (!cancelled) {
            setClinic(me.name || "");
            setRole(me.role || "");
          }
        } catch {
          /* clinic label + role are best-effort */
        }
      } catch (e) {
        if (cancelled) return;
        if (isAuthError(e)) {
          logout();
        } else {
          setError(true);
          setLoading(false);
        }
      }
    }
    load();

    refreshRef.current = setInterval(reload, 60_000);

    return () => {
      cancelled = true;
      if (refreshRef.current) clearInterval(refreshRef.current);
    };
  }, [router, logout, reload]);

  // ── Filtering ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();
    const dayMs = 86_400_000;
    let list = items;

    if (q) {
      list = list.filter((s) =>
        (s.patient?.full_name || "").toLowerCase().includes(q),
      );
    }
    if (filterDate === "today") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      list = list.filter(
        (s) =>
          s.created_at &&
          new Date(s.created_at).getTime() >= startOfDay.getTime(),
      );
    } else if (filterDate === "week") {
      list = list.filter(
        (s) =>
          s.created_at &&
          now - new Date(s.created_at).getTime() <= 7 * dayMs,
      );
    }
    if (filterStatus !== "all") {
      list = list.filter((s) => s.status === filterStatus);
    }
    return list;
  }, [items, query, filterDate, filterStatus]);

  const filteredIds = useMemo(() => filtered.map((s) => s.id), [filtered]);

  // ── Pagination ──────────────────────────────────────────────────
  const pageCount = useMemo(() => {
    if (pageSize === "all") return 1;
    return Math.max(1, Math.ceil(filtered.length / pageSize));
  }, [filtered.length, pageSize]);

  // Clamp so a stale index never points past the current result set.
  const currentPage = Math.min(page, pageCount - 1);

  const paged = useMemo(() => {
    if (pageSize === "all") return filtered;
    const start = currentPage * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageSize, currentPage]);

  // A new search / filter / page-size re-shapes the list — return to page 1.
  useEffect(() => {
    setPage(0);
  }, [query, filterDate, filterStatus, pageSize]);

  // After a delete shrinks the list, keep the page index in range.
  useEffect(() => {
    setPage((p) => Math.min(p, pageCount - 1));
  }, [pageCount]);

  // ── Selection ──────────────────────────────────────────────────
  const visibleSelectedIds = useMemo(
    () => filteredIds.filter((id) => selectedIds.has(id)),
    [filteredIds, selectedIds],
  );
  const selectedCount = visibleSelectedIds.length;

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectPageSize = useCallback((size: PageSize) => {
    setPageSize(size);
    setStoredPageSize(size);
  }, []);

  // ── Stats (header) ─────────────────────────────────────────────
  const stats = useMemo(() => {
    let waiting = 0;
    for (const s of items) {
      if (s.status === "draft") waiting++;
    }
    return { total: items.length, waiting };
  }, [items]);

  // ── Bulk delete ────────────────────────────────────────────────
  // Maps a list of summary ids to the distinct patients behind them.
  const distinctPatients = useCallback(
    (summaryIds: number[]) => {
      const map = new Map<number, string>();
      for (const id of summaryIds) {
        const s = items.find((x) => x.id === id);
        if (s?.patient_id != null && !map.has(s.patient_id)) {
          map.set(s.patient_id, s.patient?.full_name || "Paciente");
        }
      }
      return map;
    },
    [items],
  );

  // Distinct patient count for the selected scope.
  const selectedPatientCount = useMemo(
    () => distinctPatients(visibleSelectedIds).size,
    [distinctPatients, visibleSelectedIds],
  );

  // Arms / disarms delete mode. Leaving delete mode drops any selection.
  const toggleDeleteMode = useCallback(() => {
    setDeleteMode((on) => {
      if (on) setSelectedIds(new Set());
      return !on;
    });
  }, []);

  // Toolbar trash button → opens the confirmation modal.
  const openDeleteModal = useCallback(() => {
    if (selectedCount === 0) return;
    setDeleteError(null);
    setModalOpen(true);
  }, [selectedCount]);

  // Dismisses the delete flow.
  const closeModal = useCallback(() => {
    if (deleting) return; // block dismiss mid-request
    setDeleteError(null);
    setModalOpen(false);
  }, [deleting]);

  // Deletes the selected patients.
  const deleteSelected = useCallback(async () => {
    const patientIds = [...distinctPatients(visibleSelectedIds).keys()];
    if (patientIds.length === 0) {
      setModalOpen(false);
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      await deletePatients(patientIds);
      const removed = new Set(patientIds);
      // Deleting a patient removes ALL their bars — drop every match.
      setItems((prev) =>
        prev.filter(
          (s) => s.patient_id == null || !removed.has(s.patient_id),
        ),
      );
      setSelectedIds(new Set());
      setModalOpen(false);
      reload();
    } catch (e) {
      if (isAuthError(e)) {
        logout();
        return;
      }
      setDeleteError(e instanceof Error ? e.message : "Falha ao excluir.");
    } finally {
      setDeleting(false);
    }
  }, [distinctPatients, visibleSelectedIds, reload, logout]);

  // ── Render ─────────────────────────────────────────────────────
  const now = Date.now();
  const countText =
    filtered.length === 1 ? "1 registro" : `${filtered.length} registros`;

  return (
    <div className="dash-route">
      <DashNav clinic={clinic} role={role} onLogout={logout} />

      <main className="dash">
        <DashHeader total={stats.total} waiting={stats.waiting} />

        <DashSearch value={query} onChange={setQuery} />

        <DashFilters
          dateFilter={filterDate}
          onDateChange={setFilterDate}
          statusFilter={filterStatus}
          onStatusChange={setFilterStatus}
          deleteMode={deleteMode}
          onToggleDeleteMode={toggleDeleteMode}
          onRequestDelete={openDeleteModal}
          deleteDisabled={selectedCount === 0}
          confirmActive={modalOpen}
          hasSelection={selectedCount > 0}
        />

        <div className="dash-count">
          <span>{countText}</span>
          {selectedCount > 0 && (
            <>
              <span className="sep" aria-hidden="true" />
              <span className="selection">
                {selectedCount === 1
                  ? "1 selecionado"
                  : `${selectedCount} selecionados`}
              </span>
            </>
          )}
        </div>

        <section className="dash-list" aria-busy={loading}>
          {loading ? (
            <div className="state">Carregando…</div>
          ) : error ? (
            <div className="state">
              Não foi possível carregar a lista. Tente novamente em alguns
              segundos.
            </div>
          ) : filtered.length === 0 ? (
            <div className="state">Nenhum registro encontrado.</div>
          ) : (
            paged.map((s) => {
              const isNew =
                !!s.created_at &&
                now - new Date(s.created_at).getTime() < NEW_BADGE_WINDOW_MS &&
                !seenIds.has(s.id);
              return (
                <PatientCard
                  key={s.id}
                  summary={s}
                  isNew={isNew}
                  deleteMode={deleteMode}
                  selected={selectedIds.has(s.id)}
                  onToggleSelect={toggleSelect}
                  onOpen={(id) => router.push(`/summary?id=${id}`)}
                />
              );
            })
          )}
        </section>

        <DashPagination
          pageSize={pageSize}
          onPageSizeChange={selectPageSize}
          page={currentPage}
          pageCount={pageCount}
          onPageChange={setPage}
        />
      </main>

      <ConfirmDeleteModal
        open={modalOpen}
        deleting={deleting}
        selectedCount={selectedPatientCount}
        errorMsg={deleteError}
        onCancel={closeModal}
        onDeleteSelected={deleteSelected}
      />
    </div>
  );
}
