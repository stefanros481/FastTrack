import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  heading: string;
  description: string;
}

export default function EmptyState({
  icon: Icon,
  heading,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="w-10 h-10 text-[--color-text-muted] mb-3" />
      <h3 className="text-xl font-semibold">{heading}</h3>
      <p className="text-sm text-[--color-text-muted] mt-1">{description}</p>
    </div>
  );
}
