interface Props {
  count?: number;
}

function SkeletonCard() {
  return (
    <div className="bg-[--color-card] dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>
      <div className="h-3 w-48 bg-slate-200 dark:bg-slate-700 rounded mt-1" />
      <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded mt-2" />
    </div>
  );
}

export default function SessionCardSkeleton({ count = 3 }: Props) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
}
