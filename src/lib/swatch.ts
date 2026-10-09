import type { Swatch } from "../data/products";

/** CSS background for a colour swatch. Multi-colour swatches become equal pie slices. */
export function swatchBg(s: Swatch): string {
  if (typeof s === "string") return s;
  const step = 100 / s.length;
  const stops = s.map((c, i) => `${c} ${i * step}% ${(i + 1) * step}%`).join(", ");
  return `conic-gradient(from -90deg, ${stops})`;
}
