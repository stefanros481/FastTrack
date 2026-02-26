export default function StatsCardSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* 5 small stat cards */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-[--color-card] dark:bg-slate-900 rounded-2xl p-4 animate-pulse"
        >
          <div className="h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mt-2" />
        </div>
      ))}

      {/* 2 full-width period summary cards */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={`period-${i}`}
          className="col-span-2 bg-[--color-card] dark:bg-slate-900 rounded-2xl p-4 animate-pulse flex items-center gap-4"
        >
          <div className="h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded shrink-0" />
          <div>
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
