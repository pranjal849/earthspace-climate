const variantClasses = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  neutral: 'badge-neutral',
  default: 'badge bg-accent-light text-accent',
}

export default function Badge({ children, variant = 'default', className = '', dot = false }) {
  return (
    <span className={`${variantClasses[variant] || variantClasses.default} ${className}`}>
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full mr-1.5 inline-block"
          style={{
            backgroundColor: variant === 'success' ? 'var(--color-success)'
              : variant === 'warning' ? 'var(--color-warning)'
              : variant === 'danger' ? 'var(--color-danger)'
              : 'var(--color-accent)',
          }}
        />
      )}
      {children}
    </span>
  )
}
