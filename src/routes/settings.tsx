import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Check, Download, Palette, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { AppShell, OshiAvatar } from "@/components/AppShell";
import { useAccount, saveNickname } from "@/hooks/use-account";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { resetAllData } from "@/lib/cloud-sync";
import { useStore, actions, exportData, importData, OSHI_COLORS, BG_PRESETS, isWhitish, type Oshi } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "設定｜推し活ウォレット" },
      { name: "description", content: "アカウント、背景色、バックアップ、データの初期化。" },
      { property: "og:title", content: "設定｜推し活ウォレット" },
      { property: "og:description", content: "アカウント、背景色、バックアップ、データの初期化。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell title="設定">
      <AccountSection />
      <BackgroundPicker />
      <BackupSection />
      <ResetSection />
    </AppShell>
  );
}

function AccountSection() {
  const account = useAccount();
  const [nick, setNick] = useState("");
  useEffect(() => { if (account) setNick(account.nickname); }, [account]);
  if (account === undefined) return null;
  const email = account?.email;
  return (
    <section className="card-soft rounded-3xl p-5">
      <p className="mb-1 text-sm font-light text-foreground/80">アカウント</p>
      {account ? (
        <>
          <p className="mb-4 text-xs font-light text-muted-foreground">{email} でログイン中。スマホとPCでデータが同期されます。</p>
          <label className="mb-2 block text-xs font-light text-foreground/80" htmlFor="nickname">ニックネーム</label>
          <div className="mb-4 flex gap-2">
            <input id="nickname" maxLength={20} placeholder="例：みき" value={nick} onChange={(e) => setNick(e.target.value)} className="satin-field min-w-0 flex-1 rounded-2xl px-4 py-2.5 text-sm font-light outline-none" />
            <Button variant="blueGlass" className="font-light" disabled={nick.trim() === account.nickname} onClick={async () => {
              const err = await saveNickname(nick);
              if (err) toast.error("保存できませんでした"); else toast.success("ニックネームを保存しました");
            }}>保存</Button>
          </div>
          <Button variant="silver" className="w-full font-light" onClick={async () => { await supabase.auth.signOut(); toast.success("ログアウトしました"); }}>ログアウト</Button>
        </>
      ) : (
        <>
          <p className="mb-4 text-xs font-light text-muted-foreground">ログインすると、スマホとPCのどちらからでも同じデータを使えます。</p>
          <Button asChild variant="blueGlass" className="w-full font-light"><Link to="/auth">ログイン・新規登録</Link></Button>
        </>
      )}
    </section>
  );
}

function ResetSection() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <div className="card-soft mt-5 p-5">
      <p className="mb-1 text-sm font-light text-foreground/80">データの初期化</p>
      <p className="mb-3 text-xs font-light text-muted-foreground">支出記録・推し・予算・貯金をすべて削除し、はじめの状態に戻します。</p>
      <Button variant="silver" className="w-full font-light text-[var(--budget-over)]" onClick={() => setOpen(true)}>すべてのデータを初期化する</Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-light">データを初期化しますか？</AlertDialogTitle>
            <AlertDialogDescription className="font-light">すべての支出記録や推しデータが削除されます。本当によろしいですか？この操作は元に戻せません。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-light">やめる</AlertDialogCancel>
            <AlertDialogAction className="font-light" disabled={busy} onClick={async (e) => {
              e.preventDefault();
              setBusy(true);
              const err = await resetAllData();
              setBusy(false);
              setOpen(false);
              if (err) toast.error("初期化できませんでした", { description: err });
              else toast.success("すべてのデータを初期化しました");
            }}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BackupSection() {
  const download = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `oshikatsu-wallet-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("バックアップを保存しました");
  };

  const restore = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const err = importData(String(reader.result ?? ""));
      if (err) toast.error("復元に失敗しました", { description: err });
      else toast.success("バックアップから復元しました");
    };
    reader.readAsText(file);
  };

  return (
    <div className="card-soft mt-5 p-5">
      <div className="mb-1 flex items-center gap-2">
        <Download className="h-4 w-4 text-primary" />
        <span className="text-sm font-light text-foreground/80">データのバックアップ</span>
      </div>
      <p className="mb-3 text-xs font-light text-muted-foreground">
        支出・推し・予算・貯金のすべてをファイルに保存できます。機種変更の際の引っ越しにも使えます。
      </p>
      <div className="flex gap-2">
        <Button variant="unstyled" size="auto" onClick={download}
          className="press blue-glass blue-ring flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-light text-white">
          <Download className="h-3.5 w-3.5" /> 保存する
        </Button>
        <label className="press flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-xs font-light text-muted-foreground transition-colors hover:text-foreground">
          <Upload className="h-3.5 w-3.5" /> 復元する
          <input type="file" accept="application/json,.json" hidden onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) restore(f);
            e.target.value = "";
          }} />
        </label>
      </div>
    </div>
  );
}

function BackgroundPicker() {
  const { bgColor } = useStore();
  return (
    <div className="card-soft mt-5 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Palette className="h-4 w-4 text-primary" />
        <span className="text-sm font-light text-foreground/80">アプリの背景色</span>
      </div>
      <div className="flex items-center gap-2">
        {BG_PRESETS.map((p) => {
          const active = bgColor === p.color;
          return (
            <Button variant="unstyled" size="auto"
              key={p.label}
              onClick={() => actions.setBgColor(p.color)}
              aria-label={`背景を${p.label}にする`}
              className={`press grid h-9 w-9 place-items-center rounded-full border-2 ${active ? "blue-ring border-transparent" : "border-border"}`}
              style={{ background: p.color ?? "var(--gradient-silver)" }}
            >
              {active && <Check className="h-4 w-4 text-foreground" />}
            </Button>
          );
        })}
        <input
          type="color"
          value={bgColor ?? "#f8f9fa"}
          onChange={(e) => actions.setBgColor(e.target.value)}
          className="swatch-round h-9 w-9"
          aria-label="背景を好きな色にする"
        />
      </div>
    </div>
  );
}

