import { createFileRoute, Link } from "@tanstack/react-router";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import { Sparkles, Plus } from "lucide-react";
import { AppShell, OshiAvatar } from "@/components/AppShell";
import { useStore, CATEGORIES, yen } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "推し活ウォレット｜今月の推し活支出" },
      { name: "description", content: "推し活の支出を可愛く管理。推し別・カテゴリ別にひと目でわかるダッシュボード。" },
      { property: "og:title", content: "推し活ウォレット｜今月の推し活支出" },
      { property: "og:description", content: "推し活の支出を可愛く管理できる家計簿アプリ。" },
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
      <section className="relative overflow-hidden rounded-[2rem] bg-hero p-6 shadow-soft">
        <Sparkles className="absolute right-5 top-5 h-6 w-6 text-card" />
        <p className="text-sm font-bold text-ink/70">{now.getMonth() + 1}月の推し活合計</p>
        <p className="mt-2 font-display text-5xl font-bold tracking-tight text-ink">{yen(total)}</p>
        <p className="mt-3 inline-flex rounded-full bg-card/60 px-3 py-1 text-xs font-bold text-ink">
          {month.length}件の愛を記録中
        </p>
      </section>

      <section className="card-soft mt-5 p-5">
        <h2 className="mb-2 font-bold">推し別の割合</h2>
        {byOshi.length === 0 ? (
          <Empty />
        ) : (
          <div className="flex items-center gap-4">
            <div className="h-40 w-40 shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byOshi} dataKey="value" innerRadius={42} outerRadius={70} paddingAngle={byOshi.length > 1 ? 4 : 0} cornerRadius={8} stroke="none">
                    {byOshi.map((o) => <Cell key={o.id} fill={o.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-2">
              {byOshi.map((o) => (
                <li key={o.id} className="flex items-center gap-2 text-sm">
                  <OshiAvatar {...o} size={26} />
                  <span className="flex-1 truncate font-bold">{o.name}</span>
                  <span className="text-muted-foreground">{Math.round((o.value / total) * 100)}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="card-soft mt-5 p-5">
        <h2 className="mb-3 font-bold">カテゴリ別</h2>
        <div className="h-40">
          <ResponsiveContainer>
            <BarChart data={byCat}>
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} interval={0} />
              <Tooltip formatter={(v) => yen(Number(v))} labelFormatter={() => ""} cursor={{ fill: "transparent" }} />
              <Bar dataKey="value" radius={[12, 12, 12, 12]}>
                {byCat.map((c) => <Cell key={c.id} fill={c.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {byCat.map((c) => (
            <div key={c.id} className="flex items-center gap-2 rounded-2xl bg-muted px-3 py-2 text-sm">
              <span className="grid h-8 w-8 place-items-center rounded-xl text-ink" style={{ background: c.color }}><c.icon className="h-4 w-4" /></span>
              <div className="leading-tight">
                <p className="text-[11px] text-muted-foreground">{c.label}</p>
                <p className="font-bold">{yen(c.value)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Link to="/add" className="press fixed bottom-24 right-[max(1.25rem,calc(50%-12rem))] z-30 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft">
        <Plus className="h-7 w-7" />
      </Link>
    </AppShell>
  );
}

function Empty() {
  return <p className="py-6 text-center text-sm text-muted-foreground">まだ今月の記録がありません<br />右下の＋から登録してね</p>;
}
