import { cn, scoreColor } from "@/lib/utils";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("glass-card p-6", className)}>{children}</div>;
}

export function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-slate-400 text-sm">Not scored</span>;
  return (
    <span className={cn("font-bold text-lg", scoreColor(score))}>
      {score.toFixed(1)}<span className="text-xs font-normal text-slate-400">/10</span>
    </span>
  );
}

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="flex items-center gap-4">
      {icon && (
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20">
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </Card>
  );
}
