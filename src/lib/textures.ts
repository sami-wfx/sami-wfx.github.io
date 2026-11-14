import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";

/** Procedural brushed-metal roughness map: fine horizontal streaks + grain, no image asset needed. */
export function createBrushedRoughnessTexture(size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y++) {
    const shade = 118 + Math.random() * 20;
    ctx.strokeStyle = `rgba(${shade},${shade},${shade},0.5)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y + Math.random() * 0.6);
    ctx.lineTo(size, y + Math.random() * 0.6);
    ctx.stroke();
  }

  for (let i = 0; i < size * 12; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const v = Math.random() * 40 - 20;
    const shade = Math.max(0, Math.min(255, 128 + v));
    ctx.fillStyle = `rgba(${shade},${shade},${shade},0.35)`;
    ctx.fillRect(x, y, 1, 1);
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

/** Soft radial gradient sprite used as a cheap fake contact-shadow beneath floating objects. */
export function createSoftShadowTexture(size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, "rgba(0,0,0,0.55)");
  gradient.addColorStop(0.6, "rgba(0,0,0,0.22)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
