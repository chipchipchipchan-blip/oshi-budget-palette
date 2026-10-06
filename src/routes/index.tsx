import { createFileRoute, Link } from "@tanstack/react-router";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Sparkles, Plus, PencilLine, Check, X } from "lucide-react";
import { useState } from "react";
import { AppShell, OshiAvatar } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { SavingsSummary } from "@/components/SavingsSummary";
import { useStore, CATEGORIES, PIE_COLORS, yen, actions } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "推し活ウォレット｜今月の推し活支出" },
      { name: "description", content: "推し活の支出をモノトーンで上品に管理。推し別・カテゴリ別にひと目でわかるダッシュボード。" },
      { property: "og:title", content: "推し活ウォレット｜今月の推し活支出" },
      { property: "og:description", content: "推し活の支出を可愛く管理できる家計簿アプリ。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { oshis, expenses, budget, goals } = useStore();
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const month = expenses.filter((e) => e.date.startsWith(ym));
  const total = month.reduce((s, e) => s + e.amount, 0);

  const byOshi = oshis
    .map((o) => ({ ...o, value: month.filter((e) => e.oshiId === o.id).reduce((s, e) => s + e.amount, 0) }))
    .filter((o) => o.value > 0);
  const orphanValue = month
    .filter((e) => !oshis.some((o) => o.id === e.oshiId))
    .reduce((s, e) => s + e.amount, 0);
  if (orphanValue > 0) {
    byOshi.push({ id: "__deleted__", name: "削除された推し", color: "", photo: undefined, value: orphanValue });
  }
  const byCat = CATEGORIES.map((c) => ({
    ...c,
    value: month.filter((e) => e.category === c.id).reduce((s, e) => s + e.amount, 0),
  }));

  return (
    <AppShell title="ダッシュボード">
      <section className="satin-dark relative overflow-hidden rounded-3xl p-7 text-hero-foreground">
        <Sparkles className="silver-glow absolute right-5 top-5 h-6 w-6" />
        <p className="text-xs font-light text-hero-foreground/70">{now.getMonth() + 1}月の推し活合計</p>
        <p className="silver-ink mt-6 w-fit break-all font-display text-6xl font-extralight leading-none">{yen(total)}</p>
        <p className="mt-5 inline-flex rounded-full border border-hero-foreground/15 bg-hero-foreground/5 px-4 py-2 text-[11px] text-hero-foreground/80 backdrop-blur-sm">
          {month.length}件の記録
        </p>
      </section>

      <BudgetCard total={total} budget={budget} />
      <SavingsSummary goals={goals ?? []} />

      <section className="mt-8">
        <h2 className="mb-4 px-1 text-xs font-normal text-muted-foreground">推し別の割合</h2>
        {byOshi.length === 0 ? (
          <Empty />
        ) : (
          <div className="card-soft flex flex-wrap items-center justify-center gap-3 p-4">
            <div className="h-36 w-36 shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byOshi} dataKey="value" innerRadius={42} outerRadius={70} paddingAngle={byOshi.length > 1 ? 4 : 0} cornerRadius={2} stroke="var(--card)" strokeWidth={1}>
                    {byOshi.map((o, i) => <Cell key={o.id} fill={PIE_COLORS[i % PIE_COLORS.length] ?? "var(--primary)"} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="min-w-36 flex-1 space-y-3">
              {byOshi.map((o) => (
                <li key={o.id} className="flex items-center gap-2 text-[13px] font-light tracking-wide text-foreground/80">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: PIE_COLORS[byOshi.indexOf(o) % PIE_COLORS.length] ?? "var(--primary)" }} />
                  <OshiAvatar {...o} size={26} />
                  <span className="flex flex-1 items-center truncate">{o.name}</span>
                  <span className="font-light text-muted-foreground">{Math.round((o.value / total) * 100)}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-4 px-1 text-xs font-normal text-muted-foreground">カテゴリ別</h2>
        <div className="grid grid-cols-2 gap-3">
          {byCat.map((c, i) => {
            const share = total > 0 ? c.value / total : 0;
            return (
              <div key={c.id} className={`card-soft press p-4 ${i === byCat.length - 1 ? "col-span-2" : ""}`}>
                <div className="flex items-center gap-3">
                  <span className="blue-glass grid h-10 w-10 shrink-0 place-items-center rounded-full">
                    <c.icon className="h-[18px] w-[18px] text-hero-foreground" style={{ filter: "drop-shadow(0 1px 2px oklch(0.45 0.06 20 / 0.4))" }} />
                  </span>
                  <p className="text-[11px] font-light text-muted-foreground">{c.label}</p>
                </div>
                <p className="mt-3 break-all font-display text-xl font-light leading-none">{yen(c.value)}</p>
                <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-border/60">
                  <div className="h-full rounded-full blue-glass" style={{ width: `${Math.max(share * 100, share > 0 ? 8 : 0)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Button asChild variant="blueGlass" size="auto" className="fixed bottom-28 right-[max(1.5rem,calc(50%-12rem))] z-30 h-14 w-14 rounded-full">
        <Link to="/add" aria-label="支出を記録" title="支出を記録"><Plus className="h-7 w-7" /></Link>
      </Button>
    </AppShell>
  );
}

function Empty() {
  return <p className="card-soft py-10 text-center text-[13px] leading-7 text-muted-foreground">まだ今月の記録がありません<br />右下の＋から登録してね</p>;
}

function BudgetCard({ total, budget }: { total: number; budget?: number | undefined }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState("");
  const pct = budget ? (total / budget) * 100 : 0;
  const over = !!budget && total > budget;
  const warn = pct >= 80;
  const barColor = over ? "var(--budget-over)" : warn ? "var(--budget-warn)" : undefined;
  const start = () => { setVal(budget ? String(budget) : ""); setEditing(true); };
  const save = () => { actions.setBudget(Number(val.replace(/[^0-9]/g, "")) || null); setEditing(false); };

  return (
    <section className="card-soft mt-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-light text-muted-foreground">今月の予算</p>
        {!editing && (
          <Button variant="unstyled" onClick={start} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-light text-foreground/80 hover:text-[var(--clear-blue)]">
            <PencilLine className="h-3.5 w-3.5" strokeWidth={1.5} />
            {budget ? "編集" : "予算を設定"}
          </Button>
        )}
      </div>

      {editing ? (
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="mt-3 flex items-center gap-2">
          <div className="satin-field flex flex-1 items-center gap-1 rounded-xl px-3 py-2">
            <span className="font-display font-light text-muted-foreground">¥</span>
            <input autoFocus inputMode="numeric" value={val} onChange={(e) => setVal(e.target.value)} placeholder="30000" aria-label="今月の予算" className="w-full bg-transparent font-display text-lg font-light outline-none" />
          </div>
          <Button type="submit" variant="unstyled" aria-label="保存" className="blue-glass grid h-10 w-10 place-items-center rounded-full text-white"><Check className="h-4 w-4" /></Button>
          <Button type="button" variant="unstyled" aria-label="キャンセル" onClick={() => setEditing(false)} className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground"><X className="h-4 w-4" strokeWidth={1.5} /></Button>
        </form>
      ) : budget ? (
        <>
          <div className="mt-3 flex items-end justify-between gap-2">
            <p className="font-display text-2xl font-extralight">{yen(budget)}</p>
            <p className="font-display text-sm font-light" style={{ color: barColor ?? "var(--muted-foreground)" }}>{Math.round(pct)}%</p>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border/60">
            <div className={"h-full rounded-full transition-all duration-700 " + (barColor ? "" : "blue-glass")} style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} />
          </div>
          <p className="mt-2.5 text-[11px] font-light" style={{ color: over ? "var(--budget-over)" : "var(--muted-foreground)" }}>
            {over ? `予算をオーバーしています（+${yen(total - budget)}）` : `残り ${yen(budget - total)}`}
          </p>
        </>
      ) : (
        <p className="mt-2 text-[11px] font-light text-muted-foreground">予算を決めると、使った割合がゲージで表示されます</p>
      )}
    </section>
  );
}
