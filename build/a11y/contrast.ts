/**
 * WCAG 2.2 contrast math and the token pairs the contrast gate checks.
 *
 * Pure functions with no Node imports, so both the vitest gate
 * (`__tests__/contrast.test.ts`) and the preview comparison page
 * (`preview/contrast.ts`) use the same pair list and the same math.
 */

export type Rgba = { r: number; g: number; b: number; a: number };

/** Parses `#rgb`, `#rrggbb` or `#rrggbbaa`. Returns null for anything else. */
export function parseHex(hex: string): Rgba | null {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
}

/** Alpha-composites `fg` over an opaque `bg`. */
function over(fg: Rgba, bg: Rgba): Rgba {
  const mix = (f: number, b: number) => Math.round(f * fg.a + b * (1 - fg.a));
  return { r: mix(fg.r, bg.r), g: mix(fg.g, bg.g), b: mix(fg.b, bg.b), a: 1 };
}

/** WCAG relative luminance of an opaque sRGB colour. */
export function relativeLuminance({ r, g, b }: Rgba): number {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio, compositing a translucent foreground over the background first. */
export function contrastRatio(fgHex: string, bgHex: string): number {
  const bg = parseHex(bgHex);
  const fgRaw = parseHex(fgHex);
  if (!bg || !fgRaw) throw new Error(`Not a hex colour: ${!bg ? bgHex : fgHex}`);
  const fg = fgRaw.a < 1 ? over(fgRaw, bg) : fgRaw;
  const [hi, lo] = [relativeLuminance(fg), relativeLuminance(bg)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Reads `--tk-dlite-semantic-color-*` custom properties out of a variables CSS file. */
export function semanticColors(css: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of css.matchAll(/--tk-dlite-semantic-color-([\w-]+):\s*(#[0-9a-f]{3,8})\s*;/gi)) {
    out[m[1]] = m[2].toLowerCase();
  }
  return out;
}

export type PairKind = 'text' | 'non-text';

export interface ContrastPair {
  /** Semantic colour name, without the `--tk-dlite-semantic-color-` prefix. */
  fg: string;
  bg: string;
  kind: PairKind;
  /** What the pair is used for, shown in the report and on the preview page. */
  role: string;
}

/** WCAG 2.2 AA minimums: 1.4.3 (text) and 1.4.11 (non-text: control boundaries, focus indicators). */
export const AA_MIN: Record<PairKind, number> = { text: 4.5, 'non-text': 3 };
/** WCAG 2.2 AAA minimum for text (1.4.6). Non-text has no AAA level. */
export const AAA_TEXT_MIN = 7;

export const SURFACES = ['background', 'surface-base', 'surface-raised', 'surface-sunken'] as const;

const TEXT_ON_SURFACES = [
  'text-primary',
  'text-secondary',
  'text-tertiary',
  'text-link',
  'feedback-success',
  'feedback-warning',
  'feedback-danger',
  'feedback-info',
];

const NON_TEXT_ON_SURFACES: [string, string][] = [
  ['border-control', 'Input, checkbox and radio boundary'],
  ['focus-ring', 'Focus indicator'],
  ['action-primary', 'Primary button fill'],
];

/** Every pair the gate checks, for one brand × mode. */
export const CONTRAST_PAIRS: ContrastPair[] = [
  ...TEXT_ON_SURFACES.flatMap((fg) =>
    SURFACES.map((bg) => ({ fg, bg, kind: 'text' as const, role: fg.startsWith('feedback') ? 'Status text' : 'Body text' })),
  ),
  ...['action-primary', 'action-primary-hover', 'action-primary-active'].map((bg) => ({
    fg: 'text-on-primary',
    bg,
    kind: 'text' as const,
    role: 'Primary button label',
  })),
  ...['success', 'warning', 'danger', 'info'].map((fb) => ({
    fg: `feedback-${fb}-fg`,
    bg: `feedback-${fb}-bg`,
    kind: 'text' as const,
    role: 'Status badge',
  })),
  ...NON_TEXT_ON_SURFACES.flatMap(([fg, role]) =>
    SURFACES.map((bg) => ({ fg, bg, kind: 'non-text' as const, role })),
  ),
];

export type Level = 'AAA' | 'AA' | 'fail';

export function wcagLevel(ratio: number, kind: PairKind): Level {
  if (kind === 'text' && ratio >= AAA_TEXT_MIN) return 'AAA';
  return ratio >= AA_MIN[kind] ? 'AA' : 'fail';
}

export interface PairResult extends ContrastPair {
  fgHex: string;
  bgHex: string;
  ratio: number;
  level: Level;
}

/** Evaluates every pair whose two colours exist in `colors`. */
export function evaluatePairs(colors: Record<string, string>, pairs = CONTRAST_PAIRS): PairResult[] {
  return pairs.flatMap((p) => {
    const fgHex = colors[p.fg];
    const bgHex = colors[p.bg];
    if (!fgHex || !bgHex) return [];
    const ratio = contrastRatio(fgHex, bgHex);
    return [{ ...p, fgHex, bgHex, ratio, level: wcagLevel(ratio, p.kind) }];
  });
}

/** Rounds down to 2 dp so a displayed "4.50" never hides a 4.497 failure. */
export function formatRatio(ratio: number): string {
  return (Math.floor(ratio * 100) / 100).toFixed(2);
}
