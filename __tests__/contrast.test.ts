import { describe, test, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  AA_MIN,
  contrastRatio,
  evaluatePairs,
  formatRatio,
  semanticColors,
  wcagLevel,
  type PairResult,
} from '../build/a11y/contrast.ts';

/**
 * Contrast gate (WCAG 2.2 AA).
 *
 * Puente is gated: every pair in CONTRAST_PAIRS must meet AA in light and dark,
 * except the pairs listed in PUENTE_KNOWN_GAPS. The other brands get a printed
 * report only, because their colours are owned by their own brand files.
 */

const DIST_WEB = path.resolve('dist/web');
const GATED_BRAND = 'puente';

/**
 * Pairs that fail AA today and were not part of the approved Phase 0 values.
 * Each entry is asserted to STILL fail, so fixing one forces removing it here.
 * Key: `${mode}:${fg} on ${bg}`.
 */
const PUENTE_KNOWN_GAPS: Record<string, string> = {
  'light:feedback-warning-fg on feedback-warning-bg': 'yellow-800 on yellow-100 is 4.36:1',
  'dark:feedback-danger on surface-raised': 'red-500 on neutral-800 is 4.46:1',
  'dark:feedback-danger on surface-sunken': 'red-500 on neutral-800 is 4.46:1',
};

function readMode(brand: string, theme: string, mode: string): Record<string, string> {
  const file = path.join(DIST_WEB, brand, theme, mode === 'light' ? 'variables.css' : `variables.${mode}.css`);
  return semanticColors(fs.readFileSync(file, 'utf-8'));
}

function combos(): { brand: string; theme: string; mode: string }[] {
  const out: { brand: string; theme: string; mode: string }[] = [];
  for (const brand of fs.readdirSync(DIST_WEB).sort()) {
    const brandDir = path.join(DIST_WEB, brand);
    if (!fs.statSync(brandDir).isDirectory()) continue;
    for (const theme of fs.readdirSync(brandDir).sort()) {
      const themeDir = path.join(brandDir, theme);
      if (!fs.existsSync(path.join(themeDir, 'variables.css'))) continue;
      for (const f of fs.readdirSync(themeDir).sort()) {
        const m = /^variables(?:\.(\w+))?\.css$/.exec(f);
        if (m) out.push({ brand, theme, mode: m[1] ?? 'light' });
      }
    }
  }
  return out;
}

const key = (mode: string, r: PairResult) => `${mode}:${r.fg} on ${r.bg}`;

describe('contrast math', () => {
  test('matches WCAG reference values', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2);
    expect(contrastRatio('#ffffff', '#1b5fdb')).toBeCloseTo(5.67, 2);
  });

  test('composites translucent foregrounds over the background', () => {
    expect(contrastRatio('#00000000', '#ffffff')).toBeCloseTo(1, 5);
    expect(contrastRatio('#000000ff', '#ffffff')).toBeCloseTo(21, 5);
  });

  test('levels', () => {
    expect(wcagLevel(7.1, 'text')).toBe('AAA');
    expect(wcagLevel(4.5, 'text')).toBe('AA');
    expect(wcagLevel(4.49, 'text')).toBe('fail');
    expect(wcagLevel(3, 'non-text')).toBe('AA');
    expect(wcagLevel(2.99, 'non-text')).toBe('fail');
  });
});

describe(`${GATED_BRAND} meets WCAG 2.2 AA`, () => {
  for (const mode of ['light', 'dark']) {
    describe(mode, () => {
      const colors = readMode(GATED_BRAND, 'default', mode);
      const results = evaluatePairs(colors);

      test('defines every token the gate needs', () => {
        for (const name of ['text-link', 'border-control', 'focus-ring', 'action-primary-hover']) {
          expect(colors, `missing ${name}`).toHaveProperty(name);
        }
      });

      for (const r of results) {
        const k = key(mode, r);
        const gap = PUENTE_KNOWN_GAPS[k];
        test(`${r.fg} on ${r.bg} ≥ ${AA_MIN[r.kind]}:1${gap ? ' (known gap)' : ''}`, () => {
          if (gap) {
            expect(r.ratio, `${k} now passes; remove it from PUENTE_KNOWN_GAPS`).toBeLessThan(AA_MIN[r.kind]);
          } else {
            expect(r.ratio, `${k}: ${r.fgHex} on ${r.bgHex} is ${formatRatio(r.ratio)}:1`).toBeGreaterThanOrEqual(
              AA_MIN[r.kind],
            );
          }
        });
      }
    });
  }
});

describe('contrast report (other brands, not gated)', () => {
  test('prints failing pairs', () => {
    const lines: string[] = [];
    for (const { brand, theme, mode } of combos()) {
      if (brand === GATED_BRAND) continue;
      const fails = evaluatePairs(readMode(brand, theme, mode)).filter((r) => r.level === 'fail');
      lines.push(`${brand}/${theme} ${mode}: ${fails.length} below AA`);
      for (const r of fails) {
        lines.push(`  ${r.fg} on ${r.bg}  ${r.fgHex} / ${r.bgHex}  ${formatRatio(r.ratio)}:1 (needs ${AA_MIN[r.kind]})`);
      }
    }
    console.log(`\nContrast report, brands outside the gate\n${lines.join('\n')}\n`);
    expect(lines.length).toBeGreaterThan(0);
  });
});
