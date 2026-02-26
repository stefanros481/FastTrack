export default function ChartSkeleton() {
  return (
    <div className="space-y-4">
      {/* Duration chart skeleton */}
      <div className="bg-[--color-card] dark:bg-slate-900 rounded-2xl p-4 animate-pulse">
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
        <div className="flex gap-2 mb-4">
          <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
        <div className="h-[200px] bg-slate-200 dark:bg-slate-700 rounded" />
      </div>

      {/* Weekly chart skeleton */}
      <div className="bg-[--color-card] dark:bg-slate-900 rounded-2xl p-4 animate-pulse">
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
        <div className="h-[200px] bg-slate-200 dark:bg-slate-700 rounded" />
      </div>

      {/* Goal rate chart skeleton */}
      <div className="bg-[--color-card] dark:bg-slate-900 rounded-2xl p-4 animate-pulse">
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
        <div className="h-[180px] bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  );
}
