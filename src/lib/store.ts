import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Gift, Ticket, TrainFront, Mail, Sparkles, Banknote, CreditCard, Smartphone, type LucideIcon } from "lucide-react";

export type Category = "goods" | "ticket" | "travel" | "fc" | "other";
export const CATEGORIES: { id: Category; label: string; icon: LucideIcon; color: string; fg: string }[] = [
  { id: "goods", label: "グッズ", icon: Gift, color: "var(--pink)", fg: "#fff" },
  { id: "ticket", label: "チケット", icon: Ticket, color: "var(--lilac)", fg: "#fff" },
  { id: "travel", label: "遠征費", icon: TrainFront, color: "var(--mint)", fg: "#fff" },
  { id: "fc", label: "FC・月額", icon: Mail, color: "var(--peach)", fg: "var(--ink)" },
  { id: "other", label: "その他", icon: Sparkles, color: "var(--sky)", fg: "var(--ink)" },
];

export type PaymentMethod = "cash" | "card" | "emoney";
export const PAYMENTS: { id: PaymentMethod; label: string; icon: LucideIcon }[] = [
  { id: "cash", label: "現金", icon: Banknote },
  { id: "card", label: "クレジットカード", icon: CreditCard },
  { id: "emoney", label: "電子マネー", icon: Smartphone },
];

/** グラフ用モノトーン（推しが全員白でも区別できるよう濃淡で塗り分け） */
export const MONO = ["oklch(0.14 0 0)", "oklch(0.42 0 0)", "oklch(0.72 0 0)", "oklch(0.86 0 0)", "oklch(0.3 0 0)", "oklch(0.58 0 0)"];

/** 推し別円グラフの配色：ローズゴールド → ライトグレー → チャコール（以下は濃淡で補完） */
export const PIE_COLORS = [
  "var(--clear-blue)",
  "#DAD7D3",
  "oklch(0.42 0.01 30)",
  "#B4AFA8",
  "oklch(0.22 0.008 30)",
  "#8F8A83",
];

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
  id: string; amount: number; date: string; memo: string; oshiId: string; category: Category; payment?: PaymentMethod;
};
export type SavingsGoal = { id: string; title: string; target: number; saved: number };
export const MAX_SAVINGS_GOALS = 3;
type State = { oshis: Oshi[]; expenses: Expense[]; bgColor?: string; mono?: boolean; budget?: number; goals?: SavingsGoal[]; goal?: Omit<SavingsGoal, "id"> };

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

const BACKUP_KEY = KEY + "-backup";

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      try {
        state = JSON.parse(raw);
      } catch {
        // データが壊れている：初期データで上書きせず、壊れたデータをバックアップキーに退避して
        // 本体はそのまま残す（次回以降も復旧の可能性を残す）。復旧用に最大2世代保持。
        try {
          const prev = localStorage.getItem(BACKUP_KEY);
          if (prev) localStorage.setItem(BACKUP_KEY + "-prev", prev);
          localStorage.setItem(BACKUP_KEY, raw);
        } catch {}
        if (typeof window !== "undefined") {
          toast.error("保存データの読み込みに失敗しました", {
            description: "データは消去せずバックアップとして残しています。心当たりのある操作の前の状態に戻したい場合はご連絡ください。",
            duration: 8000,
          });
        }
        return;
      }
    }
    if (state.goal) {
      const { goal, ...rest } = state;
      state = { ...rest, goals: state.goals ?? [{ ...goal, id: "legacy-savings-goal" }] };
      localStorage.setItem(KEY, JSON.stringify(state));
    }
    if (!state.mono) {
      // モノトーン版へ移行：3人の白の推しを登録し、未使用の初期サンプル推しを外す
      const used = new Set(state.expenses.map((e) => e.oshiId));
      const kept = state.oshis.filter((o) => !(["a", "b"].includes(o.id) && !used.has(o.id)));
      const add = initial.oshis.filter((o) => !kept.some((k) => k.name === o.name));
      const { bgColor: _b, ...rest } = state;
      state = { ...rest, oshis: [...add, ...kept], mono: true };
      localStorage.setItem(KEY, JSON.stringify(state));
    }
  } catch {}
}
function notifySaveFailure() {
  if (typeof window === "undefined") return;
  toast.error("保存に失敗しました", {
    description: "写真の容量がいっぱいの可能性があります。写真を減らすか、小さくしてからもう一度お試しください。",
    duration: 6000,
  });
}

