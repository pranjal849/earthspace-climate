export default function AdminUsersLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded bg-gray-100 dark:bg-neutral-800" />
      <div className="rounded-lg bg-gray-100 dark:bg-neutral-800">
        <div className="space-y-3 p-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-12 rounded bg-gray-200 dark:bg-neutral-700" />
          ))}
        </div>
      </div>
    </div>
  )
}
