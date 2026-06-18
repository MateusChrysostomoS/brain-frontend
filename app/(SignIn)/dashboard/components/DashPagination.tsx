// DashPagination — page-size pill row on the left + prev / info / next
// controls on the right. Hidden navigation pad when the list fits on
// a single page; the size selector stays visible for completeness.

import PillRow from "./PillRow";
import { PAGE_SIZE_OPTIONS, type PageSize } from "@/lib/pageSize";

const SIZE_OPTIONS = PAGE_SIZE_OPTIONS.map((opt) => ({
  value: opt,
  label: opt === "all" ? "Todos" : String(opt),
}));

type DashPaginationProps = {
  pageSize: PageSize;
  onPageSizeChange: (next: PageSize) => void;
  page: number;
  pageCount: number;
  onPageChange: (next: number) => void;
};

export default function DashPagination({
  pageSize,
  onPageSizeChange,
  page,
  pageCount,
  onPageChange,
}: DashPaginationProps) {
  const hasNav = pageCount > 1;

  return (
    <footer className="dash-pagination">
      <div className="page-size">
        <span className="filter-label">Por página</span>
        <PillRow<PageSize>
          value={pageSize}
          options={SIZE_OPTIONS}
          onChange={onPageSizeChange}
          ariaLabel="Itens por página"
        />
      </div>

      {hasNav && (
        <div className="page-nav">
          <button
            type="button"
            className="page-btn"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
          >
            ‹ Anterior
          </button>
          <span className="label">
            Página {page + 1} de {pageCount}
          </span>
          <button
            type="button"
            className="page-btn"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount - 1}
          >
            Próxima ›
          </button>
        </div>
      )}
    </footer>
  );
}
