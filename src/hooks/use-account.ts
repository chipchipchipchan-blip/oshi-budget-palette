import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Account = { email: string | null; nickname: string } | null;

/** ログイン中のアカウント（未確認の間は undefined、未ログインは null） */
export function useAccount() {
  const [account, setAccount] = useState<Account | undefined>(undefined);
  useEffect(() => {
    const toAccount = (u: { email?: string; user_metadata?: Record<string, unknown> } | null | undefined): Account =>
      u ? { email: u.email ?? null, nickname: typeof u.user_metadata?.nickname === "string" ? u.user_metadata.nickname : "" } : null;
    supabase.auth.getUser().then(({ data }) => setAccount(toAccount(data.user)));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setAccount(toAccount(s?.user)));
    return () => data.subscription.unsubscribe();
  }, []);
  return account;
}

export async function saveNickname(nickname: string) {
  const { error } = await supabase.auth.updateUser({ data: { nickname: nickname.trim().slice(0, 20) } });
  return error;
}
