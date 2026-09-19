export default function Card({ children, className = '', hover = false, padding = true }) {
  return (
    <div className={`${hover ? 'card-hover' : 'card'} ${padding ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-sm font-semibold text-text-primary ${className}`}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-xs text-text-muted mt-0.5 ${className}`}>
      {children}
    </p>
  )
}
