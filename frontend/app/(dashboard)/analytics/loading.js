export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-gray-100 dark:bg-neutral-800" />
      <div className="h-[380px] rounded-lg bg-gray-100 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-[360px] rounded-lg bg-gray-100 dark:bg-neutral-800" />
        <div className="h-[360px] rounded-lg bg-gray-100 dark:bg-neutral-800" />
      </div>
    </div>
  )
}
