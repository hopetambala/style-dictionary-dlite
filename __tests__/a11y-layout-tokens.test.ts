import { describe, test, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Contract for the Phase 0 layout and accessibility tokens:
 * - global breakpoint outputs (custom media + JSON)
 * - focus ring, target size, link, control border and hover tokens in every brand
 * - Puente's upstream contrast fixes
 */

const DIST_WEB = path.resolve('dist/web');
const read = (...p: string[]) => fs.readFileSync(path.join(DIST_WEB, ...p), 'utf-8');

function cssVar(css: string, name: string): string | undefined {
  return new RegExp(`--${name}:\\s*([^;]+);`).exec(css)?.[1].trim();
}

describe('breakpoint outputs', () => {
  test('custom-media.css declares up and down queries for every breakpoint', () => {
    const css = read('custom-media.css');
    const expected: [string, number][] = [
      ['sm', 640],
      ['md', 768],
      ['lg', 1024],
      ['xl', 1280],
    ];
    for (const [bp, px] of expected) {
      expect(css).toContain(`@custom-media --tk-dlite-bp-${bp}-up (min-width: ${px}px);`);
      expect(css).toContain(`@custom-media --tk-dlite-bp-${bp}-down (max-width: ${px - 0.02}px);`);
    }
  });

  test('breakpoints.json is a px number map in ascending order', () => {
    const json = JSON.parse(read('breakpoints.json'));
    expect(json).toEqual({ sm: 640, md: 768, lg: 1024, xl: 1280 });
    expect(Object.keys(json)).toEqual(['sm', 'md', 'lg', 'xl']);
  });
});

const brandThemes = fs
  .readdirSync(DIST_WEB)
  .filter((b) => fs.statSync(path.join(DIST_WEB, b)).isDirectory())
  .flatMap((b) =>
    fs
      .readdirSync(path.join(DIST_WEB, b))
      .filter((t) => fs.existsSync(path.join(DIST_WEB, b, t, 'variables.css')))
      .map((t) => `${b}/${t}`),
  );

describe('new global tokens exist in every brand and mode', () => {
  const names = [
    'tk-dlite-semantic-color-focus-ring',
    'tk-dlite-semantic-focus-ring-width',
    'tk-dlite-semantic-focus-ring-offset',
    'tk-dlite-semantic-sizing-target-min',
    'tk-dlite-semantic-sizing-target-comfortable',
    'tk-dlite-semantic-color-text-link',
    'tk-dlite-semantic-color-border-control',
    'tk-dlite-semantic-color-action-primary-hover',
  ];
  for (const bt of brandThemes) {
    for (const file of ['variables.css', 'variables.dark.css']) {
      if (!fs.existsSync(path.join(DIST_WEB, bt, file))) continue;
      test(`${bt}/${file}`, () => {
        const css = read(bt, file);
        for (const n of names) expect(cssVar(css, n), n).toBeDefined();
        expect(cssVar(css, 'tk-dlite-semantic-focus-ring-width')).toBe('2px');
        expect(cssVar(css, 'tk-dlite-semantic-focus-ring-offset')).toBe('2px');
        expect(cssVar(css, 'tk-dlite-semantic-sizing-target-min')).toBe('24px');
        expect(cssVar(css, 'tk-dlite-semantic-sizing-target-comfortable')).toBe('44px');
        expect(cssVar(css, 'tk-dlite-semantic-color-text-link')).toBe(
          cssVar(css, 'tk-dlite-semantic-color-action-primary'),
        );
      });
    }
  }
});

describe('puente contrast values (Phase 0 table)', () => {
  const expected: Record<string, Record<string, string>> = {
    'variables.css': {
      'color-action-primary': '#1b5fdb', // blue-600
      'color-action-primary-hover': '#0a46b6', // blue-700
      'color-action-primary-active': '#043393', // blue-800
      'color-text-on-primary': '#ffffff',
      'color-text-tertiary': '#6e6e6e', // neutral-600
      'color-text-link': '#1b5fdb',
      'color-border-control': '#6e6e6e',
      'color-focus-ring': '#1b5fdb',
    },
    'variables.dark.css': {
      'color-action-primary': '#70a1fc', // blue-400, unchanged
      'color-action-primary-hover': '#a3c3fd', // blue-300
      'color-action-primary-active': '#a3c3fd', // blue-300, unchanged
      'color-text-on-primary': '#161616', // neutral-900
      'color-text-tertiary': '#a5a5a5', // neutral-500, unchanged
      'color-text-link': '#70a1fc',
      'color-border-control': '#6e6e6e',
      'color-focus-ring': '#a3c3fd', // blue-300
    },
  };
  for (const [file, vars] of Object.entries(expected)) {
    test(file, () => {
      const css = read('puente', 'default', file);
      for (const [n, v] of Object.entries(vars)) expect(cssVar(css, `tk-dlite-semantic-${n}`), n).toBe(v);
    });
  }
});

describe('other brands keep their own primary in new derived tokens', () => {
  for (const bt of brandThemes.filter((b) => !b.startsWith('puente/'))) {
    for (const file of ['variables.css', 'variables.dark.css']) {
      if (!fs.existsSync(path.join(DIST_WEB, bt, file))) continue;
      test(`${bt}/${file}`, () => {
        const css = read(bt, file);
        expect(cssVar(css, 'tk-dlite-semantic-color-focus-ring')).toBe(
          cssVar(css, 'tk-dlite-semantic-color-action-primary'),
        );
        expect(cssVar(css, 'tk-dlite-semantic-color-action-primary-hover')).toBe(
          cssVar(css, 'tk-dlite-semantic-color-action-primary-active'),
        );
      });
    }
  }
});