let syncHandler: ((s: State) => void) | null = null;
/** ログイン中、変更をクラウドへ送る処理を登録する */
export function setSyncHandler(h: ((s: unknown) => void) | null) { syncHandler = h; }
export function getStateSnapshot(): unknown { load(); return state; }
/** クラウドから取得したデータで置き換える（クラウドへは送り返さない） */
export function replaceFromCloud(data: unknown) {
  const d = data as Partial<State>;
  if (!d || !Array.isArray(d.oshis) || !Array.isArray(d.expenses)) return;
  const h = syncHandler; syncHandler = null;
  set({ ...(d as State), mono: true });
  syncHandler = h;
}

function set(next: State) {
  state = next;
  syncHandler?.(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // 保存に失敗してもメモリ上の state は更新済みなので、入力内容は画面から消えない。
    // ただし再読み込みで失われるため、ユーザーに通知する。
    notifySaveFailure();
  }
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
  updateExpense: (id: string, e: Omit<Expense, "id">) =>
    set({ ...state, expenses: state.expenses.map((x) => (x.id === id ? { ...e, id } : x)) }),
  addOshi: (o: Omit<Oshi, "id">) => set({ ...state, oshis: [...state.oshis, { ...o, id: uid() }] }),
  updateOshi: (id: string, o: Partial<Oshi>) =>
    set({ ...state, oshis: state.oshis.map((x) => (x.id === id ? { ...x, ...o } : x)) }),
  deleteOshi: (id: string) => set({ ...state, oshis: state.oshis.filter((x) => x.id !== id) }),
  addGoal: (g: Omit<SavingsGoal, "id">) => {
    const goals = state.goals ?? [];
    if (goals.length >= MAX_SAVINGS_GOALS || !Number.isSafeInteger(g.target) || g.target <= 0 || !Number.isSafeInteger(g.saved) || g.saved < 0) return;
    set({ ...state, goals: [...goals, { ...g, id: uid() }] });
  },
  updateGoal: (id: string, g: Omit<SavingsGoal, "id">) => {
    if (!Number.isSafeInteger(g.target) || g.target <= 0 || !Number.isSafeInteger(g.saved) || g.saved < 0) return;
    set({ ...state, goals: (state.goals ?? []).map((goal) => goal.id === id ? { ...g, id } : goal) });
  },
  deleteGoal: (id: string) => set({ ...state, goals: (state.goals ?? []).filter((g) => g.id !== id) }),
  addSaving: (id: string, n: number) => {
    if (!Number.isSafeInteger(n) || n <= 0) return;
    set({ ...state, goals: (state.goals ?? []).map((g) => g.id === id && Number.isSafeInteger(g.saved + n) ? { ...g, saved: g.saved + n } : g) });
  },
  setBudget: (n: number | null) => {
    const { budget: _b, ...rest } = state;
    set(n && n > 0 ? { ...rest, budget: Math.round(n) } : rest);
  },
  setBgColor: (c: string | null) => {
    const { bgColor: _drop, ...rest } = state;
    set(c ? { ...rest, bgColor: c } : rest);
  },
};

/** 現在の全データ（支出・推し・予算・貯金・背景設定）をJSON文字列として返す */
export function exportData(): string {
  load();
  return JSON.stringify({ app: KEY, version: 1, exportedAt: new Date().toISOString(), data: state }, null, 2);
}

/** バックアップJSONを検証して復元。不正ならエラーメッセージを返す（成功時は null） */
export function importData(json: string): string | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return "ファイルが壊れているか、JSON形式ではありません";
  }
  const data = (parsed as { data?: unknown })?.data ?? parsed;
  const d = data as Partial<State>;
  if (!d || typeof d !== "object" || !Array.isArray(d.oshis) || !Array.isArray(d.expenses)) {
    return "このアプリのバックアップファイルではないようです";
  }
  const next: State = {
    oshis: d.oshis,
    expenses: d.expenses,
    ...(typeof d.bgColor === "string" ? { bgColor: d.bgColor } : {}),
    mono: true,
    ...(typeof d.budget === "number" ? { budget: d.budget } : {}),
    ...(Array.isArray(d.goals) ? { goals: d.goals } : {}),
  };
  // 復元前の現データをバックアップキーに退避してから上書き（復元のやり直しができるように）
  try {
    const current = localStorage.getItem(KEY);
    if (current) localStorage.setItem(BACKUP_KEY, current);
  } catch {}
  set(next);
  return null;
}

/** スマホの現地時刻（日本ならJST）で「今日」を YYYY-MM-DD で返す。UTCのズレで前日にならない */
export const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const yen = (n: number) => "¥" + n.toLocaleString("ja-JP");
export const catOf = (id: Category) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[4]!;
export const payOf = (id?: PaymentMethod) => PAYMENTS.find((p) => p.id === id);
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
