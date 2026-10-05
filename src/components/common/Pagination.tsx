import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  itemLabel?: string;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  itemLabel = 'item',
  className = '',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(safeCurrentPage * pageSize, totalItems);

  // Generate pagination items with smart ellipsis
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (safeCurrentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages];
  };

  const pages = getPageNumbers();

  const handlePageClick = (p: number) => {
    if (p >= 1 && p <= totalPages && p !== safeCurrentPage) {
      onPageChange(p);
    }
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 pb-1 text-xs text-slate-600 dark:text-slate-400 select-none ${className}`}
    >
      {/* Left side: Showing items summary & Page Size Dropdown */}
      <div className="flex flex-wrap items-center gap-3">
        <span>
          Menampilkan{' '}
          <strong className="font-bold text-slate-900 dark:text-white font-mono">
            {startIndex}-{endIndex}
          </strong>{' '}
          dari{' '}
          <strong className="font-bold text-slate-900 dark:text-white font-mono">
            {totalItems}
          </strong>{' '}
          {itemLabel}
        </span>

        {onPageSizeChange && pageSizeOptions && pageSizeOptions.length > 0 && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden xs:inline">
              Per hal:
            </span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Jumlah item per halaman"
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1 text-xs font-semibold focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt} className="dark:bg-slate-800">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right side: Page Navigation Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* First Page Button */}
          <button
            type="button"
            onClick={() => handlePageClick(1)}
            disabled={safeCurrentPage === 1}
            title="Halaman Pertama"
            aria-label="Halaman Pertama"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          {/* Previous Page Button */}
          <button
            type="button"
            onClick={() => handlePageClick(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
            title="Halaman Sebelumnya"
            aria-label="Halaman Sebelumnya"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Page Number Pills */}
          <div className="flex items-center gap-1">
            {pages.map((p, idx) => {
              if (typeof p === 'string') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 py-1 text-slate-400 dark:text-slate-500 select-none text-xs"
                  >
                    ...
                  </span>
                );
              }

              const isActive = p === safeCurrentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePageClick(p)}
                  aria-label={`Halaman ${p}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={`min-w-7 h-7 px-2 flex items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Next Page Button */}
          <button
            type="button"
            onClick={() => handlePageClick(safeCurrentPage + 1)}
            disabled={safeCurrentPage === totalPages}
            title="Halaman Selanjutnya"
            aria-label="Halaman Selanjutnya"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Last Page Button */}
          <button
            type="button"
            onClick={() => handlePageClick(totalPages)}
            disabled={safeCurrentPage === totalPages}
            title="Halaman Terakhir"
            aria-label="Halaman Terakhir"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
