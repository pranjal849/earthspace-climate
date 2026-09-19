export default function CountriesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-gray-100 dark:bg-neutral-800" />
      <div className="h-[350px] rounded-lg bg-gray-100 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-40 rounded-lg bg-gray-100 dark:bg-neutral-800" />
        ))}
      </div>
    </div>
  )
}
