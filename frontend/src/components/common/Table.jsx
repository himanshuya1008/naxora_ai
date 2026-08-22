import clsx from 'clsx';

/**
 * Shared data-table primitive — replaces both the real-<table> pattern
 * (VisitorsTable) and the div-row-of-buttons pattern (Leads/Reports/
 * Customers pages) with one semantic, consistently-styled implementation.
 * Rows are real <tr>s (not buttons) with an optional onRowClick, so a11y
 * and keyboard nav come from the table semantics themselves.
 *
 * columns: [{ key, label, align: 'left'|'right', render?: (row) => node }]
 */
export default function Table({ columns, rows, rowKey = 'id', onRowClick, emptyState }) {
  if (rows.length === 0 && emptyState) return emptyState;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint',
                  col.align === 'right' ? 'text-right' : 'text-left'
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row[rowKey]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={clsx(
                'border-b border-line/60 last:border-0 transition-colors duration-150',
                onRowClick && 'cursor-pointer hover:bg-champagne/10'
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={clsx('px-4 py-3.5 text-ink-2', col.align === 'right' ? 'text-right' : 'text-left')}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
