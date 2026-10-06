import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Check, Download, Palette, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { AppShell, OshiAvatar } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useStore, actions, exportData, importData, OSHI_COLORS, BG_PRESETS, isWhitish, type Oshi } from "@/lib/store";

export const Route = createFileRoute("/oshi")({
  head: () => ({
    meta: [
      { title: "推し設定｜推し活ウォレット" },
      { name: "description", content: "推しの名前・イメージカラー・写真を登録。" },
      { property: "og:title", content: "推し設定｜推し活ウォレット" },
      { property: "og:description", content: "推しの名前・イメージカラー・写真を登録。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OshiPage,
});

function readPhoto(file: File, cb: (url: string) => void) {
  const img = new Image();
  img.onload = () => {
    const s = 200, cv = document.createElement("canvas");
    cv.width = cv.height = s;
    const m = Math.min(img.width, img.height);
    const context = cv.getContext("2d");
    if (!context) return;
    context.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, s, s);
    cb(cv.toDataURL("image/jpeg", 0.8));
  };
  img.src = URL.createObjectURL(file);
}

function OshiPage() {
  const { oshis } = useStore();
  const [name, setName] = useState("");

  return (
    <AppShell title="推し設定">
      <div className="space-y-4">
        {oshis.map((o) => <OshiCard key={o.id} o={o} />)}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          actions.addOshi({ name: name.trim(), color: OSHI_COLORS[oshis.length % OSHI_COLORS.length] ?? "#F2B8C6" });
          setName("");
        }}
        className="card-soft mt-5 flex gap-2 p-3"
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="新しい推しの名前" className="min-w-0 flex-1 rounded-lg bg-muted/50 px-3 outline-none" />
        <Button variant="blueGlass" size="auto" aria-label="推しを追加" title="推しを追加" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"><Plus /></Button>
      </form>
      <BackgroundPicker />
      <BackupSection />
    </AppShell>
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

function OshiCard({ o }: { o: Oshi }) {
  const dark = !isWhitish(o.color);
  return (
    <div className="blush-card overflow-hidden">
      <div
        className="h-14 border-b"
        style={{
          background: `linear-gradient(135deg, color-mix(in oklab, ${o.color} ${dark ? 46 : 86}%, #ffffff), color-mix(in oklab, ${o.color} ${dark ? 24 : 100}%, #ffffff))`,
          borderColor: "color-mix(in oklab, #c8a29a 24%, oklch(1 0 0))",
        }}
      />
      <div className="-mt-9 flex items-end gap-3 px-5">
        <label className="press blue-ring relative grid cursor-pointer place-items-center rounded-full bg-card p-[3px]">
          <OshiAvatar {...o} size={68} />
          <span className="absolute bottom-0 right-0 grid h-6 w-6 place-items-center rounded-full bg-card shadow-soft text-[var(--clear-blue)]"><Camera className="h-3.5 w-3.5" /></span>
          <input type="file" accept="image/*" hidden onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) readPhoto(f, (photo) => actions.updateOshi(o.id, { photo }));
          }} />
        </label>
        <input
          value={o.name}
          onChange={(e) => actions.updateOshi(o.id, { name: e.target.value })}
          className="mb-1 min-w-0 flex-1 rounded-xl bg-transparent px-2 py-1 text-lg font-light text-foreground outline-none focus:bg-muted"
        />
        <Button variant="unstyled" size="auto" onClick={() => confirm(`${o.name}を削除しますか？`) && actions.deleteOshi(o.id)} className="press mb-2 grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-[var(--clear-blue)]" aria-label="削除">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2 px-5 py-4">
        <span className="text-xs font-light text-foreground/80">イメージカラー</span>
        {OSHI_COLORS.map((c) => (
          <Button variant="unstyled" size="auto" key={c} onClick={() => actions.updateOshi(o.id, { color: c })}
            className={`press h-7 w-7 rounded-full border-2 ${o.color === c ? "blue-ring border-transparent" : "border-border"}`}
            style={{ background: c }} aria-label={c} />
        ))}
        <input type="color" value={o.color} onChange={(e) => actions.updateOshi(o.id, { color: e.target.value })} className="swatch-round h-7 w-7" aria-label="好きな色を選ぶ" />
      </div>
    </div>
  );
}
