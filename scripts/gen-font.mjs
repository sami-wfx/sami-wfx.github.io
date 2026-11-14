// One-off build script: converts ArchivoBlack-Regular.ttf into the three.js
// FontLoader ("typeface.json") glyph format, for the 3D SAIVO chrome wordmark.
// Not part of the app runtime — run manually with `node scripts/gen-font.mjs`.
import opentype from "opentype.js";
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ttfBuffer = readFileSync(path.join(__dirname, "ArchivoBlack-Regular.ttf"));
const font = opentype.parse(ttfBuffer.buffer.slice(ttfBuffer.byteOffset, ttfBuffer.byteOffset + ttfBuffer.byteLength));

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,&/-'’";
const unitsPerEm = font.unitsPerEm;

function glyphToOutline(glyph) {
  const scale = 1;
  const cmds = glyph.path.commands;
  const parts = [];
  for (const c of cmds) {
    switch (c.type) {
      case "M":
        parts.push("m", (c.x * scale).toFixed(1), (c.y * scale).toFixed(1));
        break;
      case "L":
        parts.push("l", (c.x * scale).toFixed(1), (c.y * scale).toFixed(1));
        break;
      case "Q":
        // three.js FontLoader's "q" outline op reads [end, control] — end point first.
        parts.push(
          "q",
          (c.x * scale).toFixed(1),
          (c.y * scale).toFixed(1),
          (c.x1 * scale).toFixed(1),
          (c.y1 * scale).toFixed(1)
        );
        break;
      case "C":
        // three.js FontLoader's "b" outline op reads [end, control1, control2] — end point first.
        parts.push(
          "b",
          (c.x * scale).toFixed(1),
          (c.y * scale).toFixed(1),
          (c.x1 * scale).toFixed(1),
          (c.y1 * scale).toFixed(1),
          (c.x2 * scale).toFixed(1),
          (c.y2 * scale).toFixed(1)
        );
        break;
      case "Z":
        break;
    }
  }
  return parts.join(" ");
}

const glyphs = {};
for (const ch of CHARS) {
  const glyph = font.charToGlyph(ch);
  if (!glyph) continue;
  glyphs[ch] = {
    ha: Math.round(glyph.advanceWidth),
    x_min: Math.round(glyph.xMin || 0),
    x_max: Math.round(glyph.xMax || 0),
    o: glyphToOutline(glyph),
  };
}

const os2 = font.tables.os2 || {};
const hhea = font.tables.hhea || {};

const json = {
  glyphs,
  familyName: "Archivo Black",
  ascender: Math.round(hhea.ascender ?? os2.sTypoAscender ?? unitsPerEm * 0.94),
  descender: Math.round(hhea.descender ?? os2.sTypoDescender ?? -unitsPerEm * 0.24),
  underlinePosition: -100,
  underlineThickness: 50,
  boundingBox: {
    yMin: -Math.round(unitsPerEm * 0.24),
    xMin: 0,
    yMax: Math.round(unitsPerEm * 0.94),
    xMax: Math.round(unitsPerEm),
  },
  resolution: unitsPerEm,
  original_font_information: {
    format: 0,
    copyright: "Archivo Black (SIL OFL 1.1) — converted for SAIVO 3D wordmark",
  },
  cssFontWeight: "normal",
  cssFontStyle: "normal",
};

const out = path.join(__dirname, "..", "public", "fonts", "archivo-black.typeface.json");
writeFileSync(out, JSON.stringify(json));
console.log("Wrote", out, `(${Object.keys(glyphs).length} glyphs, ${Math.round(JSON.stringify(json).length / 1024)}kb)`);
