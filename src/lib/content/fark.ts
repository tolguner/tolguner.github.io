/**
 * Iki icerik agacinda farkli yaprak sayisi.
 *
 * Hem duzenleyicideki "N alan yayimlanmayi bekliyor" sayacinda hem de revizyon
 * listesinde kullaniliyor; tek yerde dursun diye ayri dosya.
 */
export function farkSayisi(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return 1;

  if (Array.isArray(a) || Array.isArray(b)) {
    const x = (a as unknown[]) ?? [];
    const y = (b as unknown[]) ?? [];
    let n = Math.abs(x.length - y.length);
    for (let i = 0; i < Math.min(x.length, y.length); i++) n += farkSayisi(x[i], y[i]);
    return n;
  }

  const x = a as Record<string, unknown>;
  const y = b as Record<string, unknown>;
  let n = 0;
  for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) n += farkSayisi(x[k], y[k]);
  return n;
}
