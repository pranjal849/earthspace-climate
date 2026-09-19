export default function Table({ columns, data, className = '' }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider"
                style={col.width ? { width: col.width } : {}}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, idx) => (
            <tr key={row._id || row.id || idx} className="hover:bg-background transition-colors duration-100">
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-4 text-text-primary">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function TablePagination({ page, pages, total, onPageChange }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-t border-border">
      <p className="text-xs text-text-muted">
        Showing page {page} of {pages} ({total} total)
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-xs rounded-input border border-border text-text-muted hover:text-text-primary disabled:opacity-40 transition-colors duration-150"
        >
          Previous
        </button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
          const pageNum = page <= 3 ? i + 1 : page + i - 2
          if (pageNum < 1 || pageNum > pages) return null
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-1.5 text-xs rounded-input transition-colors duration-150 ${
                pageNum === page
                  ? 'bg-accent text-white'
                  : 'border border-border text-text-muted hover:text-text-primary'
              }`}
            >
              {pageNum}
            </button>
          )
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="px-3 py-1.5 text-xs rounded-input border border-border text-text-muted hover:text-text-primary disabled:opacity-40 transition-colors duration-150"
        >
          Next
        </button>
      </div>
    </div>
  )
}
