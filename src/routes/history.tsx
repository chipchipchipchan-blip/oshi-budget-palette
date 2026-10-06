import { createFileRoute } from "@tanstack/react-router";
import { Trash2, Heart } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useStore, actions, catOf, yen, isWhitish } from "@/lib/store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "履歴｜推し活ウォレット" },
      { name: "description", content: "推し活の支出をタイムラインで振り返り。" },
      { property: "og:title", content: "履歴｜推し活ウォレット" },
      { property: "og:description", content: "推し活の支出をタイムラインで振り返り。" },
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
      {sorted.length === 0 && <p className="card-soft p-8 text-center text-sm text-muted-foreground">まだ記録がありません</p>}
      <div className="space-y-6">
        {Object.entries(groups).map(([date, list]) => (
          <div key={date}>
            <p className="mb-2 ml-1 text-xs font-bold text-muted-foreground">
              {new Date(date).toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" })}
            </p>
            <ol className="relative space-y-3 border-l-2 border-solid border-border pl-5">
              {list.map((e) => {
                const o = oshis.find((x) => x.id === e.oshiId);
                const c = catOf(e.category);
                return (
                  <li key={e.id} className="card-soft relative flex items-center gap-3 p-4">
                    <span className="absolute -left-[1.85rem] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-card" style={{ background: o?.color ?? "var(--muted)", borderColor: o && isWhitish(o.color) ? "var(--border)" : undefined }} />
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md " style={{ background: c.color, color: c.fg }}><c.icon className="h-5 w-5" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{e.memo || c.label}</p>
                      <span className="mt-1 inline-block inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] font-bold text-ink" style={{ background: o?.color ?? "var(--muted)", border: o && isWhitish(o.color) ? "1px solid var(--border)" : undefined }}>
                        {o?.name ?? "削除された推し"}{o && <Heart className="h-3 w-3 fill-card text-foreground" />}
                      </span>
                    </div>
                    <p className="font-display font-bold">{yen(e.amount)}</p>
                    <button onClick={() => actions.deleteExpense(e.id)} aria-label="削除" className="press text-muted-foreground">
                      <Trash2 className="h-4 w-4" />
                    </button>
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
