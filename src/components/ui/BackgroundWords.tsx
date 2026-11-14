const POSITIONS = [
  { top: "8%", left: "-4%", size: "18vw", opacity: 0.035 },
  { top: "62%", left: "58%", size: "16vw", opacity: 0.03 },
  { top: "-2%", left: "48%", size: "13vw", opacity: 0.025 },
  { top: "78%", left: "2%", size: "20vw", opacity: 0.03 },
] as const;

export function BackgroundWords({ words }: { words: readonly [string, string, string, string] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      {words.map((word, i) => {
        const pos = POSITIONS[i];
        return (
          <span
            key={word + i}
            className="absolute font-black tracking-tighter text-ink whitespace-nowrap"
            style={{ top: pos.top, left: pos.left, fontSize: pos.size, opacity: pos.opacity }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}
