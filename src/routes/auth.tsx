import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const jpError = (msg: string): string => {
    const m = msg.toLowerCase();
    if (m.includes("already registered")) return "このメールアドレスはすでに登録されています。ログインをお試しください。";
    if (m.includes("weak_password") || m.includes("weak password") || m.includes("easy to guess")) return "このパスワードは簡単に推測されてしまうため使えません。英数字を組み合わせた別のパスワードをお試しください。";
    if (m.includes("not allowed") || m.includes("reserved")) return "このメールアドレスには確認メールを送れないようです。受信できるメールアドレスをご入力ください。";
    if (m.includes("at least 6") || m.includes("password should")) return "パスワードは6文字以上で入力してください。";
    if (m.includes("invalid")) return "メールアドレスまたはパスワードの形式を確認してください。";
    if (m.includes("rate limit")) return "しばらく時間をおいてから、もう一度お試しください。";
    return "入力内容を確認してもう一度お試しください。";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "up") {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      setBusy(false);
      if (error) { toast.error("登録できませんでした", { description: jpError(error.message) }); return; }
      setSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) { toast.error("ログインできませんでした", { description: "メールアドレスかパスワードが違います" }); return; }
      toast.success("ログインしました");
      navigate({ to: "/" });
    }
  };

  const sendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    setBusy(false);
    if (error) { toast.error("送信できませんでした", { description: jpError(error.message) }); return; }
    toast.success("再設定メールを送りました", { description: "メールに届いたリンクから新しいパスワードを設定してください。届かない場合は迷惑メールフォルダもご確認ください。" });
    setMode("in");
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
    <AppShell title={mode === "in" ? "ログイン" : mode === "up" ? "新規登録" : "パスワードの再設定"}>
      <p className="mb-6 text-sm font-light text-muted-foreground">ログインすると、スマホとPCのどちらからでも同じデータを確認・更新できます。</p>
      {sent ? (
        <div className="card-soft space-y-2 rounded-3xl p-6">
          <p className="text-sm font-light text-foreground/80">
            確認メールを送りました。<br />
            <span className="text-foreground/60">{email}</span> 宛のメールに届いたリンクを開くと、登録が完了します。
          </p>
          <p className="text-xs font-light text-muted-foreground">
            メールが届かない場合は、迷惑メールフォルダもご確認ください。数分待ってから、この画面を開き直すともう一度登録できます。
          </p>
        </div>
      ) : mode === "reset" ? (
        <div className="card-soft space-y-4 rounded-3xl p-6">
          <p className="text-sm font-light text-muted-foreground">
            ご登録のメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
          </p>
          <form onSubmit={sendReset} className="space-y-3">
            <input type="email" required placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
            <Button type="submit" variant="blueGlass" disabled={busy} className="w-full font-light">
              再設定メールを送る
            </Button>
          </form>
          <button type="button" onClick={() => setMode("in")} className="w-full text-center text-xs font-light text-muted-foreground underline-offset-4 hover:underline">
            ログイン画面に戻る
          </button>
        </div>
      ) : (
        <div className="card-soft space-y-4 rounded-3xl p-6">
          <Button variant="silver" className="w-full font-light" onClick={google}>Googleで続ける</Button>
          <p className="text-center text-[11px] font-light text-muted-foreground">または</p>
          <form onSubmit={submit} className="space-y-3">
            <input type="email" required placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required minLength={6} placeholder="パスワード（6文字以上）" value={password} onChange={(e) => setPassword(e.target.value)} className={field + " pr-12"} />
              <button type="button" aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"} onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-clear-blue">
                {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
              </button>
            </div>
            <Button type="submit" variant="blueGlass" disabled={busy} className="w-full font-light">
              {mode === "in" ? "ログイン" : "登録する"}
            </Button>
            {mode === "up" ? (
              <p className="text-center text-[11px] font-light text-muted-foreground">
                登録ボタンを押すと、確認メールが届きます。メールのリンクを開いて登録を完了してください。
              </p>
            ) : (
              <button type="button" onClick={() => setMode("reset")} className="w-full text-center text-[11px] font-light text-muted-foreground underline-offset-4 hover:underline">
                パスワードをお忘れですか？
              </button>
            )}
          </form>
          <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full text-center text-xs font-light text-muted-foreground underline-offset-4 hover:underline">
            {mode === "in" ? "はじめての方は新規登録" : "アカウントをお持ちの方はログイン"}
          </button>
        </div>
      )}
    </AppShell>
  );
}
