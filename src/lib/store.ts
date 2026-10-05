import { useSyncExternalStore } from "react";
import { Gift, Ticket, TrainFront, Mail, Sparkles, type LucideIcon } from "lucide-react";

export type Category = "goods" | "ticket" | "travel" | "fc" | "other";
export const CATEGORIES: { id: Category; label: string; icon: LucideIcon; color: string }[] = [
  { id: "goods", label: "グッズ", icon: Gift, color: "var(--pink)" },
  { id: "ticket", label: "チケット", icon: Ticket, color: "var(--lilac)" },
  { id: "travel", label: "遠征費", icon: TrainFront, color: "var(--mint)" },
  { id: "fc", label: "FC・月額", icon: Mail, color: "var(--peach)" },
  { id: "other", label: "その他", icon: Sparkles, color: "var(--sky)" },
];

export const OSHI_COLORS = ["#FFFFFF", "#E8E6E3", "#F2B8C6", "#C9B6E4", "#A8DCCB", "#F6CBA5", "#AFCBEA", "#F3E1A0"];

export const BG_PRESETS: { label: string; color: string | null }[] = [
  { label: "デフォルト", color: null },
  { label: "ミント", color: "#E7F5EF" },
  { label: "ラベンダー", color: "#F1ECFA" },
  { label: "ピーチ", color: "#FBEFE4" },
  { label: "スカイ", color: "#E8F1FA" },
  { label: "クリーム", color: "#FAF6EA" },
];

export type Oshi = { id: string; name: string; color: string; photo?: string };
export type Expense = {
  id: string; amount: number; date: string; memo: string; oshiId: string; category: Category;
};
type State = { oshis: Oshi[]; expenses: Expense[]; bgColor?: string };

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
  setBgColor: (c: string | null) => set({ ...state, bgColor: c ?? undefined }),
};

export const yen = (n: number) => "¥" + n.toLocaleString("ja-JP");
export const catOf = (id: Category) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[4]!;
/** 白・オフホワイトなど、カード背景に溶ける色かどうか（カラーピッカーの手入力にも対応） */
export const isWhitish = (color: string) => {
  const hex = color.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return false;
  const rgb = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return Math.min(...rgb) > 224;
};
