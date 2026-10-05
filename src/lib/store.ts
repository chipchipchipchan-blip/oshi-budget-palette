import { useSyncExternalStore } from "react";

export type Category = "goods" | "ticket" | "travel" | "fc" | "other";
export const CATEGORIES: { id: Category; label: string; emoji: string; color: string }[] = [
  { id: "goods", label: "グッズ", emoji: "🧸", color: "var(--pink)" },
  { id: "ticket", label: "チケット", emoji: "🎫", color: "var(--lilac)" },
  { id: "travel", label: "遠征費", emoji: "🚄", color: "var(--mint)" },
  { id: "fc", label: "FC・月額", emoji: "💌", color: "var(--peach)" },
  { id: "other", label: "その他", emoji: "✨", color: "var(--sky)" },
];

export const OSHI_COLORS = ["#F2B8C6", "#C9B6E4", "#A8DCCB", "#F6CBA5", "#AFCBEA", "#F3E1A0"];

export type Oshi = { id: string; name: string; color: string; photo?: string };
export type Expense = {
  id: string; amount: number; date: string; memo: string; oshiId: string; category: Category;
};
type State = { oshis: Oshi[]; expenses: Expense[] };

const KEY = "oshikatsu-wallet-v1";
const initial: State = {
  oshis: [
    { id: "a", name: "推しA", color: "#F2B8C6" },
    { id: "b", name: "推しB", color: "#C9B6E4" },
  ],
  expenses: [],
};

let state: State = initial;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw);
  } catch {}
}
function set(next: State) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  listeners.forEach((l) => l());
}

export function useStore() {
  return useSyncExternalStore(
    (cb) => { load(); listeners.add(cb); cb(); return () => listeners.delete(cb); },
    () => { load(); return state; },
    () => initial,
  );
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const actions = {
  addExpense: (e: Omit<Expense, "id">) => set({ ...state, expenses: [{ ...e, id: uid() }, ...state.expenses] }),
  deleteExpense: (id: string) => set({ ...state, expenses: state.expenses.filter((e) => e.id !== id) }),
  addOshi: (o: Omit<Oshi, "id">) => set({ ...state, oshis: [...state.oshis, { ...o, id: uid() }] }),
  updateOshi: (id: string, o: Partial<Oshi>) =>
    set({ ...state, oshis: state.oshis.map((x) => (x.id === id ? { ...x, ...o } : x)) }),
  deleteOshi: (id: string) => set({ ...state, oshis: state.oshis.filter((x) => x.id !== id) }),
};

export const yen = (n: number) => "¥" + n.toLocaleString("ja-JP");
export const catOf = (id: Category) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[4]!;
