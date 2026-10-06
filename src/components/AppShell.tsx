import { Link } from "@tanstack/react-router";
import { Home, PlusCircle, Clock, Heart, Wallet } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { applyBackground, isWhitish, useStore } from "@/lib/store";

const tabs = [
  { to: "/", label: "ホーム", icon: Home },
  { to: "/add", label: "記録", icon: PlusCircle },
  { to: "/history", label: "履歴", icon: Clock },
  { to: "/oshi", label: "推し", icon: Heart },
] as const;

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const { bgColor } = useStore();
  useEffect(() => { applyBackground(bgColor); }, [bgColor]);
  return (
    <div className="mx-auto min-h-screen max-w-md px-6 pb-36 pt-10">
      <header className="mb-8 flex items-center justify-between gap-3">
        <div>
          <p className="mb-1 font-display text-[11px] font-light text-muted-foreground">OSHI WALLET</p>
          <h1 className="text-2xl font-light">{title}</h1>
        </div>
        <div className="silver-surface grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-muted-foreground"><Wallet className="h-5 w-5" /></div>
      </header>
      {children}
      <nav aria-label="メインメニュー" className="glass-nav fixed inset-x-6 bottom-6 z-20 mx-auto flex max-w-sm justify-around rounded-3xl p-2">
        {tabs.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            className="press flex flex-1 flex-col items-center gap-1 rounded-2xl py-2.5 text-[10px] text-muted-foreground"
            activeProps={{ className: "silver-surface !text-secondary-foreground font-medium" }}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function OshiAvatar({ name, color, photo, size = 40 }: { name: string; color: string; photo?: string; size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-card font-bold text-ink"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.4,
        borderColor: isWhitish(color) ? "var(--border)" : undefined,
      }}
    >
      {photo ? <img src={photo} alt={name} className="h-full w-full object-cover" /> : name.slice(0, 1)}
    </div>
  );
}
