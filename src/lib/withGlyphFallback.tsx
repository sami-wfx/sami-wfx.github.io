// Unbounded's font file has no usable glyph for a handful of rare Cyrillic
// letters (confirmed for Tajik's Ӣ/ӣ, U+04E2-04E3) even though its declared
// unicode-range claims to cover them — and browsers don't reliably fetch a
// deep CSS fallback font just to check, so a plain font-family chain (see
// hero/constants.ts DISPLAY_FONT) silently lands on a mismatched system
// serif for just that character. This wraps known-missing characters in an
// explicit font-family override instead, which we've confirmed does have
// the glyph (Noto Sans), so no auto-detection is required.
//
// Noto Sans's own cap-height for this letter runs ~19% taller than
// Unbounded's plain letters at the same font-size (measured via Canvas
// actualBoundingBoxAscent at a 300px reference: 267px vs Unbounded's 225px
// for "И"), which is what made the substitution still look visibly "off"
// even once the font family itself matched. Scaling the wrapped span's
// font-size down compensates — both fonts render on the same text baseline
// with zero descent for this glyph, so no vertical-align adjustment needed.
const MISSING_GLYPH_RE = /[Ӣӣ]/;

// 225/267.1875 (uppercase Ӣ vs Unbounded's И) and 173.4/220.3 (lowercase ӣ vs "и").
const UPPERCASE_SCALE = 0.842;
const LOWERCASE_SCALE = 0.787;

export function withGlyphFallback(text: string, uppercase = false): React.ReactNode {
  if (!MISSING_GLYPH_RE.test(text)) return text;
  const scale = uppercase ? UPPERCASE_SCALE : LOWERCASE_SCALE;
  return text.split(/([Ӣӣ])/g).map((part, i) =>
    MISSING_GLYPH_RE.test(part) ? (
      <span key={i} style={{ fontFamily: "'Noto Sans', sans-serif", fontSize: `${scale}em` }}>
        {part}
      </span>
    ) : (
      part
    )
  );
}
