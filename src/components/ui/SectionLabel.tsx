import { cn } from "@/lib/utils";

export function SectionLabel({
  index,
  children,
  className,
}: {
  index?: string;
  children: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 font-mono text-xs tracking-[0.25em] text-ink-dim uppercase", className)}>
      {index && (
        <span className="flex items-center gap-3">
          <span className="text-accent">{index}</span>
          <span className="h-px w-4 bg-line" />
        </span>
      )}
      <span>{children}</span>
    </div>
  );
}
