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

/** グラフ用モノトーン（推しが全員白でも区別できるよう濃淡で塗り分け） */
export const MONO = ["oklch(0.14 0 0)", "oklch(0.42 0 0)", "oklch(0.72 0 0)", "oklch(0.86 0 0)", "oklch(0.3 0 0)", "oklch(0.58 0 0)"];

export const OSHI_COLORS = ["#FFFFFF", "#F2F2F2", "#E8E6E3", "#C8C8C8", "#8A8A8A", "#4A4A4A", "#1A1A1A"];

export const BG_PRESETS: { label: string; color: string | null }[] = [
  { label: "オフホワイト", color: null },
  { label: "ピュアホワイト", color: "#FFFFFF" },
  { label: "ペールグレー", color: "#EFEFEF" },
  { label: "ストーン", color: "#E6E4E0" },
  { label: "シルバー", color: "#E2E4E6" },
];

export type Oshi = { id: string; name: string; color: string; photo?: string };
export type Expense = {
  id: string; amount: number; date: string; memo: string; oshiId: string; category: Category;
};
type State = { oshis: Oshi[]; expenses: Expense[]; bgColor?: string; mono?: boolean };

const KEY = "oshikatsu-wallet-v1";
const initial: State = {
  oshis: [
    { id: "idol", name: "アイドル", color: "#FFFFFF" },
    { id: "anime", name: "アニメ", color: "#FFFFFF" },
    { id: "seiyu", name: "声優", color: "#FFFFFF" },
  ],
  expenses: [],
  mono: true,
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
    if (!state.mono) {
      // モノトーン版へ移行：3人の白の推しを登録し、未使用の初期サンプル推しを外す
      const used = new Set(state.expenses.map((e) => e.oshiId));
      const kept = state.oshis.filter((o) => !(["a", "b"].includes(o.id) && !used.has(o.id)));
      const add = initial.oshis.filter((o) => !kept.some((k) => k.name === o.name));
      state = { ...state, oshis: [...add, ...kept], mono: true, bgColor: undefined };
      localStorage.setItem(KEY, JSON.stringify(state));
    }
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
  setBgColor: (c: string | null) => {
    const { bgColor: _drop, ...rest } = state;
    set(c ? { ...rest, bgColor: c } : rest);
  },
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

/** 選んだ背景色をアプリ全体に反映。濃い色は自動で白に混ぜて淡く補正する */
export function applyBackground(color?: string) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (!color) {
    root.style.removeProperty("--background");
    root.style.removeProperty("--bg-tint-a");
    root.style.removeProperty("--bg-tint-b");
    return;
  }
  const hex = color.replace("#", "");
  let r = 253, g = 243, b = 247;
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  }
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (lum < 0.78) {
    r = Math.round(r + (255 - r) * 0.75);
    g = Math.round(g + (255 - g) * 0.75);
    b = Math.round(b + (255 - b) * 0.75);
  }
  root.style.setProperty("--background", `rgb(${r} ${g} ${b})`);
  root.style.setProperty("--bg-tint-a", `rgb(${r} ${g} ${b} / 0.55)`);
  root.style.setProperty("--bg-tint-b", `rgb(${r} ${g} ${b} / 0.45)`);
}
