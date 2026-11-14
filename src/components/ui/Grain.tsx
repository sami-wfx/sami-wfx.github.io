// Static film grain. It used to be a full-screen `mix-blend-mode: overlay` layer
// with a 4-step transform animation — a blended, constantly-repainted layer over
// the whole viewport (including the playing showreel video), which made video
// playback and scrolling stutter. At 3.5% opacity the blend/animation was
// imperceptible, so it is now a plain static, non-blended overlay.
export function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[90] opacity-[0.03]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}
