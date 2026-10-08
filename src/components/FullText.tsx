import { useEffect, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type FullTextProps = {
  /** 表示する文字（長い場合は ... で省略される） */
  text: string;
  /** 吹き出しの上に表示する見出し（例: メモ / 推し） */
  label?: string;
  /** 文字本体のクラス（省略表示 truncate を含む） */
  className?: string;
  /** タップ範囲（ボタン）のクラス */
  wrapperClassName?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
};

/**
 * 「...」で省略されたときだけタップ（クリック）できる文字。
 * 省略されていなければただの文字として表示し、変な押下感を残さない。
 */
export function FullText({
  text,
  label,
  className = "block truncate",
  wrapperClassName = "",
  align = "start",
  side = "bottom",
}: FullTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [clipped, setClipped] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setClipped(el.scrollWidth - el.clientWidth > 1);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  return (
    <Popover open={open} onOpenChange={(next) => setOpen(next && clipped)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={clipped ? text : undefined}
          aria-label={clipped ? `${label ?? "全文"}を表示` : undefined}
          className={`appearance-none bg-transparent p-0 text-left ${clipped ? "cursor-pointer" : "cursor-default"} ${wrapperClassName}`}
        >
          <span ref={ref} className={className}>{text}</span>
        </button>
      </PopoverTrigger>
      {clipped && (
        <PopoverContent
          align={align}
          side={side}
          sideOffset={8}
          collisionPadding={16}
          className="w-auto max-w-[15rem] rounded-2xl border-border/60 bg-card/95 p-3.5 shadow-soft backdrop-blur-xl"
        >
          {label && (
            <p className="mb-1 text-[10px] font-light tracking-wide text-muted-foreground/70">{label}</p>
          )}
          <p className="whitespace-pre-wrap break-words text-[12px] font-light leading-relaxed text-foreground/90">
            {text}
          </p>
        </PopoverContent>
      )}
    </Popover>
  );
}
