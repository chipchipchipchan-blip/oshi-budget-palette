import { useState } from "react";
import { Plus, PencilLine, Check, X, Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { actions, yen, MAX_SAVINGS_GOALS, type SavingsGoal } from "@/lib/store";

const num = (s: string) => /^\d+$/.test(s.replaceAll(",", "").trim()) ? Number(s.replaceAll(",", "").trim()) : NaN;
const pillBtn = "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-light text-foreground/80 hover:text-clear-blue";
const field = "satin-field mt-1 flex min-w-0 items-center gap-1 rounded-xl px-3 py-2";
const input = "min-w-0 w-full bg-transparent font-light outline-none";
const iconBtn = "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground hover:text-clear-blue";
const saveBtn = "blue-glass grid h-9 w-9 shrink-0 place-items-center rounded-full text-clear-blue-foreground disabled:opacity-40";

function GoalEditor({ goal, onClose }: { goal?: SavingsGoal; onClose: () => void }) {
  const [title, setTitle] = useState(goal?.title ?? "");
  const [target, setTarget] = useState(goal ? String(goal.target) : "");
  const [saved, setSaved] = useState(goal ? String(goal.saved) : "");
  const [deleting, setDeleting] = useState(false);
  const t = num(target);
  const s = saved.trim() ? num(saved) : 0;
  const valid = title.trim().length > 0 && Number.isSafeInteger(t) && t > 0 && Number.isSafeInteger(s) && s >= 0;

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      if (!valid) return;
      const data = { title: title.trim(), target: t, saved: s };
      if (goal) actions.updateGoal(goal.id, data); else actions.addGoal(data);
      onClose();
    }} className="mt-3 space-y-3">
      <label className="block text-[11px] text-muted-foreground">目標の名前
        <div className={field}><input autoFocus required maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="冬のライブ遠征費" className={input + " text-sm text-foreground"} /></div>
      </label>
      <div className="grid grid-cols-2 gap-2.5">
        <label className="min-w-0 text-[11px] text-muted-foreground">目標金額
          <div className={field}><span className="font-display">¥</span><input required inputMode="numeric" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="50000" className={input + " font-display text-base text-foreground"} /></div>
        </label>
        <label className="min-w-0 text-[11px] text-muted-foreground">現在の貯金額
          <div className={field}><span className="font-display">¥</span><input inputMode="numeric" value={saved} onChange={(e) => setSaved(e.target.value)} placeholder="0" className={input + " font-display text-base text-foreground"} /></div>
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {goal ? <Button type="button" variant="unstyled" onClick={() => setDeleting(true)} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-clear-blue"><Trash2 className="h-3.5 w-3.5" />目標を削除</Button> : <span />}
        <div className="flex gap-2">
          <Button type="button" variant="unstyled" aria-label="キャンセル" title="キャンセル" onClick={onClose} className={iconBtn}><X className="h-4 w-4" /></Button>
          <Button type="submit" variant="unstyled" aria-label="保存" title="保存" disabled={!valid} className={saveBtn}><Check className="h-4 w-4" /></Button>
        </div>
      </div>
      {deleting && goal && <div role="alert" className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
        <p className="text-[11px] text-muted-foreground">この目標を削除しますか？</p>
        <div className="flex gap-2">
          <Button type="button" variant="unstyled" className={pillBtn} onClick={() => setDeleting(false)}>戻る</Button>
          <Button type="button" variant="unstyled" className={pillBtn} onClick={() => { actions.deleteGoal(goal.id); onClose(); }}>削除する</Button>
        </div>
      </div>}
    </form>
  );
}

