export default function AlertsLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-32 rounded bg-gray-100 dark:bg-neutral-800" />
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 w-24 rounded bg-gray-100 dark:bg-neutral-800" />
        ))}
      </div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-24 rounded-lg bg-gray-100 dark:bg-neutral-800" />
      ))}
    </div>
  )
}
