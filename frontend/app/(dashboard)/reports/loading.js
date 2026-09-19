export default function ReportsLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-32 rounded bg-gray-100 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-52 rounded-lg bg-gray-100 dark:bg-neutral-800" />
        ))}
      </div>
    </div>
  )
}
