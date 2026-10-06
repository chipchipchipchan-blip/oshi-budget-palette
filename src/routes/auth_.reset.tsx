import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth_/reset")({
  head: () => ({
    meta: [
      { title: "パスワードの再設定｜推し活ウォレット" },
      { name: "description", content: "新しいパスワードを設定します。" },
      { property: "og:title", content: "パスワードの再設定｜推し活ウォレット" },
      { property: "og:description", content: "新しいパスワードを設定します。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      setReady((prev) => prev ?? Boolean(data.session));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("パスワードが一致しません", { description: "同じパスワードをもう一度入力してください。" });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error("変更できませんでした", {
        description: "リンクの有効期限が切れている可能性があります。もう一度メールを送り直してください。",
      });
      return;
    }
    toast.success("パスワードを変更しました");
    navigate({ to: "/" });
  };

  const field = "satin-field w-full rounded-2xl px-4 py-3 text-sm font-light outline-none";

  return (
    <AppShell title="パスワードの再設定">
      {ready === null ? (
        <p className="text-sm font-light text-muted-foreground">確認しています…</p>
      ) : !ready ? (
        <div className="card-soft space-y-3 rounded-3xl p-6">
          <p className="text-sm font-light text-foreground/80">
            このリンクは無効か、有効期限が切れています。お手数ですが、もう一度再設定メールをお送りください。
          </p>
          <Button asChild variant="silver" className="w-full font-light">
            <Link to="/auth">ログイン画面へ戻る</Link>
          </Button>
        </div>
      ) : (
        <div className="card-soft rounded-3xl p-6">
          <p className="mb-4 text-sm font-light text-muted-foreground">新しいパスワードを入力してください。</p>
          <form onSubmit={submit} className="space-y-3">
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required minLength={6} placeholder="新しいパスワード（6文字以上）" value={password} onChange={(e) => setPassword(e.target.value)} className={field + " pr-12"} />
              <button type="button" aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"} onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-clear-blue">
                {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
              </button>
            </div>
            <div className="relative">
              <input type={showConfirm ? "text" : "password"} required minLength={6} placeholder="新しいパスワード（確認）" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={field + " pr-12"} />
              <button type="button" aria-label={showConfirm ? "パスワードを隠す" : "パスワードを表示"} onClick={() => setShowConfirm((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-clear-blue">
                {showConfirm ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
              </button>
            </div>
            <Button type="submit" variant="blueGlass" disabled={busy} className="w-full font-light">
              パスワードを変更する
            </Button>
          </form>
        </div>
      )}
    </AppShell>
  );
}
