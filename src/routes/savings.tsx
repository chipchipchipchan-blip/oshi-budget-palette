import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { GoalCard } from "@/components/GoalCard";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/savings")({
  head: () => ({
    meta: [
      { title: "目標貯金｜推し活ウォレット" },
      { name: "description", content: "グッズや遠征の目標貯金を最大3つまで管理。目標ごとの進捗を確認し、貯金の追加・編集ができます。" },
      { property: "og:title", content: "目標貯金｜推し活ウォレット" },
      { property: "og:description", content: "推し活の目標に向けて、複数の貯金を自分のペースで管理。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SavingsPage,
});

function SavingsPage() {
  const { goals } = useStore();
  return <AppShell title="目標貯金">
    <Button asChild variant="unstyled" className="inline-flex items-center gap-1.5 text-xs font-light text-muted-foreground hover:text-clear-blue">
      <Link to="/"><ArrowLeft className="h-3.5 w-3.5" />ホーム</Link>
    </Button>
    <GoalCard goals={goals ?? []} />
  </AppShell>;
}