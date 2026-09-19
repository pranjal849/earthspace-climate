export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-gray-100 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-lg bg-gray-100 dark:bg-neutral-800" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-72 rounded-lg bg-gray-100 dark:bg-neutral-800" />
        <div className="h-72 rounded-lg bg-gray-100 dark:bg-neutral-800" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 rounded-lg bg-gray-100 dark:bg-neutral-800" />
        ))}
      </div>
    </div>
  )
}
