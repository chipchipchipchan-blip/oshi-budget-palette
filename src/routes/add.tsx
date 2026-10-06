import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, LayoutGrid, CalendarDays, PenLine, Wallet } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useStore, actions, CATEGORIES, PAYMENTS, todayLocal, type Category, type PaymentMethod } from "@/lib/store";

export const Route = createFileRoute("/add")({
  head: () => ({
    meta: [
      { title: "支出を記録｜推し活ウォレット" },
      { name: "description", content: "グッズ・チケット・遠征費など推し活の支出をかんたん登録。" },
      { property: "og:title", content: "支出を記録｜推し活ウォレット" },
      { property: "og:description", content: "推し活の支出をかんたん登録。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { edit?: string } => (typeof s["edit"] === "string" ? { edit: s["edit"] } : {}),
  component: AddPage,
});

function AddPage() {
  const { oshis, expenses } = useStore();
  const nav = useNavigate();
  const { edit } = Route.useSearch();
  const editing = edit ? expenses.find((x) => x.id === edit) : undefined;
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => todayLocal());
  const [memo, setMemo] = useState("");
  const [oshiId, setOshiId] = useState("");
  const [category, setCategory] = useState<Category>("goods");
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  useEffect(() => {
    if (!editing) return;
    setAmount(String(editing.amount)); setDate(editing.date); setMemo(editing.memo ?? "");
    setOshiId(editing.oshiId); setCategory(editing.category); setPayment(editing.payment ?? "cash");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing?.id]);
  const selected = oshiId || oshis[0]?.id || "";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(amount);
    if (!n || !selected) return;
    const data = { amount: n, date, memo, oshiId: selected, category, payment };
    if (editing) actions.updateExpense(editing.id, data);
    else actions.addExpense(data);
    nav({ to: "/history" });
  };

  const field = "satin-field w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-ring";

  return (
    <AppShell title={editing ? "記録を編集" : "支出を記録"}>
      <form onSubmit={submit} className="space-y-6">
        <div className="satin-dark relative overflow-hidden rounded-3xl p-7 text-center text-hero-foreground">
          <p className="text-xs font-light text-hero-foreground/70">金額</p>
          <div className="mt-6 flex items-center justify-center leading-none">
            <span className="silver-ink font-display text-6xl font-extralight">¥</span>
            <input
              aria-label="金額" inputMode="numeric" value={amount} placeholder="0"
              onChange={(e) => setAmount(e.target.value.normalize("NFKC").replace(/\D/g, ""))}
              className="silver-ink w-48 bg-transparent text-center font-display text-6xl font-extralight tracking-tight outline-none placeholder:text-hero-foreground/40"
            />
          </div>
        </div>

        {oshis.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-4 text-center text-sm font-light text-muted-foreground">
            まずは<Link to="/oshi" className="mx-1 text-primary underline underline-offset-2">推しを登録</Link>してください
          </div>
        ) : (
          <label className="block">
            <span className="mb-1 block text-sm font-light text-foreground/80">推し</span>
            <select value={selected} onChange={(e) => setOshiId(e.target.value)} className={field}>
              {oshis.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </label>
        )}

        <div>
          <span className="mb-2 flex items-center gap-1.5 text-sm font-light text-foreground/80"><LayoutGrid className="h-3.5 w-3.5 text-primary" /> カテゴリ</span>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <Button variant="unstyled" size="auto"
                type="button" key={c.id} onClick={() => setCategory(c.id)}
                className={`press flex flex-col items-center gap-1 rounded-lg border py-3 text-xs font-light transition-colors ${category === c.id ? "blue-glass blue-ring text-white" : "border-border bg-card text-muted-foreground"}`}
              >
                <c.icon className="h-6 w-6" />{c.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-2 flex items-center gap-1.5 text-sm font-light text-foreground/80"><Wallet className="h-3.5 w-3.5 text-primary" /> 支払い方法</span>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENTS.map((p) => (
              <Button variant="unstyled" size="auto"
                type="button" key={p.id} onClick={() => setPayment(p.id)}
                className={`press flex flex-col items-center gap-1 rounded-lg border py-3 text-xs font-light transition-colors ${payment === p.id ? "blue-glass blue-ring text-white" : "border-border bg-card text-muted-foreground"}`}
              >
                <p.icon className="h-6 w-6" />{p.label}
              </Button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-1 flex items-center gap-1.5 text-sm font-light text-foreground/80"><CalendarDays className="h-3.5 w-3.5 text-primary" /> 日付</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} />
        </label>

        <label className="block">
          <span className="mb-1 flex items-center gap-1.5 text-sm font-light text-foreground/80"><PenLine className="h-3.5 w-3.5 text-primary" /> メモ</span>
          <input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="アクスタ購入、ライブ当選…" className={field} />
        </label>

        <Button variant="unstyled" size="auto" disabled={!Number(amount)} className="blue-glass-wide blue-ring press flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-light tracking-wide text-white">
          <Check className="h-5 w-5" /> {editing ? "保存する" : "記録する"}
        </Button>
      </form>
    </AppShell>
  );
}
