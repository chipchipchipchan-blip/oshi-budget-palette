import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Heart, LayoutGrid, CalendarDays, PenLine } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useStore, actions, CATEGORIES, type Category } from "@/lib/store";

export const Route = createFileRoute("/add")({
  head: () => ({
    meta: [
      { title: "支出を記録｜推し活ウォレット" },
      { name: "description", content: "グッズ・チケット・遠征費など推し活の支出をかんたん登録。" },
      { property: "og:title", content: "支出を記録｜推し活ウォレット" },
      { property: "og:description", content: "推し活の支出をかんたん登録。" },
    ],
  }),
  component: AddPage,
});

function AddPage() {
  const { oshis } = useStore();
  const nav = useNavigate();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [memo, setMemo] = useState("");
  const [oshiId, setOshiId] = useState("");
  const [category, setCategory] = useState<Category>("goods");
  const selected = oshiId || oshis[0]?.id || "";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(amount);
    if (!n || !selected) return;
    actions.addExpense({ amount: n, date, memo, oshiId: selected, category });
    nav({ to: "/history" });
  };

  const field = "w-full rounded-lg border bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring";

  return (
    <AppShell title="支出を記録">
      <form onSubmit={submit} className="card-soft space-y-5 p-5">
        <div className="rounded-lg bg-hero p-5 text-center text-hero-foreground">
          <p className="text-xs font-bold text-hero-foreground/60 tracking-[0.3em]">金額</p>
          <div className="flex items-center justify-center font-display text-4xl font-bold">
            ¥
            <input
              inputMode="numeric" value={amount} placeholder="0"
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              className="w-48 bg-transparent text-center outline-none placeholder:text-hero-foreground/40"
            />
          </div>
        </div>

        <label className="block">
          <span className="mb-1 flex items-center gap-1.5 text-sm font-bold"><Heart className="h-4 w-4 text-primary" /> 誰のための支出？</span>
          <select value={selected} onChange={(e) => setOshiId(e.target.value)} className={field}>
            {oshis.map((o) => <option key={o.id} value={o.id}>{o.name} ♡</option>)}
          </select>
        </label>

        <div>
          <span className="mb-2 flex items-center gap-1.5 text-sm font-bold"><LayoutGrid className="h-4 w-4 text-primary" /> カテゴリ</span>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button
                type="button" key={c.id} onClick={() => setCategory(c.id)}
                className={`press flex flex-col items-center gap-1 rounded-lg border py-3 text-xs font-bold ${category === c.id ? "border-primary" : "border-border bg-card"}`}
                style={category === c.id ? { background: c.color, color: c.fg } : undefined}
              >
                <c.icon className="h-6 w-6" />{c.label}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-1 flex items-center gap-1.5 text-sm font-bold"><CalendarDays className="h-4 w-4 text-primary" /> 日付</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} />
        </label>

        <label className="block">
          <span className="mb-1 flex items-center gap-1.5 text-sm font-bold"><PenLine className="h-4 w-4 text-primary" /> メモ</span>
          <input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="アクスタ購入、ライブ当選…" className={field} />
        </label>

        <button disabled={!Number(amount)} className="press flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-bold text-primary-foreground shadow-soft disabled:opacity-50">
          <Check className="h-5 w-5" /> 記録する
        </button>
      </form>
    </AppShell>
  );
}
