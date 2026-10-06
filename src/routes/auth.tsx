import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "ログイン｜推し活ウォレット" },
      { name: "description", content: "ログインしてスマホとPCで同じデータを使えます。" },
      { property: "og:title", content: "ログイン｜推し活ウォレット" },
      { property: "og:description", content: "ログインしてスマホとPCで同じデータを使えます。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "up") {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      setBusy(false);
      if (error) { toast.error("登録できませんでした", { description: error.message }); return; }
      setSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) { toast.error("ログインできませんでした", { description: "メールアドレスかパスワードが違います" }); return; }
      toast.success("ログインしました");
      navigate({ to: "/" });
    }
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) { toast.error("Googleでログインできませんでした"); return; }
    if (r.redirected) return;
    toast.success("ログインしました");
    navigate({ to: "/" });
  };

  const field = "satin-field w-full rounded-2xl px-4 py-3 text-sm font-light outline-none";

  return (
    <AppShell title={mode === "in" ? "ログイン" : "新規登録"}>
      <p className="mb-6 text-sm font-light text-muted-foreground">ログインすると、スマホとPCのどちらからでも同じデータを確認・更新できます。</p>
      {sent ? (
        <div className="card-soft rounded-3xl p-6 text-sm font-light text-foreground/80">
          確認メールを送りました。メール内のリンクを開くと登録が完了します。
        </div>
      ) : (
        <div className="card-soft space-y-4 rounded-3xl p-6">
          <Button variant="silver" className="w-full font-light" onClick={google}>Googleで続ける</Button>
          <p className="text-center text-[11px] font-light text-muted-foreground">または</p>
          <form onSubmit={submit} className="space-y-3">
            <input type="email" required placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
            <input type="password" required minLength={6} placeholder="パスワード（6文字以上）" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
            <Button type="submit" variant="blueGlass" disabled={busy} className="w-full font-light">
              {mode === "in" ? "ログイン" : "登録する"}
            </Button>
          </form>
          <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full text-center text-xs font-light text-muted-foreground underline-offset-4 hover:underline">
            {mode === "in" ? "はじめての方は新規登録" : "アカウントをお持ちの方はログイン"}
          </button>
        </div>
      )}
    </AppShell>
  );
}
