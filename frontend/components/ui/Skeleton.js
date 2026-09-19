export default function Skeleton({ className = '', variant = 'rect' }) {
  const baseClass = 'skeleton relative overflow-hidden'
  const shimmer = <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />

  if (variant === 'circle') {
    return <div className={`${baseClass} rounded-full ${className}`}>{shimmer}</div>
  }

  if (variant === 'text') {
    return <div className={`${baseClass} h-4 rounded ${className}`}>{shimmer}</div>
  }

  return <div className={`${baseClass} rounded ${className}`}>{shimmer}</div>
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`card p-5 space-y-3 ${className}`}>
      <Skeleton variant="text" className="w-1/3 h-3" />
      <Skeleton variant="text" className="w-2/3 h-6" />
      <Skeleton variant="text" className="w-1/2 h-3" />
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
  return (
    <div className={`card overflow-hidden ${className}`}>
      <div className="border-b border-border p-4">
        <div className="flex gap-4">
          {[...Array(cols)].map((_, i) => (
            <Skeleton key={i} variant="text" className="flex-1 h-3" />
          ))}
        </div>
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="border-b border-border last:border-0 p-4">
          <div className="flex gap-4">
            {[...Array(cols)].map((_, j) => (
              <Skeleton key={j} variant="text" className="flex-1 h-4" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
