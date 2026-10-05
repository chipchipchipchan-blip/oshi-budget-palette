import { Link } from "@tanstack/react-router";
import { Home, PlusCircle, Clock, Heart } from "lucide-react";
import type { ReactNode } from "react";

const tabs = [
  { to: "/", label: "ホーム", icon: Home },
  { to: "/add", label: "記録", icon: PlusCircle },
  { to: "/history", label: "履歴", icon: Clock },
  { to: "/oshi", label: "推し", icon: Heart },
] as const;

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-md px-5 pb-32 pt-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-display text-xs font-bold tracking-[0.25em] text-primary">OSHI WALLET</p>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-full bg-hero text-xl shadow-soft">💖</div>
      </header>
      {children}
      <nav className="fixed inset-x-0 bottom-4 z-20 mx-auto flex max-w-sm justify-around rounded-full border bg-card/90 p-2 shadow-soft backdrop-blur">
        {tabs.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            className="press flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[11px] text-muted-foreground"
            activeProps={{ className: "bg-secondary !text-secondary-foreground font-bold" }}
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
      style={{ width: size, height: size, background: color, fontSize: size * 0.4 }}
    >
      {photo ? <img src={photo} alt={name} className="h-full w-full object-cover" /> : name.slice(0, 1)}
    </div>
  );
}
