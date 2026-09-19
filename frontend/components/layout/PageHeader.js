export default function PageHeader({ title, description, children }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
        {description && (
          <p className="text-sm text-text-muted mt-1">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
