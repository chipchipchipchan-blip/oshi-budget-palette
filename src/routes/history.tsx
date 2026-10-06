import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useStore, actions, catOf, payOf, yen } from "@/lib/store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "履歴｜推し活ウォレット" },
      { name: "description", content: "推し活の支出をタイムラインで振り返り。" },
      { property: "og:title", content: "履歴｜推し活ウォレット" },
      { property: "og:description", content: "推し活の支出をタイムラインで振り返り。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { expenses, oshis } = useStore();
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
  const groups = sorted.reduce<Record<string, typeof sorted>>((acc, e) => {
    (acc[e.date] ??= []).push(e);
    return acc;
  }, {});

  return (
    <AppShell title="履歴">
      {sorted.length === 0 && (
        <p className="card-soft p-8 text-center text-sm text-muted-foreground">まだ記録がありません</p>
      )}
      <div className="space-y-6">
        {Object.entries(groups).map(([date, list]) => (
          <div key={date}>
            <p className="mb-2 ml-1 text-[11px] font-light tracking-wide text-muted-foreground">
              {new Date(date).toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" })}
            </p>
            <ol className="relative space-y-3 border-l border-border/60 pl-5">
              {list.map((e) => {
                const o = oshis.find((x) => x.id === e.oshiId);
                const c = catOf(e.category);
                const p = payOf(e.payment);
                return (
                  <li key={e.id} className="card-soft relative flex items-center gap-3.5 rounded-2xl p-4">
                    <span className="blue-glass absolute -left-[1.44rem] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full" />
                    <span className="blue-glass press grid h-9 w-9 shrink-0 place-items-center rounded-full">
                      <c.icon className="h-4 w-4 text-hero-foreground" style={{ filter: "drop-shadow(0 1px 2px oklch(0.45 0.06 20 / 0.4))" }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-light text-foreground/90">{c.label}</p>
                      {e.memo && (
                        <p className="mt-0.5 truncate text-[11px] font-light tracking-wide text-muted-foreground/80">{e.memo}</p>
                      )}
                      <span className="mt-1.5 inline-flex items-center">
                        <span className="inline-flex max-w-full items-center rounded-full bg-foreground px-2.5 py-0.5 text-[10px] font-light tracking-wide text-background">
                          <span className="truncate">{o?.name ?? "削除された推し"}</span>
                        </span>
                      </span>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <p className="break-all text-right font-display text-xl font-extralight leading-none tracking-tight">{yen(e.amount)}</p>
                      {p && (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap text-[10px] font-light tracking-wide text-muted-foreground/80">
                          <p.icon className="h-3 w-3" />{p.label}
                        </span>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col">
                    <Button asChild variant="unstyled" size="auto" className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground/70 transition-colors hover:text-clear-blue">
                      <Link to="/add" search={{ edit: e.id }} aria-label="編集" title="編集"><Pencil className="h-3.5 w-3.5" strokeWidth={1.5} /></Link>
                    </Button>
                    <Button variant="unstyled" size="auto" onClick={() => actions.deleteExpense(e.id)} aria-label="削除" title="削除" className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground/70 transition-colors hover:text-clear-blue">
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </Button>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
