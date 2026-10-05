import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Check, Palette, Plus, Trash2 } from "lucide-react";
import { AppShell, OshiAvatar } from "@/components/AppShell";
import { useStore, actions, OSHI_COLORS, BG_PRESETS, isWhitish, type Oshi } from "@/lib/store";

export const Route = createFileRoute("/oshi")({
  head: () => ({
    meta: [
      { title: "推し設定｜推し活ウォレット" },
      { name: "description", content: "推しの名前・イメージカラー・写真を登録。" },
      { property: "og:title", content: "推し設定｜推し活ウォレット" },
      { property: "og:description", content: "推しの名前・イメージカラー・写真を登録。" },
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
    cv.getContext("2d")!.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, s, s);
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
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="新しい推しの名前" className="flex-1 rounded-full bg-muted px-4 outline-none" />
        <button className="press grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground"><Plus /></button>
      </form>
      <BackgroundPicker />
    </AppShell>
  );
}

function BackgroundPicker() {
  const { bgColor } = useStore();
  return (
    <div className="card-soft mt-5 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Palette className="h-4 w-4 text-primary" />
        <span className="text-sm font-bold">アプリの背景色</span>
      </div>
      <div className="flex items-center gap-2">
        {BG_PRESETS.map((p) => {
          const active = bgColor === p.color;
          return (
            <button
              key={p.label}
              onClick={() => actions.setBgColor(p.color)}
              aria-label={`背景を${p.label}にする`}
              className={`press grid h-9 w-9 place-items-center rounded-full border-2 ${active ? "border-foreground" : "border-border"}`}
              style={p.color ? { background: p.color } : { background: "linear-gradient(135deg, #FDF3F7, #EEF7F2)" }}
            >
              {active && <Check className="h-4 w-4 text-foreground" />}
            </button>
          );
        })}
        <input
          type="color"
          value={bgColor ?? "#FDF3F7"}
          onChange={(e) => actions.setBgColor(e.target.value)}
          className="h-9 w-9 cursor-pointer rounded-full bg-transparent"
          aria-label="背景を好きな色にする"
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">好きな色も選べます。濃い色は自動で淡く調整されます。</p>
    </div>
  );
}

function OshiCard({ o }: { o: Oshi }) {
  const light = isWhitish(o.color);
  return (
    <div className="card-soft overflow-hidden" style={light ? { background: "var(--secondary)" } : undefined}>
      <div className="h-14" style={{ background: o.color }} />
      <div className="-mt-9 flex items-end gap-3 px-5">
        <label className="press relative cursor-pointer">
          <OshiAvatar {...o} size={72} />
          <span className="absolute bottom-0 right-0 grid h-6 w-6 place-items-center rounded-full bg-card shadow-soft"><Camera className="h-3.5 w-3.5" /></span>
          <input type="file" accept="image/*" hidden onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) readPhoto(f, (photo) => actions.updateOshi(o.id, { photo }));
          }} />
        </label>
        <input
          value={o.name}
          onChange={(e) => actions.updateOshi(o.id, { name: e.target.value })}
          className="mb-1 min-w-0 flex-1 rounded-xl bg-transparent px-2 py-1 text-lg font-bold outline-none focus:bg-muted"
        />
        <button onClick={() => confirm(`${o.name}を削除しますか？`) && actions.deleteOshi(o.id)} className="press mb-2 text-muted-foreground" aria-label="削除">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center gap-2 px-5 py-4">
        <span className="text-xs font-bold text-muted-foreground">イメージカラー</span>
        {OSHI_COLORS.map((c) => (
          <button key={c} onClick={() => actions.updateOshi(o.id, { color: c })}
            className={`press h-7 w-7 rounded-full border-2 ${o.color === c ? "border-foreground" : "border-border"}`}
            style={{ background: c }} aria-label={c} />
        ))}
        <input type="color" value={o.color} onChange={(e) => actions.updateOshi(o.id, { color: e.target.value })} className="h-7 w-7 cursor-pointer rounded-full bg-transparent" />
      </div>
    </div>
  );
}
