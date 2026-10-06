import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { getStateSnapshot, replaceFromCloud, setSyncHandler } from "@/lib/store";

let currentUser: string | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;

async function push(userId: string, data: unknown) {
  const { error } = await supabase
    .from("wallet_data")
    .upsert({ user_id: userId, data: data as Json, updated_at: new Date().toISOString() });
  if (error) toast.error("クラウドへの保存に失敗しました", { description: "通信状況を確認してください。この端末には保存されています。" });
}

async function startFor(userId: string) {
  if (currentUser === userId) return;
  currentUser = userId;
  setSyncHandler(null);
  const { data, error } = await supabase.from("wallet_data").select("data").eq("user_id", userId).maybeSingle();
  if (currentUser !== userId) return;
  if (error) {
    toast.error("クラウドのデータを読み込めませんでした");
    currentUser = null;
    return;
  }
  if (data?.data) replaceFromCloud(data.data);
  else await push(userId, getStateSnapshot()); // 初回：この端末のデータをアカウントへ引き継ぐ
  setSyncHandler((s) => {
    clearTimeout(timer);
    timer = setTimeout(() => push(userId, s), 600);
  });
}

function stop() {
  currentUser = null;
  clearTimeout(timer);
  setSyncHandler(null);
}

/** アプリ起動時に一度だけ呼ぶ。ログイン状態に合わせて同期を開始・停止する */
export function initCloudSync() {
  supabase.auth.getUser().then(({ data }) => { if (data.user) startFor(data.user.id); });
  const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") stop();
    else if (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) startFor(session.user.id);
  });
  return () => sub.subscription.unsubscribe();
}