function GoalRow({ goal }: { goal: SavingsGoal }) {
  const [mode, setMode] = useState<"view" | "edit" | "add">("view");
  const [amount, setAmount] = useState("");
  const pct = goal.target > 0 ? goal.saved / goal.target * 100 : 0;
  const deposit = num(amount);
  const valid = Number.isSafeInteger(deposit) && deposit > 0 && Number.isSafeInteger(goal.saved + deposit);

  return <article aria-label={goal.title} className="min-w-0 py-5 first:pt-4 last:pb-0">
    <div className="flex items-start justify-between gap-3">
      <h3 className="min-w-0 break-words text-sm font-light leading-6">{goal.title}</h3>
      {mode === "view" && <div className="flex shrink-0 items-center gap-1">
        <Button variant="unstyled" aria-label={`${goal.title}に貯金する`} onClick={() => { setAmount(""); setMode("add"); }} className={pillBtn}><Plus className="h-3 w-3" />貯金する</Button>
        <Button variant="unstyled" aria-label={`${goal.title}を編集`} title="編集" onClick={() => setMode("edit")} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-clear-blue"><PencilLine className="h-3.5 w-3.5" /></Button>
      </div>}
    </div>
    {mode === "edit" ? <GoalEditor goal={goal} onClose={() => setMode("view")} /> : <>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
        <p className="min-w-0 break-all font-display text-2xl font-extralight leading-snug">{yen(goal.saved)}<span className="ml-1.5 text-sm text-muted-foreground">/ {yen(goal.target)}</span></p>
        <p className="font-display text-xs text-muted-foreground">{Math.round(pct)}%</p>
      </div>
      <div role="progressbar" aria-label={`${goal.title}の進捗`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(pct, 100)} aria-valuetext={`${yen(goal.saved)} / ${yen(goal.target)}`} className="mt-3 h-1 overflow-hidden rounded-full bg-border/60">
        <div className="savings-fill h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">{goal.saved >= goal.target ? "目標を達成しました" : `あと ${yen(goal.target - goal.saved)}`}</p>
      {mode === "add" && <form aria-label={`${goal.title}への貯金`} onSubmit={(e) => { e.preventDefault(); if (!valid) return; actions.addSaving(goal.id, deposit); setMode("view"); setAmount(""); }} className="mt-3">
        <label className="block text-[11px] text-muted-foreground">追加する貯金額
          <div className="mt-1 flex items-center gap-2">
            <div className={field + " mt-0 flex-1"}><span className="font-display">¥</span><input autoFocus required inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="3000" className={input + " font-display text-lg text-foreground"} /></div>
            <Button type="submit" variant="unstyled" aria-label="追加" title="追加" disabled={!valid} className={saveBtn}><Check className="h-4 w-4" /></Button>
            <Button type="button" variant="unstyled" aria-label="キャンセル" title="キャンセル" onClick={() => setMode("view")} className={iconBtn}><X className="h-4 w-4" /></Button>
          </div>
        </label>
      </form>}
    </>}
  </article>;
}

export function GoalCard({ goals }: { goals: SavingsGoal[] }) {
  const [creating, setCreating] = useState(false);
  return <section aria-label="目標貯金" className="card-soft mt-4 p-5">
    <div className="flex items-center justify-between gap-3">
      <h2 className="inline-flex items-center gap-1.5 text-xs font-light text-muted-foreground"><Target className="h-3.5 w-3.5" />目標貯金<span className="ml-1 font-display text-[11px] text-muted-foreground/70">{goals.length} / {MAX_SAVINGS_GOALS}</span></h2>
      {!creating && goals.length < MAX_SAVINGS_GOALS && <Button variant="unstyled" onClick={() => setCreating(true)} className={pillBtn}><Plus className="h-3.5 w-3.5" />{goals.length ? "目標を追加" : "目標を設定"}</Button>}
    </div>
    <div className="divide-y divide-border/60">{goals.map((goal) => <GoalRow key={goal.id} goal={goal} />)}</div>
    {creating && goals.length < MAX_SAVINGS_GOALS && <div className={goals.length ? "mt-5 border-t border-border/60 pt-4" : "mt-4"}>
      <p className="text-xs text-muted-foreground">新しい目標</p><GoalEditor onClose={() => setCreating(false)} />
    </div>}
  </section>;
}
