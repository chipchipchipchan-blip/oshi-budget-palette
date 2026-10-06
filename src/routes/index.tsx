import { createFileRoute, Link } from "@tanstack/react-router";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Sparkles, Plus, Heart } from "lucide-react";
import { AppShell, OshiAvatar } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useStore, CATEGORIES, PIE_COLORS, yen } from "@/lib/store";

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
  const { oshis, expenses } = useStore();
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const month = expenses.filter((e) => e.date.startsWith(ym));
  const total = month.reduce((s, e) => s + e.amount, 0);

  const byOshi = oshis
    .map((o) => ({ ...o, value: month.filter((e) => e.oshiId === o.id).reduce((s, e) => s + e.amount, 0) }))
    .filter((o) => o.value > 0);
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
          {month.length}件の愛を記録中
        </p>
      </section>

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
                <li key={o.id} className="flex items-center gap-2 text-sm">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: PIE_COLORS[byOshi.indexOf(o) % PIE_COLORS.length] ?? "var(--primary)" }} />
                  <OshiAvatar {...o} size={26} />
                  <span className="flex flex-1 items-center truncate font-bold">{o.name}</span>
                  <span className="text-muted-foreground">{Math.round((o.value / total) * 100)}%</span>
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
