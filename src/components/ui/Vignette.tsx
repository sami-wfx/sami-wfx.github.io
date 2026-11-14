export function Vignette() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[80]"
      style={{
        background:
          "radial-gradient(140% 100% at 50% 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)",
      }}
    />
  );
}
