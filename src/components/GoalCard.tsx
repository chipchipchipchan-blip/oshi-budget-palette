import { useState } from "react";
import { Plus, PencilLine, Check, X, Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { actions, yen, type SavingsGoal } from "@/lib/store";

const num = (s: string) => Number(s.replace(/[^0-9]/g, "")) || 0;
const pillBtn = "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-light text-foreground/80 hover:text-[var(--clear-blue)]";
const field = "satin-field flex items-center gap-1 rounded-xl px-3 py-2";
const input = "w-full bg-transparent font-light outline-none";

export function GoalCard({ goal }: { goal?: SavingsGoal | undefined }) {
  const [mode, setMode] = useState<"view" | "edit" | "add">("view");
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");
  const [add, setAdd] = useState("");
  const pct = goal && goal.target > 0 ? (goal.saved / goal.target) * 100 : 0;
  const done = !!goal && goal.saved >= goal.target;

  const startEdit = () => {
    setTitle(goal?.title ?? ""); setTarget(goal ? String(goal.target) : ""); setSaved(goal ? String(goal.saved) : "");
    setMode("edit");
  };
  const saveEdit = () => {
    const t = num(target);
    if (t > 0) actions.setGoal({ title: title.trim() || "目標貯金", target: t, saved: num(saved) });
    setMode("view");
  };
  const saveAdd = () => { actions.addSaving(num(add)); setAdd(""); setMode("view"); };

  return (
    <section className="card-soft mt-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="inline-flex items-center gap-1.5 text-xs font-light text-muted-foreground">
          <Target className="h-3.5 w-3.5" strokeWidth={1.5} />目標貯金
        </p>
        {mode === "view" && (
          <div className="flex gap-1.5">
            {goal && (
              <Button variant="unstyled" onClick={() => setMode("add")} className={pillBtn}>
                <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />貯金する
              </Button>
            )}
            <Button variant="unstyled" onClick={startEdit} className={pillBtn}>
              <PencilLine className="h-3.5 w-3.5" strokeWidth={1.5} />{goal ? "編集" : "目標を設定"}
            </Button>
          </div>
        )}
      </div>

      {mode === "edit" ? (
        <form onSubmit={(e) => { e.preventDefault(); saveEdit(); }} className="mt-4 space-y-2.5">
          <label className="block text-[11px] font-light text-muted-foreground">目標の名前
            <div className={field + " mt-1"}><input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="冬のライブ遠征費" className={input + " text-sm text-foreground"} /></div>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <label className="block text-[11px] font-light text-muted-foreground">目標金額
              <div className={field + " mt-1"}><span className="font-display text-muted-foreground">¥</span><input inputMode="numeric" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="50000" className={input + " font-display text-base text-foreground"} /></div>
            </label>
            <label className="block text-[11px] font-light text-muted-foreground">現在の貯金額
              <div className={field + " mt-1"}><span className="font-display text-muted-foreground">¥</span><input inputMode="numeric" value={saved} onChange={(e) => setSaved(e.target.value)} placeholder="0" className={input + " font-display text-base text-foreground"} /></div>
            </label>
          </div>
          <div className="flex items-center justify-between pt-1">
            {goal ? (
              <Button type="button" variant="unstyled" onClick={() => { actions.setGoal(null); setMode("view"); }} className="inline-flex items-center gap-1 text-[11px] font-light text-muted-foreground hover:text-[var(--clear-blue)]">
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />目標を削除
              </Button>
            ) : <span />}
            <div className="flex gap-2">
              <Button type="button" variant="unstyled" aria-label="キャンセル" onClick={() => setMode("view")} className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground"><X className="h-4 w-4" strokeWidth={1.5} /></Button>
              <Button type="submit" variant="unstyled" aria-label="保存" className="blue-glass grid h-10 w-10 place-items-center rounded-full text-white"><Check className="h-4 w-4" /></Button>
            </div>
          </div>
        </form>
      ) : goal ? (
        <>
          <p className="mt-3 text-sm font-light text-foreground">{goal.title}</p>
          <div className="mt-2 flex items-end justify-between gap-2">
            <p className="font-display text-2xl font-extralight">
              {yen(goal.saved)}<span className="ml-1.5 text-sm text-muted-foreground">/ {yen(goal.target)}</span>
            </p>
            <p className="font-display text-sm font-light text-muted-foreground">{Math.round(pct)}%</p>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border/60">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(pct, 100)}%`, background: "linear-gradient(90deg, #e9e9eb, #c9cacd 55%, #e6d3ce)" }} />
          </div>
          {mode === "add" ? (
            <form onSubmit={(e) => { e.preventDefault(); saveAdd(); }} className="mt-3 flex items-center gap-2">
              <div className={field + " flex-1"}><span className="font-display text-muted-foreground">¥</span><input autoFocus inputMode="numeric" value={add} onChange={(e) => setAdd(e.target.value)} placeholder="追加する金額" aria-label="追加する貯金額" className={input + " font-display text-lg"} /></div>
              <Button type="submit" variant="unstyled" aria-label="追加" className="blue-glass grid h-10 w-10 place-items-center rounded-full text-white"><Check className="h-4 w-4" /></Button>
              <Button type="button" variant="unstyled" aria-label="キャンセル" onClick={() => setMode("view")} className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground"><X className="h-4 w-4" strokeWidth={1.5} /></Button>
            </form>
          ) : (
            <p className="mt-2.5 text-[11px] font-light text-muted-foreground">
              {done ? "目標を達成しました" : `あと ${yen(goal.target - goal.saved)}`}
            </p>
          )}
        </>
      ) : (
        <p className="mt-2 text-[11px] font-light text-muted-foreground">ライブ遠征やグッズのための目標を決めて、少しずつ貯めていきましょう</p>
      )}
    </section>
  );
}
