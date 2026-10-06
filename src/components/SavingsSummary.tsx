import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { yen, type SavingsGoal } from "@/lib/store";

export function SavingsSummary({ goals }: { goals: SavingsGoal[] }) {
  const saved = goals.reduce((sum, goal) => sum + goal.saved, 0);
  const target = goals.reduce((sum, goal) => sum + goal.target, 0);
  const pct = target > 0 ? saved / target * 100 : 0;

  return (
    <Button asChild variant="unstyled" className="card-soft mt-4 block w-full p-5 text-left transition-shadow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
      <Link to="/savings" aria-label="目標貯金の詳細を開く">
        <div className="flex items-center justify-between gap-3">
          <h2 className="inline-flex items-center gap-1.5 text-xs font-light text-muted-foreground"><Target className="h-3.5 w-3.5" />目標貯金<span className="ml-1 text-[11px]">合計</span></h2>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-clear-blue" />
        </div>
        {goals.length > 0 ? <>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
            <p className="min-w-0 break-all font-display text-2xl font-extralight leading-snug">{yen(saved)}<span className="ml-1.5 text-sm text-muted-foreground">/ {yen(target)}</span></p>
            <span className="font-display text-xs font-light text-muted-foreground">{Math.round(pct)}%</span>
          </div>
          <div role="progressbar" aria-label="目標貯金全体の進捗" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(pct, 100)} aria-valuetext={`${yen(saved)} / ${yen(target)}`} className="mt-3 h-1 overflow-hidden rounded-full bg-border/60">
            <div className="savings-fill h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
        </> : <p className="mt-3 text-sm font-light text-foreground">目標を設定<ArrowUpRight className="ml-2 inline h-3 w-3 text-muted-foreground" /></p>}
      </Link>
    </Button>
  );
}