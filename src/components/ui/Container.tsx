import { cn } from "@/lib/utils";

/** Shared width/gutter for sections that must align to the same vertical
 *  edge as the Navbar (currently: Navbar + Hero only — other sections keep
 *  their own wider max-widths by design). 1280px max-width, 40px gutter —
 *  reduced to 24px below `sm` (640px), where a flat 40px on both sides
 *  left content ~3-5px wider than a 320px viewport. */
export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1320px] px-6 sm:px-10", className)}>{children}</div>;
}
